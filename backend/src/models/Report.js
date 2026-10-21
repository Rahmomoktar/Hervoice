import mongoose from 'mongoose';
const reportSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['Bullying', 'Harassment', 'Discrimination', 'Unfair Treatment', 'Other'],
    required: true
  },
  description: {
    type: String,
    minlength: 20,
    maxlength: 2000,
    required: true
  },
  status: {
    type: String,
    enum: ['Submitted', 'Awaiting Clarification', 'Under Review', 'In Progress', 'Closed'],
    default: 'Submitted'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  consultant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  accepted: {type: Boolean, default: false},
  acceptedAt: Date,
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});
export const Report = mongoose.model('Report', reportSchema);
export default Report;
