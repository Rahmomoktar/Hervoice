import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Report } from '../models/Report.js';
export const wrap = f => (req, res, next) => Promise.resolve(f(req, res, next)).catch(next);
export const validId = id => mongoose.isValidObjectId(id);
export const loginToken = u => jwt.sign({
  id: u.id
}, process.env.JWT_SECRET, {
  expiresIn: '2h',
  algorithm: 'HS256'
});
export const publicUser = u => ({
  id: u.id,
  name: u.name,
  role: u.role,
  profileCode: u.profileCode || null
});
export const reportJson = r => ({
  id: r.id,
  code: r.code,
  category: r.category,
  description: r.description,
  status: r.status,
  createdAt: r.createdAt,
  reviewer: r.reviewer,
  consultant: r.consultant,
  accepted: r.accepted,
  acceptedAt: r.acceptedAt,
  ...(r.$locals?.hideNotes ? {} : {
    notes: r.notes
  })
});
export async function allowedReport(req, res, reviewRead = false) {
  if (!validId(req.params.id)) {
    res.status(404).json({
      error: 'Not found'
    });
    return null;
  }
  const r = await Report.findById(req.params.id);
  if (!r) {
    res.status(404).json({
      error: 'Not found'
    });
    return null;
  }
  const u = req.user;
  if (u.role === 'reporter' && String(r.owner) !== u.id || u.role === 'reviewer' && !reviewRead && String(r.reviewer) !== u.id || u.role === 'consultant' && (!r.accepted || !reviewRead && String(r.consultant) !== u.id) || u.role === 'admin') {
    res.status(403).json({
      error: 'Not authorized for this report'
    });
    return null;
  }
  return r;
}
export const categories = ['Bullying', 'Harassment', 'Discrimination', 'Unfair Treatment', 'Other'];
