require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { userRouter } = require("./Routes/User");

const app = express();
const port = 8000;
let boolValue = process.env.HELMET_CROSS_ORIGIN === "true";
app.use(
  helmet({
    crossOriginResourcePolicy: boolValue,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname + "/public/images"));

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/api/user", userRouter);

app.listen(port, async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("App is running on port", port);
  } catch (error) {
    console.log(error);
  }
});
