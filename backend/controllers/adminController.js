const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('../utils/cloudinary');
const Student = require('../models/Student');
const Department = require('../models/Department');
const Guard = require('../models/Guard');
const Admin = require('../models/Admin');
const { extractEmbedding } = require('../utils/embeddingUtil');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// 🔐 Admin Login
exports.adminLogin = async (req, res) => {
    const { name, password } = req.body;
    console.log("📝 Incoming Login Request:", { name });

    try {
        const user = await Admin.findOne({ name });

        if (!user) {
            console.log("❌ Admin name not found!");
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            console.log("❌ Password did not match!");
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({ id: user._id, role: 'admin' });
        console.log("✅ Token generated successfully");

        return res.status(200).json({ message: 'Login successful', token, admin: user });

    } catch (err) {
        console.error("🔥 Server error during admin login:", err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 📝 Admin Signup
exports.adminSignup = async (req, res) => {
    const { name, password } = req.body;
    try {
        const existingAdmin = await Admin.findOne({ name });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this name already exists' });
        }

        const newAdmin = new Admin({ name, password });
        await newAdmin.save();

        const token = generateToken({ id: newAdmin._id, role: 'admin' });
        res.status(201).json({ message: 'Admin registered successfully', token, admin: newAdmin });
    } catch (err) {
        res.status(500).json({ message: 'Failed to register admin', error: err.message });
    }
};


// 👤 Add Student
exports.addStudent = async (req, res) => {
    try {
        const { studentId, name, year, branch, section, password } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ message: 'Photo is required' });

        const uploadRes = await cloudinary.uploader.upload(file.path);
        const imageUrl = uploadRes.secure_url;

        const embedding = await extractEmbedding(imageUrl);

        const newStudent = new Student({
            studentId,
            name,
            year,
            branch,
            section,
            imageUrl,
            password, // Let the model hash this in pre-save hook
            embedding
        });

        await newStudent.save();
        res.status(201).json({ message: 'Student added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add student', error: err.message });
    }
};

// 🧑‍🏫 Add Department
exports.addDepartment = async (req, res) => {
    try {
        const { deptId, name, password } = req.body;

        const newDept = new Department({ deptId, name, password });
        await newDept.save();
        res.status(201).json({ message: 'Department added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add department', error: err.message });
    }
};

// 🛡 Add Guard
exports.addGuard = async (req, res) => {
    try {
        const { guardId, name, password } = req.body;

        const newGuard = new Guard({ guardId, name, password });
        await newGuard.save();
        res.status(201).json({ message: 'Guard added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add guard', error: err.message });
    }
};
