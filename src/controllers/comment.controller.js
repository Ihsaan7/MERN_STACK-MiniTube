import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Comment from "../models/comment.model.js";
import mongoose from "mongoose";
import Video from "../models/video.model.js";

const addComment = asyncHandler(async (req, res) => {
  // Get Params and Data
  const { videoID } = req.params;
  const { content } = req.body;
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment is missing!");
  }
  if (!videoID || !mongoose.isValidObjectId(videoID)) {
    throw new ApiError(400, "Invalid Video ID!");
  }
  if (content.trim().length > 500) {
    throw new ApiError(400, "Comment too long (MAX 500 characters)!");
  }

  // Get Video
  const video = await Video.findById(videoID);
  if (!video) {
    throw new ApiError(404, "Video not Found!");
  }

  // Check for Published || only owner can comment on unpublished video
  if (
    !video.isPublished &&
    video.owner.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Cannot comment on this video");
  }

  // Create the comment
  const comment = await Comment.create({
    content: content.trim(),
    video: videoID,
    owner: req.user?._id,
  });

  // Fetch the comment and its Owner
  const createdComment = await Comment.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(comment._id) },
    },
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
  ]);

  // Return now
  return res
    .status(200)
    .json(
      new ApiResponse(200, createdComment[0], "Comment Added Successfully")
    );
});

const getAllComment = asyncHandler(async (req, res) => {
  // Get Params
  const { videoID } = req.params;
  if (!videoID || !mongoose.isValidObjectId(videoID)) {
    throw new ApiError(400, "Invalid Video ID!");
  }
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;

  // Prevent Over Query
  if (limitNumber > 100) {
    throw new ApiError(400, "Limit cannot exceed 100");
  }
  if (pageNumber < 1) {
    throw new ApiError(400, "Page must be at least 1");
  }

  // Fetch the video
  const video = await Video.findById(videoID);
  if (!video) {
    throw new ApiError(404, "No Video Found!");
  }

  // Aggregate To get the owner
  const pipeline = [
    {
      $match: { video: new mongoose.Types.ObjectId(videoID) },
    },
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
      $addFields: { owner: { $first: "$owner" } },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: 1,
      },
    },
  ];

  // Create the pipline with Aggregate
  const options = {
    page: pageNumber,
    limit: limitNumber,
  };
  const result = await Comment.aggregatePaginate(
    Comment.aggregate(pipeline),
    options
  );

  // Return res
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comments Fetched Successfully"));
});

export { addComment, getAllComment };
