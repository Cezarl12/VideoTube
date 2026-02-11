import { body } from "express-validator";

const createUpdatePlaylistValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("description").trim().optional(),
  ];
};

export { createUpdatePlaylistValidator };
