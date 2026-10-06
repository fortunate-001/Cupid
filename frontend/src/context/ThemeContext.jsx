import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext({
  theme: "System",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("theme") || "System";
    } catch {
      return "System";
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (mode) => {
      if (mode === "System") {
        const prefersDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;

        root.setAttribute(
          "data-theme",
          prefersDark ? "dark" : "light"
        );
      } else {
        root.setAttribute(
          "data-theme",
          mode.toLowerCase()
        );
      }
    };

    applyTheme(theme);

    try {
      localStorage.setItem("theme", theme);
    } catch {}

    if (theme === "System" && window.matchMedia) {
      const mediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      const handleChange = (event) => {
        root.setAttribute(
          "data-theme",
          event.matches ? "dark" : "light"
        );
      };

      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener(
          "change",
          handleChange
        );
      };
    }
  }, [theme]);

  const setTheme = (mode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}