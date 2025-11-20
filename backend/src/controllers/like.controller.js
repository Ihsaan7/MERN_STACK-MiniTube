import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Like from "../models/like.model.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";
import mongoose from "mongoose";

const likeVideo = asyncHandler(async (req, res) => {
  // Get params
  const { videoID } = req.params;
  if (!videoID || !mongoose.isValidObjectId(videoID)) {
    throw new ApiError(400, "Invalid Video ID!");
  }

  // Fetch Video
  const video = await Video.findById(videoID);
  if (!video) {
    throw new ApiError(404, "Cannot Found the Video!");
  }

  // Check for already liked or not
  const alreadyLiked = await Like.findOne({
    video: videoID,
    likedBy: req.user?._id,
  });

  let message;
  let isLiked;

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);
    message = "Video unliked";
    isLiked = false;
  } else {
    await Like.create({
      video: videoID,
      likedBy: req.user?._id,
    });
    message = "Video Liked";
    isLiked = true;
  }

  return res.status(200).json(new ApiResponse(200, { isLiked }, message));
});

const likeComment = asyncHandler(async (req, res) => {
  // Get params
  const { commentID } = req.params;
  if (!commentID || !mongoose.isValidObjectId(commentID)) {
    throw new ApiError(400, "Invalid Comment ID!");
  }

  // Fetch comment
  const comment = await Comment.findById(commentID);
  if (!comment) {
    throw new ApiError(404, "No comment found!");
  }

  // Check for already Liked or not
  const alreadyLiked = await Like.findOne({
    comment: commentID,
    likedBy: req.user?._id,
  });

  let isLiked;
  let message;

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);
    message = "Comment unliked";
    isLiked = false;
  } else {
    await Like.create({
      comment: commentID,
      likedBy: req.user?._id,
    });
    message = "Comment Liked";
    isLiked = true;
  }

  return res.status(200).json(new ApiResponse(200, { isLiked }, message));
});

const getLikedVideo = asyncHandler(async (req, res) => {
  // Get query
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  // Piplines for get LikedVideo and its owner
  const pipeline = [
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
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
              view: 1,
              createdAt: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        videoDetails: { $first: "$videoDetails" },
      },
    },
    {
      $match: {
        videoDetails: { $ne: null },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        video: "$videoDetails",
        likedAt: "$createdAt",
      },
    },
  ];

  const options = {
    page: pageNumber,
    limit: limitNumber,
  };

  const result = await Like.aggregatePaginate(
    Like.aggregate(pipeline),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Liked Vidoes Fetched Successfully"));
});

export { likeVideo, likeComment, getLikedVideo };
