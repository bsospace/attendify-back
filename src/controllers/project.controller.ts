import { ProjectService } from "../services/project.service";
import { Request, Response } from "express";

export class ProjectController {
    constructor(private projectService: ProjectService) {
        this.projectService = projectService;


        // Bind all the functions to this class

        this.getAnnouncement = this.getAnnouncement.bind(this);
    }


    /**
     * Get all announcement events with pagination and search
     * @param req - Request object
     * @param res - Response object
     * @returns - Array of announcement events and total count
     */

    public getAnnouncement = async (req: Request, res: Response): Promise<any> => {
        try {
            // Get pagination values from query parameters
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const search = req.query.search as string;
            const logs = req.query.logs === 'true';

            // Get announcement events
            const { events, totalCount } = await this.projectService.getAnnouncement(page, pageSize, search, logs);

            // Return the announcement events and total count

            return res.status(200).json({
                success: true,
                message: "Announcement events retrieved successfully",
                data: events,
                meta: {
                    page: page,
                    pageSize: pageSize,
                    totalPages: Math.ceil(totalCount / pageSize),
                    total: totalCount
                }
            });

        } catch (error) {
            // Return an error if one occurs
            res.status(500).json({ error: error });
        }
    }

    /**
     * Get all upcoming events with pagination and search
     * @param req - Request object
     * @param res - Response object
     * @returns - Array of upcoming events and total count
     */
    
    public getUpcommingEvents = async (req: Request, res: Response): Promise<any> => {
        try {
            // Get pagination values from query parameters
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const search = req.query.search as string;
            const logs = req.query.logs === 'true';
            const {
                start, end
            } = req.query;


            // Get announcement events
            const { events, totalCount } = await this.projectService.getUpcomingEvents(page, pageSize, search, start as string, end as string, logs);

            // Return the announcement events and total count

            return res.status(200).json({
                success: true,
                message: "Announcement events retrieved successfully",
                data: events,
                meta: {
                    page: page,
                    pageSize: pageSize,
                    totalPages: Math.ceil(totalCount / pageSize),
                    total: totalCount
                }
            });

        } catch (error) {
            // Return an error if one occurs
            res.status(500).json({
                success: false,
                message: "Failed to fetch announcement events.",
                error: error
            });
        }
    }
}