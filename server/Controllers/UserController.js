const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const dayjs = require("dayjs");

async function registerUser(req, res) {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      res.status(400).send("Both Email and Password Required!");
      return;
    }

    const isUser = await User.findOne({ email: email });
    if (isUser) {
      res.status(400).send("Email must be unique!");
      return;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const data = await User.create({
      username: username,
      email: email,
      password: encryptedPassword,
    });

    const AccessToken = generateAccessToken(data.email, data.username);
    const RefreshToken = generateRefreshToken(data.email);

    res.cookie("secureCookie", RefreshToken, {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: true,
      expires: dayjs().add(7, "days").toDate(),
    });

    res.status(201).send({
      result: "success",
      AccessToken,
    });

    await User.findByIdAndUpdate(
      { _id: data._id },
      { refreshToken: RefreshToken }
    );
  } catch (error) {
    res.status(500).send(error?.message);
  }
}
async function loginUser(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      res.status(400).send("Both Email and Password Required.");
      return;
    }

    const isUser = await User.findOne({ email: email });
    if (!isUser) {
      return res.status(400).send("Email or Password is incorrect.");
    }

    const validPassword = await bcrypt.compare(password, isUser.password);
    if (!validPassword) {
      return res.status(400).send("Email or Password is incorrect.");
    }

    const AccessToken = generateAccessToken(isUser.email, isUser.username);
    const RefreshToken = generateRefreshToken(isUser.email);

    res.cookie("secureCookie", RefreshToken, {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: true,
      expires: dayjs().add(7, "days").toDate(),
    });

    res.status(201).send({
      result: "success",
      AccessToken,
    });

    await User.findByIdAndUpdate(
      { _id: isUser._id },
      { refreshToken: RefreshToken }
    );
  } catch (error) {
    res.status(500).send(error?.message);
  }
}

async function getAccessToken(req, res) {
  const refreshToken = req.cookies?.secureCookie;
  if (!refreshToken) {
    return res.status(401).send({ message: "Refresh Token Not Provided." });
  }

  const isUser = await User.findOne({ refreshToken: refreshToken });
  if (!isUser) {
    return res.status(403).send({ message: "Refresh Token is Invalid." });
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, user) => {
      if (err) {
        return res.status(403).send({ message: "Refresh Token is Invalid." });
      }
      const AccessToken = generateAccessToken(isUser.email, isUser.username);
      const NewRefreshToken = generateRefreshToken(isUser.email);

      res.cookie("secureCookie", NewRefreshToken, {
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        sameSite: true,
        expires: dayjs().add(7, "days").toDate(),
      });

      res.status(201).send({
        result: "success",
        AccessToken,
      });

      await User.findByIdAndUpdate(
        { _id: isUser._id },
        { refreshToken: NewRefreshToken }
      );
    }
  );
}

async function logoutUser(req, res) {
  const refreshToken = req.cookies?.secureCookie;
  if (!refreshToken) {
    return res
      .status(400)
      .send({ message: "Unable to logout, User may already loged out." });
  }
  res.clearCookie("secureCookie");
  await User.findOneAndUpdate(
    { refreshToken: refreshToken },
    { refreshToken: "" }
  );
  return res.status(204);
}

function generateRefreshToken(email) {
  return jwt.sign(
    {
      data: { email: email },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

function generateAccessToken(email, username) {
  return jwt.sign(
    {
      data: { email: email, username: username },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
}

module.exports = {
  registerUser,
  loginUser,
  getAccessToken,
  logoutUser,
};
