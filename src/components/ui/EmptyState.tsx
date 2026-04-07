import React from "react";
import { PreggaColors } from "../../theme/colors";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: PreggaColors.sage100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: PreggaColors.sage400,
          marginBottom: 16,
        }}
      >
        {icon || <Inbox size={26} />}
      </div>
      <h3 
        style={{ 
          fontSize: 16, 
          fontWeight: 600, 
          color: PreggaColors.neutral900, 
          margin: 0, 
          marginBottom: 6,
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        {title}
      </h3>
      {description && (
        <p 
          style={{ 
            fontSize: 13, 
            color: PreggaColors.neutral500, 
            margin: 0, 
            marginBottom: action ? 16 : 0, 
            maxWidth: 320, 
            lineHeight: 1.5,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
