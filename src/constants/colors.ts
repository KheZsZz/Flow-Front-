import { ThemeMode } from "@/contexts/themeContext";
import { UserTypeEnum } from "@/schemas/enumSchema";

export type AppTheme = {
  isDark: boolean;
  primary: string;
  gradient: [string, string, ...string[]];
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  borderColor: string;
  inputBg: string;
  inputBorder: string;
  link: string;
  error: string;
  success: string;
  status: {
    [key in "Entrega" | "Coleta" | "Avarias" | "Devolução" | "Reentrega"]: {
      bg: string;
      text: string;
    };
  };
};

export const lightTheme: AppTheme = {
  isDark: false,
  primary: "#1E73FF",
  gradient: ["#263755", "#1E73FF", "#F9FAFB"],
  background: "#FFFFFF",
  card: "#F9FAFB",
  text: "#172130",
  textSecondary: "#f3f4f6",
  borderColor: "rgba(0, 0, 0, 0.1)",
  inputBg: "#ffffff",
  inputBorder: "#d1d5db",
  link: "#1E73FF",
  error: "#FF4D4D",
  success: "#18C964",
  status: {
    Entrega: { bg: "#e6f4ea", text: "#137333" },
    Coleta: { bg: "#e8f0fe", text: "#1a73e8" },
    Avarias: { bg: "#fce8e6", text: "#c5221f" },
    Devolução: { bg: "#fef7e0", text: "#b06000" },
    Reentrega: { bg: "#f3e8ff", text: "#6d28d9" },
  },
};

export const darkTheme: AppTheme = {
  isDark: true,
  primary: "#0b0f19",
  background: "#152242",
  gradient: ["#0b0f19", "#1e2640", "#151b2c"],
  card: "#151b2c",
  text: "#f3f4f6",
  textSecondary: "#f3f4f6",
  borderColor: "rgba(255, 255, 255, 0.8)",
  inputBg: "#1e2640",
  inputBorder: "#374151",
  link: "#f7cc3e",
  error: "#ef4444",
  success: "#10b981",
  status: {
    Entrega: { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80" },
    Coleta: { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa" },
    Avarias: { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" },
    Devolução: { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24" },
    Reentrega: { bg: "rgba(139, 92, 246, 0.15)", text: "#a78bfa" },
  },
};

export const ROLE_COLOR: Record<UserTypeEnum, string> = {
  Manager: "#f7cc3e",
  Admin: "#60a5fa",
  Financer: "#34d399",
  Requestor: "#a78bfa",
  Driver: "#fb923c",
  Commum: "#9ca3af",
};

export const ROLE_LABEL: Record<UserTypeEnum, string> = {
  Manager: "Manager",
  Admin: "Administrador",
  Financer: "Financeiro",
  Requestor: "Lider",
  Driver: "Motorista",
  Commum: "Assistente/Auxiliar",
};

export const THEME_OPTIONS: {
  id: ThemeMode;
  icon: "sun" | "moon";
  label: string;
}[] = [
  { id: "light", icon: "sun", label: "Claro" },
  { id: "dark", icon: "moon", label: "Escuro" },
];

type Period = "all" | "today" | "7d" | "30d";

export interface PeriodsTypes {
  key: Period;
  label: string;
}

export const PERIODS: { key: Period; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
];
