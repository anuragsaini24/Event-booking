import { Router } from 'express';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/event/:eventId', async (req, res) => res.json(await Review.find({ event: req.params.eventId }).populate('user', 'name').sort({ createdAt: -1 })));
router.post('/', requireAuth, async (req, res) => {
  const booking = await Booking.findOne({ _id: req.body.bookingId, user: req.user.id, event: req.body.eventId, status: 'confirmed' });
  if (!booking) return res.status(403).json({ message: 'Only attendees with a confirmed booking can review this event.' });
  const review = await Review.create({ event: req.body.eventId, user: req.user.id, booking: booking._id, rating: req.body.rating, comment: req.body.comment });
  res.status(201).json(await review.populate('user', 'name'));
});
export default router;
