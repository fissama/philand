"use client";

import { toast as sonnerToast } from "sonner";
import { useTheme } from "@/lib/theme-provider";

// Theme-aware toast styles with improved colors
const getToastStyles = (theme: string) => {
  const baseStyles = {
    borderRadius: "var(--radius)",
    fontSize: "14px",
    fontWeight: "500",
  };

  switch (theme) {
    case "dark":
      return {
        ...baseStyles,
        background: "hsl(220 13% 18%)",
        color: "hsl(220 9% 86%)",
        border: "1px solid hsl(220 13% 28%)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
      };
    case "colorful":
      return {
        ...baseStyles,
        background: "rgba(255, 255, 255, 0.98)",
        color: "hsl(220 9% 15%)",
        border: "2px solid rgba(147, 197, 253, 0.5)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 1)",
        backdropFilter: "blur(16px)",
      };
    case "light":
    default:
      return {
        ...baseStyles,
        background: "hsl(0 0% 100%)",
        color: "hsl(220 9% 15%)",
        border: "1px solid hsl(220 13% 91%)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      };
  }
};

const getErrorStyles = (theme: string) => {
  const baseStyles = {
    borderRadius: "var(--radius)",
    fontSize: "14px",
    fontWeight: "500",
  };

  switch (theme) {
    case "dark":
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(0 84% 45%) 0%, hsl(0 72% 38%) 100%)",
        color: "white",
        border: "1px solid hsl(0 84% 55%)",
        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
      };
    case "colorful":
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(350 89% 60%) 0%, hsl(340 82% 52%) 100%)",
        color: "white",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(16px)",
      };
    case "light":
    default:
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(0 84% 60%) 0%, hsl(0 72% 50%) 100%)",
        color: "white",
        border: "1px solid hsl(0 84% 65%)",
        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
      };
  }
};

const getSuccessStyles = (theme: string) => {
  const baseStyles = {
    borderRadius: "var(--radius)",
    fontSize: "14px",
    fontWeight: "500",
  };

  switch (theme) {
    case "dark":
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(142 69% 45%) 0%, hsl(142 69% 38%) 100%)",
        color: "white",
        border: "1px solid hsl(142 69% 55%)",
        boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
      };
    case "colorful":
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(158 64% 52%) 0%, hsl(142 71% 45%) 100%)",
        color: "white",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(16px)",
      };
    case "light":
    default:
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(142 69% 58%) 0%, hsl(142 69% 48%) 100%)",
        color: "white",
        border: "1px solid hsl(142 69% 65%)",
        boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
      };
  }
};

const getWarningStyles = (theme: string) => {
  const baseStyles = {
    borderRadius: "var(--radius)",
    fontSize: "14px",
    fontWeight: "500",
  };

  switch (theme) {
    case "dark":
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(38 92% 45%) 0%, hsl(32 95% 38%) 100%)",
        color: "white",
        border: "1px solid hsl(38 92% 55%)",
        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
      };
    case "colorful":
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(43 96% 56%) 0%, hsl(38 92% 50%) 100%)",
        color: "white",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(16px)",
      };
    case "light":
    default:
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(43 96% 60%) 0%, hsl(38 92% 52%) 100%)",
        color: "white",
        border: "1px solid hsl(43 96% 65%)",
        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
      };
  }
};

const getInfoStyles = (theme: string) => {
  const baseStyles = {
    borderRadius: "var(--radius)",
    fontSize: "14px",
    fontWeight: "500",
  };

  switch (theme) {
    case "dark":
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(217 91% 55%) 0%, hsl(217 91% 45%) 100%)",
        color: "white",
        border: "1px solid hsl(217 91% 65%)",
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
      };
    case "colorful":
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(213 94% 68%) 0%, hsl(217 91% 60%) 100%)",
        color: "white",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(16px)",
      };
    case "light":
    default:
      return {
        ...baseStyles,
        background: "linear-gradient(135deg, hsl(217 91% 65%) 0%, hsl(217 91% 55%) 100%)",
        color: "white",
        border: "1px solid hsl(217 91% 70%)",
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
      };
  }
};

// Create theme-aware toast functions
export const createThemeToast = (theme: string) => ({
  success: (message: string, options?: any) => {
    return sonnerToast.success(message, {
      ...options,
      style: getSuccessStyles(theme),
      className: theme === "colorful" ? "colorful-toast" : undefined,
    });
  },
  
  error: (message: string, options?: any) => {
    return sonnerToast.error(message, {
      ...options,
      style: getErrorStyles(theme),
      className: theme === "colorful" ? "colorful-toast" : undefined,
    });
  },
  
  info: (message: string, options?: any) => {
    return sonnerToast.info(message, {
      ...options,
      style: getInfoStyles(theme),
      className: theme === "colorful" ? "colorful-toast" : undefined,
    });
  },
  
  warning: (message: string, options?: any) => {
    return sonnerToast.warning(message, {
      ...options,
      style: getWarningStyles(theme),
      className: theme === "colorful" ? "colorful-toast" : undefined,
    });
  },
});

// Hook to get theme-aware toast functions
export const useToast = () => {
  const { theme } = useTheme();
  return createThemeToast(theme);
};

// Utility function to get current theme and create toast (for use outside components)
export const getThemeAwareToast = () => {
  const theme = document.documentElement.classList.contains("dark") 
    ? "dark" 
    : document.documentElement.classList.contains("colorful")
    ? "colorful"
    : "light";
  
  return createThemeToast(theme);
};