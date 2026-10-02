const asyncHandler = require("express-async-handler");

const checkLabManagerMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const user = res.locals.user;
    if (user.roles.includes("LAB-MANAGER")) {
      next();
    } else {
      res.status(401);
      throw new Error("You are not authorized to access this page");
    }
  } catch (error) {
    res.status(500);
    throw new Error("Something went wrong");
  }
});

module.exports = { checkLabManagerMiddleware };
