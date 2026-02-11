import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Video } from "../models/video.js";
import { User } from "../models/user.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile || !thumbnail) {
    throw new ApiError(500, "Upload failed");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    owner: req.user._id,
    isPublished: true,
  });

  if (!video) {
    throw new ApiError(500, "Something went wrong while publishing the video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pipeline = [];

  //published
  pipeline.push({ $match: { isPublished: true } });

  //filter by query
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  //filter by user
  if (userId) {
    pipeline.push({
      $match: {
        owner: userId,
      },
    });
  }

  //building the object
  pipeline.push(
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        owner: { $first: "$ownerDetails" },
      },
    }
  );

  //filter but type
  pipeline.push({
    $sort: {
      [sortBy === "likes" ? "likesCount" : sortBy]: sortType === "asc" ? 1 : -1,
    },
  });

  pipeline.push({
    $project: {
      ownerDetails: 0,
      likes: 0,
      __v: 0,
    },
  });

  const videoAggregate = Video.aggregate(pipeline);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const videos = await Video.aggregatePaginate(videoAggregate, options);

  const responseData = {
    videos: videos.docs,
    pagination: {
      total: videos.totalDocs,
      limit: videos.limit,
      page: videos.page,
      pages: videos.totalPages,
      hasNext: videos.hasNextPage,
      hasPrev: videos.hasPrevPage,
    },
  };
  if (!responseData || responseData.videos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No videos found matching the criteria"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, responseData, "Videos fetched successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  try {
    if (video.videoFile) {
      const videoPublicId = video.videoFile.split("/").pop().split(".")[0];
      await deleteFromCloudinary(videoPublicId);
    }
    if (video.thumbnail) {
      const thumbPublicId = video.thumbnail.split("/").pop().split(".")[0];
      await deleteFromCloudinary(thumbPublicId);
    }
  } catch (error) {
    console.log(error);
    throw new ApiError(404, "Error deleting from cloudinary");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deleteVideo) {
    throw new ApiError(400, "Something went wrong deleting the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully!"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { watchHistory: videoId },
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const videoStats = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
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
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
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
      $project: {
        likes: 0,
        __v: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videoStats, "Video fetched successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to modify this video");
  }

  video.isPublished = !video.isPublished;

  const savedVideo = await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        savedVideo,
        "Video publish status toggled successfully"
      )
    );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this video");
  }
  const thumbnailLocalPath = req.file?.path;

  let newThumbnail;
  if (thumbnailLocalPath) {
    newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!newThumbnail.url) {
      throw new ApiError(500, "Error while uploading new thumbnail");
    }
    const oldThumbnailUrl = video.thumbnail;
    const publicId = oldThumbnailUrl.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title || video.title,
        description: description || video.description,
        thumbnail: newThumbnail?.url || video.thumbnail,
      },
    },
    { new: true }
  ).select("-__v");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Video details updated successfully")
    );
});

export {
  publishVideo,
  getAllVideos,
  deleteVideo,
  getVideoById,
  togglePublishStatus,
  updateVideo,
};
