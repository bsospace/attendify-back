import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { CryptoService } from '../services/crypto.service';
import { AuthController } from '../controllers/auth.controller';
import AuthMiddleware from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/role.middleware';
import { Permissions } from '../utils/permission.util';
import { getByGroupNameValidationRules, getUserValidationRules } from '../utils/validators/user.util';
import { GroupService } from '../services/group.service';


const router = Router();
const userService = new UserService();
const authService = new AuthService();
const cryptoService = new CryptoService();
const groupService = new GroupService();

const authMiddleware = new AuthMiddleware(userService, cryptoService, authService);

const userController = new UserController(userService, groupService);

router.get(
    "/",
    getUserValidationRules(),
    authMiddleware.authenticate,
    requirePermission(Permissions.READ_USERS),
    userController.getAllUsers,
)

router.get(
    "/:groupName/get-by-group",
    getByGroupNameValidationRules(),
    authMiddleware.authenticate,
    requirePermission(Permissions.READ_USERS),
    userController.getByGroupName,
)

export {
    router as userRouter
}