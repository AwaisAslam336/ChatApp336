const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const dayjs = require("dayjs");
const fs = require("fs");
const path = require("path");
const { decode } = require("punycode");
// const { Console } = require("console");
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

    const AccessToken = generateAccessToken(data.email, data._id);
    const RefreshToken = generateRefreshToken(data.email, data._id);

    res.cookie("secureCookie", RefreshToken, {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: true,
      expires: dayjs().add(7, "days").toDate(),
    });

    res.status(201).send({
      result: "success",
      data: {
        email: data.email,
        username: data.username,
        _id: data._id,
        pic: data.pic,
      },
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

    const RefreshToken = generateRefreshToken(isUser.email, isUser._id);
    const AccessToken = generateAccessToken(isUser.email, isUser._id);

    res.cookie("secureCookie", RefreshToken, {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: true,
      expires: dayjs().add(7, "days").toDate(),
    });

    res.status(201).send({
      result: "success",
      data: {
        _id: isUser._id,
        email: isUser.email,
        username: isUser.username,
        pic: isUser.pic,
      },
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

async function getAccessToken(req) {
  const refreshToken = req.cookies?.secureCookie;
  if (!refreshToken) {
    return {};
  }

  const isUser = await User.findOne({ refreshToken: refreshToken });
  if (!isUser) {
    return {};
  }

  let newAccessToken;
  let newRefreshToken;
  let newUser;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return {};
      }
      newAccessToken = generateAccessToken(isUser.email, isUser._id);
      newRefreshToken = generateRefreshToken(isUser.email, isUser._id);
      newUser = decoded;

      await User.findByIdAndUpdate(
        { _id: isUser._id },
        { refreshToken: newRefreshToken }
      );
    }
  );

  if (newAccessToken && newRefreshToken && newUser) {
    return { newAccessToken, newRefreshToken, newUser };
  } else {
    return {};
  }
}

async function getAccessTokenOnRefresh(req, res) {
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
      const AccessToken = generateAccessToken(isUser.email, isUser._id);
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
      .send("Unable to logout, User may already loged out.");
  }
  res.clearCookie("secureCookie");
  await User.findOneAndUpdate(
    { refreshToken: refreshToken },
    { refreshToken: "" }
  );
  return res.status(200).send("User Loged Out.");
}

function generateRefreshToken(email, _id) {
  return jwt.sign(
    {
      data: { email, _id },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

function generateAccessToken(email, _id) {
  return jwt.sign(
    {
      data: { email, _id },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );
}

const uploadProfilePicture = async (req, res) => {
  const filename = req.file?.filename;
  const email = req.user?.data?.email;
  if (filename && email) {
    try {
      const user = await User.findOneAndUpdate({ email }, { pic: filename });
      fs.unlink(
        path.join(__dirname, "../public/images/") + user.pic,
        function (err) {
          if (err) {
            console.log("image not deleted");
          }
        }
      );
      res.status(200).send({ img: filename });
    } catch (error) {
      res.status(500).send({ Error: error?.message });
    }
  } else {
    res.status(400).send({ message: "Image Failed to Upload." });
  }
};

const searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query?.search;
    const currentUser = req.user?.data?.email;
    if (typeof searchQuery === "string" && currentUser) {
      //find users by name (i->case insensitive)
      //exclude current user
      const result = await User.find(
        { username: { $regex: searchQuery, $options: "i" } },
        "-password -refreshToken",
        {
          limit: 10,
        }
      ).find({ email: { $ne: currentUser } });

      res.status(200).send(result);
    } else {
      res.status(400).send("Invalid Search.");
    }
  } catch (error) {
    res.status(500).send({ Error: error?.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAccessToken,
  getAccessTokenOnRefresh,
  logoutUser,
  uploadProfilePicture,
  searchUsers,
};
