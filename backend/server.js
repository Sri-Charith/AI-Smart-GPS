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

const PORT = process.env.PORT || 5000;

// Start AI Server (FastAPI) automatically
const { spawn } = require('child_process');
const path = require('path');

const startAIServer = () => {
    const aiPath = path.join(__dirname, '..', 'python-gps', 'fastapi_server.py');
    console.log(`🚀 Starting AI Server at: ${aiPath}`);

    const aiProcess = spawn('py', ['-3.12', aiPath], { stdio: 'inherit' });

    aiProcess.on('error', (err) => {
        console.error('❌ Failed to start AI Server:', err);
    });

    // Cleanup on exit
    process.on('SIGINT', () => {
        aiProcess.kill();
        process.exit();
    });
};

app.listen(PORT, () => {
    console.log(`✅ Main Server running on port ${PORT}`);
    startAIServer();
});

console.log("✅ Guard routes loaded");
console.log("🔑 JWT_SECRET status:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Missing");