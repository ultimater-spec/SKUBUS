import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  location: { type: String },
  pickupTime: { type: String },
  dropTime: { type: String },
  order: { type: Number, required: true },
});

const routeSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  routeNumber: { type: String, required: true, unique: true },
  startingPoint: { type: String, required: true },
  destination: { type: String, required: true },
  stops: [stopSchema],
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }],
  estimatedDuration: { type: Number }, // in minutes
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Route', routeSchema);
