import { query } from "express-validator";

const getAllVideosValidator = () => {
  return [
    query("sortBy")
      .optional()
      .isIn(["createdAt", "views", "duration", "title", "likesCount"])
      .withMessage("Invalid sortBy field"),
    query("sortType")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("sortType must be either asc or desc"),
  ];
};

export { getAllVideosValidator };
