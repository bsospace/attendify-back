import { body, param } from "express-validator";

export const locationValidationRules = () => [
    body("name").notEmpty().withMessage("Name is required!").isString().withMessage("Name must be a string"),
    body("latitude").notEmpty().withMessage("Latitude is required!").isNumeric().withMessage("Latitude must be a number"),
    body("longitude").notEmpty().withMessage("Longitude is required!").isNumeric().withMessage("Longitude must be a number"),
];

export const locationIdValidationRules = () => [
    param("id").notEmpty().withMessage("Location ID is required!").isString().withMessage("Location ID must be a string"),
];