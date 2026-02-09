import { Router } from "express";
import {
  registerUser,
  verifyEmail,
  login,
  forgotPasswordRequest,
  resetForgotPassword,
  refreshAccesToken,
  logout,
  resendEmailVerification,
  getCurentUser,
  resetCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validator.js";
import {
  userRegisterValidation,
  userLoginValidation,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  userChngePasswordValidator,
  updateUserDetailsValidator,
} from "../validators/authValidators.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

//unauthorized
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userRegisterValidation(),
  validate,
  registerUser
);
router.route("/verify-email/:emailVerificationToken").get(verifyEmail);

router.route("/login").post(userLoginValidation(), validate, login);

router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);

router
  .route("/reset-password/:resetToken")
  .post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

router.route("/refresh-token").post(refreshAccesToken);

//authorized
router.route("/logout").post(verifyJWT, logout);
router.route("/current-user").get(verifyJWT, getCurentUser);
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);
router
  .route("/change-password")
  .post(
    verifyJWT,
    userChngePasswordValidator(),
    validate,
    resetCurrentPassword
  );
router
  .route("/update-details")
  .post(
    verifyJWT,
    updateUserDetailsValidator(),
    validate,
    updateAccountDetails
  );
router
  .route("/update-avatar")
  .post(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-coverimage")
  .post(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
export default router;
