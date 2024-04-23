const db = require("../db");

const Movies = db.collection("Movies");
const TvShows = db.collection("Shows");

// handler function to get movies and tvShows from both routes
const getMedia = async (req, res) => {
  // extracting the title to search for from query parameters
  const { title } = req.query;

  // defining the movie regex to perform case-insensitive search
  const mediaRegex = new RegExp(title, "i");

  const MovieResult = await Movies.find(
    { title: { $regex: mediaRegex } },
    { projection: { title: 1, bannerUrl: 1, releaseDate: 1, type: 1 } }
  ).toArray();
  const TvShowsResult = await TvShows.find(
    { title: { $regex: mediaRegex } },
    {
      projection: {
        title: 1,
        bannerUrl: 1,
        firstAirDate: 1,
        lastAirDate: 1,
        type: 1,
      },
    }
  ).toArray();

  // if no movie or tvShow is found for given title return a 404 error with no movies found message
  if (MovieResult.length === 0 && TvShowsResult.length === 0)
    return res.status(404).json({ error: "No movies or tvShows Found" });

  // sending the result back to client
  res.status(200).json([...MovieResult, ...TvShowsResult]);
};

module.exports = getMedia;
