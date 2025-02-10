import { Router } from "express";

import { locationValidationRules, locationIdValidationRules } from "../utils/validators/location.util";
import { validateRequest } from "../middlewares/validate.middleware";
import { LocationService } from "../services/location.service";
import { LocationController } from "../controllers/location.controller";
import { requirePermission } from "../middlewares/role.middleware";
import { Permissions } from "../utils/permission.util";
import AuthMiddleware from "../middlewares/auth.middleware";
import { UserService } from "../services/user.service";
import { CryptoService } from "../services/crypto.service";
import { AuthService } from "../services/auth.service";

const router = Router();
const locationService = new LocationService();
const locationController = new LocationController(locationService);

const userService = new UserService();
const cryptoService = new CryptoService();
const authService = new AuthService();

const authMiddleware = new AuthMiddleware(userService, cryptoService, authService);

router.get(
    "/",
    authMiddleware.authenticate,
    requirePermission(Permissions.READ_LOCATIONS),
    locationController.getAllLocations,
)

router.get(
    "/:id",
    authMiddleware.authenticate,
    requirePermission(Permissions.READ_LOCATIONS),
    locationIdValidationRules(),
    validateRequest,
    locationController.getLocation,
);

router.post(
    "/create",
    authMiddleware.authenticate,
    requirePermission(Permissions.CREATE_LOCATIONS),
    locationValidationRules(),
    validateRequest,
    locationController.createLocation
);

router.put(
    "/:id/edit",
    authMiddleware.authenticate,
    requirePermission(Permissions.UPDATE_LOCATIONS),
    locationValidationRules(),
    validateRequest,
    locationController.editLocation
);

router.delete(
    "/:id/delete",
    authMiddleware.authenticate,
    requirePermission(Permissions.DELETE_LOCATIONS),
    locationIdValidationRules(),
    validateRequest,
    locationController.deleteLocation
);

export { router as locationRouter };