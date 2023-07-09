const express = require("express");
const userRouter = express.Router();
let { registerUser } = require("../Controllers/UserController");

userRouter.post("/register", registerUser);

module.exports = { userRouter };
