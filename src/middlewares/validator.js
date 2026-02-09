import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const extratedErrors = [];
  errors.array().map((err) =>
    extratedErrors.push({
      [err.path]: err.msg,
    })
  );
  const error = new ApiError(422, "Validation failed", extratedErrors);

  return res.status(error.statusCode).json({
    success: error.success,
    message: error.message,
    errors: error.errors,
  });
};
