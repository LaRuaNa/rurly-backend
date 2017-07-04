module.exports = {
  requiresLogin: (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
      return;
    }
    res.status(401).send();
  },
};
