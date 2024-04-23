const mongoose = require("mongoose");

// defining the userSchema
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    watchlist: [
      { type: mongoose.SchemaTypes.ObjectId, ref: ["Movie", "TvShow"] },
    ],
  },
  { timestamps: true }
);

// defining the user model for consistent data schema along all users
const User = mongoose.model("User", userSchema);

module.exports = User;
