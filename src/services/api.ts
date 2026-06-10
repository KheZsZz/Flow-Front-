import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const savedUser = await AsyncStorage.getItem("@flow:auth_user");
    if (savedUser) {
      const { token } = JSON.parse(savedUser);
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn("Falha ao injetar token:", error);
  }
  return config;
});

const STATUS_MESSAGES: Record<number, { title: string; fallback: string }> = {
  400: {
    title: "Dados inválidos",
    fallback: "Verifique os campos e tente novamente.",
  },
  401: { title: "Sessão expirada", fallback: "Faça login novamente." },
  403: {
    title: "Acesso negado",
    fallback: "Você não tem permissão para esta ação.",
  },
  404: { title: "Não encontrado", fallback: "O recurso não existe." },
  409: {
    title: "Conflito de dados",
    fallback: "Já existe um registro com estas informações.",
  },
  422: {
    title: "Erro de validação",
    fallback: "Os dados enviados são inválidos.",
  },
  429: {
    title: "Muitas requisições",
    fallback: "Aguarde alguns instantes e tente novamente.",
  },
  500: {
    title: "Erro no servidor",
    fallback: "Ocorreu um erro interno. Tente mais tarde.",
  },
  503: {
    title: "Serviço indisponível",
    fallback: "O serviço está temporariamente fora do ar.",
  },
};

// middleware
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Caso de Sem Conexão ou Timeout
    if (!error.response) {
      const isTimeout = error.code === "ECONNABORTED";
      Toast.show({
        type: "error",
        text1: isTimeout ? "Tempo esgotado" : "Sem conexão",
        text2: isTimeout
          ? "O servidor demorou para responder."
          : "Verifique sua internet.",
        position: "bottom",
      });
      return Promise.reject(error);
    }

    const status = error.response.status;
    const serverMessage =
      error.response.data?.message || error.response.data?.error;

    if (status === 401) {
      AsyncStorage.removeItem("@flow:auth_user");
      router.replace("/(auth)/login");
    }

    const mapped = STATUS_MESSAGES[status] ?? {
      title: `Erro ${status}`,
      fallback: "Ocorreu um erro inesperado.",
    };

    Toast.show({
      type: "error",
      text1: mapped.title,
      text2: serverMessage || mapped.fallback,
      position: "top",
      visibilityTime: status >= 500 ? 7000 : 5000,
    });

    return Promise.reject(error);
  },
);
