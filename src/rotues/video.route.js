import Router from "express";
import { uploadMulter } from "../middlewares/multer.mware.js";
import verifyJWT from "../middlewares/auth.mware.js";

const router = Router();
