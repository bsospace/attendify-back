import { body } from "express-validator";

export const subLocationValidationRules = () => [
    body("name").notEmpty().withMessage("Name is required!").isString().withMessage("Name must be a string"),
];