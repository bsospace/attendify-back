import { Request, Response } from "express";
import { LocationService } from "src/services/location.service";
import { sub_locations } from "@prisma/client";

export class LocationController {
    private locationService: LocationService;


    constructor(locationService: LocationService) {
        this.locationService = locationService;

        this.getAllLocations = this.getAllLocations.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.createLocation = this.createLocation.bind(this);
        this.editLocation = this.editLocation.bind(this);
        this.deleteLocation = this.deleteLocation.bind(this);
    }

    public async getAllLocations(req: Request, res: Response): Promise<any> {
        try {
            const locations = await this.locationService.getAllLocations();

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

    public async createLocation(req: Request, res: Response): Promise<any> {
        try {
            const { name, latitude, longitude } = req.body;

            const location = await this.locationService.getLocation({ name });

            if (location !== null) {
                return res.status(400).json({
                    success: false,
                    message: "Create location failed",
                    errors: "Location name already exists",
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

    public async editLocation(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;

            const { name, latitude, longitude} = req.body;

            const location = await this.locationService.getLocation({ id });
            
            if (location === null) {
                return res.status(404).json({
                    success: false,
                    message: "Edit location failed",
                    errors: "Location not found",
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

            const editedLocation = await this.locationService.editLocation(id, { name, latitude, longitude}, newDataLogs);

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

    public async deleteLocation(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;

            const location = await this.locationService.getLocation({ id });

            if (location === null) {
                return res.status(404).json({
                    success: false,
                    message: "Delete location failed",
                    errors: "Location not found",
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


    public async getLocation(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const locations = await this.locationService.getLocations(id);
            
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