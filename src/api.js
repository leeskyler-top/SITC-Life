import axios from 'axios';
import my_config from "@/my_config.js";

const api = axios.create({
    baseURL: my_config.api_url, // 设置baseURL
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.access_token
    },
});

export default api;