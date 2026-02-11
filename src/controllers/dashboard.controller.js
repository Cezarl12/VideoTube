import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const stats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
        totalVideos: { $sum: 1 },
        totalLikes: { $sum: { $size: "$likes" } },
        mostViewedVideo: { $max: { views: "$views", title: "$title" } },
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        let: { ownerId: new mongoose.Types.ObjectId(userId) },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$channel", "$$ownerId"] },
            },
          },
          { $count: "count" },
        ],
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "tweets",
        let: { ownerId: new mongoose.Types.ObjectId(userId) },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$owner", "$$ownerId"] },
            },
          },
          { $count: "count" },
        ],
        as: "tweets",
      },
    },
    {
      $addFields: {
        totalSubscribers: { $ifNull: [{ $first: "$subscribers.count" }, 0] },
        totalTweets: { $ifNull: [{ $first: "$tweets.count" }, 0] },
      },
    },
    {
      $project: {
        _id: 0,
        subscribers: 0,
        tweets: 0,
      },
    },
  ]);

  const finalStats =
    stats.length > 0
      ? stats[0]
      : {
          totalViews: 0,
          totalVideos: 0,
          totalLikes: 0,
          totalSubscribers: 0,
          totalTweets: 0,
          mostViewedVideo: null,
        };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        finalStats,
        "Comprehensive stats fetched successfully"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { chanelId } = req.params;
  const { sortBy = "createdAt", sortType = "desc" } = req.query;

  if (!isValidObjectId(chanelId)) {
    throw new ApiError(404, "Not a valid id!");
  }

  const sortOptions = {};
  const key = sortBy;
  const type = sortType === "asc" ? 1 : -1;
  sortOptions[key] = type;

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(chanelId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        owner: 1,
        thumnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        likesCount: 1,
      },
    },
    {
      $sort: sortOptions,
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videos,
        `Videos sorted by ${sortBy} in ${sortType} order`
      )
    );
});

export { getChannelStats, getChannelVideos };
