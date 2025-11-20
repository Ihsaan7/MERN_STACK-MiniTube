import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Video from "../models/video.model.js";
import Subs from "../models/subs.model.js";
import Like from "../models/like.model.js";
import mongoose from "mongoose";
import Comment from "../models/comment.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // Get the logged-in user's channel ID
  const channelId = req.user._id;

  // Aggregate stats from Video collection
  const stats = await Video.aggregate([
    {
      // Stage 1: Match only this user's published videos
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
        isPublished: true,
      },
    },
    {
      // Stage 2: Lookup likes on these videos
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      // Stage 3: Lookup subscribers to this channel
      $lookup: {
        from: "subs",
        localField: "owner",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      // Stage 4: Group and calculate totals
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: { $size: "$likes" } },
        totalSubscribers: { $first: { $size: "$subscribers" } },
      },
    },
    {
      // Stage 5: Project to clean up output
      $project: {
        _id: 0,
        totalVideos: 1,
        totalViews: 1,
        totalLikes: 1,
        totalSubscribers: 1,
      },
    },
  ]);

  // Handle edge case: user has no published videos
  if (!stats[0]) {
    // Still fetch subscriber count even if no videos
    const subscriberCount = await Subs.countDocuments({
      channel: channelId,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalVideos: 0,
          totalViews: 0,
          totalLikes: 0,
          totalSubscribers: subscriberCount,
        },
        "Channel stats fetched successfully"
      )
    );
  }

  // Return res
  return res
    .status(200)
    .json(new ApiResponse(200, stats[0], "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // Get the logged-in user's channel ID
  const channelId = req.user._id;

  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Optional: sorting (default: newest first)
  const sortBy = req.query.sortBy || "createdAt";
  const sortType = req.query.sortType === "asc" ? 1 : -1;

  // Aggregate to get videos with their stats
  const videos = await Video.aggregate([
    {
      // Stage 1: Match videos of this channel (both published and unpublished)
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      // Stage 2: Lookup likes for each video
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      // Stage 3: Lookup comments for each video
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      // Stage 4: Add computed fields
      $addFields: {
        likesCount: { $size: "$likes" },
        commentsCount: { $size: "$comments" },
      },
    },
    {
      // Stage 5: Project only needed fields
      $project: {
        _id: 1,
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        view: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        likesCount: 1,
        commentsCount: 1,
      },
    },
    {
      // Stage 6: Sort videos
      $sort: {
        [sortBy]: sortType,
      },
    },
    {
      // Stage 7: Skip for pagination
      $skip: skip,
    },
    {
      // Stage 8: Limit results
      $limit: limit,
    },
  ]);

  // Get total count for pagination metadata
  const totalVideos = await Video.countDocuments({
    owner: channelId,
  });

  const totalPages = Math.ceil(totalVideos / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Return videos with pagination info
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          currentPage: page,
          totalPages,
          totalVideos,
          videosPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
      },
      "Channel videos fetched successfully"
    )
  );
});
export { getChannelStats, getChannelVideos };
