import axios from 'axios';

const config = {
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded'
	}
};
const url = import.meta.env.VITE_API_BASE_URL;

export class Remote {
	static async getInfo() {
		const response = await axios.post(`${url}getreginfo.php`, '', config);
		return response.data;
	}
	
	static async getUserInfo(email) {
		const response = await axios.post(`${url}getinfo.php`, `email=${email}`, config);
		return response.data;
	}
	
	static async registerUser(data) {
		const payload = new URLSearchParams(data).toString();
		const response = await axios.post(`${url}register.php`, payload, config);
		return response.data;
	}

	static async updateUser(data) {
		const payload = new URLSearchParams(data).toString();
		const response = await axios.post(`${url}updatereg.php`, payload, config);
		return response.data;
	}

}
