const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  approveRequest,
  rejectRequest,
  getDepartmentProfile,
  scanFaceAndGetStudentHistory
} = require('../controllers/departmentController');

const authenticateToken = require('../middleware/authMiddleware');

// All these routes are for Department role
router.get('/requests', authenticateToken, getAllRequests);
router.put('/approve/:id', authenticateToken, approveRequest);
router.put('/reject/:id', authenticateToken, rejectRequest);
router.get('/me', authenticateToken, getDepartmentProfile);
router.post('/scan-face', authenticateToken, scanFaceAndGetStudentHistory);

module.exports = router;
