import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['reporter', 'reviewer', 'consultant', 'admin'],
    required: true
  },
  removedAt: {type: Date, default: null},
  active: {type: Boolean, default: true},
  invitationHash: {type: String, select: false},
  invitationExpires: {type: Date, select: false},
  profileCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});
export const User = mongoose.model('User', userSchema);
export default User;
