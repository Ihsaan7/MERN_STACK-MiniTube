import Router from "express";
import {
  addComment,
  getAllComment,
  removeComment,
  updateComment,
} from "../controllers/comment.controller.js";
import verifyJWT from "../middlewares/auth.mware.js";

const router = Router();

// Protected Routes
router.use(verifyJWT);
router.route("/comment/:videoID").post(addComment);

router.route("/all-comment/:videoID").get(getAllComment);

router.route("/update-comment/:commentID").patch(updateComment);

router.route("/remove-comment/:commentID").delete(removeComment);

export default router;
