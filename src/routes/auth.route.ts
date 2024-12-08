import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { validateRequest } from "../middlewares/validate.middleware";
import { loginValidationRules } from "../utils/validators/auth.util";
import { UserService } from "../services/user.service";

const router = Router();
const authService = new AuthService();
const userService = new UserService();
const authController = new AuthController(authService, userService);

// Route for login
router.post(
  "/login",
  loginValidationRules(),
  validateRequest,
 authController.login
);

export { router as authRouter };
