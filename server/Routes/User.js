const express = require("express");
const auth = require("../Middlewares/auth");
const multer = require("multer");
const upload = multer();
const userRouter = express.Router();
let {
  registerUser,
  loginUser,
  getAccessToken,
  logoutUser,
  uploadProfilePicture,
} = require("../Controllers/UserController");

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/token", getAccessToken);
userRouter.get("/logout", logoutUser);
userRouter.post("/pic", upload.single("img"), uploadProfilePicture);

module.exports = { userRouter };
