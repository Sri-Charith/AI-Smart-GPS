const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;


const createAdmin = async () => {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined in .env file");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');


  const existing = await Admin.findOne({ adminId: 'admin01' });
  if (existing) {
    console.log('⚠️ Admin already exists');
    process.exit();
  }

  //   const hashedPassword = await bcrypt.hash('admin123', 10);
  await Admin.create({
    adminId: 'admin01',
    name: 'Main Admin',
    password: 'admin123'
  });

  console.log('✅ Admin created');
  process.exit();
};

createAdmin();
