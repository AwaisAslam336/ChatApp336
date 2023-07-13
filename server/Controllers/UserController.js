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

    const accessToken = generateAccessToken(data.email, data.username);
    const refreshToken = generateRefreshToken(data.email);

    await User.findByIdAndUpdate(
      { _id: data._id },
      { refreshToken: refreshToken }
    );

    res.status(201).send({
      result: "success",
      data: { AccessToken: accessToken, RefreshToken: refreshToken },
    });
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

    const accessToken = generateAccessToken(isUser.email, isUser.username);
    const refreshToken = generateRefreshToken(isUser.email);

    await User.findByIdAndUpdate(
      { _id: isUser._id },
      { refreshToken: refreshToken }
    );

    res.status(201).send({
      result: "success",
      data: { AccessToken: accessToken, RefreshToken: refreshToken },
    });
  } catch (error) {
    res.status(500).send({
      Error: "Server Error!",
    });
  }
}

async function getAccessToken(req, res) {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).send({ message: "Refresh Token Not Provided." });
  }

  const isUser = await User.findOne({ refreshToken: refreshToken });
  if (!isUser) {
    return res.status(403).send({ message: "Refresh Token is Invalid." });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ message: "Refresh Token is Invalid." });
    }
    const accessToken = generateAccessToken(isUser.email, isUser.username);
    return res.status(200).send({ accessToken: accessToken });
  });
}

async function logoutUser(req, res) {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res
      .status(400)
      .send({ message: "Unable to logout, User is missing." });
  }
  await User.findOneAndUpdate(
    { refreshToken: refreshToken },
    { refreshToken: "" }
  );
  return res.status(204).send({ message: "Successfully Loged Out." });
}

function generateRefreshToken(email) {
  return jwt.sign(
    {
      data: { email: email },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );
}

function generateAccessToken(email, username) {
  return jwt.sign(
    {
      data: { email: email, username: username },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );
}

module.exports = {
  registerUser,
  loginUser,
  getAccessToken,
  logoutUser,
};
