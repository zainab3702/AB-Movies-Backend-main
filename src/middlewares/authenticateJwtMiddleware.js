const jwt = require("jsonwebtoken");

// importing dotenv config for accessing environment variables
require("dotenv/config");

const authenticateJwt = async (req, res, next) => {
  // extracting the jwt token from header
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];

  //   verifying the access token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Can't login please try again" });
    }
    // if jwt is verified set the user object on request object
    req.user = user;
    next();
  });
};

module.exports = authenticateJwt;
