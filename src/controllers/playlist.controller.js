import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";
import Playlist from "../models/playlist.model.js";
import User from "../models/user.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  // Get data
  const { name, description, isPublic } = req.body;
  if (!name || name.trim() === "") {
    throw new ApiError(400, "Playlist name is required");
  }

  if (!description || description.trim() === "") {
    throw new ApiError(400, "Playlist description is required");
  }

  // Lenght Validation
  if (name.trim().length > 60) {
    throw new ApiError(400, "Name length must be less then 60characters!");
  }
  if (description.trim().length > 300) {
    throw new ApiError(
      400,
      "Description length must be less then 300characters!"
    );
  }

  // Create playlist
  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    videos: [],
    owner: req.user?._id,
    isPublic: isPublic,
  });

  // Return res
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created Succesfully"));
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  // Get user
  const userID = req.user?._id;
  if (!userID || !mongoose.isValidObjectId(userID)) {
    throw new ApiError(400, "Invalid User ID!");
  }
  const user = await User.findById(userID);
  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  // Aggregation
  const playlist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userID),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $project: {
              thumbnail: 1,
              title: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        videoCount: { $size: "$videoDetails" },
        firstVideoThumbnail: { $first: "$videoDetails.thumbnail" },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videoCount: 1,
        firstVideoThumbnail: 1,
        isPublic: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  // Return res
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Fetched Successfully"));
});

const getSinglePlaylist = asyncHandler(async (req, res) => {
  // Get Params
  const { playlistID } = req.params;
  if (!playlistID || !mongoose.isValidObjectId(playlistID)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  // Aggregate Pipeline
  const playlist = await Playlist.aggregate([
    // Stage 1: Match this specific playlist
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistID),
      },
    },

    // Stage 2: Lookup playlist owner details
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },

    // Stage 3: Lookup all videos in playlist
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          // Nested lookup: get video owner
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
          {
            $project: {
              title: 1,
              description: 1,
              thumbnail: 1,
              duration: 1,
              views: 1,
              createdAt: 1,
              owner: 1,
              isPublished: 1,
            },
          },
        ],
      },
    },

    // Stage 4: Flatten owner array
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },

    // Stage 5: Add computed fields
    {
      $addFields: {
        videoCount: { $size: "$videoDetails" },
        totalDuration: { $sum: "$videoDetails.duration" },
      },
    },

    // Stage 6: Project final structure
    {
      $project: {
        name: 1,
        description: 1,
        owner: 1,
        videos: "$videoDetails",
        videoCount: 1,
        totalDuration: 1,
        isPublic: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  // Check for playlist exists
  if (!playlist || playlist.length === 0) {
    throw new ApiError(404, "Playlist not found");
  }

  const playlistData = playlist[0];

  // Check privacy: only owner can see private playlists
  if (
    !playlistData.isPublic &&
    playlistData.owner._id.toString() !== req.user?._id.toString()
  ) {
    throw new ApiError(403, "This playlist is private");
  }

  // Return res
  return res
    .status(200)
    .json(new ApiResponse(200, playlistData, "Playlist fetched successfully"));
});

export { createPlaylist, getUserPlaylist, getSinglePlaylist };
