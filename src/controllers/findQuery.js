const startDate = new Date("2024-01-01");
const endDate = new Date("2025-01-25");

const videos = await Video.find({
  createdAt: { $gte: startDate, $lte: endDate }
});

console.log(videos);

const startDate = new Date("2024-01-01");
const endDate = new Date("2025-01-25");

const videos = await Video.aggregate([
  { 
    $match: {
      createdAt: { $gte: startDate, $lte: endDate }
    }
  },
  { $sort: { createdAt: 1 } } // Sorting videos by createdAt (ascending)
]);

console.log(videos);

const mongoose = require('mongoose');

// Assuming you already have the Video model set up
const Video = mongoose.model('Video', new mongoose.Schema({
  title: String,
  category: String,
  views: Number,
  createdAt: { type: Date, default: Date.now }
}));

async function fetchGroupedVideos() {
  try {
    const result = await Video.aggregate([
      // Match videos within the desired date range
      {
        $match: {
          createdAt: { $gte: new Date("2024-01-01"), $lte: new Date("2025-01-25") }        }
      },
      // Group by category, summing the views and counting the number of vdeos
      {
        $group: {
          _id: "$category", // Group by category
          totalViews: { $sum: "$views" }, // Sum of views in each category
          videoCount: { $sum: 1 } // Count of videos in each category
        }
      },
      // Project the fields to modify the output format
      {
        $project: {
          category: "$_id", // Rename _id to category
          totalViews: 1, // Include totalViews field
          videoCount: 1, // Include videoCount field
          _id: 0 // Exclude the _id field from the result
        }
      },
      // Sort by totalViews in descending order
      {
        $sort: { totalViews: -1 }
      }
    ]);

    // Output the result to console
    console.log("Grouped Video Data:", result);
  } catch (err) {
    console.error("Error in aggregation:", err);
  }
}

// Example call to the function
fetchGroupedVideos();
result :- 
Grouped Video Data: [
    { category: 'Education', totalViews: 5000, videoCount: 5 },
    { category: 'Technology', totalViews: 3500, videoCount: 3 },
    { category: 'Entertainment', totalViews: 1000, videoCount: 2 }
  ]

  db.videos.find({
    $and: [
      { category: { $in: ["Technology", "Education"] } }, // Category is "Technology" or "Education"
      { views: { $gte: 1000, $lte: 10000 } }, // Views between 1000 and 10000
      { createdAt: { $gte: new Date("2024-01-01") } }, // Created after 2024-01-01
      { title: { $regex: "Mongo", $options: "i" } } // Title contains "Mongo" (case-insensitive)
    ]
  });
