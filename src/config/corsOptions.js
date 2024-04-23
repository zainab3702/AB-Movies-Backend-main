const allowedOrigins = require("./allowedOrigins");

// to allow the below definded origins to access the server
const corsOptions = {
  origin: (origin, callback) => {
    // if allowedOrigins includes the origin or if origin is null
    if (allowedOrigins.includes(origin) || !origin) {
      // null indiacates there is no error and true says origin is allowed
      callback(null, true);
    } else {
      // else return an error
      callback(new Error("Not allowed by CORS"));
    }
  },
};

module.exports = corsOptions;
