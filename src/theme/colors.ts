/**
 * Pregga Admin Design System - Color Tokens
 * Based on Figma designs - Earthy/warm theme with cream sidebar
 */

export const PreggaColors = {
  // Primary Terracotta/Coral (Main accent - logo, heart icon)
  primary900: "#8B3D2F",
  primary800: "#A34838",
  primary700: "#B85442",
  primary600: "#C75D4D",
  primary500: "#D4715E", // Main terracotta
  primary400: "#DE8A7A",
  primary300: "#E8A396",
  primary200: "#F2BCB2",
  primary100: "#FAE5E1",
  primary50: "#FDF2F0",

  // Secondary (Warm cream/beige)
  secondary500: "#C9BBA8",
  secondary400: "#D6CCBD",
  secondary300: "#E3DDD2",
  secondary200: "#F0EDE7",
  secondary100: "#F8F6F3",

  // Accent Olive/Sage Green (for active states, Premium badges)
  accent600: "#5A6B4F",
  accent500: "#6B7B5F", // Olive green for active menu
  accent400: "#7D8C70",
  accent100: "#E8EBE5",

  // Cream/Warm tones (for backgrounds) - from Figma
  cream100: "#F5F3F0", // Main content background
  cream50: "#FAF8F5",

  // Neutral (Gray scale - warmer tones)
  neutral900: "#2D2D2D",
  neutral800: "#364153",
  neutral700: "#4A5565",
  neutral600: "#6A7282",
  neutral500: "#808080",
  neutral400: "#9E9E9E",
  neutral300: "#BDBDBD",
  neutral200: "#E0E0E0",
  neutral100: "#F3F4F6",
  neutral50: "#F5F5F5",

  // Background - matching Figma
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F5F3F0", // Cream background from Figma
  bgTertiary: "#F5F5F5",

  // Semantic - Success (Green for Active status)
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

  // Semantic - Warning (for Suspended status)
  warning700: "#F57C00",
  warning600: "#FB8C00",
  warning500: "#FF9800",
  warning400: "#FFA726",
  warning100: "rgba(255, 152, 0, 0.12)",

  // Semantic - Destructive/Error (Red for delete actions)
  destructive700: "#C62828",
  destructive600: "#D32F2F",
  destructive500: "#F44336",
  destructive400: "#EF5350",
  destructive100: "rgba(244, 67, 54, 0.12)",

  // Terracotta (for logo and heart icon)
  terracotta600: "#B85442",
  terracotta500: "#C75D4D",
  terracotta400: "#D4715E",
  terracotta100: "#E8D5CC",

  // Sage/Green aliases (for compatibility)
  sage600: "#5A6B4F",
  sage500: "#6B7B5F",
  sage400: "#7D8C70",
  sage100: "#D4E4D8",

  // Rose/Pink aliases (for compatibility - using terracotta tones)
  rose600: "#B56B5B",
  rose500: "#C07B6B",
  rose400: "#D4715E",
  rose100: "#E8D5CC",

  // Base
  white: "#FFFFFF",
  black: "#000000",

  // Sidebar (White with shadow - from Figma)
  sidebarBg: "#FFFFFF",
  sidebarHover: "rgba(107, 123, 95, 0.06)",
  sidebarActive: "#6B7F6C", // Olive green active background from Figma
  sidebarText: "#364153",
  sidebarTextActive: "#FFFFFF",
  sidebarAccent: "#C07B6B", // Terracotta for logo

  // Card/Border
  border: "#E6E6E6",
  borderLight: "#F0F0F0",
} as const;

export const PreggaGradients = {
  sidebar: "linear-gradient(180deg, #F5F0EB 0%, #EDE8E3 100%)",
  primaryButton: "linear-gradient(135deg, #6B7B5F 0%, #5A6B4F 100%)",
  terracottaAccent: "linear-gradient(135deg, #D4715E 0%, #C75D4D 100%)",
  heroGradient: "linear-gradient(135deg, #F5F0EB 0%, #FAF8F5 50%, #E8EBE5 100%)",
} as const;

export const PreggaShadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  card: "0 1px 3px rgba(0, 0, 0, 0.08)",
  md: "0 4px 12px rgba(0, 0, 0, 0.1)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
  modal: "0 16px 48px rgba(0, 0, 0, 0.16)",
  button: "0 2px 8px rgba(107, 123, 95, 0.25)",
} as const;

export type PreggaColorKey = keyof typeof PreggaColors;
