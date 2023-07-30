const express = require("express");
const auth = require("../Middlewares/auth");
const multer = require("multer");
const userRouter = express.Router();
let {
  registerUser,
  loginUser,
  getAccessToken,
  logoutUser,
  uploadProfilePicture,
  searchUsers,
} = require("../Controllers/UserController");

//multer image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/token", getAccessToken);
userRouter.get("/logout", logoutUser);
userRouter.post("/img", auth, upload.single("img"), uploadProfilePicture);
userRouter.post("/search", auth, searchUsers);

module.exports = { userRouter };
