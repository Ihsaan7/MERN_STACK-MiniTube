import Router from "express";
import {
  createPlaylist,
  getUserPlaylist,
  getSinglePlaylist,
} from "../controllers/playlist.controller.js";
import verifyJWT from "../middlewares/auth.mware.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-playlist").post(createPlaylist);

router.route("/get-user-playlist").get(getUserPlaylist);

router.route("/get-playlist/:playlistID").get(getSinglePlaylist);

export default router;
