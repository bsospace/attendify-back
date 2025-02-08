import { Router } from 'express';
import { GroupController } from '../controllers/group.controller';
import { GroupService } from '../services/group.service';
import { createGroupValidationRules, createGroupWithUsersValidationRules, deleteUserFromGroupValidationRules, getGroupsValidationRules } from '../utils/validators/group.util';
import { validateRequest } from '../middlewares/validate.middleware';
import AuthMiddleware from '../middlewares/auth.middleware';
import { UserService } from '../services/user.service';
import { CryptoService } from '../services/crypto.service';
import { AuthService } from '../services/auth.service';
import { requirePermission } from '../middlewares/role.middleware';
import { Permissions } from '../utils/permission.util';

// Instantiate GroupService and GroupController
const groupService = new GroupService();
const userService = new UserService();
const groupController = new GroupController(groupService,userService);
const cryptoService = new CryptoService();
const authService = new AuthService();

const authMiddleware = new AuthMiddleware(userService, cryptoService, authService);

// Create the router
const router = Router();

// Route to get all groups with pagination and search
router.get('/', authMiddleware.authenticate, requirePermission(Permissions.READ_GROUPS), getGroupsValidationRules(), validateRequest, groupController.getAllGroups);

// Route to create a new group with validation
router.post('/create', authMiddleware.authenticate, requirePermission(Permissions.CREATE_GROUPS),createGroupValidationRules(), validateRequest, groupController.createGroup);

// Route to update a group with validation
router.put('/:id/edit', authMiddleware.authenticate, requirePermission(Permissions.UPDATE_GROUPS), createGroupValidationRules(), validateRequest, groupController.updateGroup);


// Route create a new group with a user
router.post('/group-user/create', authMiddleware.authenticate, requirePermission(Permissions.CREATE_GROUPS),createGroupWithUsersValidationRules(), groupController.addUserToGroup);

// Route to get all users in a group
router.put('/group-user/:groupId/edit', authMiddleware.authenticate, requirePermission(Permissions.DELETE_GROUPS), groupController.updateUserInGroup);

// Route to delete a user from a group
router.delete('/group-user/:groupId/delete', authMiddleware.authenticate, requirePermission(Permissions.DELETE_GROUPS),deleteUserFromGroupValidationRules(), groupController.deleteUserFromGroup);

// Route to delete a group
router.delete('/:id/delete', authMiddleware.authenticate, requirePermission(Permissions.DELETE_GROUPS), groupController.deleteGroup);

export {
    router as groupRouter
};
