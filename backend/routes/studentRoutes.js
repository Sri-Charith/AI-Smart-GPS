const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authenticateToken = require('../middleware/authMiddleware');
const { uploadStudents, loginStudent, getDashboard } = require('../controllers/studentController');

router.post('/upload', upload.single('file'), uploadStudents);
router.post('/login', loginStudent);
router.get('/dashboard', authenticateToken, getDashboard);
// router.get('/dashboard', authenticateToken, (req, res) => {
//     res.json({
//       message: `Welcome, student ${req.student.studentId}!`,
//       student: req.student
//     });
//   });
module.exports = router;
