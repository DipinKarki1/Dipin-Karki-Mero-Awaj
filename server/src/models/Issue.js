import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  locationCoords: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Road', 'Water', 'Electricity'],
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open',
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  votes: {
    type: [mongoose.Schema.ObjectId],
    ref: 'User',
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  progressUpdates: [
    {
      status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    createdAt: {
      type: Date,
    },
  },
  imageUrl: {
    type: String,
  },
});

export default mongoose.model('Issue', issueSchema);
