import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme as RNUseColorScheme } from "react-native";
import { lightTheme, darkTheme } from "@/constants/colors";

type ThemeType = typeof lightTheme;
export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextData {
  theme: ThemeType;
  mode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = RNUseColorScheme(); // Captura o tema nativo do dispositivo
  const [mode, setMode] = useState<ThemeMode>("system"); // Padrão inicial é o Sistema
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(
    systemColorScheme === "dark" ? darkTheme : lightTheme
  );

  useEffect(() => {
    // Atualiza o tema com base na escolha do usuário ou do sistema
    if (mode === "system") {
      setCurrentTheme(systemColorScheme === "dark" ? darkTheme : lightTheme);
    } else {
      setCurrentTheme(mode === "dark" ? darkTheme : lightTheme);
    }
  }, [mode, systemColorScheme]);

  // Função direta para o usuário definir o tema em qualquer lugar do app
  const changeThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  // Flag booleana utilitária para checar se o resultado visual final é escuro
  const isDark = mode === "system" ? systemColorScheme === "dark" : mode === "dark";

  return (
    <ThemeContext.Provider
      value={{ theme: currentTheme, mode, isDark, setThemeMode: changeThemeMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}