import { describe, it, expect } from "vitest";
import authReducer, {
    setUser,
    clearUser,
    selectUserState,
    type UserState,
} from "../../../src/app/layout/auth/authSlice";
import type { RootState } from "../../../src/lib/store";
import type { User } from "../../../src/lib/types";

describe("authSlice", () => {
    const initialState: UserState = {
        user: null,
    };

    const mockUser: User = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: null,
        userRole: "user",
        name: "Test User",
        createdAt: new Date("2024-01-01"),
        isActive: true,
    };

    describe("Reducers", () => {
        it("should return initial state", () => {
            const result = authReducer(undefined, { type: "unknown" });
            expect(result).toEqual(initialState);
        });

        it("should set user", () => {
            const result = authReducer(initialState, setUser(mockUser));
            expect(result.user).toEqual(mockUser);
        });

        it("should update user", () => {
            const stateWithUser = { user: mockUser };
            const updatedUser: User = { ...mockUser, username: "updateduser" };
            const result = authReducer(stateWithUser, setUser(updatedUser));
            expect(result.user).toEqual(updatedUser);
        });

        it("should clear user", () => {
            const stateWithUser = { user: mockUser };
            const result = authReducer(stateWithUser, clearUser());
            expect(result.user).toBeNull();
        });

        it("should handle clearUser when already null", () => {
            const result = authReducer(initialState, clearUser());
            expect(result.user).toBeNull();
        });
    });

    describe("Selectors", () => {
        it("should select user state when user exists", () => {
            const mockRootState: RootState = {
                auth: { user: mockUser },
                admin: {} as any,
                map: {} as any,
                list: {} as any,
                config: { currentPage: "/" },
            };
            expect(selectUserState(mockRootState)).toEqual(mockUser);
        });

        it("should select user state when user is null", () => {
            const mockRootState: RootState = {
                auth: { user: null },
                admin: {} as any,
                map: {} as any,
                list: {} as any,
                config: { currentPage: "/" },
            };
            expect(selectUserState(mockRootState)).toBeNull();
        });
    });
});
