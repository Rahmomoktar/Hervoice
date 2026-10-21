import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models.js';
const {
  ADMIN_NAME,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  MONGO_URI
} = process.env;
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env');
  process.exit(1);
}
try {
  await mongoose.connect(MONGO_URI || 'mongodb://127.0.0.1:27017/her_voice_demo', {
    serverSelectionTimeoutMS: 5000
  });
  if (await User.exists({
    email: ADMIN_EMAIL.trim().toLowerCase()
  })) {
    console.log('Account already exists; no changes made');
  } else {
    if (ADMIN_PASSWORD.length < 8 || Buffer.byteLength(ADMIN_PASSWORD,'utf8') > 72) throw new Error('New administrator passwords must be at least 8 characters');
    if (await User.exists({role:'admin'}) && process.env.ALLOW_ADDITIONAL_ADMIN !== 'true') {
      throw new Error('Additional administrators require explicit setup authorization');
    }
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
      role: 'admin'
    });
    console.log('Administrator created:', ADMIN_EMAIL);
  }
  await mongoose.disconnect();
} catch (e) {
  console.error('Administrator seed failed. Check MongoDB connection and admin settings.');
  process.exit(1);
}
