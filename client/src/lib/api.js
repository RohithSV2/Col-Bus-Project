import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://server-two-beige-19.vercel.app/api"
      : "http://localhost:5000/api"),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization header if token exists in localStorage (dual support)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smartbus_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 responses to clear stale credentials
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      // Token expired or invalid
      // localStorage.removeItem("smartbus_token");
      // localStorage.removeItem("smartbus_user");
    }
    return Promise.reject(error);
  }
);

export default api;
