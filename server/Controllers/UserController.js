const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");

async function registerUser(req, res) {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      res.status(400).send({ message: "Both Email and Password Required!" });
      return;
    }

    const isUser = await User.findOne({ email: email });
    if (isUser) {
      res.status(400).send({ message: "Email must be unique!" });
      return;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const data = await User.create({
      username: username,
      email: email,
      password: encryptedPassword,
    });

    const accessToken = jwt.sign(
      {
        data: { username: data.username, email: data.email },
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res
      .status(201)
      .send({ result: "success", data: { AccessToken: accessToken } });
  } catch (error) {
    res.status(500).send({
      Error: "Server Error!",
    });
  }
}
async function loginUser(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      res.status(400).send({ message: "Both Email and Password Required." });
      return;
    }

    const isUser = await User.findOne({ email: email });
    if (!isUser) {
      return res
        .status(400)
        .send({ message: "Email or Password is incorrect." });
    }

    const validPassword = await bcrypt.compare(password, isUser.password);
    if (!validPassword) {
      return res.status(400).send("Email or Password is incorrect.");
    }

    const accessToken = jwt.sign(
      {
        data: { username: isUser.username, email: isUser.email },
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res
      .status(201)
      .send({ result: "success", data: { AccessToken: accessToken } });
  } catch (error) {
    res.status(500).send({
      Error: "Server Error!",
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
};
