require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { userRouter } = require("./Routes/User");

const app = express();
const port = 8000;

app.use(helmet());
app.use(express.json());
app.use(cors());

app.use("/api/user", userRouter);

app.get("/", require("./Middlewares/auth"), (req, res) =>
  res.send("Top Secret Page!!!!!")
);

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
