import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	token: localStorage.getItem('usertoken'),
	user: null,
	isLoading: false,
	isLogging: false,
	password: null,
	error: null
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		saveUser: (state, action) => {
			//const [user, token] = action.payload;
			localStorage.setItem('usertoken', action.payload.token)
			return {
				...state,
				user: action.payload.name,
				token: action.payload.token,
			}
		},
		loginRequest: (state) => {
			return {
				isLoading: true
			}

		},
		loginSuccess: (state) => {
			return {
				isLoading: false,
				isLoggedIn: true,
				error: null,
			}
		},
		loginFailure: (state, action) => {
			return {
				isLoading: false,
				isLoggedIn: false,
				error: action.payload,
			}
		},
		checkToken: (state, action) => {
			return {
				isLoading: false,
				isLoggedIn: false,
				error: action.payload,
			}
		},
	},
	extraReducers: (builder) => { }
});

export const { saveUser, loginRequest, loginSuccess, loginFailure } = userSlice.actions;
export default userSlice.reducer;
