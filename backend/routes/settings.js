import express from 'express';
import Settings from '../models/Settings.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/settings
// @desc    Get site settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   PUT /api/settings
// @desc    Update site settings
// @access  Private (Admin only)
router.put('/', protect, admin, async (req, res) => {
  try {
    let settings = await Settings.getSettings();
    
    // Update fields
    const allowedFields = [
      'siteName', 'siteDescription', 'showLikes', 'showViews', 'showComments',
      'navbarTitleEnabled', 'navbarTitle', 'navbarColor', 'navbarColorEnd',
      'seoTitle', 'seoDescription', 'seoKeywords', 'ogImage', 'twitterHandle',
      'socialLinks'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

export default router;
