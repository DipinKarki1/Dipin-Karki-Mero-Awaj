import mongoose from 'mongoose';

const awarenessSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Guideline', 'News', 'Rights', 'Environment'],
  },
  image: {
    type: String,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Awareness', awarenessSchema);
