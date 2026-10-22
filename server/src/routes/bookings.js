import { Router } from 'express';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import { requireAuth } from '../middleware/auth.js';
import crypto from 'node:crypto';
import mongoose from 'mongoose';

const router = Router();
router.get('/mine', requireAuth, async (req, res) => res.json(await Booking.find({ user: req.user.id }).populate('event').sort({ createdAt: -1 })));
router.post('/', requireAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const event = await Event.findOneAndUpdate(
    { _id: req.body.eventId, availableTickets: { $gte: Number(req.body.quantity) } },
    { $inc: { availableTickets: -Number(req.body.quantity), reservedTickets: Number(req.body.quantity) } },
    { new: true, session }
  );
  const quantity = Number(req.body.quantity);
  if (!event || !quantity) { await session.abortTransaction(); session.endSession(); return res.status(400).json({ message: 'Tickets are no longer available.' }); }
  const subtotal = event.price * quantity;
  const discount = Math.min(Number(req.body.discount || 0), subtotal);
  const platformFee = 20;
  const booking = await Booking.create([{ user: req.user.id, event: event._id, quantity, ticketType: req.body.ticketType || 'General', ticketId: `EVT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`, subtotal, discount, platformFee, totalAmount: subtotal - discount + platformFee, paymentOrderId: req.body.paymentOrderId, paymentId: req.body.paymentId, reservationExpiresAt: new Date(Date.now() + 10 * 60 * 1000) }], { session });
  await session.commitTransaction(); session.endSession();
  res.status(201).json(await booking[0].populate('event'));
});
router.patch('/:id/confirm', requireAuth, async (req, res) => {
  const booking = await Booking.findOneAndUpdate({ _id: req.params.id, user: req.user.id, status: 'reserved', reservationExpiresAt: { $gt: new Date() } }, { $set: { status: 'confirmed' }, $unset: { reservationExpiresAt: 1 } }, { new: true }).populate('event');
  if (!booking) return res.status(400).json({ message: 'Reservation expired. Please select seats again.' });
  await Event.findByIdAndUpdate(booking.event._id, { $inc: { reservedTickets: -booking.quantity } });
  res.json(booking);
});
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id, status: 'confirmed' });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  booking.status = 'cancelled'; await booking.save(); await Event.findByIdAndUpdate(booking.event, { $inc: { availableTickets: booking.quantity } });
  res.json(booking);
});
router.post('/verify/:ticketId', requireAuth, async (req, res) => {
  const booking = await Booking.findOne({ ticketId: req.params.ticketId }).populate('event').populate('user', 'name email');
  if (!booking) return res.status(404).json({ valid: false, message: 'Ticket not found.' });
  if (booking.checkedIn) return res.status(409).json({ valid: false, message: 'Ticket has already been checked in.' });
  booking.checkedIn = true;
  await booking.save();
  res.json({ valid: true, message: 'Ticket checked in.', booking });
});
export default router;
