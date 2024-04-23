const db = require("../db");
const ObjectId = require("mongoose").Types.ObjectId;
//  fetching movie collection from database
const Movies = db.collection("Movies");

// handler function to get allMovies based on page number
const getMovies = async (req, res) => {
  try {
    // extracting the page number from query parameters
    const page = req.query.page || 1;
    const limit = 20;
    const offset = parseInt(page - 1) * limit;

    // getting movies as per the page number
    const movies = await Movies.find(
      {},
      {
        projection: {
          title: 1,
          bannerUrl: 1,
          releaseDate: 1,
          type: 1,
          posterUrl: 1,
        },
      }
    )
      .skip(offset)
      .limit(limit)
      .toArray();

    const totalMovies = await Movies.countDocuments();
    // to indicate the total number of pages
    const totalPages = Math.ceil(totalMovies / limit);

    // if no movie is found for the given send 404 no page found
    if (movies.length === 0 || page > totalPages) {
      res.status(404).send("Page not found");
    } else {
      // sending movies totalMovies and totalPageCount as a result to the client
      res.status(200).json({ totalMovies, totalPages, movies });
    }
  } catch (err) {
    // logging the error
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// handler function to get details about single movie using _id
const getMovie = async (req, res) => {
  try {
    // extracting the id from url parameters and making a mongodb objectId for the same
    const idToGet = new ObjectId(req.params.id);

    // finding the movie details using the newly created objectId
    const movie = await Movies.findOne(
      { _id: idToGet },
      {
        projection: {
          title: 1,
          releaseDate: 1,
          cast: 1,
          rating: 1,
          summary: 1,
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
    res.status(200).json(movie);
  } catch (err) {
    // logging the error
    console.log(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// handler function to get Movies based on search titles
const searchMovies = async (req, res) => {
  try {
    // to extract the title from query params to search for
    const titleToGet = req.query.title;
    const titleRegex = new RegExp(titleToGet, "i");

    // to query the results using the newly created regex
    const movies = await Movies.find(
      { title: { $regex: titleRegex } },
      {
        projection: {
          title: 1,
          bannerUrl: 1,
          releaseDate: 1,
          type: 1,
          posterUrl: 1,
        },
      }
    ).toArray();

    // if no movie is found for given title return a 404 error with no movies found message
    if (movies.length === 0) {
      res.status(404).json({ error: "No movies Found" });
    } else {
      // sending the result back to client
      res.status(200).json(movies);
    }
  } catch (err) {
    // logging the error
    console.log(err.message);
    res.status(500).send("Internal Server Error");
  }
};

// handler function to get Movie URLS of single movie using _id
const getMovieUrls = async (req, res) => {
  try {
    // extracting the id from url parameters and making a mongodb objectId for the same
    const idToGet = new ObjectId(req.params.id);

    // finding the movie url details using the newly created objectId
    const urls = await Movies.findOne(
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

// handler function to get Movie Cast of single movie using _id
const getMovieCast = async (req, res) => {
  try {
    // extracting the id from url parameters and making a mongodb objectId for the same
    const idToGet = new ObjectId(req.params.id);

    // finding the movie cast details using the newly created objectId
    const cast = await Movies.findOne(
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
  getMovies,
  getMovie,
  getMovieUrls,
  getMovieCast,
  searchMovies,
};
