import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Comment } from "../models/comment.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const commentsAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              userName: 1,
              avatar: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
        likesCount: { $size: "$likes" },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        likes: 0,
      },
    },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const comments = await Comment.aggregatePaginate(commentsAggregate, options);

  if (!comments || comments.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No comments yet!"));
  }

  const results = {
    comments: comments.docs,
    pagination: {
      total: comments.totalDocs,
      limit: comments.limit,
      page: comments.page,
      pages: comments.totalPages,
      hasNext: comments.hasNextPage,
      hasPrev: comments.hasPrevPage,
    },
  };
  return res
    .status(200)
    .json(new ApiResponse(200, results, "Comments fetched successfully"));
});

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

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found!");
  }
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      403,
      "You do not have permission to delete this comment"
    );
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment nout found!");
  }
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      403,
      "You do not have permission to update this comment"
    );
  }
  const newComment = await Comment.findByIdAndUpdate(
    comment._id,
    { content },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment updates succesfully"));
});

export { addComment, getVideoComments, deleteComment, updateComment };
