import axios from "axios";
export const api = axios.create({
  baseURL: "https://rvault-cli.onrender.com",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: () => true, // prevent silent hang on status issues
});