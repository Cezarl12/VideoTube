import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;

    const message = error.message || "Something went wrong!";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const respone = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "developer" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode).json(respone);
};
