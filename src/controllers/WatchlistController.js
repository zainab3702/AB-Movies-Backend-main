const db = require("../db");

//  fetching the user model from models
const User = require("../models/Users");
const ObjectId = require("mongoose").Types.ObjectId;

// fetching the Movies and TvShows collection from database
const Movies = db.collection("Movies");
const TvShows = db.collection("Shows");

// handler function to get the user's watchlist
const getUserWatchlist = async (req, res) => {
  try {
    // extracting the user object we got from middleware
    const user = req.user;

    // define a regex for email to perform an exactly matching case-Insenstive search
    const emailRegex = new RegExp(`^${user.email}$`, "i");

    // getting the user's watchlist from database
    const watchlist = await User.findOne(
      { email: { $regex: emailRegex } },
      { watchlist: 1, _id: 0 }
    );
    const userWatchlist = watchlist?.watchlist;

    // in Case no wathlist found return a 404 error
    if (!userWatchlist)
      return res
        .status(404)
        .json({ success: false, message: "Watchlist Not Found" });

    // populate the user's watchlist using id's stored in
    const userWatchListWithDetails = await Promise.all(
      // NOTE: using await promise.all will wait for the reponses of map function to execute
      userWatchlist.map(async (item) => {
        // check if movie or tvShow with given id exist in database and populate from collections accordingly
        const getMovieFromDatabase = await Movies.findOne(
          { _id: item },
          { projection: { title: 1, bannerUrl: 1, releaseDate: 1, type: 1 } }
        );
        const getTvShowFromDatabase = await TvShows.findOne(
          { _id: item },
          {
            projection: {
              title: 1,
              bannerUrl: 1,
              firstAirDate: 1,
              lastAirDate: 1,
              type: 1,
            },
          }
        );
        /* if it is a movie then result won't be null and sent to wathlist directly
        else a tvShow will be sent to watchlist.
      */
        return getMovieFromDatabase ?? getTvShowFromDatabase;
      })
    );

    //  return  the user's watchlist
    res
      .status(200)
      .json({ success: true, watchlist: userWatchListWithDetails });
  } catch (err) {
    // logging the error
    console.log(err.message);
    res.status(500).json({
      success: false,
      message: "Can't retain watchlist please try again",
    });
  }
};

// handler function to add movie id's to user's watchlist;
const addToWatchlist = async (req, res) => {
  try {
    // extracting the id from url parameters and converting it to a mongodb object id
    const { id } = req.params;
    const idToAdd = new ObjectId(id);

    // check if movie or tvShow with given id exist in database
    const doesMovieExist = await Movies.findOne(
      { _id: idToAdd },
      { projection: { _id: 1 } }
    );
    const doesTvShowExist = await TvShows.findOne(
      { _id: idToAdd },
      { projection: { _id: 1 } }
    );

    const typeToAdd =
      id === String(doesMovieExist?._id)
        ? "Movie"
        : String(doesTvShowExist?._id)
        ? "Tv-Show"
        : null;

    //   if no movie or tvshow with given id is found then return a 404 error
    if (!typeToAdd)
      return res.status(404).send("No movie or tv-show found with given id");

    // else proeceeding ahead and extracting the user object we got from middleware
    const user = req.user;

    // define a regex for email to perform an exactly matching case-Insenstive search
    const emailRegex = new RegExp(`^${user.email}$`, "i");

    // fetching user from database
    const watchlist = await User.findOne(
      { email: { $regex: emailRegex } },
      { watchlist: 1, _id: 0 }
    );

    const userWatchList = watchlist.watchlist;
    // check if same id exists in watchlist
    //   if it does return 400 error with message movie or tv Show already exists
    if (
      userWatchList.filter((watchListId) => String(watchListId) === id).length >
      0
    ) {
      return res.status(400).json({
        success: false,
        message: ` ${typeToAdd} already exists in watchlist`,
      });
    }
    //   else add id to the watchlist and update database
    userWatchList.push(id);
    await User.updateOne(
      { email: { $regex: emailRegex } },
      { watchlist: userWatchList }
    );
    // sending the response back to client
    res.status(201).json({
      success: true,
      message: `${typeToAdd} added to watchlist successfuly`,
    });
  } catch (err) {
    // logging the error
    console.log(err.message);
    res.status(500).json({
      success: false,
      message: "Can't update watchlist please try again",
    });
  }
};

// Handler function to remove movie or TV show ID from user's watchlist
const removeFromWatchlist = async (req, res) => {
  try {
    // Extracting the ID from URL parameters and converting it to a mongodb object id
    const { id } = req.params;
    const idToAdd = new ObjectId(id);

    // Extracting the user object from middleware
    const user = req.user;

    // Define a regex for email to perform an exactly matching case-insensitive search
    const emailRegex = new RegExp(`^${user.email}$`, "i");

    // Fetching user's watchlist from the database
    const watchlist = await User.findOne(
      { email: user.email },
      { watchlist: 1, _id: 0 }
    );

    // check if movie or tvShow with given id exist in database
    const doesMovieExist = await Movies.findOne(
      { _id: idToAdd },
      { projection: { _id: 1 } }
    );
    const doesTvShowExist = await TvShows.findOne(
      { _id: idToAdd },
      { projection: { _id: 1 } }
    );

    const typeToAdd =
      id === String(doesMovieExist?._id)
        ? "Movie"
        : String(doesTvShowExist?._id)
        ? "Tv-Show"
        : null;

    let userWatchList = watchlist.watchlist;

    // Remove the ID from the watchlist array
    userWatchList = userWatchList.filter(
      (watchListId) => String(watchListId) !== id
    );

    // Update the user's watchlist in the database
    await User.updateOne(
      { email: { $regex: emailRegex } },
      { watchlist: userWatchList }
    );

    // Sending the response back to the client
    res.status(200).json({
      success: true,
      message: `${typeToAdd} removed from watchlist successfully`,
    });
  } catch (err) {
    // Logging the error
    console.log(err.message);
    res.status(500).json({
      success: false,
      message: "Can't update watchlist, please try again",
    });
  }
};

module.exports = { getUserWatchlist, addToWatchlist, removeFromWatchlist };
