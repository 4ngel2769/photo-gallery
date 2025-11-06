import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Site Configuration
  siteName: {
    type: String,
    default: 'Photo Gallery'
  },
  siteDescription: {
    type: String,
    default: 'A beautiful photo gallery'
  },
  
  // Display Settings
  showLikes: {
    type: Boolean,
    default: true
  },
  showViews: {
    type: Boolean,
    default: true
  },
  showComments: {
    type: Boolean,
    default: true
  },
  
  // Navbar Settings
  navbarTitleEnabled: {
    type: Boolean,
    default: true
  },
  navbarTitle: {
    type: String,
    default: 'Photo Gallery'
  },
  navbarColor: {
    type: String,
    default: '#9333ea' // purple-600
  },
  navbarColorEnd: {
    type: String,
    default: '#db2777' // pink-600
  },
  
  // SEO Settings
  seoTitle: {
    type: String,
    default: 'Photo Gallery - Beautiful Photography'
  },
  seoDescription: {
    type: String,
    default: 'Discover stunning photography in our beautiful gallery'
  },
  seoKeywords: {
    type: String,
    default: 'photography, gallery, photos, images, art'
  },
  ogImage: {
    type: String,
    default: ''
  },
  twitterHandle: {
    type: String,
    default: ''
  },
  
  // Social Links
  socialLinks: {
    instagram: {
      type: String,
      default: ''
    },
    pixabay: {
      type: String,
      default: ''
    },
    pexels: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('Settings', settingsSchema);
