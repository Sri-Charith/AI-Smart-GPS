const express = require('express');
const router = express.Router();
const { verifyFace } = require('../controllers/faceVerificationController');

const {
  getAllRequestsForGuard,
  deleteRequest,
  getGuardProfile,
  markAsLeft
} = require('../controllers/guardController');

const authenticateToken = require('../middleware/authMiddleware');

// All these routes are for Guard role
router.post('/verify-face', verifyFace);
router.get('/requests', authenticateToken, getAllRequestsForGuard);
router.delete('/delete/:id', authenticateToken, deleteRequest);
router.get('/me', authenticateToken, getGuardProfile);
router.put('/mark-left/:id', authenticateToken, markAsLeft);


module.exports = router;
