import mongoose from 'mongoose';
import {consultantTitles,specialistCategories} from '../utils/specialists.js';
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
  consultantTitle:{type:String,enum:consultantTitles,default:'General consultant'},
  specialties:{type:[String],enum:specialistCategories,default:()=>[...specialistCategories]},
  organization:{type:String,maxlength:100,default:''},
  communityModerator: {type: Boolean, default: false},
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
