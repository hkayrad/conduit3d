import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../lib/store";
import type { User } from "../../../lib/types";

export interface UserState {
	user: User | null;
}

const initialState: UserState = {
	user: null,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
		},
		clearUser: (state) => {
			state.user = null;
		},
	},
});

export const { setUser, clearUser } = authSlice.actions;

export const selectUserState = (state: RootState) => state.auth.user;

export default authSlice.reducer;
