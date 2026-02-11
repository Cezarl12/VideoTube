import { body } from "express-validator";
import { query } from "express-validator";

const addVideoValidation = () => {
  return [
    body("title").trim().notEmpty().withMessage("Title is necessary"),
    body("description").trim().notEmpty().withMessage("Title is necessary"),
  ];
};

const getAllVideosValidation = () => {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("query").optional().isString().trim(),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "views", "duration", "likes", "title"])
      .withMessage(
        "You can only sort by: createdAt, views, duration, likes, or title"
      ),
    query("sortType")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("sortType must be either 'asc' or 'desc'"),
    query("userId")
      .optional()
      .isMongoId()
      .withMessage("Invalid User ID format"),
  ];
};

const updateVideoValidation = () => {
  return [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title is necessary"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title is necessary"),
  ];
};

export { addVideoValidation, getAllVideosValidation, updateVideoValidation };
