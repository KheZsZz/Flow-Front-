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
  (response) => response,
  (error) => {
    if (!error.response) {
      const isTimeout = error.code === "ECONNABORTED";
      Toast.show({
        type: "error",
        text1: isTimeout ? "Tempo esgotado" : "Sem conexão",
        text2: isTimeout
          ? "O servidor demorou para responder. Tente novamente."
          : "Não foi possível conectar ao servidor. Verifique sua conexão.",
        position: "bottom",
        visibilityTime: 5000,
      });
      return Promise.reject(error);
    }

    const status = error.response.status;
    const data = error.response.data;

    const serverMessage = data?.error || data?.message;

    // Mapa de status → título + fallback descritivo
    const statusMap: Record<number, { title: string; fallback: string }> = {
      400: {
        title: "Dados inválidos",
        fallback: "Verifique os campos e tente novamente.",
      },
      401: {
        title: "Sessão expirada",
        fallback: "Faça login novamente para continuar.",
      },
      403: {
        title: "Acesso negado",
        fallback: "Você não tem permissão para esta ação.",
      },
      404: {
        title: "Não encontrado",
        fallback: "O recurso solicitado não existe.",
      },
      409: {
        title: "Conflito de dados",
        fallback: "Já existe um registro com essas informações.",
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

    const mapped = statusMap[status] ?? {
      title: `Erro ${status}`,
      fallback: "Ocorreu um erro inesperado.",
    };

    if (status === 401) {
      // Se você tiver acesso ao router aqui, chame logout/redirect
      // authStore.logout() ou router.replace("/(auth)/login")
    }

    Toast.show({
      type: "error",
      text1: mapped.title,
      text2: serverMessage || mapped.fallback,
      position: "bottom",
      visibilityTime: status >= 500 ? 7000 : 5000,
      autoHide: true,
    });

    return Promise.reject(error);
  },
);
