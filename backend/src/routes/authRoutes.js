import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'node:crypto';
import { User, Report, Message } from '../models.js';
import { auth } from '../middleware/authMiddleware.js';
import { wrap, validId, loginToken, publicUser, reportJson, allowedReport, categories } from '../utils/helpers.js';
const router = Router();
router.post('/api/auth/register', wrap(async (req, res) => {
  const {
    name,
    email,
    password
  } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 80 || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) return res.status(400).json({
    error: 'Name, valid email, and password of at least 8 characters are required'
  });
  if (await User.exists({
    email: email.trim().toLowerCase()
  })) return res.status(409).json({
    error: 'Email already registered'
  });
  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12),
    role: 'reporter',
    profileCode: 'HV-U-' + randomBytes(5).toString('hex').toUpperCase()
  });
  res.status(201).json({
    token: loginToken(user),
    user: publicUser(user)
  });
}));
router.post('/api/auth/login', wrap(async (req, res) => {
  const {
    email,
    password
  } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || Buffer.byteLength(password, 'utf8') > 72) return res.status(400).json({
    error: 'Invalid login'
  });
  const u = await User.findOne({
    email: email.trim().toLowerCase()
  }).select('+passwordHash');
  if (!u || u.active === false || !(await bcrypt.compare(password, u.passwordHash))) return res.status(401).json({
    error: 'Incorrect email or password'
  });
  res.json({
    token: loginToken(u),
    user: publicUser(u)
  });
}));
router.get('/api/auth/me', auth(), (req, res) => res.json({
  user: publicUser(req.user)
}));
router.post('/api/auth/accept-invitation', wrap(async (req,res) => {
  const {invitation,password}=req.body||{};
  if(typeof invitation!=='string'||!/^[a-f0-9]{64}$/.test(invitation)||typeof password!=='string'||password.length<8||Buffer.byteLength(password,'utf8')>72)return res.status(400).json({error:'A valid invitation and password of at least 8 characters are required'});
  const hash=createHash('sha256').update(invitation).digest('hex');
  const passwordHash=await bcrypt.hash(password,12);
  const user=await User.findOneAndUpdate({invitationHash:hash,invitationExpires:{$gt:new Date()},active:false,role:{$in:['reviewer','consultant']}},{$set:{passwordHash,active:true},$unset:{invitationHash:1,invitationExpires:1}},{new:true});
  if(!user)return res.status(400).json({error:'This invitation is invalid, expired, or already used. Ask your administrator for a new invitation.'});
  res.json({message:'Password set. You can now log in.'});
}));
export default router;
