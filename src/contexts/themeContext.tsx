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
  const systemColorScheme = RNUseColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(
    systemColorScheme === "dark" ? darkTheme : lightTheme,
  );

  useEffect(() => {
    if (mode === "system") {
      setCurrentTheme(systemColorScheme === "dark" ? darkTheme : lightTheme);
    } else {
      setCurrentTheme(mode === "dark" ? darkTheme : lightTheme);
    }
  }, [mode, systemColorScheme]);

  const changeThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };
  const isDark =
    mode === "system" ? systemColorScheme === "dark" : mode === "dark";

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        mode,
        isDark,
        setThemeMode: changeThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
