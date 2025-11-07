import bcrypt from 'bcryptjs';
import User from '../models/User.js';

/**
 * Initialize admin user if it doesn't exist
 * This runs automatically on server startup
 */
export const initializeAdmin = async () => {
  try {
    // Get admin credentials from environment or use defaults
    const adminEmail = process.env.ROOT_ADMIN_EMAIL || 'admin@photogallery.local';
    const adminPassword = process.env.ROOT_ADMIN_PASSWORD || 'admin123';

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

    // Create root admin user
    console.log('🔧 Creating admin user...');
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
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ROOT ADMIN USER CREATED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ', adminEmail);
    console.log('🔑 Password: ', adminPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANT: Change password on first login!');
    console.log('🔐 Admin panel: http://localhost:3000/sudo');
    console.log('');

    return rootAdmin;
  } catch (error) {
    console.error('❌ Error initializing admin user:', error);
    throw error;
  }
};
