export const authMiddleware = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    req.session.error = 'Unauthenticated';
    return res.status(401).json({
      success: false,
      message: 'User unauthenticated',
    });
  }
};
