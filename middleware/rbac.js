/**
 * Role hierarchy: admin > analyst > viewer
 * Roles array defines the MINIMUM role required (and above).
 */
const ROLE_LEVELS = {
  viewer: 1,
  analyst: 2,
  admin: 3,
};

/**
 * Middleware factory: authorise(...roles)
 * Grants access if the authenticated user's role is in the provided list.
 * 
 * Usage:
 *   router.get('/endpoint', authenticate, authorise('admin'), handler)
 *   router.get('/endpoint', authenticate, authorise('analyst', 'admin'), handler)
 */
const authorise = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const userRoleLevel = ROLE_LEVELS[req.user.role] || 0;
    const hasAccess = allowedRoles.some(
      (role) => ROLE_LEVELS[role] <= userRoleLevel
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(' or ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

/**
 * Middleware: Allow only admin
 */
const adminOnly = authorise('admin');

/**
 * Middleware: Allow analyst and admin
 */
const analystAndAbove = authorise('analyst', 'admin');

/**
 * Middleware: Allow all authenticated users (viewer and above)
 */
const viewerAndAbove = authorise('viewer', 'analyst', 'admin');

module.exports = { authorise, adminOnly, analystAndAbove, viewerAndAbove };
