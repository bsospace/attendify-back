import { prisma } from "../prisma/client";
import { users } from "@prisma/client";

export class UserService {
    /**
     * Fetches a user by email from the database.
     * @param email - The email of the user to fetch.
     * @returns The user object if found, otherwise null.
     * @throws Error if the database query fails.
     */
    public async getUserByEmail(email: string): Promise<users | null> {
        try {
            const user = await prisma.users.findUnique({
                where: {
                    email,
                },
            });

            return user;
        } catch (error) {
            console.error("Error fetching user by email:", error);
            throw new Error("Failed to fetch user by email.");
        }
    }

    public async createUser(User: Omit<users, 'id'>): Promise<users> {
        try {
            const user = await prisma.users.create({
                data: {
                    ...User,
                    username: User.username || '',
                    email: User.email || '',
                    first_name: User.first_name || '',
                    last_name: User.last_name || '',
                    created_at: new Date(),
                    updated_at: new Date(),
                    data_logs: User.data_logs || undefined,
                },
            });
            return user;
        } catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Failed to create user.");
        }
    }
}
