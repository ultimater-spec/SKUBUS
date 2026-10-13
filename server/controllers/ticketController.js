import Ticket from '../models/Ticket.js';
import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import { sendNotification, notifyAdmins } from '../utils/notify.js';

export const getTickets = async (req, res, next) => {
  try {
    const { status, category, priority, search } = req.query;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Parents strictly scoped to their own tickets
    if (req.user.role === 'parent') {
      query.parent = req.user._id;
    }

    let tickets = await Ticket.find(query)
      .populate('parent', 'name email phone role profileImage')
      .populate('student', 'name studentId className division')
      .populate('assignedAdmin', 'name email role')
      .populate('messages.sender', 'name role profileImage')
      .sort({ createdAt: -1 });

    if (req.user.role !== 'admin') {
      tickets = tickets.map(t => {
        const obj = t.toObject();
        delete obj.internalNotes;
        return obj;
      });
    }

    if (search) {
      const q = search.toLowerCase();
      tickets = tickets.filter(t => 
        t.ticketId?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.parent?.name?.toLowerCase().includes(q) ||
        t.student?.name?.toLowerCase().includes(q)
      );
    }

    res.status(200).json({ status: true, message: "Tickets fetched successfully", data: tickets });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('parent', 'name email phone role profileImage')
      .populate('student', 'name studentId className division')
      .populate('assignedAdmin', 'name email role profileImage')
      .populate('messages.sender', 'name role profileImage');

    if (!ticket) {
      return res.status(404).json({ status: false, message: "Support ticket not found" });
    }

    if (req.user.role === 'parent' && ticket.parent._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: false, message: "Not authorized to view this ticket" });
    }

    const result = ticket.toObject();
    if (req.user.role !== 'admin') {
      delete result.internalNotes;
    }

    res.status(200).json({ status: true, message: "Ticket fetched successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req, res, next) => {
  try {
    const { subject, category, description, studentId, student, priority } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ status: false, message: "Ticket subject and description are required" });
    }

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
          return res.status(403).json({ status: false, message: "Selected student is not authorized for your account" });
        }
      }
    }

    const count = await Ticket.countDocuments();
    const ticketId = `TCK-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const ticket = await Ticket.create({
      ticketId,
      parent: req.user._id,
      student: targetStudentId || null,
      subject: subject.trim(),
      category: category || 'General',
      description: description.trim(),
      priority: priority || 'normal',
      status: 'open',
      messages: [{
        sender: req.user._id,
        senderName: req.user.name,
        senderRole: req.user.role,
        message: description.trim(),
        createdAt: new Date()
      }]
    });

    const populated = await Ticket.findById(ticket._id)
      .populate('parent', 'name email phone')
      .populate('student', 'name studentId className');

    // Notify administrators of new ticket
    await notifyAdmins({
      title: `New Support Ticket: ${ticket.ticketId}`,
      message: `${req.user.name} created ticket "${ticket.subject}" [${ticket.category}].`,
      type: 'ticket',
      relatedId: ticket._id,
      link: `/admin/complaints?tab=tickets`
    });

    res.status(201).json({ 
      status: true, 
      message: "Support ticket created successfully. An administrator will respond shortly.", 
      data: populated 
    });
  } catch (error) {
    next(error);
  }
};

export const replyTicket = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ status: false, message: "Reply message cannot be empty" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ status: false, message: "Ticket not found" });
    }

    if (req.user.role === 'parent' && ticket.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: false, message: "Not authorized to reply to this ticket" });
    }

    ticket.messages.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim(),
      createdAt: new Date()
    });

    // Update status based on who replied
    if (req.user.role === 'admin') {
      ticket.status = 'waiting_for_parent';
      ticket.assignedAdmin = req.user._id;
    } else if (req.user.role === 'parent') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    // Send notifications
    if (req.user.role === 'parent') {
      await notifyAdmins({
        title: `Reply on Ticket ${ticket.ticketId}`,
        message: `${req.user.name} replied to ticket "${ticket.subject}".`,
        type: 'ticket',
        relatedId: ticket._id,
        link: `/admin/complaints?tab=tickets`
      });
    } else {
      await sendNotification({
        recipient: ticket.parent,
        title: `Admin Reply on Ticket ${ticket.ticketId}`,
        message: `Admin ${req.user.name} replied to your support ticket "${ticket.subject}".`,
        type: 'ticket',
        relatedId: ticket._id,
        link: `/parent/dashboard?tab=tickets`
      });
    }

    const updated = await Ticket.findById(ticket._id)
      .populate('parent', 'name email')
      .populate('student', 'name studentId')
      .populate('assignedAdmin', 'name')
      .populate('messages.sender', 'name role profileImage');

    res.status(200).json({ status: true, message: "Reply posted successfully", data: updated });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ status: false, message: "Ticket not found" });
    }

    const { status, internalNotes, assignedAdmin } = req.body;

    // Parents can only close their own tickets
    if (req.user.role === 'parent') {
      if (ticket.parent.toString() !== req.user._id.toString()) {
        return res.status(403).json({ status: false, message: "Not authorized" });
      }
      if (status !== 'closed') {
        return res.status(403).json({ status: false, message: "Parents can only close resolved tickets" });
      }
      ticket.status = 'closed';
      ticket.closedAt = new Date();
      ticket.closedBy = req.user._id;
    } else if (req.user.role === 'admin') {
      if (status) ticket.status = status;
      if (internalNotes !== undefined) ticket.internalNotes = internalNotes;
      if (assignedAdmin) ticket.assignedAdmin = assignedAdmin;
      if (status === 'closed' || status === 'resolved') {
        ticket.closedAt = new Date();
        ticket.closedBy = req.user._id;
      }
    }

    await ticket.save();

    // Notify parent if admin changed status
    if (req.user.role === 'admin') {
      await sendNotification({
        recipient: ticket.parent,
        title: `Ticket ${ticket.ticketId} Status: ${ticket.status.toUpperCase()}`,
        message: `Your ticket "${ticket.subject}" status was updated to ${ticket.status}.`,
        type: 'ticket',
        relatedId: ticket._id,
        link: `/parent/dashboard?tab=tickets`
      });
    }

    const updated = await Ticket.findById(ticket._id)
      .populate('parent', 'name email')
      .populate('student', 'name studentId')
      .populate('assignedAdmin', 'name')
      .populate('messages.sender', 'name role profileImage');

    res.status(200).json({ status: true, message: "Ticket status updated successfully", data: updated });
  } catch (error) {
    next(error);
  }
};
