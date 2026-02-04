// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // The token should come like: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'student') req.student = decoded;
    else if (decoded.role === 'department') req.department = decoded;
    else if (decoded.role === 'guard') req.guard = decoded;
    else if (decoded.role === 'admin') req.admin = decoded;


    // now req.student has student info from token
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = authenticateToken;

