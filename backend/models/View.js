import mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo',
    required: true,
    index: true
  },
  fingerprint: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate views from same fingerprint
viewSchema.index({ photoId: 1, fingerprint: 1 });

// Auto-delete views older than 90 days
viewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export default mongoose.model('View', viewSchema);
