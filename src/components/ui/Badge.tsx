import { PreggaColors } from "../../theme/colors";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "primary"
  | "accent"
  | "sage"
  | "rose"
  | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string; dotColor: string; border?: string }> = {
  success: {
    bg: PreggaColors.success50,
    color: PreggaColors.success700,
    dotColor: PreggaColors.success500,
    border: PreggaColors.success200,
  },
  warning: {
    bg: PreggaColors.warning50,
    color: PreggaColors.warning700,
    dotColor: PreggaColors.warning500,
    border: PreggaColors.warning200,
  },
  danger: {
    bg: PreggaColors.error50,
    color: PreggaColors.error700,
    dotColor: PreggaColors.error500,
    border: PreggaColors.error200,
  },
  info: {
    bg: PreggaColors.info50,
    color: PreggaColors.info700,
    dotColor: PreggaColors.info500,
    border: PreggaColors.info200,
  },
  neutral: {
    bg: PreggaColors.neutral100,
    color: PreggaColors.neutral700,
    dotColor: PreggaColors.neutral400,
    border: PreggaColors.neutral200,
  },
  primary: {
    bg: PreggaColors.primary50,
    color: PreggaColors.primary700,
    dotColor: PreggaColors.primary500,
    border: PreggaColors.primary200,
  },
  accent: {
    bg: PreggaColors.accent50,
    color: PreggaColors.accent700,
    dotColor: PreggaColors.accent500,
    border: PreggaColors.accent200,
  },
  sage: {
    bg: PreggaColors.accent50,
    color: PreggaColors.accent700,
    dotColor: PreggaColors.accent500,
    border: PreggaColors.accent200,
  },
  rose: {
    bg: PreggaColors.rose50,
    color: PreggaColors.rose700,
    dotColor: PreggaColors.rose500,
    border: PreggaColors.rose200,
  },
  outline: {
    bg: "transparent",
    color: PreggaColors.neutral700,
    dotColor: PreggaColors.neutral400,
    border: PreggaColors.neutral300,
  },
};

export function Badge({ children, variant = "neutral", dot = false, size = "md", icon }: BadgeProps) {
  const styles = variantStyles[variant];
  const padding = size === "sm" ? "2px 8px" : "4px 10px";
  const fontSize = size === "sm" ? 11 : 12;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding,
        borderRadius: 6,
        fontSize,
        fontWeight: 500,
        background: styles.bg,
        color: styles.color,
        fontFamily: "'Inter', -apple-system, sans-serif",
        whiteSpace: "nowrap",
        border: styles.border ? `1px solid ${styles.border}` : undefined,
        lineHeight: 1.4,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: styles.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {icon && <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>}
      {children}
    </span>
  );
}

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "expired"
  | "online"
  | "offline"
  | "verified"
  | "unverified"
  | "cancelled"
  | "accepted"
  | "rejected"
  | "trial";

interface StatusBadgeProps {
  status: StatusType | string;
  showDot?: boolean;
}

const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  active: { variant: "accent", label: "Active" },
  inactive: { variant: "neutral", label: "Inactive" },
  pending: { variant: "warning", label: "Pending" },
  expired: { variant: "danger", label: "Expired" },
  online: { variant: "accent", label: "Online" },
  offline: { variant: "neutral", label: "Offline" },
  verified: { variant: "accent", label: "Verified" },
  unverified: { variant: "warning", label: "Unverified" },
  cancelled: { variant: "danger", label: "Cancelled" },
  accepted: { variant: "accent", label: "Accepted" },
  rejected: { variant: "danger", label: "Rejected" },
  trial: { variant: "info", label: "Trial" },
};

export function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    variant: "neutral" as BadgeVariant,
    label: status,
  };

  return (
    <Badge variant={config.variant} dot={showDot}>
      {config.label}
    </Badge>
  );
}
