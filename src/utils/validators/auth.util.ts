import { body } from "express-validator";

// Validation rules for the login endpoint
export const loginValidationRules = () => [
  body("email").notEmpty().withMessage("Username is required!").isString().withMessage("Username must be a string"),
  body("password").notEmpty().withMessage("Password is required!"),
];