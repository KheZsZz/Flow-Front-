import { StatusTypes } from "@/schemas/statusSchema";
import { api } from "./api";

export const getStatus = async () => {
  try {
    const response = await api.get("/status");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createStatus = async (data: StatusTypes) => {
  try {
    const response = await api.post("/status", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStatus = async (id: string, data: StatusTypes) => {
  try {
    const response = await api.put(`/status/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export const deleteStatus = async (id: string) => {
//   try {
//     const response = await api.delete(`/status/${id}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

export const findStatus = async (id: string) => {
  try {
    const response = await api.get(`/status/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleStatus = async (id: string, is_active: boolean) => {
  const response = await api.patch(`/status/${id}`, { is_active });
  return response.data;
};
