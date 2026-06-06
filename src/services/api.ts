import axios from "axios";
import Toast from "react-native-toast-message";

export const api = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL_DEV,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor
api.interceptors.request.use(async (config) => {
  const savedUser = localStorage.getItem("@flow:auth_user");
  if (savedUser && config.headers) {
    const { token } = JSON.parse(savedUser);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// middleware
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = "Ocorreu um erro inesperado no ecossistema.";

    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "Não foi possível conectar ao servidor. Verifique a sua conexão.";
    }

    Toast.show({
      type: "error",
      text1: "Falha na Operação",
      text2: errorMessage,
      position: "bottom",
      visibilityTime: 5000,
      autoHide: true,
    });

    return Promise.reject(error);
  },
);
