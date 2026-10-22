import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['fixed', 'percent'], default: 'fixed' },
  value: { type: Number, required: true },
  minimumOrder: { type: Number, default: 0 },
  maximumDiscount: Number,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  expiresAt: Date,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);