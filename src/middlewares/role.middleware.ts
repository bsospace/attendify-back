import { Request, Response, NextFunction } from "express";
import cacheService from "../services/cache.service";
import { UserService } from '../services/user.service';

const userService = new UserService();

export function requirePermission(permission: string): any {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { id: string };

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found",
        error: "User not found",
      });
    }

    try {
      const cacheKey = `users:${user.id}`;
      let userData = await cacheService.get<{
        permissions: string[];
      }>(cacheKey);

      // If not in cache, fetch from database and cache it
      if (!userData) {
        const dbUser = await userService.getUserById(user.id);
        if (!dbUser) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized: user not found",
            error: "User not found",
          });
        }

        userData = {
          permissions: dbUser.permissions,
        };

        // Store user data in cache for 10 minutes
        await cacheService.set(cacheKey, userData, 600);
      }

      // Check if user has the required permission
      if (userData.permissions.includes(permission)) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Forbidden: insufficient permission",
          error: "Insufficient permission",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error || "Unknown error",
      });
    }
  };
}

export function requireRole(role: string): any {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { id: string };

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found",
        error: "User not found",
      });
    }

    try {
      const cacheKey = `users:${user.id}`;
      let userData = await cacheService.get<{
        roles: string[];
      }>(cacheKey);

      // If not in cache, fetch from database and cache it
      if (!userData) {
        const dbUser = await userService.getUserById(user.id);
        if (!dbUser) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized: user not found",
            error: "User not found",
          });
        }

        userData = {
          roles: dbUser.roles,
        };

        // Store user data in cache for 10 minutes
        await cacheService.set(cacheKey, userData, 600);
      }

      // Check if user has the required role
      if (userData.roles.includes(role)) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Forbidden: insufficient role",
          error: "Insufficient role",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error || "Unknown error",
      });
    }
  };
}