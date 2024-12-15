import { sub_locations } from "@prisma/client";
import { prisma } from "../prisma/client";

export class SubLocationService {

    public async getSubLocation(subLocation: Partial<sub_locations>): Promise<sub_locations | null> {
        try {
            const subLocationData = await prisma.sub_locations.findFirst({
                where: {
                    AND: [
                        {
                            OR: [
                                { id: subLocation.id },
                                { name: subLocation.name },
                            ]
                        },
                        {
                            deleted_at: null
                        }
                    ],
                },
            });
            return subLocationData;
        } catch (error) {
            console.error("Error fetching sub location by id:", error);
            throw new Error("Failed to fetch sub location by id.");
        }
    }

    public async createSubLocation(locationId: string, name: string, data_logs: any): Promise<sub_locations> {
        try {
            const newSubLocation = await prisma.sub_locations.create({
                data: {
                    location_id: locationId,
                    name: name,
                    data_logs: data_logs,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
            return newSubLocation;
        } catch (error) {
            console.error("Error creating sub location:", error);
            throw new Error("Failed to create sub location.");
        }
    }

    public async editSubLocation(subLocation: Partial<sub_locations>, data_logs: any): Promise<any> {
        try {
            const editSubLocation = await prisma.sub_locations.update({
                where: {
                    id: subLocation.id,
                },
                data: {
                    ...subLocation,
                    name: subLocation.name ?? '',
                    updated_at: new Date(),
                    data_logs: data_logs,
                },
            })
            return editSubLocation;
        } catch (error) {
            console.error("Error creating sub location:", error);
            throw new Error("Failed to create sub location.");
        }
    }

    public async deleteSubLocation(id: string, data_logs: any): Promise<any> {
        try {
            const deleteSubLocation = await prisma.sub_locations.update({
                where: {
                    id: id,
                },
                data: {
                    deleted_at: new Date(),
                    updated_at: new Date(),
                    data_logs: data_logs,
                },
            });
            return deleteSubLocation;
        } catch (error) {
            console.error("Error creating sub location:", error);
            throw new Error("Failed to create sub location.");
        }
    }
}