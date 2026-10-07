import Complaint from '../models/Complaint.js';

export const getComplaints = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    if (req.user.role === 'parent') {
      query.user = req.user._id;
    }

    const complaints = await Complaint.find(query)
      .populate('user', 'name email phone role')
      .populate('student', 'name studentId className division')
      .populate('repliedBy', 'name')
      .sort({ createdAt: -1 });

    if (search) {
      const lowerSearch = search.toLowerCase();
      const filtered = complaints.filter(c => 
        c.complaintId.toLowerCase().includes(lowerSearch) || 
        c.subject.toLowerCase().includes(lowerSearch)
      );
      return res.status(200).json({ status: true, message: "Complaints fetched successfully", data: filtered });
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
      .populate('repliedBy', 'name role profileImage');
      
    if (!complaint) {
      return res.status(404).json({ status: false, message: "Complaint not found" });
    }
    
    if (req.user.role === 'parent' && complaint.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: false, message: "Not authorized to view this complaint" });
    }
    
    res.status(200).json({ status: true, message: "Complaint fetched successfully", data: complaint });
  } catch (error) {
    next(error);
  }
};

export const createComplaint = async (req, res, next) => {
  try {
    const count = await Complaint.countDocuments();
    const complaintId = `CMP-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    
    const complaintData = {
      ...req.body,
      complaintId,
      user: req.user._id
    };
    
    const complaint = await Complaint.create(complaintData);
    
    const populated = await Complaint.findById(complaint._id)
      .populate('user', 'name email')
      .populate('student', 'name');
      
    res.status(201).json({ status: true, message: "Complaint created successfully", data: populated });
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

    const updateData = { ...req.body };
    
    if (req.body.adminReply) {
      updateData.repliedBy = req.user._id;
      updateData.repliedAt = new Date();
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    )
    .populate('user', 'name email')
    .populate('student', 'name')
    .populate('repliedBy', 'name');
    
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
