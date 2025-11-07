const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

// Check if a password was provided as a command line argument
const password = process.argv[2];
if (!password) {
  console.error('Please provide a password as a command line argument');
  console.error('Usage: node .salt.js <password>');
  process.exit(1);
}

// Hash the provided password
hashPassword(password)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));