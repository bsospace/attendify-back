import { events } from "@prisma/client";
import { prisma } from "../../prisma/client";
import { HttpError } from "../utils/handler.util";

export class ProjectService {
    constructor() { }

    public async getAnnouncement(
        page?: number,
        pageSize?: number,
        search?: string,
        logs: boolean = false
    ): Promise<{ events: (Partial<events>)[], totalCount: number }> {
        // Get announcement
        try {

            // Check if pagination should be applied
            const isPaginated = typeof page === 'number' && typeof pageSize === 'number' && page > 0 && pageSize > 0;

            // Default values if pagination is used
            const currentPage = isPaginated ? page : 1;
            const currentPageSize = isPaginated ? pageSize : 10;
            const searchQuery = search?.trim() ?? '';

            // Calculate pagination offset
            const skip = isPaginated ? (currentPage - 1) * currentPageSize : undefined;


            // Get all announcement events
            const eventsData = await prisma.events.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                { name: { contains: searchQuery } },
                                { description: { contains: searchQuery } },
                                { banner: { contains: searchQuery } },
                                { year: { equals: parseInt(searchQuery) || undefined } },
                                { file: { contains: searchQuery } }
                            ]
                        }, {
                            announce: true,
                            published_at: { not: null }
                        },
                    ]
                }, include: {
                    event_type: {
                        select: {
                            name: true,
                            announce: true
                        }
                    }
                },
                skip: skip,
                take: currentPageSize,
                orderBy: {
                    start_date: 'desc'
                }
            });

            // Get the total count of announcement events
            const totalCount = await prisma.events.count({
                where: {
                    AND: [
                        {
                            OR: [
                                { name: { contains: searchQuery } },
                                { description: { contains: searchQuery } },
                                { banner: { contains: searchQuery } },
                                { year: { equals: parseInt(searchQuery) || undefined } },
                                { file: { contains: searchQuery } }
                            ]
                        }, {
                            announce: true
                        }
                    ]
                }
            });

            // Return the events and total count
            return {
                events: eventsData,
                totalCount: totalCount
            };


        } catch (error) {
            console.error("Error fetching annance :", error);
            throw new HttpError(500, "Failed to fetch announcement events.");
        }
    }


    public async getUpcomingEvents(
        page?: number,
        pageSize?: number,
        search?: string,
        start?: string,  // Start date in ISO format (YYYY-MM-DD)
        end?: string,    // End date in ISO format (YYYY-MM-DD)
        logs: boolean = false
    ): Promise<{ events: (Partial<events>)[], totalCount: number }> {
        try {
            const isPaginated = typeof page === 'number' && typeof pageSize === 'number' && page > 0 && pageSize > 0;
            const currentPage = isPaginated ? page : 1;
            const currentPageSize = isPaginated ? pageSize : 10;
            const searchQuery = search?.trim() ?? '';
            const skip = isPaginated ? (currentPage - 1) * currentPageSize : undefined;

            // Convert start and end to Date objects if provided
            const startDateFilter = start ? new Date(start) : undefined;
            const endDateFilter = end ? new Date(end) : undefined;

            if (logs) console.log(`Filtering events from ${startDateFilter} to ${endDateFilter}`);

            // Define filters
            const filters: any = {
                AND: [
                    {
                        OR: [
                            { name: { contains: searchQuery, mode: "insensitive" } },
                            { description: { contains: searchQuery, mode: "insensitive" } },
                            { banner: { contains: searchQuery, mode: "insensitive" } },
                            { file: { contains: searchQuery, mode: "insensitive" } },
                            { year: isNaN(parseInt(searchQuery)) ? undefined : parseInt(searchQuery) }
                        ]
                    },
                    { published_at: { not: null } }
                ]
            };

            // Add date range filter
            if (startDateFilter || endDateFilter) {
                filters.AND.push({
                    start_date: {
                        gte: startDateFilter,  // Greater than or equal to start date
                        lte: endDateFilter     // Less than or equal to end date
                    }
                });
            }

            // Fetch paginated events
            const eventsData = await prisma.events.findMany({
                where: filters,
                include: {
                    event_type: { select: { name: true, announce: true } }
                },
                skip: skip,
                take: currentPageSize,
                orderBy: { start_date: 'desc' }
            });

            // Fetch total count
            const totalCount = await prisma.events.count({ where: filters });

            return { events: eventsData, totalCount };
        } catch (error) {
            console.error("Error fetching upcoming events:", error);
            throw new HttpError(500, "Failed to fetch upcoming events.");
        }
    }
}