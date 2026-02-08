import { body } from "express-validator";

const userRegisterValidation = () => {
  return [
    body(fullName).trim().notEmpty().withMessage("FullName required!"),
    body(email)
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

export { userRegisterValidation };
