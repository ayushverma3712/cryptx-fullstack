// client/src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 30000,
});

// Attach JWT from localStorage automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem("cx_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally → redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cx_token");
      localStorage.removeItem("cx_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
