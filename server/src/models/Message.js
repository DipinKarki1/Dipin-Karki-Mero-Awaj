import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.ObjectId,
    ref: 'Issue',
    required: true,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Please add a message text'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Message', messageSchema);
