const express = require('express');
const router = express.Router();
const {
  sendGatePassRequest,
  viewStatus,
  deleteRequest
} = require('../controllers/gatepassController');
const authenticateToken = require('../middleware/authMiddleware'); // only students should use these routes

// Student gatepass APIs
router.post('/request', authenticateToken, sendGatePassRequest);
router.get('/status', authenticateToken, viewStatus);
router.delete('/delete/:id', authenticateToken, deleteRequest);


module.exports = router;
