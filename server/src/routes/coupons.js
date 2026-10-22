import { Router } from 'express';
import Coupon from '../models/Coupon.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/validate', requireAuth, async (req, res) => {
  const code = String(req.body.code || '').toUpperCase();
  const subtotal = Number(req.body.subtotal || 0);
  const coupon = await Coupon.findOne({ code, active: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] });
  if (!coupon || subtotal < coupon.minimumOrder || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) return res.status(400).json({ valid: false, message: 'Coupon is invalid, expired, or does not meet the order minimum.' });
  let discount = coupon.discountType === 'percent' ? subtotal * coupon.value / 100 : coupon.value;
  if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
  discount = Math.min(discount, subtotal);
  res.json({ valid: true, code: coupon.code, discount });
});
export default router;
