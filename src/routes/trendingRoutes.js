const express = require("express");
const { getTrending } = require("../controllers/trendingController");

const trendingRoutes = express.Router();

// to get all trending movies and tv Shows
trendingRoutes.get("/", getTrending);

// Export the trending routes
module.exports = trendingRoutes;
