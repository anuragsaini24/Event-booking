import { Router } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();
const secret = () => process.env.JWT_SECRET || 'development-secret';
const tokenFor = (user) => jwt.sign({ id: user._id, email: user.email, role: user.role }, secret(), { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = await User.create({ name, email, role: ['user', 'organizer'].includes(role) ? role : 'user', passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post('/forgot-password', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) { user.resetToken = crypto.randomBytes(24).toString('hex'); user.resetTokenExpires = Date.now() + 3600000; await user.save(); }
  res.json({ message: 'If the email exists, reset instructions have been sent.' });
});

router.post('/reset-password', async (req, res) => {
  const user = await User.findOne({ resetToken: req.body.token, resetTokenExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: 'Reset token is invalid or expired.' });
  user.passwordHash = await bcrypt.hash(req.body.password, 12); user.resetToken = undefined; user.resetTokenExpires = undefined; await user.save();
  res.json({ message: 'Password updated successfully.' });
});

export default router;
