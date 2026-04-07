import React, { useState } from "react";
import { PreggaColors, PreggaShadows, PreggaGradients, PreggaTransitions } from "../../theme/colors";
import { Button } from "../ui/Button";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import logoImg from "../../assets/logo.png";

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ error?: string }>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const result = await onLogin(email, password);
    
    setLoading(false);
    
    if (result.error) {
      setErrors({ general: result.error });
    }
  };

  const inputStyle = (field: string, hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    height: 48,
    padding: "12px 16px",
    paddingLeft: 44,
    paddingRight: field === "password" ? 48 : 16,
    borderRadius: 10,
    border: `1px solid ${hasError ? PreggaColors.error400 : focusedField === field ? PreggaColors.accent400 : PreggaColors.neutral200}`,
    fontSize: 15,
    fontFamily: "'Inter', -apple-system, sans-serif",
    outline: "none",
    transition: PreggaTransitions.normal,
    boxSizing: "border-box" as const,
    color: PreggaColors.neutral900,
    background: PreggaColors.white,
    boxShadow: focusedField === field
      ? hasError
        ? PreggaShadows.focusError
        : PreggaShadows.focus
      : "none",
  });

  const iconStyle = (field: string): React.CSSProperties => ({
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: focusedField === field ? PreggaColors.accent500 : PreggaColors.neutral400,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    transition: PreggaTransitions.fast,
  });

  return (
    <div
      style={{
        minHeight: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PreggaGradients.heroGradient,
        fontFamily: "'Inter', sans-serif",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: PreggaColors.white,
          borderRadius: 16,
          boxShadow: PreggaShadows.lg,
          overflow: "hidden",
          margin: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "28px 24px 20px",
            textAlign: "center",
            borderBottom: `1px solid ${PreggaColors.primary100}`,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              overflow: "hidden",
              margin: "0 auto 14px",
              boxShadow: PreggaShadows.sm,
            }}
          >
            <img src={logoImg} alt="Pregga" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: PreggaColors.neutral900,
              margin: 0,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Pregga Admin
          </h1>
          <p
            style={{
              fontSize: 14,
              color: PreggaColors.neutral500,
              margin: "6px 0 0",
            }}
          >
            Sign in to manage your platform
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          <form onSubmit={handleLogin}>
            {errors.general && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 14px",
                  background: PreggaColors.error50,
                  borderRadius: 10,
                  marginBottom: 16,
                  border: `1px solid ${PreggaColors.error200}`,
                }}
              >
                <AlertCircle size={18} color={PreggaColors.error600} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: PreggaColors.error700 }}>
                  {errors.general}
                </span>
              </div>
            )}

            {/* Email Field */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: PreggaColors.neutral700,
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <div style={iconStyle("email")}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle("email", !!errors.email)}
                  required
                />
              </div>
              {errors.email && (
                <div style={{ fontSize: 12, color: PreggaColors.error600, marginTop: 6 }}>
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: PreggaColors.neutral700,
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <div style={iconStyle("password")}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle("password", !!errors.password)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: PreggaColors.neutral400,
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: PreggaTransitions.fast,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = PreggaColors.neutral600;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = PreggaColors.neutral400;
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <div style={{ fontSize: 12, color: PreggaColors.error600, marginTop: 6 }}>
                  {errors.password}
                </div>
              )}
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Sign In
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            background: PreggaColors.cream50,
            borderTop: `1px solid ${PreggaColors.primary100}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 12, color: PreggaColors.neutral500, margin: 0 }}>
            © 2026 Pregga Health. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
