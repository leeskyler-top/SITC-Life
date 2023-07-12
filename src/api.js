import axios from 'axios';

const api = axios.create({
    baseURL: 'https://twxc-beta.leeskyler.top/backend/api/v1/', // 设置baseURL
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.token
    },
});

export default api;