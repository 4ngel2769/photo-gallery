import express from 'express';
import Theme from '../models/Theme.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/themes/active
// @desc    Get active theme
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const theme = await Theme.findOne({ isActive: true });
    res.json(theme || { customCSS: '', colors: {} });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   GET /api/themes
// @desc    Get all themes
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const themes = await Theme.find();
    res.json(themes);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   POST /api/themes
// @desc    Create or update theme
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    // Deactivate all themes
    await Theme.updateMany({}, { isActive: false });

    // Find or create default theme
    let theme = await Theme.findOne({ name: req.body.name || 'default' });
    
    if (!theme) {
      theme = new Theme({
        name: req.body.name || 'default'
      });
    }

    theme.customCSS = req.body.customCSS || '';
    theme.colors = req.body.colors || {};
    theme.isActive = true;

    await theme.save();
    res.json(theme);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

export default router;
