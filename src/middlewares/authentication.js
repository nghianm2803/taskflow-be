const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { AppError } = require("../helpers/utils");
const authMiddleware = {};

authMiddleware.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) return next(new AppError(401, "Login required", "Validation Error"));
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return next(new AppError(401, "Token expired", "Validation Error"));
        } else {
          return next(new AppError(401, "Token is invalid", "Validation Error"));
        }
      }
      // console.log("Token Payload:", payload); // Include _id and role
      req.userId = payload._id;
      req.permission = payload.role;
    });
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
