const express = require("express");
const userRouter = express.Router();
let {
  registerUser,
  loginUser,
  getAccessToken,
  logoutUser,
} = require("../Controllers/UserController");

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/token", getAccessToken);
userRouter.delete("/logout", logoutUser);

module.exports = { userRouter };
