const db = require("../db");
const ObjectId = require("mongoose").Types.ObjectId;

//  fetching movie collection from database
const TvShows = db.collection("Shows");

// handler function to get allTvShows based on page number
const getTvShows = async (req, res) => {
  try {
    // extracting the page number from query parameters
    const page = req.query.page || 1;
    const limit = 20;
    const offset = parseInt(page - 1) * limit;

    // getting TvShows as per the page number
    const tvShows = await TvShows.find(
      {},
      {
        projection: {
          title: 1,
          bannerUrl: 1,
          posterUrl: 1,
          firstAirDate: 1,
          lastAirDate: 1,
          type: 1,
        },
      }
    )
      .skip(offset)
      .limit(limit)
      .toArray();

    const totalTvShows = await TvShows.countDocuments();
    // to indicate the total number of pages
    const totalPages = Math.ceil(totalTvShows / limit);

    // if no tvshow is found for the given page send 404 no page found

    if (tvShows.length === 0 || page > totalPages) {
      res.status(404).send("Page Not Found");
    } else {
      // sending TvShows totalTvShows and totalPageCount as a result to the client
      res.status(200).json({ totalTvShows, totalPages, tvShows });
    }
  } catch (err) {
    // logging the error
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// handler function to get details about single tvshow using _id
const getTvShow = async (req, res) => {
  try {
    // extracting the id from url parameters and making a mongodb objectId for the same
    const idToGet = new ObjectId(req.params.id);

    // finding the tvshow details using the newly created objectId
    const tvShow = await TvShows.findOne(
      { _id: idToGet },
      {
        projection: {
          title: 1,
          firstAirDate: 1,
          lastAirDate: 1,
          rating: 1,
          summary: 1,
          cast: 1,
          genres: 1,
          runtime: 1,
          language: 1,
          posterUrl: 1,
          status: 1,
          type: 1,
        },
      }
    );
    // sending the result back to client
    res.status(200).json(tvShow);
  } catch (err) {
    // logging the error
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// handler function to get tvshows based on search titles
const searchTvShows = async (req, res) => {
  try {
    // to extract the title from query params to search for
    const titleToGet = req.query.title;
    const titleRegex = new RegExp(titleToGet, "i");

    // to query the results using the newly created regex
    const tvShows = await TvShows.find(
      { title: { $regex: titleRegex } },
      {
        projection: {
          title: 1,
          bannerUrl: 1,
          firstAirDate: 1,
          lastAirDate: 1,
          type: 1,
          posterUrl: 1,
        },
      }
    ).toArray();

    // if no tvShow is found for given title return a 404 error with no tvshows found message
    if (tvShows.length === 0) {
      res.status(404).json({ error: "No Tv Shows Found" });
    } else {
      // sending the result back to client
      res.status(200).json(tvShows);
    }
  } catch (err) {
    // logging the error
    console.log(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// handler function to get URLS of single tvshow using _id
const getTvShowUrls = async (req, res) => {
  try {
    // extracting the id from url parameters and making a mongodb objectId for the same
    const idToGet = new ObjectId(req.params.id);

    // finding the tvshow url details using the newly created objectId
    const urls = await TvShows.findOne(
      { _id: idToGet },
      {
        projection: {
          homepage: 1,
          trailerUrl: 1,
          imdbUrl: {
            $cond: {
              if: { $eq: ["$imdbId", ""] }, // Check if imdbId exists and is not empty
              then: 0, // If imdbId is empty, return an empty string for imdbUrl
              else: { $concat: ["https://www.imdb.com/title/", "$imdbId"] }, // If imdbId exists, concatenate the URL with found id
            },
          },
        },
      }
    );

    // sending the result back to the client
    res.status(200).json(urls);
  } catch (err) {
    // logging the error
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// handler function to get Cast of single tvshow using _id
const getTvShowCast = async (req, res) => {
  try {
    // extracting the id from url parameters and making a mongodb objectId for the same
    const idToGet = new ObjectId(req.params.id);

    // finding the tvshow cast details using the newly created objectId
    const cast = await TvShows.findOne(
      { _id: idToGet },
      { projection: { cast: 1, _id: 0 } }
    );

    // sending the response back to the client
    res.status(200).json(cast);
  } catch (err) {
    // logging the error
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  getTvShows,
  getTvShow,
  searchTvShows,
  getTvShowCast,
  getTvShowUrls,
};
