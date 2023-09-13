const { AppError } = require("../helpers/utils");

const permission = {};

permission.managerCheck = (req, res, next) => {
  const { permission } = req;
  // console.log(permission); // Must be Manager or Admin
  if (permission !== "Manager" && permission !== "Admin") {
    return next(new AppError(401, "Only Manager have permission to do this action.", "Permission required."));
  }
  next();
};

module.exports = permission;
