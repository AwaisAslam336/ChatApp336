const express = require("express");
const userRouter = express.Router();
let { registerUser, loginUser } = require("../Controllers/UserController");

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

module.exports = { userRouter };
