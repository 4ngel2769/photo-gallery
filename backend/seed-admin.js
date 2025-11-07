import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

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

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin credentials from environment or use defaults
    const adminEmail = process.env.ROOT_ADMIN_EMAIL || 'admin@photogallery.local';
    const adminPassword = process.env.ROOT_ADMIN_PASSWORD || 'admin123';

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
      // Create root admin user
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
      
      console.log('✅ Root admin user created successfully!');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 ROOT ADMIN CREDENTIALS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:    ', adminEmail);
      console.log('🔑 Password: ', adminPassword);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('⚠️  IMPORTANT: You MUST change this password on first login!');
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
