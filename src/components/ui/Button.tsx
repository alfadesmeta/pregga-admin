import { useState } from "react";
import { PreggaColors, PreggaShadows, PreggaTransitions } from "../../theme/colors";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent" | "sage" | "success";
type ButtonSize = "xs" | "sm" | "md" | "lg";

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
      boxShadow: PreggaShadows.buttonHover,
      transform: "translateY(-1px)",
    },
  },
  secondary: {
    base: {
      background: PreggaColors.accent50,
      color: PreggaColors.accent700,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: PreggaColors.accent200,
    },
    hover: {
      background: PreggaColors.accent100,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: PreggaColors.accent300,
    },
  },
  outline: {
    base: {
      background: "transparent",
      color: PreggaColors.neutral700,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: PreggaColors.neutral200,
    },
    hover: {
      background: PreggaColors.neutral50,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: PreggaColors.neutral300,
      color: PreggaColors.neutral900,
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
      color: PreggaColors.neutral900,
    },
  },
  danger: {
    base: {
      background: PreggaColors.error600,
      color: PreggaColors.white,
      border: "none",
      boxShadow: "0 1px 3px rgba(220, 38, 38, 0.2)",
    },
    hover: {
      background: PreggaColors.error700,
      boxShadow: "0 4px 6px rgba(220, 38, 38, 0.25)",
      transform: "translateY(-1px)",
    },
  },
  accent: {
    base: {
      background: PreggaColors.terracotta500,
      color: PreggaColors.white,
      border: "none",
      boxShadow: "0 1px 3px rgba(199, 93, 77, 0.2)",
    },
    hover: {
      background: PreggaColors.terracotta600,
      boxShadow: "0 4px 6px rgba(199, 93, 77, 0.25)",
      transform: "translateY(-1px)",
    },
  },
  sage: {
    base: {
      background: PreggaColors.sage500,
      color: PreggaColors.white,
      border: "none",
      boxShadow: "0 1px 3px rgba(107, 127, 108, 0.2)",
    },
    hover: {
      background: PreggaColors.sage600,
      boxShadow: "0 4px 6px rgba(107, 127, 108, 0.25)",
      transform: "translateY(-1px)",
    },
  },
  success: {
    base: {
      background: PreggaColors.success600,
      color: PreggaColors.white,
      border: "none",
      boxShadow: "0 1px 3px rgba(22, 163, 74, 0.2)",
    },
    hover: {
      background: PreggaColors.success700,
      boxShadow: "0 4px 6px rgba(22, 163, 74, 0.25)",
      transform: "translateY(-1px)",
    },
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  xs: { padding: "4px 8px", fontSize: 12, borderRadius: 6, gap: 4 },
  sm: { padding: "6px 12px", fontSize: 13, borderRadius: 6, gap: 6 },
  md: { padding: "10px 16px", fontSize: 14, borderRadius: 8, gap: 8 },
  lg: { padding: "12px 20px", fontSize: 15, borderRadius: 10, gap: 8 },
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
  const [isPressed, setIsPressed] = useState(false);

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const combinedStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: 500,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : loading ? 0.8 : 1,
    transition: PreggaTransitions.smooth,
    width: fullWidth ? "100%" : "auto",
    whiteSpace: "nowrap",
    userSelect: "none",
    ...sizeStyle,
    ...variantStyle.base,
    ...(isHovered && !disabled && !loading ? variantStyle.hover : {}),
    ...(isPressed && !disabled && !loading ? { transform: "translateY(0)", opacity: 0.9 } : {}),
    ...style,
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {loading && (
        <Loader2
          size={size === "xs" ? 12 : size === "sm" ? 14 : 16}
          style={{ animation: "spin 0.7s linear infinite" }}
        />
      )}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
}
