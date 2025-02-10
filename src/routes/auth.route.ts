import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import AuthMiddleware from "../middlewares/auth.middleware";
import { CryptoService } from "../services/crypto.service";

const router = Router();
const authService = new AuthService();
const userService = new UserService();
const cryptoService = new CryptoService();


const authController = new AuthController(authService, userService);
const authMiddleware = new AuthMiddleware(userService, cryptoService, authService);

router.post("/login", authController.login);
router.get("/me", authMiddleware.authenticate, authController.me);

export { router as authRouter };
