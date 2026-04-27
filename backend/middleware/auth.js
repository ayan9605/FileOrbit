// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

function authMiddleware(req, res, next) {
  let token = null;

  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
