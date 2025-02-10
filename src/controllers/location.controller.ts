import { Request, Response } from "express";
import { LocationService } from "../services/location.service";
import { sub_locations } from "@prisma/client";

export class LocationController {
    private locationService: LocationService;


    /**
     * @param locationService - LocationService instance
     * @returns - LocationController instance
     */

    constructor(locationService: LocationService) {
        this.locationService = locationService;

        this.getAllLocations = this.getAllLocations.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.createLocation = this.createLocation.bind(this);
        this.editLocation = this.editLocation.bind(this);
        this.deleteLocation = this.deleteLocation.bind(this);
    }

    /**
     * Get all locations with pagination and search
     * @param req - Express Request object
     * @param res - Express Response object
     * @returns - JSON response with locations data
     */

    public async getAllLocations(req: Request, res: Response): Promise<any> {
        try {

            const page: number = parseInt(req.query.page as string) || 1;
            const pageSize: number = parseInt(req.query.pageSize as string);
            const search: string = req.query.search as string || '';
            const logs: boolean = req.query.logs === 'true';

            const { locations, totalCount } = await this.locationService.getAllLocations(
                page,
                pageSize,
                search,
                logs
            );

            return res.status(200).json({
                success: true,
                message: "Locations retrieved successfully",
                data: locations,
                meta: {
                    page: page || 1,
                    pageSize: pageSize || locations.length,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / (pageSize || locations.length)),
                }
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
     * Create a new location 
     * @param req - Express Request object
     * @param res - Express Response object
     * @returns - JSON response with new location data
     */

    public async createLocation(req: Request, res: Response): Promise<any> {
        try {
            const { name, latitude, longitude } = req.body;

            const location = await this.locationService.getLocation({ name });

            if (location !== null) {
                return res.status(400).json({
                    success: false,
                    message: "Create location failed",
                    error: "Location name already exists",
                });
            }

            const createLocation = await this.locationService.createLocation(
                {
                    name,
                    latitude,
                    longitude,
                },
                // subLocation,
                [
                    {
                        action: "created",
                        created_at: new Date(),
                        updated_at: new Date(),
                    }
                ]
            );

            return res.status(201).json({
                success: true,
                message: "Location created successfully",
                data: createLocation,
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
     * Edit a location 
     * @param req - Express Request object
     * @param res - Express Response object
     * @returns - JSON response with updated location data
     */

    public async editLocation(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;

            const { name, latitude, longitude } = req.body;

            const location = await this.locationService.getLocation({ id });

            if (location === null) {
                return res.status(404).json({
                    success: false,
                    message: "Edit location failed",
                    error: "Location not found",
                });
            }

            let newDataLogs;

            if (location && Array.isArray(location.data_logs)) {
                location.data_logs.push({
                    action: "edited",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
                newDataLogs = location.data_logs;
            }

            const editedLocation = await this.locationService.editLocation(id, { name, latitude, longitude }, newDataLogs);

            return res.status(200).json({
                success: true,
                message: "Location edited successfully",
                data: editedLocation
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
     * Delete a location by id
     * @param req  - Express Request object
     * @param res - Express Response object
     * @returns - JSON response with success message
     */

    public async deleteLocation(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;

            const location = await this.locationService.getLocation({ id });

            if (location === null) {
                return res.status(404).json({
                    success: false,
                    message: "Delete location failed",
                    error: "Location not found",
                });
            }

            let newDataLogs;

            if (location && Array.isArray(location.data_logs)) {
                location.data_logs.push({
                    action: "deleted",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
                newDataLogs = location.data_logs;
            }

            const deletedLocation = await this.locationService.deleteLocation(id, newDataLogs);

            return res.status(200).json({
                success: true,
                message: "Location deleted successfully",
                data: deletedLocation,
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
     * Get a location by id
     * @param req - Express Request object
     * @param res - Express Response object
     * @returns - JSON response with location data
     */

    public async getLocation(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const logs: boolean = req.query.logs === 'true';

            const locations = await this.locationService.getLocationById(id, logs);

            return res.status(200).json({
                success: true,
                message: "Locations retrieved successfully",
                data: locations,
            });
        } catch (error) {
            console.error("Error creating location:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to create location",
            });
        }
    }
}