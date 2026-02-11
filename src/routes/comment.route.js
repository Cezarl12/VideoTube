import { Router } from "express";
import { validate } from "../middlewares/validator.js";
import { verifyJWT } from "../middlewares/auth.js";
import {
  addUpdateCommentValidator,
  getCommentsValidator,
} from "../validators/commentsValidator.js";
import {
  addComment,
  getVideoComments,
  deleteComment,
  updateComment,
} from "../controllers/comments.controller.js";
const router = Router();

router.use(verifyJWT);
router
  .route("/:videoId")
  .post(addUpdateCommentValidator(), validate, addComment)
  .get(getCommentsValidator(), validate, getVideoComments);
router
  .route("/c/:commentId")
  .delete(deleteComment)
  .patch(addUpdateCommentValidator(), validate, updateComment);

export default router;
