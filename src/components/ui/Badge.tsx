import { PreggaColors } from "../../theme/colors";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "primary" | "accent" | "sage";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string; dotColor: string }> = {
  success: {
    bg: PreggaColors.success100,
    color: PreggaColors.success600,
    dotColor: PreggaColors.success500,
  },
  warning: {
    bg: PreggaColors.warning100,
    color: PreggaColors.warning700,
    dotColor: PreggaColors.warning500,
  },
  danger: {
    bg: PreggaColors.destructive100,
    color: PreggaColors.destructive600,
    dotColor: PreggaColors.destructive500,
  },
  info: {
    bg: PreggaColors.info100,
    color: PreggaColors.info600,
    dotColor: PreggaColors.info500,
  },
  neutral: {
    bg: PreggaColors.neutral100,
    color: PreggaColors.neutral600,
    dotColor: PreggaColors.neutral400,
  },
  primary: {
    bg: PreggaColors.primary100,
    color: PreggaColors.primary600,
    dotColor: PreggaColors.primary500,
  },
  accent: {
    bg: PreggaColors.accent100,
    color: PreggaColors.accent500,
    dotColor: PreggaColors.accent400,
  },
  sage: {
    bg: PreggaColors.sage100,
    color: PreggaColors.sage600,
    dotColor: PreggaColors.sage500,
  },
};

export function Badge({ children, variant = "neutral", dot = false, size = "md" }: BadgeProps) {
  const styles = variantStyles[variant];
  const padding = size === "sm" ? "2px 8px" : "4px 12px";
  const fontSize = size === "sm" ? 11 : 12;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding,
        borderRadius: 20,
        fontSize,
        fontWeight: 500,
        background: styles.bg,
        color: styles.color,
        fontFamily: "'Inter', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: styles.dotColor,
          }}
        />
      )}
      {children}
    </span>
  );
}

type StatusType = "active" | "inactive" | "pending" | "expired" | "online" | "offline" | "verified" | "unverified";

interface StatusBadgeProps {
  status: StatusType | string;
}

const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  active: { variant: "success", label: "Active" },
  inactive: { variant: "neutral", label: "Inactive" },
  pending: { variant: "warning", label: "Pending" },
  expired: { variant: "danger", label: "Expired" },
  online: { variant: "success", label: "Online" },
  offline: { variant: "neutral", label: "Offline" },
  verified: { variant: "accent", label: "Verified" },
  unverified: { variant: "warning", label: "Unverified" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || { variant: "neutral" as BadgeVariant, label: status };

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
