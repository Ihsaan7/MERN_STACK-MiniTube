import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Video from "../models/video.model.js";
import { uploadCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose, { mongo } from "mongoose";
import User from "../models/user.model.js";

const uploadVideo = asyncHandler(async (req, res) => {
  // Get data
  const { title, description } = req.body;
  if (!(title && description)) {
    throw new ApiError(400, "Both fields are required!");
  }

  // Get the files
  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video file and thumbnail are required!");
  }

  // Check file size (5MB = 5 * 1024 * 1024 bytes)
  const videoFileSize = req.files?.videoFile?.[0]?.size;
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (videoFileSize > maxSize) {
    throw new ApiError(400, "Video size must be less than 5MB!");
  }

  // Upload on Cloudi
  const videoFile = await uploadCloudinary(videoFileLocalPath);
  const thumbnail = await uploadCloudinary(thumbnailLocalPath);

  // Get URL and duration
  const videoUrl = videoFile.url;
  const videoDuration = videoFile.duration;
  const thumbnailUrl = thumbnail.url;

  // Create video in DB
  const video = await Video.create({
    title,
    description,
    videoFile: videoUrl,
    duration: videoDuration,
    thumbnail: thumbnailUrl,
    owner: req.user._id,
  });

  // Return res as video
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded Successfully"));
});

const getVideo = asyncHandler(async (req, res) => {
  // Get id
  const { videoID } = req.params;
  if (!videoID || !mongoose.isValidObjectId(videoID)) {
    throw new ApiError(400, "Video Id is invalid!");
  }

  const video = await Video.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoID) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscriberCount: { $size: "$subscribers" },
              isSubscribed: {
                $cond: {
                  if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              subscriberCount: 1,
              isSubscribed: 1,
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

  if (!video || video.length === 0) {
    throw new ApiError(404, "Video not found!");
  }

  const videoData = video[0];
  if (!videoData.isPublished) {
    if (
      !req.user ||
      videoData.owner._id.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(403, "Video is not available!");
    }
  }

  await Video.findByIdAndUpdate(videoID, {
    $inc: { view: 1 },
  });

  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: videoID },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoData, "Video Fetched Successfully"));
});
export { uploadVideo, getVideo };
