import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Adjust based on your backend URL

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
