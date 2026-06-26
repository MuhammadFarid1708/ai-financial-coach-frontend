import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import FinancialCoach from './components/FinancialCoach';
import Dashboard from './components/Dashboard';

export default function App() {
  const [userSessionId, setUserSessionId] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [workspaceView, setWorkspaceView] = useState("profile-setup");

  useEffect(() => {
    const savedUserId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    
    if (savedUserId && token) {
      setUserSessionId(savedUserId);
      setWorkspaceView("dashboard"); // Skip setup wizard if session token is already valid
    }
    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = () => {
    const savedUserId = localStorage.getItem('user_id');
    setUserSessionId(savedUserId);
    setWorkspaceView("profile-setup"); // Take new or freshly cleared logins to profile configuration setup wizard
  };

  const handleProfileComplete = () => {
    setWorkspaceView("dashboard");
  };

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ border: '4px solid #334155', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <>
      {!userSessionId ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : workspaceView === "profile-setup" ? (
        <FinancialCoach onProfileSetupComplete={handleProfileComplete} />
      ) : (
        <Dashboard />
      )}
    </>
  );
}