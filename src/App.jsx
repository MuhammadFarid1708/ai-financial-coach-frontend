import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import FinancialCoach from './components/FinancialCoach';

export default function App() {
  const [userSessionId, setUserSessionId] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user has an existing saved active login token
    const savedUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (savedUserId && token) {
      setUserSessionId(savedUserId);
    }
    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = (userId) => {
    setUserSessionId(userId);
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
      {userSessionId ? (
        <FinancialCoach />
      ) : (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}