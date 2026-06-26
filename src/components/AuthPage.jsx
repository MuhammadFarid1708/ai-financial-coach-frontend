import React, { useState } from 'react';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (!isLogin && !username.trim())) return;

    setError('');

    // PASSWORD VALIDATION ENGINE (Only for Sign Up)
    if (!isLogin) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (/\s/.test(password)) {
        setError('Password cannot contain spaces.');
        return;
      }
      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/]/;
      if (!specialCharRegex.test(password)) {
        setError('Password must contain at least one special character (e.g., @, #, $, %).');
        return;
      }
    }

    setLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    
    try {
      let response;
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', email.trim()); 
        formData.append('password', password);

        response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData,
        });
      } else {
        response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            username: username.trim(),
            password: password
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        let fallbackMsg = 'Authentication failed';
        if (data.detail) {
          if (typeof data.detail === 'string') fallbackMsg = data.detail;
          else if (Array.isArray(data.detail)) fallbackMsg = data.detail[0]?.msg || fallbackMsg;
        }
        throw new Error(fallbackMsg);
      }

      if (isLogin) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('app_username', data.username || email.trim().split('@')[0]);
        onLoginSuccess(data.user_id);
      } else {
        setIsLogin(true);
        setError('Account created successfully! Please sign in.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', margin: 0 }}>
      <div style={{ backgroundColor: '#0f172a', width: '100%', maxWidth: '400px', padding: '40px', borderRadius: '16px', border: '1px solid #1e293b', boxSizing: 'border-box', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
        
        {/* Header Block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #334155' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-3"/></svg>
          </div>
          <h1 style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', textAlign: 'center', margin: '6px 0 0 0' }}>
            {isLogin ? 'Sign in to access your workspace' : 'Sign up to build your custom strategy engine'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: error.includes('successfully') ? '#064e3b' : '#7f1d1d', color: error.includes('successfully') ? '#34d399' : '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: error.includes('successfully') ? '1px solid #047857' : '1px solid #991b1b', wordBreak: 'break-word' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* ALWAYS DISPLAY THE EMAIL FIELD */}
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Email Address</label>
            <input
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., mail@example.com"
              required
              style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px 14px', color: '#f8fafc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* DISPLAY USERNAME FIELD ONLY ON SIGN UP */}
          {!isLogin && (
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Username</label>
              <input
                type="text"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., BrokeBillionaire"
                required={!isLogin}
                style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px 14px', color: '#f8fafc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* ALWAYS DISPLAY PASSWORD FIELD */}
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px 50px 12px 14px', color: '#f8fafc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: 0 }}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '14px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '14px' }}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>

      </div>
    </div>
  );
}