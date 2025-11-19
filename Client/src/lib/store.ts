import { configureStore } from "@reduxjs/toolkit";
import { mapSlice } from "../app/layout/map/mapSlice";
import { authSlice } from "../app/layout/auth/authSlice";
import { adminSlice } from "../app/layout/admin/adminSlice";
import { listSlice } from "../app/layout/list/listSlice";
import { configSlice } from "../app/configSlice";
import { Logger } from "./utils";

/**
 * Load the user state from localStorage.
 * @returns The user state loaded from localStorage, or undefined if not found.
 */
const loadUserFromLocalStorage = () => {
	try {
		const serializedState = localStorage.getItem("userState");
		if (serializedState === null) return undefined;
		return {
			auth: {
				user: JSON.parse(serializedState),
			},
		};
	} catch (e) {
		Logger.error("Error loading state from localStorage:", e);
		return undefined;
	}
};

/**
 * Save the user state to localStorage.
 * @param state The current Redux state.
 */
const saveUserToLocalStorage = (state: any) => {
	try {
		const serializedState = JSON.stringify(state.auth.user);
		localStorage.setItem("userState", serializedState);
	} catch (e) {
		Logger.error("Error saving state to localStorage:", e);
	}
};

const preloadedUserState = loadUserFromLocalStorage();

export const store = configureStore({
	reducer: {
		config: configSlice.reducer,
		admin: adminSlice.reducer,
		auth: authSlice.reducer,
		map: mapSlice.reducer,
		list: listSlice.reducer,
	},
	preloadedState: preloadedUserState,
});

store.subscribe(() => {
	saveUserToLocalStorage(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
