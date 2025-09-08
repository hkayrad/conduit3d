import type { ApiResponse, LoginUserDto, User, UserCounts } from "../types";
import instance from "../instance";
import Cookies from "js-cookie";
import { capitalizeFirstLetter } from "../utils";

/**
 * Class representing the authentication API.
 */
export class AuthApi {

    /**
     * Login a user.
     * @param {LoginUserDto} user The user credentials.
     * @returns A promise that resolves to the user data.
     */
    static async login(user: LoginUserDto) {
        const { username, password } = user;
        // Make API call to login
        const response = await instance.post<ApiResponse<User>>("/auth/login", { username, password });

        return response.data;
    }

    /**
     * Logout the current user.
     */
    static logout() {
        Cookies.remove("user_session");
    }

    /**
     * Get all users.
     * @param pageSize Number of users per page.
     * @param pageNumber The page number to fetch.
     * @param sortBy The field to sort by.
     * @param ascending Whether to sort in ascending order.
     * @param query Optional search query to filter users.
     * @returns A promise that resolves to the list of users.
     */
    static async fetchAll(
        pageSize: number = 10,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true,
        query: string = null!) {
        const response = await instance.get<ApiResponse<User[]>>("/auth", {
            params: {
                pageSize: pageSize,
                pageNumber: pageNumber,
                sortBy: capitalizeFirstLetter(sortBy),
                ascending: ascending,
                query: query
            }
        });
        return response.data;
    }

    /**
     * Get the count of users.
     * @param query Optional search query to filter users.
     * @returns A promise that resolves to the user counts.
     */
    static async fetchCount(query: string = null!) {
        const response = await instance.get<ApiResponse<UserCounts>>("/auth/count", {
            params: {
                query: query
            }
        });
        return response.data;
    }

    /**
     * Delete a user.
     * @param userId The ID of the user to delete.
     * @returns A promise that resolves when the user is deleted.
     */
    static async deleteUser(userId: number) {
        const response = await instance.delete<ApiResponse<void>>(`/auth/${userId}`);
        return response.data;
    }

    /**
     * Update a user.
     * @param userId ID of the user to update
     * @param user The user object with updated information.
     * @returns A promise that resolves to the updated user data.
     */
    static async updateUser(userId: number, user: User) {
        const response = await instance.put<ApiResponse<User>>(`/auth/${userId}`, user);
        return response.data;
    }

    /**
     * Create a new user.   
     * @param user The user object to create.
     * @returns A promise that resolves to the created user data.
     */
    static async createUser(user: User) {
        const response = await instance.post<ApiResponse<User>>(`/auth`, user);
        return response.data;
    }
}