import { query } from "express-validator";


export const getAnnacmentValidationRules = () => [
    query("page").optional().isNumeric().withMessage("Page must be a number"),
    query("pageSize").optional().isNumeric().withMessage("Page size must be a number"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("logs").optional().isBoolean().withMessage("Logs must be a boolean"),
]

export const getUpcommingEventsValidationRules = () => [
    query("page").optional().isNumeric().withMessage("Page must be a number"),
    query("pageSize").optional().isNumeric().withMessage("Page size must be a number"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("logs").optional().isBoolean().withMessage("Logs must be a boolean"),
    query("start").optional().isString().withMessage("Start date must be a string"),
    query("end").optional().isString().withMessage("End date must be a string"),
]