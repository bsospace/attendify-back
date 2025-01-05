import { groups } from '@prisma/client';
import { prisma } from '../../prisma/client';

export class GroupService {

    constructor() { }
    // Pagination and search added to getAllGroups method, now returning count as well
    public async getAllGroups(page: number = 1, pageSize: number = 10, search: string = ''): Promise<{ groups: groups[], totalCount: number }> {
        try {
            // Calculate pagination offset
            const skip = (page - 1) * pageSize;

            // Get groups with pagination and search
            const groups = await prisma.groups.findMany({
                where: {
                    deleted_at: null,
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    }
                },
                orderBy: { created_at: 'desc' },
                skip: skip,
                take: pageSize,
            });

            // Get total count of groups (for pagination)
            const totalCount = await prisma.groups.count({
                where: {
                    deleted_at: null,
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    }
                }
            });

            return { groups, totalCount };
        } catch (error) {
            console.error("Error fetching groups:", error);
            throw new Error("Failed to fetch groups.");
        }
    }


    public async getByName(name: string): Promise<groups | null> {
        try {
            const group = await prisma.groups.findFirst({
                where: {
                    name: name,
                    deleted_at: null,
                },
            });

            return group;
        } catch (error) {
            console.error("Error fetching group:", error);
            throw new Error("Failed to fetch group.");
        }
    }

    public async createGroup(groups: Partial<groups>, data_logs: any): Promise<groups> {
        try {
            const group = await prisma.groups.create({
                data: {
                    ...groups,
                    name: groups.name ?? '',
                    created_at: new Date(),
                    updated_at: new Date(),
                    data_logs: data_logs,
                },
            });

            return group;
        } catch (error) {
            console.error("Error creating group:", error);
            throw new Error("Failed to create group.");
        }
    }
}
