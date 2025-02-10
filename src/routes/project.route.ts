import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { ProjectService } from "../services/project.service";
import { getAnnacmentValidationRules, getUpcommingEventsValidationRules } from "../utils/validators/project.util";



const projectService = new ProjectService();
const projectController = new ProjectController(projectService);





const router = Router();


router.get('/announcement', getAnnacmentValidationRules(), projectController.getAnnouncement);

router.get('/upcomming', getUpcommingEventsValidationRules(), projectController.getUpcommingEvents);

export {
    router as projectRouter
}