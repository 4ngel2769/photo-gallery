import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: { message: 'Not authorized, no token' } });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ error: { message: 'User not found' } });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ error: { message: 'User account is deactivated' } });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: { message: 'Not authorized, token failed' } });
    }
  } catch (error) {
    res.status(500).json({ error: { message: 'Server error in auth middleware' } });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: { message: 'Not authorized as admin' } });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Token invalid, but continue as guest
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
