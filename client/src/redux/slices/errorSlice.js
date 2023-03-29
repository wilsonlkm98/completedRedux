import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

const errorSlice = createSlice({
	name: "error",
	initialState,
	reducers: {
		showError: (state, action) => (state = action.payload),
		clearError: state => (state = null)
	}
});

export const { showError, clearError } = errorSlice.actions;
export default errorSlice.reducer;
