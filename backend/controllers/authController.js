const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Department = require('../models/Department');
const Guard = require('../models/Guard');
const Admin = require('../models/Admin');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// 🔐 Universal Login (For all roles)
const login = async (req, res) => {
  const { role, id, password, name, branch, year, section } = req.body;

  try {
    if (!role) return res.status(400).json({ message: 'Role is required' });

    let user;
    if (role === 'admin') {
      user = await Admin.findOne({ name: id });
    } else if (role === 'student') {
      user = await Student.findOne({ studentId: id, name, branch, year, section });
    } else if (role === 'department') {
      user = await Department.findOne({ deptId: id, name });
    } else if (role === 'guard') {
      user = await Guard.findOne({ guardId: id, name });
    }

    if (!user) return res.status(401).json({ message: `${role} not found with these details` });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = generateToken({ id: user._id, role, name: user.name || id });
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, role, ...user._doc }
    });

  } catch (err) {
    console.error("🔥 Login Error:", err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { login };
