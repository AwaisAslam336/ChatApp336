const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");

async function registerUser(req, res) {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    let encryptedPassword;
    password
      ? (encryptedPassword = await bcrypt.hash(password, 10))
      : res.status(400).send({ message: "Password Required!" });

    const data = await User.create({
      username: username,
      email: email,
      password: encryptedPassword,
    });
    res.send({ result: "success", data: data });
  } catch (error) {
    error.keyPattern
      ? res.status(400).send({ message: "Email must be Unique" })
      : res.status(500).send({
          Error: error,
        });
  }
}

module.exports = {
  registerUser,
};
