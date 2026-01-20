import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

/**
 * Auto-switching theme hook based on time of day
 * Light theme: 6:00 AM - 7:59 PM
 * Dark theme: 8:00 PM - 5:59 AM
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getThemeByTime());

  useEffect(() => {
    // Set initial theme
    applyTheme(theme);

    // Check theme every minute
    const interval = setInterval(() => {
      const newTheme = getThemeByTime();
      if (newTheme !== theme) {
        setTheme(newTheme);
        applyTheme(newTheme);
        console.log(`🎨 Theme changed to ${newTheme} mode at ${new Date().toLocaleTimeString()}`);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [theme]);

  return { theme, isDark: theme === "dark" };
}

/**
 * Determine theme based on current time
 * Day (light): 6:00 AM - 7:59 PM
 * Night (dark): 8:00 PM - 5:59 AM
 */
function getThemeByTime(): Theme {
  const now = new Date();
  const hour = now.getHours();

  // Dark theme: 8 PM (20:00) to 5:59 AM (5:59)
  // Light theme: 6 AM (6:00) to 7:59 PM (19:59)
  if (hour >= 20 || hour < 6) {
    return "dark";
  }
  
  return "light";
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  
  // Save to localStorage for persistence
  localStorage.setItem("theme-preference", theme);
}

/**
 * Get saved theme preference or auto-detect
 */
export function getInitialTheme(): Theme {
  // Check if user has a saved preference
  const saved = localStorage.getItem("theme-preference");
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  
  // Otherwise, use time-based theme
  return getThemeByTime();
}

/**
 * Manually override theme (useful for testing or user preference)
 */
export function setManualTheme(theme: Theme) {
  applyTheme(theme);
  localStorage.setItem("theme-preference", theme);
}
