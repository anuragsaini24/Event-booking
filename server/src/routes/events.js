import { Router } from 'express';
import Event from '../models/Event.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/', async (req, res) => {
  const filter = { status: 'published' };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.city) filter.city = req.query.city;
  if (req.query.search) filter.$text = { $search: req.query.search };
  res.json(await Event.find(filter).sort(req.query.sort === 'price' ? { price: 1 } : req.query.sort === 'date' ? { date: 1 } : { popularity: -1 }));
});
router.post('/', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const event = await Event.create({ ...req.body, status: 'pending', availableTickets: req.body.totalTickets, reservedTickets: 0 });
  res.status(201).json(event);
});
router.get('/:id', async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, status: 'published' });
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  res.json(event);
});
export default router;