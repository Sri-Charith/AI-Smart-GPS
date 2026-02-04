const dotenv = require('dotenv');
dotenv.config();
const express = require('express');

const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const gatepassRoutes = require('./routes/gatepassRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const guardRoutes = require('./routes/guardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');


const cors = require('cors');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/students', studentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gatepass', gatepassRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/guard', guardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
// Routes




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
console.log("✅ Guard routes loaded");
console.log("🔑 JWT_SECRET status:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Missing");
