import Router from "express";
import verifyJWT from "../middlewares/auth.mware.js";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.use(verifyJWT);
// Protected Routes
router.route("/channel-stats").get(getChannelStats);

router.route("/channel-videos").get(getChannelVideos);

export default router;
