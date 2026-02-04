const express = require('express');
const router = express.Router();
const {
    adminLogin,
    adminSignup,
    addStudent,
    addDepartment,
    addGuard,
    getAllStudents,
    getAllDepartments,
    getAllGuards,
    deleteStudent,
    deleteDepartment,
    deleteGuard,
    updateStudent,
    updateDepartment,
    updateGuard
} = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Admin login route
router.post('/login', adminLogin);
router.post('/signup', adminSignup);

// Data fetching routes
router.get('/students', authenticateToken, getAllStudents);
router.get('/departments', authenticateToken, getAllDepartments);
router.get('/guards', authenticateToken, getAllGuards);

// Member adding routes
router.post('/add-student', authenticateToken, upload.single('photo'), addStudent);
router.post('/add-department', authenticateToken, addDepartment);
router.post('/add-guard', authenticateToken, addGuard);

// Member deletion routes
router.delete('/student/:id', authenticateToken, deleteStudent);
router.delete('/department/:id', authenticateToken, deleteDepartment);
router.delete('/guard/:id', authenticateToken, deleteGuard);

// Member update routes
router.put('/student/:id', authenticateToken, upload.single('photo'), updateStudent);
router.put('/department/:id', authenticateToken, updateDepartment);
router.put('/guard/:id', authenticateToken, updateGuard);

module.exports = router;
