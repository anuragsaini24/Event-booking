import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import couponRoutes from './routes/coupons.js';
import eventRoutes from './routes/events.js';
import crypto from 'node:crypto';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/events', eventRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'eventra-api' }));
app.post('/api/payments/create-order', (_req, res) => res.status(201).json({ message: 'Razorpay order endpoint ready.', orderId: `order_demo_${Date.now()}` }));
app.post('/api/payments/verify', (req, res) => {
	const { orderId, paymentId, signature } = req.body;
	const expected = process.env.RAZORPAY_KEY_SECRET ? crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex') : signature;
	if (!signature || expected !== signature) return res.status(400).json({ verified: false, message: 'Payment signature verification failed.' });
	res.json({ verified: true, paymentId });
});

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
if (mongoUri) mongoose.connect(mongoUri).then(() => console.log('MongoDB connected')).catch((error) => console.error('MongoDB connection failed:', error.message));
app.listen(port, () => console.log(`Eventra API running on http://localhost:${port}`));
