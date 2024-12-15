import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import cacheService from '../services/cache.service';
import { users } from '@prisma/client';
import { UserService } from '../services/user.service';
import { CryptoService } from '../services/crypto.service';
import { envConfig } from 'src/configs/env.config';
import { AuthService } from 'src/services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: Partial<users>;
    }
  }
}

class AuthMiddleware {
  private userService: UserService;
  private cryptoService: CryptoService;
  private authService: AuthService;

  constructor(userService: UserService, cryptoService: CryptoService, authService: AuthService) {
    this.userService = userService;
    this.cryptoService = cryptoService;
    this.authService = authService;

    // Bind methods to preserve `this` context
    this.authenticate = this.authenticate.bind(this);

  }


  public authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {

      // Retrieve token from Authorization header or cookies
      const authHeader = req.headers?.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies?.accessToken;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authorization failed!",
          error: "No token provided",
        });
      }

      // Decode token to get service
      const decode = this.cryptoService.decodeToken(token);

      // Check if token is for the correct service
      if (!decode?.service?.includes(envConfig.app.serviceName)) {
        return res.status(401).json({
          success: false,
          message: "Authorization failed!",
          error: "Invalid service in token",
        });
      }

      // Verify the access token
      const jwtPayload: JwtPayload | null = this.cryptoService.verifyAccessToken(
        token,
        decode.service
      );

      if (!jwtPayload) {
        return res.status(401).json({
          success: false,
          message: "Authorization failed!",
          error: "Invalid token",
        });
      }

      // Try retrieving the user from cache
      let user = await cacheService.get<Partial<users>>(`users:${jwtPayload.sub}`);

      if (!user) {
        // Fetch user from database if not cached
        const userDatabase = await this.userService.getUserById(jwtPayload.sub!);

        if (userDatabase?.deleted_at) {
          return res.status(401).json({
            success: false,
            message: "Authorization failed!",
            error: "User not found",
          });
        }

        if (userDatabase) {
          user = userDatabase;
          await cacheService.set(`users:${jwtPayload.sub}`, user, 600);
        } else {
          // Create a user if not found
          console.log("[INFO] User not found, creating new user...");
          console.log("[INFO] Fetching user profile from OpenID...");

          const userProfile = await this.authService.profile(token);

          if (!userProfile.success) {
            return res.status(401).json({
              success: false,
              message: "Authorization failed!",
              error: userProfile.error,
            });
          }

          console.log("[INFO] Profile:", userProfile);
          const newUser = await this.userService.createUser({
            id: jwtPayload.sub!,
            email: userProfile.data?.email!,
            username: userProfile.data?.username || "",
            first_name: userProfile.data?.first_name || "",
            last_name: userProfile.data?.last_name || "",
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            data_logs: {
              title: `User created with email: ${userProfile.data?.email} from OpenID`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
            },
          });

          user = newUser;
          await cacheService.set(`users:${jwtPayload.sub}`, newUser, 600);
        }
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error("Error in authentication:", error);

      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error || "Unknown error",
      });
    }
  };
}

export default AuthMiddleware;