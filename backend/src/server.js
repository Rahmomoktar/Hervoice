import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import {Report} from './models/Report.js';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
const app = express(),
  PORT = Number(process.env.PORT || 5000),
  SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 32 || SECRET.startsWith('replace-')) {
  console.error('Set a unique JWT_SECRET containing at least 32 characters');
  process.exit(1);
}
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(value => value.trim())
}));
app.use(express.json({
  limit: '15kb'
}));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
// Successful logins and health checks must not consume normal workspace traffic limits.
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  skip: req => req.path === '/health' || req.path.startsWith('/auth/'),
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: {error:'Too many workspace requests. Please pause and try again shortly.'}
}));
const failedLoginLimit = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders:'draft-8',legacyHeaders:false,
  message:{error:'Too many unsuccessful login attempts. Please wait before trying again.'}
});
app.use('/api/auth/login',failedLoginLimit);
app.use('/api/auth/register',rateLimit({
  windowMs:15*60*1000,limit:30,standardHeaders:'draft-8',legacyHeaders:false,
  message:{error:'Too many registration attempts. Please wait before creating another account.'}
}));
app.use('/api/auth/accept-invitation',rateLimit({
  windowMs:15*60*1000,limit:30,standardHeaders:'draft-8',legacyHeaders:false,
  message:{error:'Too many invitation attempts. Please wait before trying again.'}
}));
app.get('/api/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
  ok: mongoose.connection.readyState === 1,
  database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable',
  service: 'HER VOICE fictional-data prototype'
}));
app.use(authRoutes);
app.use(reportRoutes);
app.use(messageRoutes);
app.use(staffRoutes);
app.use(aiRoutes);
app.use((req, res) => res.status(404).json({
  error: 'Endpoint not found'
}));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({
    error: 'Invalid JSON body'
  });
  if (err.type === 'entity.too.large') return res.status(413).json({
    error: 'Request body too large'
  });
  if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({
    error: 'Invalid input'
  });
  console.error('Request failed:', err.name);
  if (err?.code === 11000) return res.status(409).json({
    error: 'Already exists'
  });
  res.status(500).json({
    error: 'Unexpected server error'
  });
});
try {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/her_voice_demo', {
    serverSelectionTimeoutMS: 5000
  });
  await Report.updateMany({consultant:{$ne:null},accepted:{$exists:false}},{$set:{accepted:true}});
  app.listen(PORT, process.env.HOST || '127.0.0.1', () => console.log(`HER VOICE API listening at http://localhost:${PORT}`));
} catch (e) {
  console.error('MongoDB connection failed. Check MONGO_URI and that MongoDB is running.');
  process.exit(1);
}
