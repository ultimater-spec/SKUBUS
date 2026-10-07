import Bus from '../models/Bus.js';
import Staff from '../models/Staff.js';
import Route from '../models/Route.js';

export const getBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find()
      .populate('driver', 'user employeeId')
      .populate('attendant', 'user employeeId')
      .populate('assignedRoute', 'routeName routeNumber')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json({ status: true, message: "Buses fetched successfully", data: buses });
  } catch (error) {
    next(error);
  }
};

export const getBusById = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('driver', 'user employeeId')
      .populate('attendant', 'user employeeId')
      .populate('assignedRoute', 'routeName routeNumber')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name email phone' }
      });
      
    if (!bus) {
      return res.status(404).json({ status: false, message: "Bus not found" });
    }
    res.status(200).json({ status: true, message: "Bus fetched successfully", data: bus });
  } catch (error) {
    next(error);
  }
};

export const createBus = async (req, res, next) => {
  try {
    const bus = await Bus.create(req.body);
    
    // Update staff and route models if assigned
    if (req.body.driver) {
      await Staff.findByIdAndUpdate(req.body.driver, { assignedBus: bus._id });
    }
    if (req.body.attendant) {
      await Staff.findByIdAndUpdate(req.body.attendant, { assignedBus: bus._id });
    }
    if (req.body.assignedRoute) {
      await Route.findByIdAndUpdate(req.body.assignedRoute, { assignedBus: bus._id });
    }
    
    res.status(201).json({ status: true, message: "Bus created successfully", data: bus });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: false, message: 'Bus number or registration number already exists' });
    }
    next(error);
  }
};

export const updateBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ status: false, message: "Bus not found" });
    }

    const { driver, attendant, assignedRoute } = req.body;

    // Handle old associations
    if (driver !== undefined && bus.driver && driver !== bus.driver.toString()) {
      await Staff.findByIdAndUpdate(bus.driver, { $unset: { assignedBus: 1 } });
    }
    if (attendant !== undefined && bus.attendant && attendant !== bus.attendant.toString()) {
      await Staff.findByIdAndUpdate(bus.attendant, { $unset: { assignedBus: 1 } });
    }
    if (assignedRoute !== undefined && bus.assignedRoute && assignedRoute !== bus.assignedRoute.toString()) {
      await Route.findByIdAndUpdate(bus.assignedRoute, { $unset: { assignedBus: 1 } });
    }

    // Update bus
    const updatedBus = await Bus.findByIdAndUpdate(
      req.params.id, 
      {
        ...req.body,
        driver: driver === "" ? null : driver,
        attendant: attendant === "" ? null : attendant,
        assignedRoute: assignedRoute === "" ? null : assignedRoute,
      }, 
      { new: true, runValidators: true }
    );

    // Set new associations
    if (driver) await Staff.findByIdAndUpdate(driver, { assignedBus: updatedBus._id });
    if (attendant) await Staff.findByIdAndUpdate(attendant, { assignedBus: updatedBus._id });
    if (assignedRoute) await Route.findByIdAndUpdate(assignedRoute, { assignedBus: updatedBus._id });
    
    res.status(200).json({ status: true, message: "Bus updated successfully", data: updatedBus });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: false, message: 'Bus number or registration number already exists' });
    }
    next(error);
  }
};

export const deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ status: false, message: "Bus not found" });
    }
    
    if (bus.driver) await Staff.findByIdAndUpdate(bus.driver, { $unset: { assignedBus: 1 } });
    if (bus.attendant) await Staff.findByIdAndUpdate(bus.attendant, { $unset: { assignedBus: 1 } });
    if (bus.assignedRoute) await Route.findByIdAndUpdate(bus.assignedRoute, { $unset: { assignedBus: 1 } });

    await Bus.findByIdAndDelete(bus._id);
    
    res.status(200).json({ status: true, message: "Bus deleted successfully", data: {} });
  } catch (error) {
    next(error);
  }
};
