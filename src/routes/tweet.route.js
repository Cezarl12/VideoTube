import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweets.controller.js";
import { createUpdateTweetValidator } from "../validators/tweetValidator.js";
import { validate } from "../middlewares/validator.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createUpdateTweetValidator(), validate, createTweet);

router.route("/user/:userId").get(getUserTweets);

router
  .route("/:tweetId")
  .patch(createUpdateTweetValidator(), validate, updateTweet)
  .delete(deleteTweet);
export default router;
