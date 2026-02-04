const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Department = require('../models/Department');
const Guard = require('../models/Guard');
const Admin = require('../models/Admin');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const signup = async (req, res) => {
  const { role, id, password, name, branch, year, section } = req.body;

  try {
    if (!role) return res.status(400).json({ message: 'Role is required' });

    let user;
    if (role === 'admin') {
      const existing = await Admin.findOne({ name: id });
      if (existing) return res.status(400).json({ message: 'Admin already exists' });
      user = new Admin({ name: id, password });
    } else if (role === 'student') {
      const existing = await Student.findOne({ studentId: id });
      if (existing) return res.status(400).json({ message: 'Student already exists' });
      user = new Student({ studentId: id, name, branch, year, section, password });
    } else if (role === 'department') {
      const existing = await Department.findOne({ deptId: id });
      if (existing) return res.status(400).json({ message: 'Department already exists' });
      user = new Department({ deptId: id, name, password });
    } else if (role === 'guard') {
      const existing = await Guard.findOne({ guardId: id });
      if (existing) return res.status(400).json({ message: 'Guard already exists' });
      user = new Guard({ guardId: id, name, password });
    }

    if (!user) return res.status(400).json({ message: 'Invalid role for signup' });

    await user.save();
    const token = generateToken({ id: user._id, role, name: user.name || id });

    return res.status(201).json({
      message: `${role} registered successfully`,
      token,
      user: { id: user._id, role, ...user._doc }
    });

  } catch (err) {
    console.error("🔥 Signup Error:", err);
    return res.status(500).json({ message: 'Server error during signup', error: err.message });
  }
};

// 🔐 Universal Login (For all roles)
const login = async (req, res) => {
  const { role, id, password } = req.body;

  try {
    if (!role) return res.status(400).json({ message: 'Role is required' });
    if (!id || !password) return res.status(400).json({ message: 'ID and Password are required' });

    let user;
    const searchId = id.trim();
    console.log(`\n🔑 Login Attempt -> Role: ${role}, ID: "${searchId}"`);

    if (role === 'admin') {
      user = await Admin.findOne({ name: searchId });
    } else if (role === 'student') {
      user = await Student.findOne({ studentId: searchId });
    } else if (role === 'department') {
      user = await Department.findOne({ deptId: searchId });
    } else if (role === 'guard') {
      user = await Guard.findOne({ guardId: searchId });
    }

    if (!user) {
      console.log(`❌ FAIL: ${role} with ID "${searchId}" not found in database.`);
      return res.status(401).json({
        message: `${role} account not found. Please verify your ID or register first.`
      });
    }

    console.log(`✅ SUCCESS: ${role} found. Verifying password...`);
    const isMatch = await user.matchPassword(password.trim());

    if (!isMatch) {
      console.log(`❌ FAIL: Password mismatch for ${role} "${searchId}"`);
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    console.log(`✨ SUCCESS: Login verified for ${role} "${searchId}"`);

    const token = generateToken({ id: user._id, role, name: user.name || searchId });

    // Create a user object without the password
    const userResponse = { ...user._doc };
    delete userResponse.password;

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, role, ...userResponse }
    });

  } catch (err) {
    console.error("🔥 INTERNAL LOGIN ERROR:", err);
    return res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

module.exports = { login, signup };
