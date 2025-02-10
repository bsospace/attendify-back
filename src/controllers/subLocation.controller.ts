import { Request, Response } from "express";
import { SubLocationService } from "../services/subLocation.service";
import { DataLog } from "../interfaces";

export class SubLocationController {
    private subLocationService: SubLocationService;

    constructor(subLocationService: SubLocationService) {
        this.subLocationService = subLocationService;

        this.createSubLocation = this.createSubLocation.bind(this);
        this.editSubLocation = this.editSubLocation.bind(this);
    }

    /**
     * Create a new sub location under a location
     * @param req - Express Request object
     * @param res - Express Response object
     * @returns - JSON response with new sub location data
     */

    public async createSubLocation(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { name } = req.body;

            // Create data logs for the sub location
            const dataLogs: DataLog[] = [
                {
                    action: "created",
                    created_at: new Date(),
                    updated_at: new Date(),
                    created_by: req.user?.email || 'unknown',
                    meta: [
                        `name: ${name}`
                    ]
                }
            ]

            // Create the sub location with the data logs
            const createSubLocation = await this.subLocationService.createSubLocation(
                id,
                name,
                dataLogs
            );

            // Return the response with the new sub location data
            return res.status(201).json({
                success: true,
                message: "Sub location created successfully",
                data: createSubLocation,
            });

        } catch (error) {
            console.error("Error creating location:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to create location",
                error: error,
            });
        }
    }

    /**
     * Edit a sub location under a location
     * @param req - Express Request object
     * @param res - Express Response object
     * @returns - JSON response with updated sub location data
     */

    public async editSubLocation(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const { name } = req.body;

            const subLocation = await this.subLocationService.getSubLocation({ id });

            let newDataLogs;
            if (subLocation && Array.isArray(subLocation.data_logs)) {
                subLocation.data_logs.push({
                    action: "edited",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                newDataLogs = subLocation.data_logs;
            }

            const editSubLocation = await this.subLocationService.editSubLocation({ id, name }, newDataLogs,);

            return res.status(200).json({
                success: true,
                message: "Edit sub location successfully",
                data: editSubLocation
            });
        } catch (error) {
            console.error("Error creating location:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to create location",
            });
        }
    }

    /**
     * Delete a sub location under a location by id
     * @param req - Express Request object
     * @param res - Express Response object
     * @returns - JSON response with success message
     */

    public async deleteSubLocation(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;

        } catch (error) {
            console.error("Error creating location:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to create location",
            });
        }
    }

}