import Route from '../models/Route.js';
import Bus from '../models/Bus.js';

export const getRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find()
      .populate('assignedBus', 'busNumber registrationNumber')
      .populate('assignedStaff', 'user employeeId')
      .populate({
        path: 'assignedStaff',
        populate: { path: 'user', select: 'name phone' }
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json({ status: true, message: "Routes fetched successfully", data: routes });
  } catch (error) {
    next(error);
  }
};

export const getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('assignedBus', 'busNumber registrationNumber')
      .populate('assignedStaff', 'user employeeId')
      .populate({
        path: 'assignedStaff',
        populate: { path: 'user', select: 'name phone' }
      });
      
    if (!route) {
      return res.status(404).json({ status: false, message: "Route not found" });
    }
    res.status(200).json({ status: true, message: "Route fetched successfully", data: route });
  } catch (error) {
    next(error);
  }
};

export const createRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);
    
    if (req.body.assignedBus) {
      await Bus.findByIdAndUpdate(req.body.assignedBus, { assignedRoute: route._id });
    }
    
    res.status(201).json({ status: true, message: "Route created successfully", data: route });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: false, message: 'Route number already exists' });
    }
    next(error);
  }
};

export const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ status: false, message: "Route not found" });
    }

    const { assignedBus } = req.body;

    if (assignedBus !== undefined && route.assignedBus && assignedBus !== route.assignedBus.toString()) {
      await Bus.findByIdAndUpdate(route.assignedBus, { $unset: { assignedRoute: 1 } });
    }

    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id, 
      {
        ...req.body,
        assignedBus: assignedBus === "" ? null : assignedBus,
      }, 
      { new: true, runValidators: true }
    );

    if (assignedBus) await Bus.findByIdAndUpdate(assignedBus, { assignedRoute: updatedRoute._id });
    
    res.status(200).json({ status: true, message: "Route updated successfully", data: updatedRoute });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: false, message: 'Route number already exists' });
    }
    next(error);
  }
};

export const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ status: false, message: "Route not found" });
    }
    
    if (route.assignedBus) await Bus.findByIdAndUpdate(route.assignedBus, { $unset: { assignedRoute: 1 } });

    await Route.findByIdAndDelete(route._id);
    
    res.status(200).json({ status: true, message: "Route deleted successfully", data: {} });
  } catch (error) {
    next(error);
  }
};
