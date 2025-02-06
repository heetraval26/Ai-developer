import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor to always use the latest token
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token'); // Fetch the latest token before each request
    console.log("Updated Token being sent in request:", token); // Debugging

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    } else {
        console.warn("No token found, request may fail with 401");
    }

    return config;
}, error => {
    return Promise.reject(error);
});

export default axiosInstance;
