const express = require("express");
const {
  getTvShows,
  getTvShow,
  searchTvShows,
  getTvShowCast,
  getTvShowUrls,
} = require("../controllers/TvShowsController");
const TvShowsRouter = express.Router();

// to get all the tvShows based on page number
TvShowsRouter.get("/", getTvShows);

// to get tvShows based on search titles
TvShowsRouter.get("/search", searchTvShows);

// to get details about single tvShow based on given id
TvShowsRouter.get("/:id", getTvShow);

// to get movie urls based on given id
TvShowsRouter.get("/urls/:id", getTvShowUrls);

// to get tvshow Cast based on given id
TvShowsRouter.get("/cast/:id", getTvShowCast);
module.exports = TvShowsRouter;
