import express from 'express';
import Comment from '../models/Comment.js';
import Photo from '../models/Photo.js';
import { protect, admin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/comments/:photoId
// @desc    Get all comments for a photo
// @access  Public
router.get('/:photoId', async (req, res) => {
  try {
    const comments = await Comment.find({ photo: req.params.photoId })
      .populate('user', 'username displayName email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   POST /api/comments/:photoId
// @desc    Create a comment on a photo
// @access  Private
router.post('/:photoId', protect, async (req, res) => {
  try {
    // Verify photo exists
    const photo = await Photo.findById(req.params.photoId);
    if (!photo) {
      return res.status(404).json({ error: { message: 'Photo not found' } });
    }

    const comment = new Comment({
      photo: req.params.photoId,
      user: req.user._id,
      content: req.body.content
    });

    const savedComment = await comment.save();
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('user', 'username displayName email');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: { message: 'Comment not found' } });
    }

    // Check ownership
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Not authorized to update this comment' } });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    const updatedComment = await comment.save();
    const populatedComment = await Comment.findById(updatedComment._id)
      .populate('user', 'username displayName email');

    res.json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: { message: 'Comment not found' } });
    }

    // Check ownership or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Not authorized to delete this comment' } });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

export default router;
