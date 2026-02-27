import React, { useState } from "react";
import { PreggaColors, PreggaShadows, PreggaGradients } from "../../theme/colors";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Baby, Eye, EyeOff, ArrowLeft, Mail, Lock, CheckCircle } from "lucide-react";

type AuthView = "login" | "forgot" | "email-sent";

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [resetEmail, setResetEmail] = useState("");

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

    setTimeout(() => {
      onLogin(email, password);
      setLoading(false);
    }, 1000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !validateEmail(resetEmail)) {
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView("email-sent");
    }, 1000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PreggaGradients.heroGradient,
        fontFamily: "'Inter', sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: PreggaColors.white,
          borderRadius: 20,
          boxShadow: PreggaShadows.lg,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "32px 32px 24px",
            textAlign: "center",
            borderBottom: `1px solid ${PreggaColors.primary100}`,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: PreggaColors.terracotta500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: PreggaColors.white,
            }}
          >
            <Baby size={28} />
          </div>
          <h1
            style={{
              fontSize: 26,
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
              margin: "8px 0 0",
            }}
          >
            {view === "login" && "Sign in to manage your platform"}
            {view === "forgot" && "Reset your password"}
            {view === "email-sent" && "Check your inbox"}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: 32 }}>
          {view === "login" && (
            <form onSubmit={handleLogin}>
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@pregga.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                error={errors.email}
                icon={<Mail size={16} />}
                required
              />

              <div style={{ position: "relative" }}>
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  error={errors.password}
                  icon={<Lock size={16} />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: 36,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: PreggaColors.neutral400,
                    padding: 4,
                    display: "flex",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 20,
                }}
              >
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  style={{
                    background: "none",
                    border: "none",
                    color: PreggaColors.primary600,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" fullWidth loading={loading} size="lg">
                Sign In
              </Button>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgotPassword}>
              <button
                type="button"
                onClick={() => setView("login")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  color: PreggaColors.neutral600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  marginBottom: 20,
                  padding: 0,
                }}
              >
                <ArrowLeft size={16} />
                Back to sign in
              </button>

              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                icon={<Mail size={16} />}
                required
              />

              <p
                style={{
                  fontSize: 13,
                  color: PreggaColors.neutral500,
                  marginBottom: 20,
                }}
              >
                We'll send you a link to reset your password.
              </p>

              <Button type="submit" fullWidth loading={loading} size="lg">
                Send Reset Link
              </Button>
            </form>
          )}

          {view === "email-sent" && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: PreggaColors.success100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  color: PreggaColors.success600,
                }}
              >
                <CheckCircle size={32} />
              </div>

              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: PreggaColors.neutral900,
                  margin: "0 0 8px",
                }}
              >
                Email Sent!
              </h3>

              <p
                style={{
                  fontSize: 14,
                  color: PreggaColors.neutral500,
                  marginBottom: 24,
                }}
              >
                We've sent a password reset link to{" "}
                <strong style={{ color: PreggaColors.neutral700 }}>{resetEmail}</strong>
              </p>

              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => {
                  setView("login");
                  setResetEmail("");
                }}
              >
                Return to Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 32px",
            background: PreggaColors.cream50,
            borderTop: `1px solid ${PreggaColors.primary100}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 12, color: PreggaColors.neutral500, margin: 0 }}>
            © 2026 Pregga. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
