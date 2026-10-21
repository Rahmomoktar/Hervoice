import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { User, Report, Message } from '../models.js';
import { auth } from '../middleware/authMiddleware.js';
import { wrap, validId, loginToken, publicUser, reportJson, allowedReport, categories } from '../utils/helpers.js';
const router = Router();
router.get('/api/reports/:id/messages', auth('reporter', 'reviewer', 'consultant'), wrap(async (req, res) => {
  const r = await allowedReport(req, res);
  if (!r) return;
  const msgs = await Message.find({
    report: r._id
  }).sort({
    createdAt: 1
  }).limit(200);
  res.json({
    messages: msgs.map(m => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      createdAt: m.createdAt
    }))
  });
}));
router.post('/api/reports/:id/messages', auth('reporter', 'reviewer', 'consultant'), wrap(async (req, res) => {
  const r = await allowedReport(req, res);
  if (!r) return;
  const {
    text
  } = req.body || {};
  if (typeof text !== 'string' || text.trim().length < 2 || text.length > 1000) return res.status(400).json({
    error: 'Message must be 2–1000 characters'
  });
  if (req.user.role === 'reporter' && !r.reviewer) return res.status(400).json({
    error: 'A reviewer has not been assigned yet'
  });
  const m = await Message.create({
    report: r._id,
    sender: req.user._id,
    text: text.trim()
  });
  res.status(201).json({
    message: {
      id: m.id,
      text: m.text
    }
  });
}));
export default router;
