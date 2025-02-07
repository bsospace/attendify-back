import { locations, sub_locations } from '@prisma/client'
import { prisma } from '../../prisma/client';


export class LocationService {

    constructor() { }

    /**
     * Get all locations with pagination and search
     * @param page - Page number 
     * @param pageSize - Number of items per page
     * @param search - Search query 
     * @param logs - Include data logs
     * @returns - Array of locations and total count
     */

    public async getAllLocations(
        page?: number,
        pageSize?: number,
        search?: string,
        logs: boolean = false
    ): Promise<{ locations: locations[], totalCount: number }> {
        try {
            // Ensure valid pagination values
            const isPaginated = typeof page === 'number' && typeof pageSize === 'number' && page > 0 && pageSize > 0;

            // Default values if pagination is used
            const currentPage = isPaginated ? page : 1;
            const currentPageSize = isPaginated ? pageSize : 10;
            const searchQuery = search?.trim() ?? '';

            // Calculate pagination offset
            const skip = isPaginated ? (currentPage - 1) * currentPageSize : undefined;

            // Get locations with optional pagination and search
            const locations = await prisma.locations.findMany({
                where: {
                    deleted_at: null,
                    ...(searchQuery && {
                        OR: [
                            { name: { contains: searchQuery, mode: 'insensitive' } },
                            { latitude: { equals: parseFloat(searchQuery) } },
                            { longitude: { equals: parseFloat(searchQuery) } },
                        ],
                        
                    }),
                },
                select: {
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                    created_at: true,
                    updated_at: true,
                    deleted_at: true,
                    data_logs: logs,
                },
                orderBy: { created_at: 'desc' },
                ...(isPaginated && { skip, take: currentPageSize }), // Apply pagination only if valid
            });

            // Get total count of locations (for pagination)
            const totalCount = await prisma.locations.count({
                where: {
                    deleted_at: null,
                    ...(searchQuery && {
                        name: {
                            contains: searchQuery,
                            mode: 'insensitive',
                        }
                    })
                }
            });

            return { locations, totalCount };
        } catch (error) {
            console.error("Error fetching locations:", error);
            throw new Error("Failed to fetch locations.");
        }
    }

    public async createLocation(locations: Partial<locations>, data_logs: any): Promise<locations> {
        try {
            const location = await prisma.locations.create({
                data: {
                    ...locations,
                    name: locations.name ?? '',
                    latitude: parseFloat(locations.latitude?.toString() ?? '0'),
                    longitude: parseFloat(locations.longitude?.toString() ?? '0'),
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

    public async getLocationById(id: string, logs?: boolean): Promise<locations | null> {
        try {
            console.log("Fetching location with id:", id);
            console.log("Logs enabled:", logs);
    
            const location = await prisma.locations.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                    created_at: true,
                    updated_at: true,
                    deleted_at: true,
                    data_logs: logs ?? false,
                    sub_locations: {
                        select: {
                            id: true,
                            name: true,
                            created_at: true,
                            updated_at: true,
                            deleted_at: true,
                            data_logs: logs ?? false,
                        }
                    }
                }
            });
    
            if (!location) {
                console.warn(`Location with id ${id} not found.`);
                return null; // Return null if no location is found
            }
    
            return location;
        } catch (error) {
            console.error("Error fetching location:", error);
            throw new Error("Failed to fetch location.");
        }
    }    
}