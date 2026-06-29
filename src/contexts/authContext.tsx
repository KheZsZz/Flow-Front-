import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "@/schemas/usersSchema";
import { api } from "@/services/api";
import { queryClient } from "@/lib/queryClient";

interface CompanySession {
  id: string;
  name: string;
  logo_url: string;
  is_active: boolean;
}

interface UserSession {
  user: UserType;
  company?: CompanySession;
  token: string;
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

  const singOut = async () => {
    try {
      api.defaults.headers.common["Authorization"] = "";
      setUser(null);
      await AsyncStorage.removeItem("@flow:auth_user");
      queryClient.clear();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const singIn = async (serverPayload: SingInParams) => {
    try {
      api.defaults.headers.common["Authorization"] =
        `Bearer ${serverPayload.token}`;

      const response = await api.get("/auth/me");
      const me = response.data;

      if (!me?.user) {
        throw new Error("Perfil inválido retornado por /auth/me");
      }

      const completeSession: UserSession = {
        user: me.user,
        company: me.company,
        token: serverPayload.token,
      };

      setUser(completeSession);
      await AsyncStorage.setItem(
        "@flow:auth_user",
        JSON.stringify(completeSession),
      );
    } catch (error) {
      console.error("Erro ao processar o login no frontend:", error);
      await singOut();
      throw error;
    }
  };

  const loadStorageData = async () => {
    try {
      const storagedUser = await AsyncStorage.getItem("@flow:auth_user");

      if (storagedUser) {
        const parsedUser = JSON.parse(storagedUser) as UserSession;

        if (!parsedUser?.token) {
          throw new Error("Token não encontrado no armazenamento local.");
        }

        api.defaults.headers.common["Authorization"] =
          `Bearer ${parsedUser.token}`;

        const response = await api.get("/auth/me");
        const me = response.data;

        if (!me?.user) {
          throw new Error("Perfil inválido retornado por /auth/me");
        }

        const updatedSession: UserSession = {
          user: me.user,
          company: me.company,
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
