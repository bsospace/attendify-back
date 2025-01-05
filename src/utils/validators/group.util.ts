import { body, query } from "express-validator";

// Validation rules for the login endpoint
export const getGroupsValidationRules = () => [
    query("page").optional().isNumeric().withMessage("Page must be a number"),
    query("pageSize").optional().isNumeric().withMessage("Page size must be a number"),
    query("search").optional().isString().withMessage("Search must be a string"),
];

// Validation rules for the create group endpoint
export const createGroupValidationRules = () => [
    body("name").notEmpty().withMessage("Name is required!").isString().withMessage("Name must be a string"),
];