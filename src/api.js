import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1/sitc-publicity/backend/api/v1/', // 设置baseURL
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.token
    },
});

export default api;