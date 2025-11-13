import Router from "express";
import verifyJWT from "../middlewares/auth.mware.js";
import {
  getAllSubbedChannel,
  getUserChannelSubscribers,
  toggleSubscribe,
} from "../controllers/subs.controller.js";

const router = Router();

router.use(verifyJWT);
// Protected Route

router.route("/toggle-subscribe/:channelID").post(toggleSubscribe);

// Get all channel (Users) who subbed to me
router
  .route("/get-my-subbed-channel/:channelID")
  .get(getUserChannelSubscribers);

// Get all channel to whome i subscribed
router.route("/get-me-subbed-channel").get(getAllSubbedChannel);
export default router;
