const mongoose = require("mongoose");

// Define the TV Show Schema
const tvShowSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imdbid: {
    type: String,
  },
  rating: {
    type: Number,
  },
  rated: {
    type: String,
  },
  language: {
    type: String,
    required: true,
  },
  firstAirDate: {
    type: Date,
    required: true,
  },
  lastAirDate: {
    type: Date,
  },
  status: {
    type: String,
  },
  genres: {
    type: [String],
  },
  summary: {
    type: String,
    required: true,
  },
  cast: {
    type: [String],
  },
  homepage: {
    type: String,
  },
  bannerUrl: {
    type: String,
  },
  posterUrl: {
    type: String,
  },
});

// Export the TV Show model
const TVShow = mongoose.model("TVShow", tvShowSchema);

module.exports = TVShow;
