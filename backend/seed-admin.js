import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  displayName: String,
  role: String,
  isActive: Boolean,
  profilePicture: String,
  mustChangePassword: Boolean,
  lastPasswordChange: Date,
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

/**
 * Generate a secure random password using crypto
 * @param {number} length - Length of the password (default: 64)
 * @returns {string} - Base64 encoded random password
 */
const generateSecurePassword = (length = 64) => {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
};

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin credentials from environment or use defaults
    const adminEmail = process.env.ROOT_ADMIN_EMAIL || 'admin@photogallery.local';
    const passwordFilePath = join(process.cwd(), '.pswd');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Root admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      
      // Update to force password change if not already set
      if (!existingAdmin.mustChangePassword) {
        existingAdmin.mustChangePassword = true;
        await existingAdmin.save();
        console.log('🔒 Updated: Password change required on next login');
      }
    } else {
      // Create root admin user with secure random password
      console.log('🔧 Creating admin user with secure random password...');
      const adminPassword = generateSecurePassword(64);
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const rootAdmin = new User({
        username: adminEmail.split('@')[0], // Use email prefix as username
        email: adminEmail,
        password: hashedPassword,
        displayName: 'Root Administrator',
        role: 'admin',
        isActive: true,
        mustChangePassword: true,
        lastPasswordChange: null,
      });

      await rootAdmin.save();
      
      // Save password to .pswd file
      const passwordContent = `# PHOTO GALLERY - ROOT ADMIN PASSWORD
# Generated: ${new Date().toISOString()}
# Email: ${adminEmail}
# 
# ⚠️  IMPORTANT SECURITY NOTES:
# - Change this password immediately after first login
# - Delete this file after saving the password securely
# - Never commit this file to version control
# - This password was auto-generated using crypto.randomBytes(64)

Email: ${adminEmail}
Password: ${adminPassword}

Admin Panel: http://localhost:3000/sudo
`;

      writeFileSync(passwordFilePath, passwordContent, 'utf8');
      
      console.log('✅ Root admin user created successfully!');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 ROOT ADMIN CREDENTIALS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:    ', adminEmail);
      console.log('🔑 Password: ', adminPassword);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💾 Password saved to: .pswd');
      console.log('');
      console.log('⚠️  CRITICAL SECURITY STEPS:');
      console.log('   1. Copy the password above immediately');
      console.log('   2. Login and change the password');
      console.log('   3. Delete the .pswd file after securing your password');
      console.log('');
      console.log('🔐 Access admin panel at: http://localhost:3000/sudo');
      console.log('');
    }

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
