import { query } from "express-validator";




// Validation rules for the get user endpoint
export const getUserValidationRules = () => [
    query("page").optional().isNumeric().withMessage("Page must be a number"),
    query("pageSize").optional().isNumeric().withMessage("Page size must be a number"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("logs").optional().isBoolean().withMessage("Logs must be a boolean"),
];


export const getByGroupNameValidationRules = () => [
    query("groupName").isString().withMessage("Group name must be a string"),
    query("page").optional().isNumeric().withMessage("Page must be a number"),
    query("pageSize").optional().isNumeric().withMessage("Page size must be a number"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("logs").optional().isBoolean().withMessage("Logs must be a boolean"),
]
