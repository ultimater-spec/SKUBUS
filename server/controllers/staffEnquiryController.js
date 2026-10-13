import StaffEnquiry from '../models/StaffEnquiry.js';
import Staff from '../models/Staff.js';
import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import { sendNotification, notifyAdmins } from '../utils/notify.js';

export const getEnquiries = async (req, res, next) => {
  try {
    const { status, isEscalated, search } = req.query;

    let query = {};
    if (status) query.status = status;
    if (isEscalated !== undefined) query.isEscalated = isEscalated === 'true';

    // Role-based visibility
    if (req.user.role === 'parent') {
      query.parent = req.user._id;
    } else if (req.user.role === 'staff') {
      const staffDoc = await Staff.findOne({ user: req.user._id });
      if (!staffDoc) {
        return res.status(200).json({ status: true, message: "Enquiries fetched successfully", data: [] });
      }
      query.staff = staffDoc._id;
    }

    let enquiries = await StaffEnquiry.find(query)
      .populate('parent', 'name email phone profileImage')
      .populate('student', 'name studentId className division')
      .populate({
        path: 'staff',
        select: 'designation employeeId assignedBus assignedRoute user',
        populate: [
          { path: 'user', select: 'name email phone profileImage' },
          { path: 'assignedBus', select: 'busNumber' },
          { path: 'assignedRoute', select: 'routeName' }
        ]
      })
      .populate('messages.sender', 'name role profileImage')
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      enquiries = enquiries.filter(e => 
        e.enquiryId?.toLowerCase().includes(q) ||
        e.subject?.toLowerCase().includes(q) ||
        e.parent?.name?.toLowerCase().includes(q) ||
        e.student?.name?.toLowerCase().includes(q) ||
        e.staff?.user?.name?.toLowerCase().includes(q)
      );
    }

    if (req.user.role !== 'admin') {
      enquiries = enquiries.map(e => {
        const obj = e.toObject();
        delete obj.internalNotes;
        return obj;
      });
    }

    res.status(200).json({ status: true, message: "Enquiries fetched successfully", data: enquiries });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await StaffEnquiry.findById(req.params.id)
      .populate('parent', 'name email phone profileImage')
      .populate('student', 'name studentId className division')
      .populate({
        path: 'staff',
        select: 'designation employeeId assignedBus assignedRoute user',
        populate: [
          { path: 'user', select: 'name email phone profileImage' },
          { path: 'assignedBus', select: 'busNumber' },
          { path: 'assignedRoute', select: 'routeName' }
        ]
      })
      .populate('messages.sender', 'name role profileImage');

    if (!enquiry) {
      return res.status(404).json({ status: false, message: "Staff enquiry not found" });
    }

    // Authorization check
    if (req.user.role === 'parent' && enquiry.parent._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: false, message: "Not authorized to view this enquiry" });
    }
    if (req.user.role === 'staff' && enquiry.staff?.user?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: false, message: "Not authorized to view this enquiry" });
    }

    const result = enquiry.toObject();
    if (req.user.role !== 'admin') {
      delete result.internalNotes;
    }

    res.status(200).json({ status: true, message: "Enquiry fetched successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const createEnquiry = async (req, res, next) => {
  try {
    const { staffId, studentId, subject, category, message } = req.body;

    if (!staffId || !studentId || !subject || !message) {
      return res.status(400).json({ 
        status: false, 
        message: "Assigned staff, student, subject, and message are required" 
      });
    }

    // 1. Verify student belongs to this parent
    const parentRecord = await Parent.findOne({ user: req.user._id });
    if (!parentRecord) {
      return res.status(404).json({ status: false, message: "Parent profile not found" });
    }

    const studentDoc = await Student.findOne({
      _id: studentId,
      $or: [
        { parent: parentRecord._id },
        { _id: { $in: parentRecord.children || [] } }
      ]
    }).populate('assignedBus assignedRoute');

    if (!studentDoc) {
      return res.status(403).json({ status: false, message: "Selected student does not belong to your authorized records" });
    }

    // 2. Verify selected staff is assigned to the student's bus or route
    const targetStaff = await Staff.findById(staffId).populate('user', 'name');
    if (!targetStaff) {
      return res.status(404).json({ status: false, message: "Selected staff member not found" });
    }

    // Check relationship
    const isAssigned = (
      (studentDoc.assignedBus && targetStaff.assignedBus?.toString() === studentDoc.assignedBus._id.toString()) ||
      (studentDoc.assignedRoute && targetStaff.assignedRoute?.toString() === studentDoc.assignedRoute._id.toString()) ||
      (studentDoc.assignedBus?.driver?.toString() === targetStaff._id.toString()) ||
      (studentDoc.assignedBus?.attendant?.toString() === targetStaff._id.toString())
    );

    // If no explicit bus match, allow staff enquiry only if school permits or if assigned
    if (!isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: false, 
        message: "You may only contact staff members directly assigned to your student's bus or route" 
      });
    }

    const count = await StaffEnquiry.countDocuments();
    const enquiryId = `ENQ-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const enquiry = await StaffEnquiry.create({
      enquiryId,
      parent: req.user._id,
      student: studentDoc._id,
      staff: targetStaff._id,
      subject: subject.trim(),
      category: category || 'General Enquiry',
      message: message.trim(),
      status: 'new',
      messages: [{
        sender: req.user._id,
        senderName: req.user.name,
        senderRole: 'parent',
        message: message.trim(),
        createdAt: new Date()
      }]
    });

    // Notify assigned staff member
    if (targetStaff.user) {
      await sendNotification({
        recipient: targetStaff.user._id,
        title: `New Parent Enquiry: ${enquiry.enquiryId}`,
        message: `${req.user.name} sent an enquiry regarding student ${studentDoc.name}: "${enquiry.subject}".`,
        type: 'enquiry',
        relatedId: enquiry._id,
        link: `/staff/dashboard`
      });
    }

    const populated = await StaffEnquiry.findById(enquiry._id)
      .populate('parent', 'name email phone')
      .populate('student', 'name studentId')
      .populate({
        path: 'staff',
        select: 'designation user',
        populate: { path: 'user', select: 'name' }
      });

    res.status(201).json({ 
      status: true, 
      message: `Enquiry sent to ${targetStaff.user?.name || 'assigned staff'} successfully.`, 
      data: populated 
    });
  } catch (error) {
    next(error);
  }
};

export const replyEnquiry = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ status: false, message: "Reply message cannot be empty" });
    }

    const enquiry = await StaffEnquiry.findById(req.params.id)
      .populate('staff', 'user');

    if (!enquiry) {
      return res.status(404).json({ status: false, message: "Enquiry not found" });
    }

    // Authorization check
    const isParent = req.user.role === 'parent' && enquiry.parent.toString() === req.user._id.toString();
    const isAssignedStaff = req.user.role === 'staff' && enquiry.staff?.user?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isParent && !isAssignedStaff && !isAdmin) {
      return res.status(403).json({ status: false, message: "Not authorized to reply to this enquiry" });
    }

    enquiry.messages.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim(),
      createdAt: new Date()
    });

    if (isAssignedStaff) {
      enquiry.status = 'replied';
    } else if (isParent) {
      enquiry.status = 'in_progress';
    }

    await enquiry.save();

    // Send notifications
    if (isParent && enquiry.staff?.user) {
      await sendNotification({
        recipient: enquiry.staff.user._id,
        title: `Reply on Enquiry ${enquiry.enquiryId}`,
        message: `${req.user.name} sent a follow-up message on "${enquiry.subject}".`,
        type: 'enquiry',
        relatedId: enquiry._id,
        link: `/staff/dashboard`
      });
    } else if (isAssignedStaff || isAdmin) {
      await sendNotification({
        recipient: enquiry.parent,
        title: `Staff Response on Enquiry ${enquiry.enquiryId}`,
        message: `${req.user.name} replied to your enquiry "${enquiry.subject}".`,
        type: 'enquiry',
        relatedId: enquiry._id,
        link: `/parent/dashboard?tab=staff`
      });
    }

    const updated = await StaffEnquiry.findById(enquiry._id)
      .populate('parent', 'name email')
      .populate('student', 'name studentId')
      .populate({
        path: 'staff',
        select: 'designation user',
        populate: { path: 'user', select: 'name' }
      })
      .populate('messages.sender', 'name role profileImage');

    res.status(200).json({ status: true, message: "Reply added successfully", data: updated });
  } catch (error) {
    next(error);
  }
};

export const escalateEnquiry = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const enquiry = await StaffEnquiry.findById(req.params.id)
      .populate('student', 'name studentId')
      .populate({
        path: 'staff',
        select: 'designation user',
        populate: { path: 'user', select: 'name' }
      });

    if (!enquiry) {
      return res.status(404).json({ status: false, message: "Enquiry not found" });
    }

    if (req.user.role === 'parent' && enquiry.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: false, message: "Not authorized to escalate this enquiry" });
    }

    enquiry.isEscalated = true;
    enquiry.escalatedAt = new Date();
    enquiry.escalationReason = reason ? reason.trim() : 'Parent requested administrative intervention.';
    enquiry.status = 'in_progress';

    enquiry.messages.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: `[ESCALATED TO ADMIN]: ${enquiry.escalationReason}`,
      createdAt: new Date()
    });

    await enquiry.save();

    // Alert all admins
    await notifyAdmins({
      title: `URGENT: Escalated Staff Enquiry ${enquiry.enquiryId}`,
      message: `Parent ${req.user.name} escalated an enquiry regarding staff ${enquiry.staff?.user?.name || 'Staff'}. Reason: "${enquiry.escalationReason}"`,
      type: 'enquiry',
      relatedId: enquiry._id,
      link: `/admin/complaints?tab=enquiries`
    });

    // Confirmation notification to parent
    await sendNotification({
      recipient: enquiry.parent,
      title: `Enquiry ${enquiry.enquiryId} Escalated`,
      message: `Your enquiry has been escalated to school administration. An administrator will review and intervene promptly.`,
      type: 'enquiry',
      relatedId: enquiry._id,
      link: `/parent/dashboard?tab=staff`
    });

    res.status(200).json({ 
      status: true, 
      message: "Enquiry has been successfully escalated to school administrators.", 
      data: enquiry 
    });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status, internalNotes } = req.body;

    const enquiry = await StaffEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ status: false, message: "Enquiry not found" });
    }

    if (status) enquiry.status = status;
    if (internalNotes !== undefined && req.user.role === 'admin') {
      enquiry.internalNotes = internalNotes;
    }

    await enquiry.save();

    if (status === 'resolved') {
      await sendNotification({
        recipient: enquiry.parent,
        title: `Enquiry ${enquiry.enquiryId} Resolved`,
        message: `Your staff enquiry "${enquiry.subject}" has been marked as resolved.`,
        type: 'enquiry',
        relatedId: enquiry._id,
        link: `/parent/dashboard?tab=staff`
      });
    }

    res.status(200).json({ status: true, message: "Enquiry status updated successfully", data: enquiry });
  } catch (error) {
    next(error);
  }
};
