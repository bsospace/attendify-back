import { Router } from 'express';

import { SubLocationController } from 'src/controllers/subLocation.controller';
import { SubLocationService } from '../services/subLocation.service';
import { subLocationValidationRules } from '../utils/validators/subLocation.util';
import { validateRequest } from '../middlewares/validate.middleware';
const router = Router();
const subLocationService = new SubLocationService();
const subLocationController = new SubLocationController(subLocationService);



router.post(
    "/:id/create",
    subLocationValidationRules(),
    validateRequest,
    subLocationController.createSubLocation,
);

router.patch(
    "/:id/edit",
    subLocationValidationRules(),
    validateRequest,
    subLocationController.editSubLocation,
);


export { router as subLocationRouter };