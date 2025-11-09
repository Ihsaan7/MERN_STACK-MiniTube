import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import { uploadCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { username, password, email, fullName } = req.body;
  // Validate
  if ([username, email, fullName, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user exists
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User already exist!");
  }

  //File upload
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required!");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required!");
  }

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // Fetch user without pass
  const createdUser = await User.findById(user._id).select(
    "-refreshToken -password"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating User!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  //validate
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required!");
  }

  //find user in DB
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  //validate
  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  //Check for pass
  const passCheck = await user.isPassCorrect(password);
  //validate
  if (!passCheck) {
    throw new ApiError(401, "Invalid Credentials!");
  }

  // gen tokens
  const accessToken = user.genAccessToken();
  const refreshToken = user.genRefreshToken();
  // new Refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-refreshToken -password"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, refreshToken, accessToken },
        "User LoggedIn SuccessFully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggedOut Successfully"));
});

const newAccessToken = asyncHandler(async (req, res) => {
  // Get token
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  // Validate
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request!");
  }

  try {
    // Verify Token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_TOKEN
    );
    // Fetch User
    const user = await User.findById(decodedToken._id);
    // Validate
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token!");
    }
    // Validate
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refreshed Token is Expired or used!");
    }

    // Gen new Token
    const accessToken = user.genAccessToken();
    const refreshToken = user.genRefreshToken();

    // Options for cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    // sends the response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Token Refreshed Successfully"
        )
      );
  } catch (err) {
    throw new ApiError(401, err?.message || "Unathorized Access");
  }
});

const updateDetails = asyncHandler(async (req, res) => {
  // Get fileds
  const { username, fullName } = req.body;
  // Validate
  if (!(fullName || username)) {
    throw new ApiError(400, "Both fields required!");
  }

  // Fetch user
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullName, username },
    },
    {
      new: true,
    }
  ).select("-password ");
  // Validate
  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  // Send response
  return res
    .status(200)
    .json(
      new ApiResponse(200, { user }, "Account details updated Successfully")
    );
});

const updatePass = asyncHandler(async (req, res) => {
  // Get data
  const { oldPass, newPass } = req.body;
  // Validate
  if (!(oldPass && newPass)) {
    throw new ApiError(400, "Both fields are required!");
  }

  // Fetch User
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(401, "Invalid Request!");
  }

  // Check for OldPass
  const isPassCorrect = await user.isPassCorrect(oldPass);
  if (!isPassCorrect) {
    throw new ApiError(401, "Invalid old password!");
  }

  // Update newPass
  user.password = newPass;
  await user.save({ validateBeforeSave: false });

  // Send response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const userProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Profile Fetched Successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  // Get file
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is missing!");
  }

  // Upload to cloudinary
  const avatar = await uploadCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Error while uploading to Cloudinary!");
  }

  // Get old avatar URL to delete
  const oldAvatarUrl = req.user?.avatar;
  if (oldAvatarUrl) {
    const publicId = oldAvatarUrl.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Avatar Updated Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  newAccessToken,
  updateDetails,
  updatePass,
  userProfile,
  updateAvatar,
};
