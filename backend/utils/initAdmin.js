import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import User from '../models/User.js';

/**
 * Generate a secure random password using crypto
 * @param {number} length - Length of the password (default: 64)
 * @returns {string} - Base64 encoded random password
 */
const generateSecurePassword = (length = 64) => {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
};

/**
 * Initialize admin user if it doesn't exist
 * This runs automatically on server startup
 */
export const initializeAdmin = async () => {
  try {
    // Get admin email from environment or use default
    const adminEmail = process.env.ROOT_ADMIN_EMAIL || 'admin@photogallery.local';
    const passwordFilePath = join(process.cwd(), '.pswd');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      
      // Ensure password change flag is set
      if (!existingAdmin.mustChangePassword) {
        existingAdmin.mustChangePassword = true;
        await existingAdmin.save();
        console.log('🔒 Password change required on next login');
      }
      return existingAdmin;
    }

    // Generate secure random password
    console.log('🔧 Creating admin user with secure random password...');
    const adminPassword = generateSecurePassword(64);
    
    // Create root admin user
    const rootAdmin = new User({
      username: adminEmail.split('@')[0], // Use email prefix as username
      email: adminEmail,
      password: adminPassword, // Let the User model's pre-save hook handle hashing
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
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ROOT ADMIN USER CREATED');
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
    console.log('🔐 Admin panel: http://localhost:3000/sudo');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    return rootAdmin;
  } catch (error) {
    console.error('❌ Error initializing admin user:', error);
    throw error;
  }
};
