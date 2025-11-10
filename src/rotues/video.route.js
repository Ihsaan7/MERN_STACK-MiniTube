import Router from "express";
import { uploadMulter } from "../middlewares/multer.mware.js";
import verifyJWT from "../middlewares/auth.mware.js";
import { getVideo, uploadVideo } from "../controllers/video.controller.js";

const router = Router();

// All routes below are automatically protected
router.use(verifyJWT);

router.route("/upload-video").post(
  uploadMulter.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

router.route("/watch/:videoID").get(getVideo);

export default router;
