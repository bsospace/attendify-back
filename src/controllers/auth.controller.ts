import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";

export class AuthController {

  private authService: AuthService;
  private userService: UserService;

  constructor(authService: AuthService, userService: UserService) {
    this.authService = authService;
    this.userService = userService;

    // Bind methods to preserve `this` context
    this.login = this.login.bind(this);
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
          errors: ["Email and password are required"],
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
      const accessToken = data?.accessToken;

      const profile = await this.authService.profile(accessToken);

      const user = profile?.data;

      let existingUser = await this.userService.getUserByEmail(email);

      if (!existingUser) {
        // Create a new user if one does not exist
        existingUser = await this.userService.createUser({
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

      // Respond with success
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            first_name: existingUser.first_name,
            last_name: existingUser.last_name,
            username: existingUser.username,
          },
          accessToken,
          refreshToken: data?.refreshToken,
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
