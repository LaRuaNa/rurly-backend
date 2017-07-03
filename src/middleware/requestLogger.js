module.exports = () =>
  (req, res, next) => {
    console.log(`URL: ${req.url}`);
    next();
  };
