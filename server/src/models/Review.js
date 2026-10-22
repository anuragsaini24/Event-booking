import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, maxlength: 1000 }
}, { timestamps: true });

reviewSchema.index({ event: 1, user: 1 }, { unique: true });
export default mongoose.model('Review', reviewSchema);