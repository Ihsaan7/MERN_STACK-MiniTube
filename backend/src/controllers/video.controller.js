import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import Playlist from "../models/playlist.model.js";
import { uploadCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
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

const updatePublish = asyncHandler(async (req, res) => {
  // Get data
  const { videoID } = req.params;
  if (!videoID || !mongoose.isValidObjectId(videoID)) {
    throw new ApiError(400, "Invalid video ID!");
  }

  // Find the user
  const video = await Video.findById(videoID);
  if (!video) {
    throw new ApiError(404, "Cant find the video!");
  }

  // Check for owner
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You can't modify this video!");
  }

  // Toggle the published
  video.isPublished = !video.isPublished;
  await video.save();

  // Return res
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Published being Toggled Successfully"));
});

const updateContent = asyncHandler(async (req, res) => {
  // Get params
  const { videoID } = req.params;
  if (!videoID) {
    throw new ApiError(400, "Invalid Video Id!");
  }

  // Get data
  const { title, description } = req.body;
  if (!title && !description) {
    throw new ApiError(400, "Both fileds are required!");
  }

  // Get Video
  const video = await Video.findById(videoID);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  // Check for Owner
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can't edit this video!");
  }

  // Get multer Data
  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required!");
  }

  // Upload on Cloudi
  const thumbnail = await uploadCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(400, "Error uploading thumbnail to Cloudinary!");
  }

  // Delete Old files
  const oldThumbnail = video.thumbnail;
  if (oldThumbnail) {
    const publicId = oldThumbnail.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }

  // Update the content
  video.title = title;
  video.description = description;
  video.thumbnail = thumbnail.url;
  await video.save();

  // Return Res
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Content Updated Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  // Get params
  const { videoID } = req.params;
  if (!videoID || !mongoose.isValidObjectId(videoID)) {
    throw new ApiError(400, "Video ID is invalid!");
  }

  // Get Video
  const video = await Video.findById(videoID);
  if (!video) {
    throw new ApiError(404, "No video found!");
  }

  // Check for owner
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can't edit the Video!");
  }

  // Get Video Data
  const videoFileLocalPath = req.file?.path;
  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is missing!");
  }

  // Check for Size
  const videoSize = req.file?.size;
  const maxSize = 5 * 1024 * 1024;
  if (videoSize > maxSize) {
    throw new ApiError(400, "Video Size must be less than 5MB!");
  }

  // Upload on Cloudi
  const videoFile = await uploadCloudinary(videoFileLocalPath);
  if (!videoFile) {
    throw new ApiError(400, "Error uploading Video!");
  }

  // Get url and Duration
  const videoUrl = videoFile.url;
  const videoDuration = videoFile.duration;

  // Delete old video from Cloudinary
  const oldVideoFile = video.videoFile;
  if (oldVideoFile) {
    const publicId = oldVideoFile.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }

  // Update video in DB
  video.videoFile = videoUrl;
  video.duration = videoDuration;
  await video.save();

  // Return the res
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video has been updated Succesfully"));
});

const removeVideo = asyncHandler(async (req, res) => {
  // Get Params
  const { videoID } = req.params;
  if (!videoID || !mongoose.isValidObjectId(videoID)) {
    throw new ApiError(400, "Video ID is missing or invalid!");
  }

  // Fetch video
  const video = await Video.findById(videoID);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  // Check for owner
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You cannot Delete this video!");
  }

  // Delete from Cloudinary (log errors but don't block)
  const videoPublicId = video.videoFile.split("/").pop().split(".")[0];
  const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];

  try {
    await deleteFromCloudinary(videoPublicId);
    await deleteFromCloudinary(thumbnailPublicId);
  } catch (error) {
    console.log("Cloudinary deletion failed:", error.message);
    // Continue with DB deletion even if Cloudinary fails
  }

  // Delete from DB
  await Video.findByIdAndDelete(videoID);

  // Delete Related Data .Comments , Likes , Playlist
  await Comment.deleteMany({ video: videoID });
  await Like.deleteMany({ video: videoID });
  await Playlist.updateMany(
    { videos: videoID },
    { $pull: { videos: videoID } }
  );
  await User.updateMany(
    { watchHistory: videoID },
    { $pull: { watchHistory: videoID } }
  );

  // Return response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Deleted Successfully"));
});

const getAllVideo = asyncHandler(async (req, res) => {
  // Get Query
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // Validate Params
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  // Get PublishedVideos only
  const pipeline = [];
  pipeline.push({
    $match: {
      isPublished: true,
    },
  });

  // Show Channel Videos
  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userID!");
    }
  }
  pipeline.push({
    $match: { owner: new mongoose.Types.ObjectId(userId) },
  });

  // Show Query Videos
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  // Get Video Owners details
  pipeline.push({
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
  });
  pipeline.push({
    $addFields: {
      owner: { $first: "$owner" },
    },
  });

  // Validate for avoiding sensitive fields
  const allowedSortFields = ["createdAt", "views", "title", "duration"];
  if (sortBy && !allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sort field");
  }

  // Get Sorted Videos
  if (sortBy && sortType) {
    const sortOrder = sortType === "asc" ? 1 : -1;
    pipeline.push({
      $sort: {
        [sortBy]: sortOrder,
      },
    });
  } else {
    pipeline.push({
      $sort: { createdAt: -1 },
    });
  }

  // Project Fields
  pipeline.push({
    $project: {
      title: 1,
      description: 1,
      thumbnail: 1,
      duration: 1,
      view: 1,
      createdAt: 1,
      owner: 1,
    },
  });

  // Pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limitNumber });

  // Execute aggregation
  const videos = await Video.aggregate(pipeline);

  // Get total count
  const totalVideos = await Video.countDocuments({
    isPublished: true,
    ...(userId && { owner: new mongoose.Types.ObjectId(userId) }),
  });

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalVideos / limitNumber),
        totalVideos,
      },
      "Videos fetched successfully"
    )
  );
});

export {
  uploadVideo,
  getVideo,
  updatePublish,
  updateContent,
  updateVideo,
  removeVideo,
  getAllVideo,
};
