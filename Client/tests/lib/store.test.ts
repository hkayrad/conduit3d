import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { Logger as LoggerMock } from "../../src/lib/utils/logger";
import { cleanup } from "@testing-library/react";

// Mock external dependencies
vi.mock("../../src/lib/utils/logger", () => ({
	Logger: {
		error: vi.fn(),
	},
}));

// Mock slice reducers to isolate store logic
const defaultAuthState = { user: null };
const mockAuthReducer = vi.fn((state = defaultAuthState, action) => {
	if (action.type === "auth/setUser") {
		return { ...state, user: action.payload };
	}
	return state;
});

vi.mock("../../src/app/layout/auth/authSlice", () => ({ authSlice: { reducer: mockAuthReducer } }));
vi.mock("../../src/app/layout/map/mapSlice", () => ({ mapSlice: { reducer: (s = {}) => s } }));
vi.mock("../../src/app/layout/admin/adminSlice", () => ({ adminSlice: { reducer: (s = {}) => s } }));
vi.mock("../../src/app/layout/list/listSlice", () => ({ listSlice: { reducer: (s = {}) => s } }));
vi.mock("../../src/app/configSlice", () => ({ configSlice: { reducer: (s = {}) => s } }));

describe("Redux Store", () => {
	const userState = { id: "test-user", name: "Test User" };
	const serializedUserState = JSON.stringify(userState);

	// Mock localStorage
	const localStorageMock = (() => {
		let store: Record<string, string> = {};
		return {
			getItem: vi.fn((key: string) => store[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				store[key] = value;
			}),
			clear: () => {
				store = {};
			},
		};
	})();

	beforeEach(() => {
		vi.clearAllMocks();
		localStorageMock.clear();
		Object.defineProperty(globalThis, "localStorage", {
			value: localStorageMock,
			writable: true,
		});
	});

	afterEach(() => {
		cleanup();
		vi.resetModules(); // Reset modules to re-evaluate store.ts for each test
	});

	describe("loadUserFromLocalStorage", () => {
		it("should return undefined if no user state in localStorage", async () => {
			localStorageMock.getItem.mockReturnValue(null);
			const { store } = await import("../../src/lib/store");
			const state = store.getState();
			expect(state.auth.user).toBeNull();
			expect(localStorageMock.getItem).toHaveBeenCalledWith("userState");
		}, 10000);

		it("should return the preloaded state if user state exists in localStorage", async () => {
			localStorageMock.getItem.mockReturnValue(serializedUserState);
			const { store } = await import("../../src/lib/store");
			const state = store.getState();
			expect(state.auth.user).toEqual(userState);
			expect(localStorageMock.getItem).toHaveBeenCalledWith("userState");
		});

		it("should return undefined and log error on JSON parse error", async () => {
			localStorageMock.getItem.mockReturnValue("invalid-json");
			const { store } = await import("../../src/lib/store");
			const state = store.getState();
			expect(state.auth.user).toBeNull();
			expect(LoggerMock.error).toHaveBeenCalledWith("Error loading state from localStorage:", expect.any(SyntaxError));
		});

		it("should return undefined and log error on localStorage.getItem error", async () => {
			const error = new Error("localStorage is disabled");
			localStorageMock.getItem.mockImplementation(() => {
				throw error;
			});
			const { store } = await import("../../src/lib/store");
			const state = store.getState();
			expect(state.auth.user).toBeNull();
			expect(LoggerMock.error).toHaveBeenCalledWith("Error loading state from localStorage:", error);
		});
	});

	describe("saveUserToLocalStorage", () => {
		it("should save user state to localStorage on state change", async () => {
			const { store } = await import("../../src/lib/store");

			store.dispatch({ type: "auth/setUser", payload: userState });

			expect(localStorageMock.setItem).toHaveBeenCalledWith("userState", serializedUserState);
		});

		it("should not throw and log error on localStorage.setItem error", async () => {
			const error = new Error("Quota exceeded");
			localStorageMock.setItem.mockImplementation(() => {
				throw error;
			});

			const { store } = await import("../../src/lib/store");

			// This should not throw an error in the test
			store.dispatch({ type: "auth/setUser", payload: userState });

			expect(LoggerMock.error).toHaveBeenCalledWith("Error saving state to localStorage:", error);
		});
	});

	describe("Store Configuration", () => {
		it("should be configured with all the reducers", async () => {
			// Reset modules to ensure fresh import
			vi.resetModules();

			// Create a mock configureStore that captures its config
			let capturedConfig: any;
			const mockConfigureStore = vi.fn((config) => {
				capturedConfig = config;
				// Return a minimal store mock
				return {
					dispatch: vi.fn(),
					getState: vi.fn(() => ({ auth: { user: null } })),
					subscribe: vi.fn(),
					replaceReducer: vi.fn(),
					[Symbol.observable]: vi.fn(),
				};
			});

			// Mock @reduxjs/toolkit before importing store
			vi.doMock("@reduxjs/toolkit", async () => {
				const actual = await vi.importActual<typeof import("@reduxjs/toolkit")>("@reduxjs/toolkit");
				return {
					...actual,
					configureStore: mockConfigureStore,
				};
			});

			await import("../../src/lib/store");

			expect(mockConfigureStore).toHaveBeenCalled();
			expect(capturedConfig.reducer).toHaveProperty("config");
			expect(capturedConfig.reducer).toHaveProperty("admin");
			expect(capturedConfig.reducer).toHaveProperty("auth");
			expect(capturedConfig.reducer).toHaveProperty("map");
			expect(capturedConfig.reducer).toHaveProperty("list");

			// Clean up the mock
			vi.doUnmock("@reduxjs/toolkit");
		});

		it("should subscribe saveUserToLocalStorage to store updates", async () => {
			localStorageMock.getItem.mockReturnValue(null);
			const { store } = await import("../../src/lib/store");

			// The subscription is set up on module load.
			// The first call to setItem is from the initial state, which might be undefined/null.
			// We dispatch an action to trigger the subscription again.
			localStorageMock.setItem.mockClear();

			store.dispatch({ type: "auth/setUser", payload: userState });

			expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
			expect(localStorageMock.setItem).toHaveBeenCalledWith("userState", serializedUserState);
		});
	});
});
