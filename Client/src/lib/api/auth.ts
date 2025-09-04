import type { ApiResponse, LoginUserDto, User, UserCountsDto } from "../types";
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
     * @returns The logged-in user data.
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
     * @returns An array of users.
     */
    static async fetchAll(
        pageSize: number = 10,
        pageNumber: number = 1,
        sortBy: string = 'id',
        ascending: boolean = true) {
        const response = await instance.get<ApiResponse<User[]>>("/auth", {
            params: {
                pageSize: pageSize,
                pageNumber: pageNumber,
                sortBy: capitalizeFirstLetter(sortBy),
                ascending: ascending
            }
        });
        return response.data;
    }

    /**
     * Get the count of users.
     * @returns The count of users.
     */
    static async fetchCount() {
        const response = await instance.get<ApiResponse<UserCountsDto>>("/auth/count");
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

    static async updateUser(userId: number, user: User) {
        const response = await instance.put<ApiResponse<User>>(`/auth/${userId}`, user);
        return response.data;
    }

    static async createUser(user: User) {
        const response = await instance.post<ApiResponse<User>>(`/auth`, user);
        return response.data;
    }
}