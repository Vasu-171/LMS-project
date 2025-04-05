const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token from header:', token); // Debugging the token
  
  if (!token) return res.status(401).json({ message: 'Unauthorized: Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden: Invalid token' });
    req.user = user; // contains { id, role }
    next();
  });
}

// Middleware to restrict access to specific roles
function authorizeRoles(...roles) {
  return (req, res, next) => {
    console.log('User Role:', req.user.role); // Debugging the user role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
