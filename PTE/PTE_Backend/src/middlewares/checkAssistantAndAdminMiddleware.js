const asyncHandler = require("express-async-handler");

const checkAssistantAndAdminMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const user = res.locals.user;
    if (user.roles.includes("ASSISTANT") || user.roles.includes("ADMIN")) {
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
module.exports = { checkAssistantAndAdminMiddleware };
