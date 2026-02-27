/**
 * Pregga Admin Design System - Color Tokens
 * Based on Figma designs - Pink/Rose theme with dark sidebar
 */

export const PreggaColors = {
  // Primary Pink/Rose (Main accent)
  primary900: "#7A1F3D",
  primary800: "#9B2A4D",
  primary700: "#B83560",
  primary600: "#D14073",
  primary500: "#E85D8C", // Main pink
  primary400: "#ED7FA3",
  primary300: "#F2A1BA",
  primary200: "#F7C3D1",
  primary100: "#FBE5EC",
  primary50: "#FDF2F5",

  // Secondary (Soft pink/blush)
  secondary500: "#F5A5B8",
  secondary400: "#F8BDC9",
  secondary300: "#FAD5DB",
  secondary200: "#FCEAED",
  secondary100: "#FEF5F7",

  // Accent Green (for success states)
  accent600: "#43A047",
  accent500: "#4CAF50",
  accent400: "#66BB6A",
  accent100: "#E8F5E9",

  // Cream/Warm tones (for backgrounds)
  cream100: "#FFF8F5",
  cream50: "#FFFCFA",

  // Neutral (Gray scale)
  neutral900: "#1A1A1A",
  neutral800: "#2D2D2D",
  neutral700: "#404040",
  neutral600: "#666666",
  neutral500: "#808080",
  neutral400: "#999999",
  neutral300: "#B3B3B3",
  neutral200: "#CCCCCC",
  neutral100: "#E6E6E6",
  neutral50: "#F5F5F5",

  // Background
  bgPrimary: "#FFFFFF",
  bgSecondary: "#FAFAFA",
  bgTertiary: "#F5F5F5",

  // Semantic - Success
  success700: "#2E7D32",
  success600: "#388E3C",
  success500: "#4CAF50",
  success400: "#66BB6A",
  success100: "rgba(76, 175, 80, 0.12)",

  // Semantic - Info
  info600: "#1976D2",
  info500: "#2196F3",
  info400: "#42A5F5",
  info100: "rgba(33, 150, 243, 0.12)",

  // Semantic - Warning
  warning700: "#F57C00",
  warning600: "#FB8C00",
  warning500: "#FF9800",
  warning400: "#FFA726",
  warning100: "rgba(255, 152, 0, 0.12)",

  // Semantic - Destructive/Error
  destructive700: "#C62828",
  destructive600: "#D32F2F",
  destructive500: "#F44336",
  destructive400: "#EF5350",
  destructive100: "rgba(244, 67, 54, 0.12)",

  // Base
  white: "#FFFFFF",
  black: "#000000",

  // Sidebar (Dark theme)
  sidebarBg: "#1A1A1A",
  sidebarHover: "rgba(255, 255, 255, 0.08)",
  sidebarActive: "rgba(232, 93, 140, 0.15)",
  sidebarText: "#999999",
  sidebarTextActive: "#FFFFFF",
  sidebarAccent: "#E85D8C",

  // Card/Border
  border: "#E6E6E6",
  borderLight: "#F0F0F0",
} as const;

export const PreggaGradients = {
  sidebar: "linear-gradient(180deg, #1A1A1A 0%, #2D2D2D 100%)",
  primaryButton: "linear-gradient(135deg, #E85D8C 0%, #D14073 100%)",
  pinkAccent: "linear-gradient(135deg, #F5A5B8 0%, #E85D8C 100%)",
} as const;

export const PreggaShadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  card: "0 1px 3px rgba(0, 0, 0, 0.08)",
  md: "0 4px 12px rgba(0, 0, 0, 0.1)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
  modal: "0 16px 48px rgba(0, 0, 0, 0.16)",
  button: "0 2px 8px rgba(232, 93, 140, 0.25)",
} as const;

export type PreggaColorKey = keyof typeof PreggaColors;
