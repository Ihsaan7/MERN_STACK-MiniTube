import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";
import Playlist from "../models/playlist.model.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";

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

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  // Get params
  const { playlistID, videoID } = req.params;
  if (!playlistID || !mongoose.isValidObjectId(playlistID)) {
    throw new ApiError(400, "Invalid Playlist ID!");
  }
  if (!videoID || !mongoose.isValidObjectId(videoID)) {
    throw new ApiError(400, "Invalid Video ID!");
  }

  // Check for playlist
  const playlist = await Playlist.findById(playlistID);
  if (!playlist) {
    throw new ApiError(404, "No playlist found!");
  }

  // Check for owner
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Only owner can add video to this playlist!");
  }

  // Check for video
  const video = await Video.findById(videoID);
  if (!video) {
    throw new ApiError(404, "No video found!");
  }

  // Check for publish
  if (!video.isPublished) {
    throw new ApiError(400, "Cannot add unpublished video to playlist");
  }

  // Check if video already in playlist
  if (playlist.videos.includes(videoID)) {
    throw new ApiError(400, "Video already exists in current playlist!");
  }

  // Add video to playlist
  playlist.videos.push(videoID);
  await playlist.save();

  // Return full playlist
  const updatedPlaylist = await Playlist.findById(playlistID).populate(
    "videos",
    "title thumbnail duration"
  );

  // Return res
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist Successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // Get params
  const { playlistID, videoID } = req.params;
  if (!playlistID || !mongoose.isValidObjectId(playlistID)) {
    throw new ApiError(400, "Invalid Playlist ID!");
  }
  if (!videoID || !mongoose.isValidObjectId(videoID)) {
    throw new ApiError(400, "Invalid Video ID!");
  }

  // Check for Playlist and Video
  const playlist = await Playlist.findById(playlistID);
  const video = await Video.findById(videoID);
  if (!playlist) {
    throw new ApiError(404, "No Playlist found!");
  }
  if (!video) {
    throw new ApiError(404, "No Video found!");
  }

  // Check for owner
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Only owner can remove video from playlist!");
  }

  // Check for video in Playlist
  if (!playlist.videos.includes(videoID)) {
    throw new ApiError(400, "No such video exists in Playlist!");
  }

  // Remove the video
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistID,
    {
      $pull: { videos: videoID },
    },
    {
      new: true,
    }
  );

  // Return res
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed from playlist Successfully"
      )
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  // Get params and Data
  const { playlistID } = req.params;
  const { name, description, isPublic } = req.body;
  if (!playlistID || !mongoose.isValidObjectId(playlistID)) {
    throw new ApiError(400, "Invalid Playlist ID!");
  }
  // Validataion
  if (!name && !description && isPublic === undefined) {
    throw new ApiError(400, "Both fields are required!");
  }
  if (name !== undefined) {
    if (name.trim() === "") {
      throw new ApiError(400, "Playlist name cannot be empty");
    }

    if (name.trim().length > 100) {
      throw new ApiError(400, "Playlist name too long (max 100 chars)");
    }
  }

  if (description !== undefined) {
    if (description.trim() === "") {
      throw new ApiError(400, "Description cannot be empty");
    }

    if (description.trim().length > 500) {
      throw new ApiError(400, "Description too long (max 500 chars)");
    }
  }

  if (isPublic !== undefined && typeof isPublic !== "boolean") {
    throw new ApiError(400, "isPublic must be a boolean");
  }

  // Check for Playlist
  const playlist = await Playlist.findById(playlistID);
  if (!playlist) {
    throw new ApiError(404, " No playlist found!");
  }

  // Check for owner
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Only owner can update playlist!");
  }

  // Update Playlist
  const updateFields = {};

  if (name) updateFields.name = name.trim();
  if (description) updateFields.description = description.trim();
  if (isPublic !== undefined) updateFields.isPublic = isPublic;

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistID,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  // Return res
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated Successfully")
    );
});

const removePlaylist = asyncHandler(async (req, res) => {
  // Get params
  const { playlistID } = req.params;
  if (!playlistID || !mongoose.isValidObjectId(playlistID)) {
    throw new ApiError(400, "Invalid Playlist ID!");
  }

  // Check for Playlist
  const playlist = await Playlist.findById(playlistID);
  if (!playlist) {
    throw new ApiError(404, "No playlist found!");
  }

  // Check for owner
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Only onwer can delete playlist!");
  }

  // Delete playlist
  await Playlist.findByIdAndDelete(playlist);

  // Return res
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted Successfully"));
});
export {
  createPlaylist,
  getUserPlaylist,
  getSinglePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  removePlaylist,
};
