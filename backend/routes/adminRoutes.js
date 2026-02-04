const express = require('express');
const router = express.Router();
const { adminLogin, adminSignup, addStudent, addDepartment, addGuard } = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Admin login route
router.post('/login', adminLogin);
router.post('/signup', adminSignup);
router.post('/add-student', authenticateToken, upload.single('photo'), addStudent);
router.post('/add-department', authenticateToken, addDepartment);
router.post('/add-guard', authenticateToken, addGuard);

module.exports = router;
