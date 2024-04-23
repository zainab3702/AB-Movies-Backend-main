const mongoose = require("mongoose");

// Define the Movie Schema
const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imdbId: {
    type: String,
  },
  rating: {
    type: Number,
  },
  runtime: {
    type: Number,
  },
  language: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
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
    required: true,
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
  trailerUrl: {
    type: String,
  },
});

// Export the Movie model
const Movie = mongoose.model("Movie", movieSchema);

module.exports = { Movie };
