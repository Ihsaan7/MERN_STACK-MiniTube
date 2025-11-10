import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import { uploadCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const uploadVideo = asyncHandler(async (req, res) => {
  // Get data
  const { title, description } = req.body;
  if (!(title && description)) {
    throw new ApiError(400, "Both fields are required!");
  }

  // Get the files
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

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
