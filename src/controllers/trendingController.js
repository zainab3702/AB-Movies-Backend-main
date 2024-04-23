const db = require("../db/index");
const axios = require("axios");
// importing dotenv config for accessing environment variables
require("dotenv/config");

// Helper function to check if the Trending collection needs an update
const needsUpdate = async () => {
  const trendingCollection = db.collection("Trending");
  const latestEntry = await trendingCollection.findOne(
    {},
    { sort: { _id: -1 } }
  );

  if (!latestEntry) return true; // Collection is empty, needs update

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return latestEntry.createdAt < oneWeekAgo; // Check if the latest entry is older than a week
};

// Helper function to fetch IMDb IDs from TMDB and update the Trending collection with details from Movies and Shows collections
const updateTrendingCollection = async () => {
  const trendingUrl = "https://api.themoviedb.org/3/trending/all/week";
  const apiKey = process.env.TMDB_API_KEY;
  const trendingResponse = await axios.get(`${trendingUrl}?api_key=${apiKey}`);
  const trendingData = trendingResponse.data;
  const trendingItems = trendingData.results;

  const detailsPromises = trendingItems.map(async (item) => {
    const mediaType = item.media_type;
    const detailsUrl = `https://api.themoviedb.org/3/${mediaType}/${item.id}/external_ids?api_key=${apiKey}`;

    const detailsResponse = await axios.get(detailsUrl);
    const detailsData = detailsResponse.data;
    const imdbId = detailsData.imdb_id;

    const collectionName = mediaType === "movie" ? "Movies" : "Shows";
    const collection = db.collection(collectionName);
    const mediaDetails = await collection.findOne({ imdbId });

    return mediaDetails ? { ...mediaDetails, createdAt: new Date() } : null;
  });

  const fullDetails = (await Promise.all(detailsPromises)).filter(
    (details) => details !== null
  );

  const trendingCollection = db.collection("Trending");
  await trendingCollection.deleteMany({});
  await trendingCollection.insertMany(fullDetails);
};

// Fetch trending movies and tv shows from the Trending collection
const getTrending = async (req, res) => {
  try {
    if (await needsUpdate()) {
      await updateTrendingCollection();
    }

    const trendingCollection = db.collection("Trending");
    const trendingItems = await trendingCollection
      .find(
        {},
        {
          projection: {
            title: 1,
            bannerUrl: 1,
            releaseDate: 1,
            firstAirDate: 1,
            lastAirDate: 1,
            rated: 1,
            type: 1,
          },
        }
      )
      .toArray();

    res.status(200).json({ trendingItems });
  } catch (error) {
    console.error("Error in getTrending:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTrending };
