import { Router } from "express";
import { validate } from "../middlewares/validator.js";
import { verifyJWT } from "../middlewares/auth.js";
import { addCommentValidator } from "../validators/commentsValidator.js";
import { addComment } from "../controllers/comments.controller.js";
const router = Router();

router.use(verifyJWT);
router.route("/:videoId").get(addCommentValidator(), validate, addComment);
export default router;
