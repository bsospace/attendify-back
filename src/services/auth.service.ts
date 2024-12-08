import { envConfig } from "../configs/env.config";

export class AuthService {

  public async profile(token: string) {
    try {
      const fetchProfileResponse = await fetch(
        `${envConfig.openIdApi}/auth//me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const profileResponse = (await fetchProfileResponse.json()) as { message?: string; error?: string; data?: any };

      // Handle specific API error responses
      if (!fetchProfileResponse.ok) {
        const errorMessage =
          profileResponse.message ||
          profileResponse.error ||
          "Failed to fetch profile";

        // Return a structured error object
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Return success with data
      return {
        success: true,
        data: profileResponse.data,
      };
    } catch (error) {
      // Handle unexpected errors
      return {
        success: false,
        error:
          error instanceof Error
            ? `Failed to fetch profile: ${error.message}`
            : "An unknown error occurred",
      };    
    }
  }

  public async login(email: string, password: string) {
    try {
      const fetchLoginResponse = await fetch(
        `${envConfig.openIdApi}/auth/login?service=attendify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const loginResponse = (await fetchLoginResponse.json()) as { message?: string; error?: string; data?: any };

      // Handle specific API error responses
      if (!fetchLoginResponse.ok) {
        const errorMessage =
          loginResponse.message ||
          loginResponse.error ||
          "Failed to log in";

        // Return a structured error object
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Return success with data
      return {
        success: true,
        data: loginResponse.data,
      };
    } catch (error) {
      // Handle unexpected errors
      return {
        success: false,
        error:
          error instanceof Error
            ? `Failed to log in: ${error.message}`
            : "An unknown error occurred",
      };
    }
  }
}
