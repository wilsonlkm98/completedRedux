import axios from "axios";

const authApi = {
	login: async data => await axios.post("/api/user/auth/login", data),
	register: async data => await axios.post("/api/user/auth/register", data),
	verify: async data => await axios.post("/api/user/auth/verify", data)
};

export default authApi;
