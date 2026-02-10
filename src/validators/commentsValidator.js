import { body } from "express-validator";

const addCommentValidator = () => {
  return [body("content").trim().notEmpty().withMessage("Content is required")];
};

export { addCommentValidator };
