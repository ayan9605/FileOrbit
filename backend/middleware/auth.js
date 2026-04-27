// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

/**
 * Verify JWT and attach user to req.user.
 * Expects "Authorization: Bearer <token>" header.[web:6][web:12]
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
