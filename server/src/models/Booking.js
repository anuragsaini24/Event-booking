import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  quantity: { type: Number, min: 1, required: true },
  ticketId: { type: String, unique: true, required: true },
  ticketType: { type: String, enum: ['General', 'VIP', 'Premium'], default: 'General' },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  platformFee: { type: Number, default: 20 },
  totalAmount: { type: Number, required: true },
  paymentOrderId: String,
  paymentId: String,
  checkedIn: { type: Boolean, default: false },
  status: { type: String, enum: ['reserved', 'confirmed', 'cancelled', 'payment_failed'], default: 'reserved' },
  couponCode: String,
  reservationExpiresAt: Date
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
