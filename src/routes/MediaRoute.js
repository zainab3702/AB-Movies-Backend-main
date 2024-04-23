const express = require("express");
const getMedia = require("../controllers/MediaController");

const mediaRouter = express.Router();

mediaRouter.get("/", getMedia);

module.exports = mediaRouter;
