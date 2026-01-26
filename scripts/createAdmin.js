/**
 * Script to create an admin user
 * Usage: node scripts/createAdmin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  accountStatus: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auction-platform');
    console.log('✅ Connected to MongoDB\n');

    // Get user input
    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\n⚠️  User with this email already exists!');
      const makeAdmin = await question('Do you want to make this user an admin? (yes/no): ');
      
      if (makeAdmin.toLowerCase() === 'yes' || makeAdmin.toLowerCase() === 'y') {
        existingUser.role = 'admin';
        existingUser.accountStatus = 'active';
        await existingUser.save();
        console.log('\n✅ User updated to admin successfully!');
        console.log('Email:', existingUser.email);
        console.log('Role:', existingUser.role);
      } else {
        console.log('\n❌ Operation cancelled');
      }
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const admin = new User({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        accountStatus: 'active'
      });

      await admin.save();
      console.log('\n✅ Admin user created successfully!');
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('\nYou can now login with these credentials at /login');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
createAdmin();

