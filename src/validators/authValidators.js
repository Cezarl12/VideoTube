import { body } from "express-validator";
import { oneOf } from "express-validator";

const userRegisterValidation = () => {
  return [
    body("fullName").trim().notEmpty().withMessage("Full Name is required!"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required!")
      .isEmail()
      .withMessage("Email is invalid"),
    body("userName")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lower case")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};

const userLoginValidation = () => {
  return [
    oneOf(
      [
        body("email")
          .trim()
          .notEmpty()
          .withMessage("Email is required!")
          .isEmail()
          .withMessage("Invalid email format"),

        body("userName").trim().notEmpty().withMessage("Username is required"),
      ],
      {
        message: "Please provide either Email or Username to login",
      }
    ),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [body("newPassword").notEmpty().withMessage("Password is required")];
};

const userChngePasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ];
};

const updateUserDetailsValidator = () => {
  return [
    body("fullName").trim().notEmpty().withMessage("Full Name is required!"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

export {
  userRegisterValidation,
  userLoginValidation,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  userChngePasswordValidator,
  updateUserDetailsValidator,
};
