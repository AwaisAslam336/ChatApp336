const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const { getAccessToken } = require("../Controllers/UserController");

module.exports = function auth(req, res, next) {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      let token = req.headers.authorization.split(" ")[1];
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
          let user = null;
          if (err) {
            const { newAccessToken, newRefreshToken, newUser } =
              await getAccessToken(req);
            user = newUser;

            if (!newAccessToken || !newRefreshToken || !user) {
              return res.status(403).send({ message: err.message });
            }
            res.cookie("secureCookie", newRefreshToken, {
              secure: process.env.NODE_ENV !== "development",
              httpOnly: true,
              sameSite: true,
              expires: dayjs().add(7, "days").toDate(),
            });
          }

          req.user = decoded ? decoded : user;
          next();
        }
      );
    } else {
      return res.status(400).send({ message: "Token is required" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Server Error" });
  }
};
