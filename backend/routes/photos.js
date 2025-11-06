import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Photo from '../models/Photo.js';
import { protect, admin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads/photos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
  }
});

// @route   GET /api/photos
// @desc    Get all photos with pagination and filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.mood) query.mood = req.query.mood;
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 }; // default: newest first
    if (req.query.sort === 'likes') sort = { likes: -1 };
    if (req.query.sort === 'views') sort = { views: -1 };
    if (req.query.sort === 'oldest') sort = { createdAt: 1 };

    const photos = await Photo.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Photo.countDocuments(query);

    res.json({
      photos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPhotos: total,
        hasMore: skip + photos.length < total
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   GET /api/photos/:id
// @desc    Get single photo by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ error: { message: 'Photo not found' } });
    }

    // Increment views
    photo.views += 1;
    await photo.save();

    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   POST /api/photos
// @desc    Upload a new photo
// @access  Private (Admin only)
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No image file provided' } });
    }

    const uploadDir = process.env.UPLOAD_DIR || 'uploads/photos';
    const imageUrl = `/${uploadDir}/${req.file.filename}`;

    const photo = new Photo({
      title: req.body.title,
      description: req.body.description,
      imageUrl,
      camera: {
        type: req.body.cameraType,
        model: req.body.cameraModel,
        brand: req.body.cameraBrand
      },
      location: req.body.location,
      resolution: {
        width: req.body.width,
        height: req.body.height
      },
      category: req.body.category,
      mood: req.body.mood,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      dateTaken: req.body.dateTaken ? new Date(req.body.dateTaken) : undefined
    });

    const savedPhoto = await photo.save();
    res.status(201).json(savedPhoto);
  } catch (error) {
    // Delete uploaded file if save fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   PUT /api/photos/:id
// @desc    Update photo details
// @access  Private (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ error: { message: 'Photo not found' } });
    }

    // Update fields
    const allowedUpdates = [
      'title', 'description', 'location', 'category', 'mood', 'tags', 'dateTaken'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        photo[field] = req.body[field];
      }
    });

    // Update camera info
    if (req.body.cameraType) photo.camera.type = req.body.cameraType;
    if (req.body.cameraModel) photo.camera.model = req.body.cameraModel;
    if (req.body.cameraBrand) photo.camera.brand = req.body.cameraBrand;

    const updatedPhoto = await photo.save();
    res.json(updatedPhoto);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   DELETE /api/photos/:id
// @desc    Delete a photo
// @access  Private (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ error: { message: 'Photo not found' } });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), photo.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await photo.deleteOne();
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   POST /api/photos/:id/like
// @desc    Toggle like on a photo
// @access  Public
router.post('/:id/like', optionalAuth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ error: { message: 'Photo not found' } });
    }

    // Use session ID or user ID for tracking likes
    const identifier = req.user ? req.user._id.toString() : req.body.sessionId || req.ip;

    if (!identifier) {
      return res.status(400).json({ error: { message: 'Session ID required for anonymous likes' } });
    }

    const likedIndex = photo.likedBy.indexOf(identifier);

    if (likedIndex > -1) {
      // Unlike
      photo.likedBy.splice(likedIndex, 1);
      photo.likes -= 1;
    } else {
      // Like
      photo.likedBy.push(identifier);
      photo.likes += 1;
    }

    await photo.save();
    res.json({ likes: photo.likes, isLiked: likedIndex === -1 });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// @route   GET /api/photos/:id/like-status
// @desc    Check if user/session has liked a photo
// @access  Public
router.get('/:id/like-status', optionalAuth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({ error: { message: 'Photo not found' } });
    }

    const identifier = req.user ? req.user._id.toString() : req.query.sessionId || req.ip;
    const isLiked = photo.likedBy.includes(identifier);

    res.json({ isLiked, likes: photo.likes });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

export default router;
