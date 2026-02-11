import { body, query } from "express-validator";

const addUpdateCommentValidator = () => {
  return [body("content").trim().notEmpty().withMessage("Content is required")];
};

const getCommentsValidator = () => {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ];
};

export { addUpdateCommentValidator, getCommentsValidator };
