const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      let token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          res.status(403).send({ message: err.message });
          return;
        }
        req.user = decoded;
        next();
      });
    } else {
      res.status(400).send({ message: "Token is required" });
    }
  } catch (error) {}
};
