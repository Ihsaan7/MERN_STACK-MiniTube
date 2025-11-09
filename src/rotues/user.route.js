import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
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

export default router;
