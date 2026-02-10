import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Comment } from "../models/comment.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const newComment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.user._id,
  });

  if (!newComment) {
    throw new ApiError(500, "Something went wrong while adding the comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Commented added succesfully"));
});

export { addComment };
