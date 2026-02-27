import { useState, useEffect } from "react";
import { LoginPage } from "./components/auth";
import { PreggaAdminDashboard } from "./PreggaAdminDashboard";

const AUTH_KEY = "pregga_auth";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem(AUTH_KEY);
    setIsAuthenticated(authStatus === "true");
  }, []);

  const handleLogin = (email: string, _password: string) => {
    console.log("Login attempt:", email);
    localStorage.setItem(AUTH_KEY, "true");
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    window.location.hash = "";
  };

  if (isAuthenticated === null) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F1EB",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #E8DFD2",
            borderTopColor: "#8B7355",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <PreggaAdminDashboard onSignOut={handleSignOut} />;
}

export default App;
