import { api } from "../../utils/api.js";


export async function health() {
try {
    console.log("➡️ Calling /health API...");

  const response = await api.get("/health");

  console.log("⬅️ Response received");

  return response.data;
} catch (err) {
    throw err;
}
}