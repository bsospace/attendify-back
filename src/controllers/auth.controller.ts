import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { users } from "@prisma/client";
import { permission } from "process";
import { envConfig } from "src/configs/env.config";

export class AuthController {

  private authService: AuthService;
  private userService: UserService;

  constructor(authService: AuthService, userService: UserService) {
    this.authService = authService;
    this.userService = userService;

    // Bind methods to preserve `this` context
    this.login = this.login.bind(this);
    this.me = this.me.bind(this);
  }

  public async me(req: Request, res: Response): Promise<any> {
    try {
      const user = req.user as users

      return res.json({
        success: true,
        message: 'Get my user info successful',
        data: user
      });

    } catch (error) {
      // Pass unexpected errors to the next middleware (e.g., error handler)
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }

  /**
   * Handles user login requests.
   * @param req - Express Request object
   * @param res - CustomResponse object extended with custom methods
   * @param next - Express NextFunction for error handling
   */
  public async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Invalid request",
          errors: "Email and password are required",
        });
      }

      // Call AuthService for login logic
      const loginResponse = await this.authService.login(email, password);

      // Check for service-level errors
      if (loginResponse.error) {
        return res.status(400).json({
          success: false,
          message: loginResponse.error,
        })
      }

      const { data } = loginResponse;

      const credentials = data?.credentials;
      const accessToken = credentials?.accessToken;
      const refreshToken = credentials.refreshToken;

      const profile = await this.authService.profile(accessToken);

      const user = profile?.data;

      let existingUser = await this.userService.getUserByEmail(email);
      let newUser: users | null = null;

      if (!existingUser) {
        // Create a new user if one does not exist
        newUser = await this.userService.createUser({
          id: user?.id,
          email,
          first_name: user?.firstName,
          last_name: user?.lastName,
          username: user?.username || '',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          data_logs: {
            title: `User created with email: ${email}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
        });
      }

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: envConfig.nodeEnv === 'production',
        sameSite: 'strict',
        domain: envConfig.app.cookieDomain,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: envConfig.nodeEnv === 'production',
        sameSite: 'strict',
        domain: envConfig.app.cookieDomain,
      });

      // Respond with success
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            ...existingUser,
            ...newUser,
          },
          credentials: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      // Pass unexpected errors to the next middleware (e.g., error handler)
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }
}
