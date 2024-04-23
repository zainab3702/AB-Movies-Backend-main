const allowedOrigins = require("../config/allowedOrigins");

/* 
if origin is in the allowedOrigins array, set the Access-Control-Allow-Credentials header to true 
, So it can use secure httpOnly cookies 

*/
const allowCredentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};

module.exports = allowCredentials;
