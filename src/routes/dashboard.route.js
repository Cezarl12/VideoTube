import { Router } from "express";
import {
  getChannelVideos,
  getChannelStats,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.js";
import { validate } from "../middlewares/validator.js";
import { getAllVideosValidator } from "../validators/dashboardValidator.js";

const router = Router();
router.use(verifyJWT);

router.route("/stats").get(getChannelStats);
router
  .route("/videos/:chanelId")
  .get(getAllVideosValidator(), validate, getChannelVideos);
export default router;
