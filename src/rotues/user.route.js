import { Router } from "express";
import {
  updatePass,
  loginUser,
  logoutUser,
  newAccessToken,
  registerUser,
  updateDetails,
  userProfile,
  updateAvatar,
  updateCoverImage,
  getChannel,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { uploadMulter } from "../middlewares/multer.mware.js";
import verifyJWT from "../middlewares/auth.mware.js";
import ApiResponse from "../utils/apiResponse.js";

const router = Router();

// ----------------- User routes ------------------------
router.route("/signup").post(
  uploadMulter.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// Protected Routes Here
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(verifyJWT, newAccessToken);

router.route("/update-detail").post(verifyJWT, updateDetails);

router.route("/update-password").patch(verifyJWT, updatePass);

router.route("/profile").get(verifyJWT, userProfile);

router
  .route("/update-avatar")
  .patch(verifyJWT, uploadMulter.single("avatar"), updateAvatar);

router
  .route("/update-coverImage")
  .patch(verifyJWT, uploadMulter.single("coverImage"), updateCoverImage);

router.route("/channel/:username").get(verifyJWT, getChannel);

router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
