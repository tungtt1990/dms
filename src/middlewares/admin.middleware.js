// src/middlewares/admin.middleware.js
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Admins only.' });
};

const isTeacherOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Teacher or Admin only.' });
};

module.exports = { isAdmin, isTeacherOrAdmin };
