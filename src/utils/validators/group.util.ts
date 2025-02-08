import { body, param, query } from "express-validator";

// Validation rules for the login endpoint
export const getGroupsValidationRules = () => [
    query("page").optional().isNumeric().withMessage("Page must be a number"),
    query("pageSize").optional().isNumeric().withMessage("Page size must be a number"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("logs").optional().isBoolean().withMessage("Logs must be a boolean"),
];

// Validation rules for the create group endpoint
export const createGroupValidationRules = () => [
    body("name").notEmpty().withMessage("Name is required!").isString().withMessage("Name must be a string"),
];

// Validation rules for the update group endpoint
export const updateGroupValidationRules = () => [
    body("name").optional().isString().withMessage("Name must be a string"),
    param("id").notEmpty().withMessage("ID is required!").isString().withMessage("ID must be a string"),
    body("description").optional().isString().withMessage("Description must be a string"),
];


// Validation rules for the create group with users endpoint
export const createGroupWithUsersValidationRules = () => [
    body("name").notEmpty().withMessage("Name is required!").isString().withMessage("Name must be a string"),
    body("users").notEmpty().withMessage("Users are required!").isArray().withMessage("Users must be an array"),
    body("description").optional().isString().withMessage("Description must be a string"),
    body("users.*.id").notEmpty().withMessage("User ID is required!").isString().withMessage("User ID must be a string"),
];


export const deleteUserFromGroupValidationRules = () => [
    body("users").notEmpty().withMessage("Users are required!").isArray().withMessage("Users must be an array"),
    body("users.*.id").notEmpty().withMessage("User ID is required!").isString().withMessage("User ID must be a string"),
    param("groupId").notEmpty().withMessage("Group ID is required!").isString().withMessage("Group ID must be a string"),
]