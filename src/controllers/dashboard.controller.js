import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Like from "../models/like.model.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";
import mongoose from "mongoose";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelID = req.user?._id;
});
