import { Router } from "express";

import { locationValidationRules, locationIdValidationRules } from "../utils/validators/location.util";
import { validateRequest } from "../middlewares/validate.middleware";
import { LocationService } from "src/services/location.service";
import { LocationController } from "src/controllers/location.controller";

const router = Router();
const locationService = new LocationService();
const locationController = new LocationController(locationService);

router.get(
    "/",
    locationController.getAllLocations,
)

router.get(
    "/:id",
    locationIdValidationRules(),
    validateRequest,
    locationController.getLocation,
);

router.post(
    "/create",
    locationValidationRules(),
    validateRequest,
    locationController.createLocation
);

router.put(
    "/:id/edit",
    locationValidationRules(),
    validateRequest,
    locationController.editLocation
);

router.delete(
    "/:id/delete",
    locationIdValidationRules(),
    validateRequest,
    locationController.deleteLocation
);

export { router as locationRouter };