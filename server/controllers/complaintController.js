import Complaint from '../models/Complaint.js';
import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import { sendNotification, notifyAdmins } from '../utils/notify.js';

export const getComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, search } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    // Parents are strictly scoped to their own complaints
    if (req.user.role === 'parent') {
      query.user = req.user._id;
    }

    let complaints = await Complaint.find(query)
      .populate('user', 'name email phone role profileImage')
      .populate('student', 'name studentId className division')
      .populate('repliedBy', 'name role')
      .populate('messages.sender', 'name role profileImage')
      .sort({ createdAt: -1 });

    // Sanitize internalNotes for non-admin users
    if (req.user.role !== 'admin') {
      complaints = complaints.map(c => {
        const obj = c.toObject();
        delete obj.internalNotes;
        return obj;
      });
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      complaints = complaints.filter(c => 
        c.complaintId?.toLowerCase().includes(lowerSearch) || 
        c.subject?.toLowerCase().includes(lowerSearch) ||
        c.user?.name?.toLowerCase().includes(lowerSearch) ||
        c.student?.name?.toLowerCase().includes(lowerSearch)
      );
    }
      
    res.status(200).json({ status: true, message: "Complaints fetched successfully", data: complaints });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email phone role profileImage')
      .populate('student', 'name studentId className division')
      .populate('repliedBy', 'name role profileImage')
      .populate('messages.sender', 'name role profileImage');
      
    if (!complaint) {
      return res.status(404).json({ status: false, message: "Complaint not found" });
    }
    
    // Security check: parents can only view their own complaints
    if (req.user.role === 'parent' && complaint.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: false, message: "Not authorized to view this complaint" });
    }
    
    const result = complaint.toObject();
    if (req.user.role !== 'admin') {
      delete result.internalNotes;
    }
    
    res.status(200).json({ status: true, message: "Complaint fetched successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const createComplaint = async (req, res, next) => {
  try {
    const { title, subject, description, category, priority, studentId, student, attachment } = req.body;

    const finalSubject = subject || title;
    if (!finalSubject || !description) {
      return res.status(400).json({ status: false, message: "Complaint title and description are required" });
    }

    // Verify student belongs to this parent if student is provided
    const targetStudentId = studentId || student;
    if (req.user.role === 'parent' && targetStudentId) {
      const parentRecord = await Parent.findOne({ user: req.user._id });
      if (parentRecord) {
        const studentDoc = await Student.findOne({ 
          _id: targetStudentId,
          $or: [
            { parent: parentRecord._id },
            { _id: { $in: parentRecord.children || [] } }
          ]
        });
        if (!studentDoc) {
          return res.status(403).json({ status: false, message: "Selected student does not belong to your authorized records" });
        }
      }
    }

    // Generate unique complaint reference CMP-YYYY-XXXX
    const count = await Complaint.countDocuments();
    const complaintId = `CMP-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    
    const complaint = await Complaint.create({
      complaintId,
      user: req.user._id,
      student: targetStudentId || null,
      subject: finalSubject.trim(),
      description: description.trim(),
      category: category || 'Other',
      priority: priority ? priority.toLowerCase() : 'normal',
      status: 'pending',
      attachment: attachment || null,
      messages: [{
        sender: req.user._id,
        senderName: req.user.name,
        senderRole: req.user.role,
        message: description.trim(),
        createdAt: new Date()
      }]
    });
    
    const populated = await Complaint.findById(complaint._id)
      .populate('user', 'name email phone')
      .populate('student', 'name studentId className');

    // Notify administrators of new complaint
    await notifyAdmins({
      title: `New ${complaint.priority === 'urgent' ? 'URGENT ' : ''}Complaint: ${complaint.complaintId}`,
      message: `${req.user.name} submitted a complaint regarding "${complaint.subject}".`,
      type: 'complaint',
      relatedId: complaint._id,
      link: `/admin/complaints/${complaint._id}`
    });
      
    res.status(201).json({ 
      status: true, 
      message: "Complaint submitted successfully. An administrator has been notified.", 
      data: populated 
    });
  } catch (error) {
    next(error);
  }
};

export const addComplaintMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ status: false, message: "Message text cannot be empty" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ status: false, message: "Complaint not found" });
    }

    // Check ownership
    if (req.user.role === 'parent' && complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: false, message: "Not authorized to reply to this complaint" });
    }

    const newMessage = {
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim(),
      createdAt: new Date()
    };

    complaint.messages.push(newMessage);

    // If parent replies to resolved/rejected complaint, set back to under_review
    if (req.user.role === 'parent' && ['resolved', 'rejected'].includes(complaint.status)) {
      complaint.status = 'under_review';
    }

    await complaint.save();

    // Send notifications
    if (req.user.role === 'parent') {
      await notifyAdmins({
        title: `Follow-up on Complaint ${complaint.complaintId}`,
        message: `${req.user.name} sent a message on "${complaint.subject}".`,
        type: 'complaint',
        relatedId: complaint._id,
        link: `/admin/complaints/${complaint._id}`
      });
    } else {
      await sendNotification({
        recipient: complaint.user,
        title: `Update on Complaint ${complaint.complaintId}`,
        message: `Admin ${req.user.name} added a reply to your complaint.`,
        type: 'complaint',
        relatedId: complaint._id,
        link: `/parent/dashboard?tab=complaints`
      });
    }

    const updated = await Complaint.findById(complaint._id)
      .populate('user', 'name email')
      .populate('student', 'name studentId')
      .populate('messages.sender', 'name role profileImage');

    res.status(200).json({ status: true, message: "Message added successfully", data: updated });
  } catch (error) {
    next(error);
  }
};

export const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ status: false, message: "Complaint not found" });
    }

    const { status, adminReply, resolutionNotes, internalNotes, priority } = req.body;
    
    if (status) complaint.status = status;
    if (priority) complaint.priority = priority;
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
    if (internalNotes !== undefined) complaint.internalNotes = internalNotes;

    if (adminReply && adminReply.trim()) {
      complaint.adminReply = adminReply.trim();
      complaint.repliedBy = req.user._id;
      complaint.repliedAt = new Date();
      
      // Also push to messages thread for unified timeline
      complaint.messages.push({
        sender: req.user._id,
        senderName: req.user.name,
        senderRole: 'admin',
        message: adminReply.trim(),
        createdAt: new Date()
      });
    }

    await complaint.save();

    // Notify parent about status change or official reply
    await sendNotification({
      recipient: complaint.user,
      title: `Complaint ${complaint.complaintId} Updated`,
      message: `Status: ${complaint.status.replace('_', ' ').toUpperCase()}${adminReply ? ` - Response: "${adminReply.slice(0, 60)}..."` : ''}`,
      type: 'complaint',
      relatedId: complaint._id,
      link: `/parent/dashboard?tab=complaints`
    });

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('user', 'name email phone')
      .populate('student', 'name studentId')
      .populate('repliedBy', 'name role')
      .populate('messages.sender', 'name role profileImage');
    
    res.status(200).json({ status: true, message: "Complaint updated successfully", data: updatedComplaint });
  } catch (error) {
    next(error);
  }
};

export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ status: false, message: "Complaint not found" });
    }
    
    await Complaint.findByIdAndDelete(complaint._id);
    
    res.status(200).json({ status: true, message: "Complaint deleted successfully", data: {} });
  } catch (error) {
    next(error);
  }
};
