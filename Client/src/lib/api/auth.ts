import type { LoginUserDto } from "../types";
import instance from "../instance";
import Cookies from "js-cookie";

export default class AuthApi {
    static async login(user: LoginUserDto) {
        const { username, password } = user;
        // Make API call to login
        return await instance.post("/auth/login", { username, password });
    }

    static async logout() {
        return Cookies.remove("user_session");
    }
}