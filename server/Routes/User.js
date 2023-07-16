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
userRouter.get("/token", getAccessToken);
userRouter.get("/logout", logoutUser);

module.exports = { userRouter };
