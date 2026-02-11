import { body } from "express-validator";

const createUpdateTweetValidator = () => {
  return [
    body("content").trim().notEmpty().withMessage("It must have a content!"),
  ];
};
export { createUpdateTweetValidator };
