import { Router } from "express";
import { validate } from "../middlewares/validator.js";
import { verifyJWT } from "../middlewares/auth.js";
import {
  addVideoValidation,
  getAllVideosValidation,
  updateVideoValidation,
} from "../validators/videosValidator.js";
import {
  publishVideo,
  getAllVideos,
  deleteVideo,
  getVideoById,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.js";

const router = Router();
router.use(verifyJWT);
router
  .route("/")
  .get(getAllVideosValidation(), validate, getAllVideos)
  .post(
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    addVideoValidation(),
    validate,
    publishVideo
  );

router
  .route("/:videoId")
  .delete(deleteVideo)
  .get(getVideoById)
  .patch(
    upload.single("thumbnail"),
    updateVideoValidation(),
    validate,
    updateVideo
  );

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
export default router;
