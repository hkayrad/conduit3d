import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: Record<string, string> = {};

export const configSlice = createSlice({
	name: "config",
	initialState,
	reducers: {
		setConfig(_, action: PayloadAction<Record<string, string>>) {
			return action.payload;
		},
		updateConfig(state, action: PayloadAction<Record<string, string>>) {
			return { ...state, ...action.payload };
		},
	},
});

export const { setConfig, updateConfig } = configSlice.actions;

export const selectConfig = (state: { config: Record<string, string> }) => state.config;

export default configSlice.reducer;
