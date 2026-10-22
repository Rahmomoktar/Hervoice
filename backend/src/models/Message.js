import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  visibility: {
    type: String,
    enum: ['participants'],
    default: 'participants',
    required: true
  }
}, {
  timestamps: true
});
export const Message = mongoose.model('Message', messageSchema);
export default Message;
