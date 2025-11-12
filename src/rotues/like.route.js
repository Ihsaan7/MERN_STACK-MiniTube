import Router from "express";
import verifyJWT from "../middlewares/auth.mware.js";
import {
  getLikedVideo,
  likeComment,
  likeVideo,
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);
//Protected Routes

router.route("/like-video/:videoID").post(likeVideo);

router.route("/like-comment/:commentID").post(likeComment);

router.route("/get-liked-video").get(getLikedVideo);

export default router;
