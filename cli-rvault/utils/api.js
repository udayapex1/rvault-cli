import axios from "axios";
import { getToken } from "./config.js";

export const api = axios.create({
  baseURL: "https://rvault-cli.onrender.com",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: () => true, // prevent silent hang on status issues
});

// Automatically attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});