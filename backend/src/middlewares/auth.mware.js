import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  //Get cookie
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  //validate
  if (!token) {
    throw new ApiError(401, "Unauthorized request!");
  }

  //verify cookie
  const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
  //fetch the user
  const user = await User.findById(decodedToken._id).select(
    "-refreshToken -password"
  );
  //validate
  if (!user) {
    throw new ApiError(401, "Unauthorized Request!");
  }

  // send req.user
  req.user = user;
  next();
});

export default verifyJWT;
