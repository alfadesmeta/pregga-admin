/**
 * Pregga Admin Design System - Color Tokens
 * Premium earthy/warm theme with refined aesthetics
 */

export const PreggaColors = {
  // Primary Terracotta/Coral (Main accent - logo, heart icon)
  primary900: "#8B3D2F",
  primary800: "#A34838",
  primary700: "#B85442",
  primary600: "#C75D4D",
  primary500: "#D4715E",
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
  secondary50: "#FDFCFB",

  // Accent Olive/Sage Green (for active states, Premium badges)
  accent700: "#4A5A3F",
  accent600: "#5A6B4F",
  accent500: "#6B7B5F",
  accent400: "#7D8C70",
  accent300: "#A3B196",
  accent200: "#C5D0BC",
  accent100: "#E8EBE5",
  accent50: "#F4F6F2",

  // Cream/Warm tones (for backgrounds)
  cream100: "#F5F3F0",
  cream50: "#FAF8F5",

  // Neutral (Gray scale - warmer tones)
  neutral900: "#1A1D21",
  neutral800: "#2D3139",
  neutral700: "#4A5565",
  neutral600: "#6B7280",
  neutral500: "#9CA3AF",
  neutral400: "#B8BFC9",
  neutral300: "#D1D5DB",
  neutral200: "#E5E7EB",
  neutral100: "#F3F4F6",
  neutral50: "#F9FAFB",

  // Background
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F8F6F3",
  bgTertiary: "#F3F4F6",

  // Semantic - Success
  success700: "#15803D",
  success600: "#16A34A",
  success500: "#22C55E",
  success400: "#4ADE80",
  success200: "#BBF7D0",
  success100: "#DCFCE7",
  success50: "#F0FDF4",

  // Semantic - Info
  info700: "#0369A1",
  info600: "#0284C7",
  info500: "#0EA5E9",
  info400: "#38BDF8",
  info200: "#BAE6FD",
  info100: "#E0F2FE",
  info50: "#F0F9FF",

  // Semantic - Warning
  warning700: "#B45309",
  warning600: "#D97706",
  warning500: "#F59E0B",
  warning400: "#FBBF24",
  warning300: "#FCD34D",
  warning200: "#FDE68A",
  warning100: "#FEF3C7",
  warning50: "#FFFBEB",

  // Semantic - Error/Destructive
  error700: "#B91C1C",
  error600: "#DC2626",
  error500: "#EF4444",
  error400: "#F87171",
  error300: "#FCA5A5",
  error200: "#FECACA",
  error100: "#FEE2E2",
  error50: "#FEF2F2",

  // Aliases for backward compatibility
  destructive700: "#B91C1C",
  destructive600: "#DC2626",
  destructive500: "#EF4444",
  destructive400: "#F87171",
  destructive100: "#FEE2E2",
  destructive50: "#FEF2F2",

  // Terracotta (for logo and heart icon)
  terracotta700: "#9A4638",
  terracotta600: "#B85442",
  terracotta500: "#C75D4D",
  terracotta400: "#D4715E",
  terracotta200: "#EBBFB6",
  terracotta100: "#F5DDD8",
  terracotta50: "#FBF0EE",

  // Sage/Green aliases
  sage700: "#4A5A3F",
  sage600: "#5A6B4F",
  sage500: "#6B7B5F",
  sage400: "#7D8C70",
  sage200: "#C5D0BC",
  sage100: "#E2E9DD",
  sage50: "#F2F5F0",

  // Rose/Pink aliases
  rose700: "#9A5B4D",
  rose600: "#B56B5B",
  rose500: "#C07B6B",
  rose400: "#D4715E",
  rose200: "#E8D5CC",
  rose100: "#F3E8E3",
  rose50: "#FAF5F3",

  // Base
  white: "#FFFFFF",
  black: "#000000",

  // Sidebar
  sidebarBg: "#FFFFFF",
  sidebarHover: "rgba(107, 123, 95, 0.06)",
  sidebarActive: "#6B7F6C",
  sidebarText: "#4A5565",
  sidebarTextActive: "#FFFFFF",
  sidebarAccent: "#C07B6B",

  // Card/Border
  border: "#E5E7EB",
  borderLight: "#F3F4F6",

  // Overlay
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
} as const;

export const PreggaGradients = {
  sidebar: "linear-gradient(180deg, #FFFFFF 0%, #FAFAF9 100%)",
  primaryButton: "linear-gradient(135deg, #6B7B5F 0%, #5A6B4F 100%)",
  terracottaAccent: "linear-gradient(135deg, #D4715E 0%, #C75D4D 100%)",
  heroGradient: "linear-gradient(135deg, #F5F0EB 0%, #FAF8F5 50%, #E8EBE5 100%)",
  cardShine: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)",
  successGradient: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
  warningGradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
  infoGradient: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
  dangerGradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
} as const;

export const PreggaShadows = {
  xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
  sm: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
  card: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
  modal: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  button: "0 1px 3px rgba(107, 123, 95, 0.2), 0 1px 2px rgba(107, 123, 95, 0.12)",
  buttonHover: "0 4px 6px rgba(107, 123, 95, 0.25), 0 2px 4px rgba(107, 123, 95, 0.15)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)",
  focus: "0 0 0 3px rgba(107, 123, 95, 0.15)",
  focusError: "0 0 0 3px rgba(239, 68, 68, 0.15)",
} as const;

export const PreggaTransitions = {
  fast: "all 0.1s ease",
  normal: "all 0.15s ease",
  smooth: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  entrance: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export type PreggaColorKey = keyof typeof PreggaColors;
