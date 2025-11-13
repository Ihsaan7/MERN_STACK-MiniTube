import mongoose from "mongoose";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";
import Subs from "../models/subs.model.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleSubscribe = asyncHandler(async (req, res) => {
  let message;
  let isSubscribed;
  // Get params
  const { channelID } = req.params;
  if (!channelID || !mongoose.isValidObjectId(channelID)) {
    throw new ApiError(400, "Invalid Channel ID!");
  }

  // Get Channel | User
  const user = await User.findById(channelID);
  if (!user) {
    throw new ApiError(404, "No channel found!");
  }

  // Check for own Channel Subs
  if (channelID === req.user?._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to you own account!");
  }

  // Check for Already Subscribed
  const alreadySubed = await Subs.findOne({
    subscriber: req.user?._id,
    channel: channelID,
  });
  if (alreadySubed) {
    await Subs.findByIdAndDelete(alreadySubed._id);
    message = "Channel Unsubscribed Successfully";
    isSubscribed = false;
  } else {
    await Subs.create({
      subscriber: req.user?._id,
      channel: channelID,
    });
    message = "Channel Subscribed Successfully";
    isSubscribed = true;
  }

  // Count Subscriber
  const subscriberCount = await Subs.countDocuments({ channel: channelID });

  // return res
  return res
    .status(200)
    .json(new ApiResponse(200, { isSubscribed, subscriberCount }, message));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // Get params
  const { channelID } = req.params;
  if (!channelID || !mongoose.isValidObjectId(channelID)) {
    throw new ApiError(400, "Invalid Channel ID!");
  }

  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;

  // Check for Channel | User exits
  const user = await User.findById(channelID);
  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  // Pipeline
  const pipeline = [
    {
      $match: { channel: new mongoose.Types.ObjectId(channelID) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
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
        subscriberDetails: { $first: "$subscriberDetails" },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        subscriber: "$subscriberDetails",
        subscribedAt: "$createdAt",
      },
    },
  ];

  // Pagination
  const options = {
    page: pageNumber,
    limit: limitNumber,
  };

  const result = await Subs.aggregatePaginate(
    Subs.aggregate(pipeline),
    options
  );

  // Return res
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Subbed Channel Fetched Successfully"));
});

const getAllSubbedChannel = asyncHandler(async (req, res) => {
  // Page and Limit
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;

  const pipeline = [
    // Stage 1: Match all subscriptions by this user
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(req.user?._id),
      },
    },

    // Stage 2: Lookup channel details
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails",
        pipeline: [
          // Nested lookup: count channel's subscribers
          {
            $lookup: {
              from: "subs",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: "$subscribers" },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              subscribersCount: 1,
            },
          },
        ],
      },
    },

    // Stage 3: Flatten channel array
    {
      $addFields: {
        channelDetails: { $first: "$channelDetails" },
      },
    },

    // Stage 4: Filter out deleted channels
    {
      $match: {
        channelDetails: { $ne: null },
      },
    },

    // Stage 5: Sort by most recently subscribed
    {
      $sort: {
        createdAt: -1,
      },
    },

    // Stage 6: Project final structure
    {
      $project: {
        channel: "$channelDetails",
        subscribedAt: "$createdAt",
      },
    },
  ];

  // Paginate
  const options = {
    page: pageNumber,
    limit: limitNumber,
  };
  const result = await Subs.aggregatePaginate(
    Subs.aggregate(pipeline),
    options
  );

  // Return Res
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "All Channel who subscribed are Fetched Successfully"
      )
    );
});
export { toggleSubscribe, getUserChannelSubscribers, getAllSubbedChannel };
