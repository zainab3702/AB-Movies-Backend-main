require("dotenv/config"); // for loading enviroment varibles
const mongoose = require("mongoose");

// loading mongo connection string from .env
const DATABASE_URL = process.env.MONGO_CONNECTION_STRING;

console.log(DATABASE_URL);
// connecting to mongo db via connection string
mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("Database connection error: ", err.message);
  });

// initializing db for exporting database connection
const db = mongoose.connection;
module.exports = db;
