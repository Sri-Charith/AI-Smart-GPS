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
            studentId: studentId.trim(),
            name: name.trim(),
            year: year.trim(),
            branch: branch.trim(),
            section: section.trim(),
            imageUrl,
            password, // Let the model hash this in pre-save hook
            embedding
        });

        await newStudent.save();
        console.log(`✅ Student ${studentId.trim()} added successfully`);
        res.status(201).json({ message: 'Student added successfully' });
    } catch (err) {
        console.error("🔥 Error adding student:", err.message);
        res.status(500).json({ message: 'Failed to add student', error: err.message });
    }
};

// 🧑‍🏫 Add Department
exports.addDepartment = async (req, res) => {
    try {
        const { deptId, name, password, department } = req.body;

        const newDept = new Department({
            deptId: deptId.trim(),
            name: name.trim(),
            password: password.trim(),
            department: department ? department.trim() : ""
        });
        await newDept.save();
        console.log(`✅ HOD ${deptId.trim()} added successfully`);
        res.status(201).json({ message: 'Department added successfully' });
    } catch (err) {
        console.error("🔥 Error adding department:", err.message);
        res.status(500).json({ message: 'Failed to add department', error: err.message });
    }
};

// 🛡 Add Guard
exports.addGuard = async (req, res) => {
    try {
        const { guardId, name, password } = req.body;

        const newGuard = new Guard({
            guardId: guardId.trim(),
            name: name.trim(),
            password: password.trim()
        });
        await newGuard.save();
        console.log(`✅ Guard ${guardId.trim()} added successfully`);
        res.status(201).json({ message: 'Guard added successfully' });
    } catch (err) {
        console.error("🔥 Error adding guard:", err.message);
        res.status(500).json({ message: 'Failed to add guard', error: err.message });
    }
};

// 📋 Get All Students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find({}, '-password');
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch students', error: err.message });
    }
};

// 📋 Get All Departments
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find({}, '-password');
        res.status(200).json(departments);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch departments', error: err.message });
    }
};

// 📋 Get All Guards
exports.getAllGuards = async (req, res) => {
    try {
        const guards = await Guard.find({}, '-password');
        res.status(200).json(guards);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch guards', error: err.message });
    }
};

const GatePassRequest = require('../models/GatePassRequest');

// 🗑 Delete Student
exports.deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        await Student.findByIdAndDelete(studentId);
        // Cascading delete for requests
        await GatePassRequest.deleteMany({ student: studentId });

        res.status(200).json({ message: 'Student and associated requests deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete student', error: err.message });
    }
};


// 🗑 Delete Department
exports.deleteDepartment = async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete department', error: err.message });
    }
};

// 🗑 Delete Guard
exports.deleteGuard = async (req, res) => {
    try {
        await Guard.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Guard deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete guard', error: err.message });
    }
};

// 🔄 Update Student
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const { studentId, name, year, branch, section, password } = req.body;
        const file = req.file;

        if (studentId) student.studentId = studentId.trim();
        if (name) student.name = name.trim();
        if (year) student.year = year.trim();
        if (branch) student.branch = branch.trim();
        if (section) student.section = section.trim();
        if (password && password.trim()) student.password = password.trim();
        else if (password === "") { /* do nothing, don't update to empty */ }

        if (file) {
            const uploadRes = await cloudinary.uploader.upload(file.path);
            student.imageUrl = uploadRes.secure_url;
            student.embedding = await extractEmbedding(student.imageUrl);
        }

        await student.save();
        console.log(`✅ Student ${student.studentId} updated successfully`);
        res.status(200).json({ message: 'Student updated successfully', student });
    } catch (err) {
        console.error("🔥 Error updating student:", err.message);
        res.status(500).json({ message: 'Failed to update student', error: err.message });
    }
};

// 🔄 Update Department
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const dept = await Department.findById(id);
        if (!dept) return res.status(404).json({ message: 'Department not found' });

        const { deptId, name, password, department } = req.body;
        if (deptId) dept.deptId = deptId.trim();
        if (name) dept.name = name.trim();
        if (department) dept.department = department.trim();
        if (password && password.trim()) dept.password = password.trim();

        await dept.save();
        console.log(`✅ HOD ${dept.deptId} updated successfully. Password modified: ${!!(password && password.trim())}`);
        res.status(200).json({ message: 'Department updated successfully', dept });
    } catch (err) {
        console.error("🔥 Error updating department:", err.message);
        res.status(500).json({ message: 'Failed to update department', error: err.message });
    }
};

// 🔄 Update Guard
exports.updateGuard = async (req, res) => {
    try {
        const { id } = req.params;
        const guard = await Guard.findById(id);
        if (!guard) return res.status(404).json({ message: 'Guard not found' });

        const { guardId, name, password } = req.body;
        if (guardId) guard.guardId = guardId.trim();
        if (name) guard.name = name.trim();
        if (password && password.trim()) guard.password = password.trim();

        await guard.save();
        console.log(`✅ Guard ${guard.guardId} updated successfully. Password modified: ${!!(password && password.trim())}`);
        res.status(200).json({ message: 'Guard updated successfully', guard });
    } catch (err) {
        console.error("🔥 Error updating guard:", err.message);
        res.status(500).json({ message: 'Failed to update guard', error: err.message });
    }
};

// 🔄 Refresh Student Embedding (AI Backfill)
exports.refreshStudentEmbedding = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        if (!student.imageUrl) return res.status(400).json({ message: 'No photo found for this student to analyze' });

        console.log(`🤖 Re-analyzing face for: ${student.name} (${student.studentId})`);
        const embedding = await extractEmbedding(student.imageUrl);

        if (!embedding) {
            return res.status(500).json({ message: 'AI Analysis failed. Please check the photo quality.' });
        }

        student.embedding = embedding;
        await student.save();

        res.status(200).json({ message: 'AI Face Data recalibrated successfully', student });
    } catch (err) {
        console.error("🔥 Error refreshing embedding:", err.message);
        res.status(500).json({ message: 'Failed to refresh face data', error: err.message });
    }
};
