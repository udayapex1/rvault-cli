import { api } from "../../utils/api.js";

export async function getUploads(page = 1, limit = 20) {
    try {
        const response = await api.get(`/api/user/uploads?page=${page}&limit=${limit}`);
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data?.message || "Failed to fetch uploads");
        }
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to fetch uploads";
        throw new Error(message);
    }
}

export async function getDownloadLink(fileId) {
    try {
        const response = await api.get(`/api/files/download/${fileId}`);
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data?.message || "Failed to get download link");
        }
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to get download link";
        throw new Error(message);
    }
}

export async function deleteFile(fileId) {
    try {
        const response = await api.delete(`/api/files/${fileId}`);
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data?.message || "Failed to delete file");
        }
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Failed to delete file";
        throw new Error(message);
    }
}
