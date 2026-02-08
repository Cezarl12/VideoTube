import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-erros.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const extratedErrors = [];
  errors.array().map((err) =>
    extratedErrors.push({
      [err.path]: err.msg,
    })
  );
  throw new ApiError(422, "Received data is not valid", extratedErrors);
};
