import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("lsp-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 422) {
        console.log("Token tidak valid atau kedaluwarsa. Melakukan logout...");
        localStorage.removeItem("lsp-token");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
