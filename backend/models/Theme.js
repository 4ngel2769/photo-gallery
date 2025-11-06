import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'default'
  },
  customCSS: {
    type: String,
    default: ''
  },
  colors: {
    primary: String,
    secondary: String,
    accent: String,
    background: String,
    foreground: String
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Theme', themeSchema);
