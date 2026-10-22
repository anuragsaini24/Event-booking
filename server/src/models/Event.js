import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, index: true },
  city: { type: String, index: true },
  date: { type: Date, index: true },
  time: String,
  price: { type: Number, required: true },
  totalTickets: { type: Number, required: true },
  availableTickets: { type: Number, required: true },
  reservedTickets: { type: Number, default: 0 },
  reservationExpiresAt: Date,
  status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending' },
  ticketTypes: [{ name: String, price: Number, quantity: Number }],
  image: String,
  popularity: { type: Number, default: 0 }
}, { timestamps: true });

eventSchema.index({ title: 'text', description: 'text', city: 'text' });
export default mongoose.model('Event', eventSchema);
