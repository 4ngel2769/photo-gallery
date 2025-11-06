import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  camera: {
    type: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    brand: {
      type: String,
      trim: true
    }
  },
  location: {
    type: String,
    trim: true
  },
  resolution: {
    width: Number,
    height: Number
  },
  category: {
    type: String,
    trim: true,
    enum: ['landscape', 'portrait', 'wildlife', 'street', 'architecture', 'nature', 'other']
  },
  mood: {
    type: String,
    enum: ['warm', 'neutral', 'cold', 'serene', 'vibrant', 'moody', 'dreamy'],
    default: 'neutral'
  },
  tags: [{
    type: String,
    trim: true
  }],
  dateTaken: {
    type: Date
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String // Will store session IDs or user IDs
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
photoSchema.index({ category: 1, mood: 1 });
photoSchema.index({ createdAt: -1 });
photoSchema.index({ likes: -1 });

export default mongoose.model('Photo', photoSchema);
