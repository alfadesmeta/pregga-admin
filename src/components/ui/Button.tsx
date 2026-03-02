import { useState } from "react";
import { PreggaColors, PreggaShadows } from "../../theme/colors";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent" | "sage";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { base: React.CSSProperties; hover: React.CSSProperties }> = {
  primary: {
    base: {
      background: PreggaColors.accent500,
      color: PreggaColors.white,
      border: "none",
      boxShadow: PreggaShadows.button,
    },
    hover: {
      background: PreggaColors.accent600,
    },
  },
  secondary: {
    base: {
      background: PreggaColors.accent100,
      color: PreggaColors.accent600,
      border: "none",
    },
    hover: {
      background: "rgba(107, 123, 95, 0.15)",
    },
  },
  outline: {
    base: {
      background: "transparent",
      color: PreggaColors.neutral700,
      border: `1px solid ${PreggaColors.neutral200}`,
    },
    hover: {
      background: PreggaColors.neutral50,
      borderColor: PreggaColors.neutral300,
    },
  },
  ghost: {
    base: {
      background: "transparent",
      color: PreggaColors.neutral600,
      border: "none",
    },
    hover: {
      background: PreggaColors.neutral100,
      color: PreggaColors.neutral800,
    },
  },
  danger: {
    base: {
      background: PreggaColors.destructive600,
      color: PreggaColors.white,
      border: "none",
    },
    hover: {
      background: PreggaColors.destructive700,
    },
  },
  accent: {
    base: {
      background: PreggaColors.terracotta500,
      color: PreggaColors.white,
      border: "none",
      boxShadow: "0 2px 8px rgba(199, 93, 77, 0.25)",
    },
    hover: {
      background: PreggaColors.terracotta600,
    },
  },
  sage: {
    base: {
      background: PreggaColors.sage500,
      color: PreggaColors.white,
      border: "none",
      boxShadow: "0 2px 8px rgba(107, 127, 108, 0.25)",
    },
    hover: {
      background: PreggaColors.sage600,
    },
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: 13, borderRadius: 6 },
  md: { padding: "10px 18px", fontSize: 14, borderRadius: 8 },
  lg: { padding: "14px 24px", fontSize: 15, borderRadius: 10 },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const combinedStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    transition: "all 0.15s ease",
    width: fullWidth ? "100%" : "auto",
    ...sizeStyle,
    ...variantStyle.base,
    ...(isHovered && !disabled && !loading ? variantStyle.hover : {}),
    ...style,
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {loading && <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} />}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
}
