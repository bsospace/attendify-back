import { locations, sub_locations } from '@prisma/client'
import { prisma } from 'src/prisma/client';


export class LocationService {

    public async getAllLocations(): Promise<locations[]> {
        try {
            const locations = await prisma.locations.findMany({
                where: {
                    deleted_at: null
                },
                orderBy: { created_at: 'desc' },
            });
            return locations;
        } catch (error) {
            console.error("Error creating location:", error);
            throw new Error("Failed to create location.");
        }
    }

    public async createLocation(locations: Partial<locations>, data_logs: any): Promise<locations> {
        try {
            const location = await prisma.locations.create({
                data: {
                    ...locations,
                    name: locations.name ?? '',
                    latitude: locations.latitude ?? 0,
                    longitude: locations.longitude ?? 0,
                    created_at: new Date(),
                    updated_at: new Date(),
                    data_logs: data_logs,
                },
            });

            return location;
        }
        catch (error) {
            console.error("Error creating location:", error);
            throw new Error("Failed to create location.");
        }
    }


    public async editLocation(id: string, locations: Partial<locations>, data_logs: any): Promise<locations> {
        try {
            const location = await prisma.locations.update({
                where: {
                    id: id,
                },
                data: {
                    ...locations,
                    name: locations.name ?? '',
                    latitude: locations.latitude ?? 0,
                    longitude: locations.longitude ?? 0,
                    updated_at: new Date(),
                    data_logs: data_logs,
                },
            });


            return location;
        }
        catch (error) {
            console.error("Error creating location:", error);
            throw new Error("Failed to create location.");

        }
    }

    public async deleteLocation(id: string, data_logs: any) {
        try {
            const locations = await prisma.locations.update({
                where: {
                    id: id,
                },
                data: {
                    deleted_at: new Date(),
                    updated_at: new Date(),
                    data_logs: data_logs
                },
            })

            return locations;
        } catch (error) {
            console.error("Error creating location:", error);
            throw new Error("Failed to create location.");
        }
    }

    public async getLocation(locations: Partial<locations>): Promise<locations | null> {
        try {
            const location = await prisma.locations.findFirst({
                where: {
                    AND: [
                        {
                            OR: [
                                { id: locations.id },
                                { name: locations.name },
                            ]
                        },
                        {
                            deleted_at: null
                        }
                    ]
                },
            });
            return location;
        } catch (error) {
            console.error("Error creating location:", error);
            throw new Error("Failed to create location.");
        }
    }

    public async getLocations(id: string): Promise<locations[]> {
        try {
            const locations = await prisma.locations.findMany({
                where: {
                    id: id,
                },
                include: {
                    sub_locations: true,
                },
            });

            return locations;
        } catch (error) {
            console.error("Error creating location:", error);
            throw new Error("Failed to create location.");
        }
    }
}