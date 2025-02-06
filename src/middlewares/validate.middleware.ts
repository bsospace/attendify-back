/**
 * validateRequest.middleware.ts
 * This file is responsible for validating the all request in this app.
 * Author: Piyawat Wongyat
 * Created: 06/09/2024
 */

import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/***
 * This function validates the request and returns an error if the request is invalid.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */

export const validateRequest = (req: Request, res: Response, next: NextFunction): any => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
      error: errors.array()[0].msg,
    });
  }
  next();
};