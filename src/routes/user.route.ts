import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { CryptoService } from '../services/crypto.service';
import { AuthController } from '../controllers/auth.controller';
import AuthMiddleware from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/role.middleware';
import { Permissions } from '../utils/permission.util';
import { getUserValidationRules } from '../utils/validators/user.util';


const router = Router();
const userService = new UserService();
const authService = new AuthService();
const cryptoService = new CryptoService();

const authMiddleware = new AuthMiddleware(userService, cryptoService, authService);

const userController = new UserController(userService);

router.get(
    "/",
    getUserValidationRules(),
    authMiddleware.authenticate,
    requirePermission(Permissions.READ_USERS),
    userController.getAllUsers,
)

export {
    router as userRouter
}