import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "@/schemas/usersSchema";
import { api } from "@/services/api";

interface CompanySession {
  id: string;
  name: string;
  logo_url: string;
  is_active: boolean;
}

interface UserSession {
  user: UserType;
  company?: CompanySession;
  token: string; // ✨ Adicionado explicitamente aqui para facilitar o acesso
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  singIn: (serverPayload: SingInParams) => Promise<void>;
  singOut: () => Promise<void>;
}

interface SingInParams {
  message: string;
  token: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const singIn = async (serverPayload: SingInParams) => {
    try {
      // Define o token temporário para a requisição de perfil
      api.defaults.headers.common["Authorization"] =
        `Bearer ${serverPayload.token}`;

      const response = await api.get("/auth/me");

      // Monta a sessão incluindo o token explicitamente na raiz
      const completeSession: UserSession = {
        company: response.data.company,
        user: response.data.user,
        token: serverPayload.token,
      };

      setUser(completeSession);
      await AsyncStorage.setItem(
        "@flow:auth_user",
        JSON.stringify(completeSession),
      );
    } catch (error) {
      console.error("Erro ao processar o login no frontend:", error);
      throw error;
    }
  };

  const singOut = async () => {
    try {
      api.defaults.headers.common["Authorization"] = "";
      setUser(null);
      await AsyncStorage.removeItem("@flow:auth_user");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const loadStorageData = async () => {
    try {
      const storagedUser = await AsyncStorage.getItem("@flow:auth_user");

      if (storagedUser) {
        const parsedUser = JSON.parse(storagedUser) as UserSession;

        if (!parsedUser.token) {
          throw new Error("Token não encontrado no armazenamento local.");
        }

        api.defaults.headers.common["Authorization"] =
          `Bearer ${parsedUser.token}`;

        const response = await api.get("/auth/me");

        const updatedSession: UserSession = {
          user: response.data.user,
          company: response.data.company,
          token: parsedUser.token,
        };

        setUser(updatedSession);
        await AsyncStorage.setItem(
          "@flow:auth_user",
          JSON.stringify(updatedSession),
        );
      }
    } catch (error) {
      console.error("Sessão expirada ou inválida ao restaurar:", error);
      await singOut();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, singIn, singOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
