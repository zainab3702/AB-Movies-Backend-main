const express = require("express");
const {
  getMovies,
  getMovie,
  getMovieUrls,
  getMovieCast,
  searchMovies,
} = require("../controllers/movieController");

const movieRouter = express.Router();

// to get all the movies based on page number
movieRouter.get("/", getMovies);

// to get movies based on search titles
movieRouter.get("/search", searchMovies);

// to get details about single movie based on given id
movieRouter.get("/:id", getMovie);

// to get movie urls based on given id
movieRouter.get("/urls/:id", getMovieUrls);

// to get movie Cast based on given id
movieRouter.get("/cast/:id", getMovieCast);

module.exports = movieRouter;
