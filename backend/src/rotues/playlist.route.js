import Router from "express";
import {
  createPlaylist,
  getUserPlaylist,
  getSinglePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  removePlaylist,
} from "../controllers/playlist.controller.js";
import verifyJWT from "../middlewares/auth.mware.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-playlist").post(createPlaylist);

router.route("/get-user-playlist").get(getUserPlaylist);

router.route("/get-playlist/:playlistID").get(getSinglePlaylist);

router.route("/add-video/:playlistID/:videoID").patch(addVideoToPlaylist);

router
  .route("/remove-video/:playlistID/:videoID")
  .patch(removeVideoFromPlaylist);

router.route("/update-playlist/:playlistID").patch(updatePlaylist);

router.route("/remove-playlist/:playlistID").delete(removePlaylist);
export default router;
