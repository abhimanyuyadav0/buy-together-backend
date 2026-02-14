import { success } from "../utils/response.util.js";

/** Inline fallback so theme API never crashes the server if config file is missing or invalid */
const FALLBACK_THEME = {
  defaultColorScheme: "auto",
  brandColors: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    secondary: "#1E40AF",
    secondaryLight: "#3B82F6",
    accent: "#60A5FA",
    accentDark: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  light: {
    text: "#1A1A1A",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#2563EB",
    link: "#2563EB",
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    secondary: "#1E40AF",
    accent: "#60A5FA",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F7F9FB",
    backgroundSecondary: "#EEF2F6",
    backgroundTertiary: "#E1E8ED",
    border: "#E1E8ED",
    cardBackground: "#FFFFFF",
    inputBackground: "#F7F9FB",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#60A5FA",
    link: "#60A5FA",
    primary: "#60A5FA",
    primaryDark: "#3B82F6",
    secondary: "#3B82F6",
    accent: "#93C5FD",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    backgroundRoot: "#0F1419",
    backgroundDefault: "#1A1F26",
    backgroundSecondary: "#252B33",
    backgroundTertiary: "#303842",
    border: "#303842",
    cardBackground: "#1A1F26",
    inputBackground: "#252B33",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

let cachedTheme = null;

async function loadThemeConfig() {
  if (cachedTheme) return cachedTheme;
  try {
    const mod = await import("../config/theme.config.js");
    const config = mod?.THEME_CONFIG ?? mod?.default?.THEME_CONFIG;
    if (config && typeof config === "object") {
      cachedTheme = config;
      return cachedTheme;
    }
  } catch (err) {
    console.error("[theme] Failed to load theme.config.js, using fallback:", err?.message || err);
  }
  cachedTheme = FALLBACK_THEME;
  return cachedTheme;
}

async function getTheme(_req, res) {
  try {
    const theme = await loadThemeConfig();
    return success(res, { theme }, "Theme");
  } catch (err) {
    console.error("[theme] getTheme error:", err?.message || err);
    return success(res, { theme: FALLBACK_THEME }, "Theme");
  }
}

export { getTheme };
