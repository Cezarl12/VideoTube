import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, userName, email, password } = req.body;
  const user = User.findOne({ userName, email });
  if (user) {
    throw new ApiError(400, "An user ");
  }
});

export { registerUser };
