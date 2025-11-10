import Router from "express";
import { uploadMulter } from "../middlewares/multer.mware.js";
import verifyJWT from "../middlewares/auth.mware.js";
import {
  getVideo,
  updateContent,
  updatePublish,
  updateVideo,
  uploadVideo,
} from "../controllers/video.controller.js";

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

router.route("/update-publish/:videoID").patch(updatePublish);

router
  .route("/update-content/:videoID")
  .patch(uploadMulter.single("thumbnail"), updateContent);

router
  .route("/update-video/:videoID")
  .patch(uploadMulter.single("videoFile"), updateVideo);
export default router;
