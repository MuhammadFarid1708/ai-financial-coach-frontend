import React, { useState, useEffect, useRef } from 'react';

// Unified inner component to display chart data inline inside a chat bubble
function SolidPieChart({ chartData }) {
  const canvasRef = useRef(null);
  const values = chartData?.values || [];

  useEffect(() => {
    if (!canvasRef.current || !chartData) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const total = values.reduce((sum, val) => sum + val, 0);
    if (total === 0) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 90; // Optimized size for inline bubble viewing
    const colors = ['#10b981', '#3b82f6', '#f59e0b'];
    
    let startAngle = 0;
    values.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      startAngle += sliceAngle;
    });

    startAngle = 0;
    values.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      const percentage = Math.round((value / total) * 100);
      const midAngle = startAngle + sliceAngle / 2;
      const textX = centerX + Math.cos(midAngle) * (radius * 0.6);
      const textY = centerY + Math.sin(midAngle) * (radius * 0.6);
      if (percentage > 4) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, textX, textY);
      }
      startAngle += sliceAngle;
    });
  }, [chartData, values]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '20px', backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
      <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500', margin: 0, textAlign: 'center' }}>
        Target Income Distribution Strategy Model:
      </p>
      
      <canvas ref={canvasRef} width="240" height="200" />
      
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#10b981' }}></span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Targeted Savings: <strong style={{ color: '#10b981' }}>₹{Math.round(values[0] || 0).toLocaleString('en-IN')}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#3b82f6' }}></span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Essential Needs: <strong style={{ color: '#3b82f6' }}>₹{Math.round(values[1] || 0).toLocaleString('en-IN')}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#f59e0b' }}></span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Lifestyle Wants: <strong style={{ color: '#f59e0b' }}>₹{Math.round(values[2] || 0).toLocaleString('en-IN')}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FinancialCoach() {
  const [hasProfile, setHasProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [username, setUsername] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [unavoidableExpenses, setUnavoidableExpenses] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [riskTolerance, setRiskTolerance] = useState('Moderate');
  
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('app_username');
    if (savedUsername) setUsername(savedUsername);
    
    const storedIncome = localStorage.getItem('user_monthly_income');
    if (storedIncome) {
      setMonthlyIncome(storedIncome);
      setUnavoidableExpenses(localStorage.getItem('user_unavoidable_expenses') || '0');
      setSavingsGoal(localStorage.getItem('user_savings_goal') || '0');
      setRiskTolerance(localStorage.getItem('user_risk_tolerance') || 'Moderate');
      setHasProfile(true);
      fetchChatSessions();
    } else {
      setShowProfileModal(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchChatSessions = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/sessions/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Error linking sessions history panel:", err);
    }
  };

  const handleStartNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setPrompt('');
  };

  const handleSelectSession = async (session) => {
    setActiveSessionId(session.id);
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const res = await fetch(`http://127.0.0.1:8000/history/${userId}/sessions`);
      
      if (res.ok) {
        const allInsights = await res.json();
        const sessionMessages = allInsights
          .filter(item => item.session_id === session.id)
          .reverse();
        
        const formattedThread = [];
        sessionMessages.forEach(msg => {
          formattedThread.push({ sender: 'user', text: msg.user_prompt });
          formattedThread.push({ sender: 'coach', text: msg.conversational_response, chartData: msg.chart_data });
        });
        
        setMessages(formattedThread);
      }
    } catch (err) {
      console.error("Error context recovery run:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this financial strategy thread?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (activeSessionId === sessionId) {
          handleStartNewChat();
        }
        fetchChatSessions();
      } else {
        alert("Failed to delete session resource from server logs.");
      }
    } catch (err) {
      console.error("Error processing thread drop:", err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const currentUsername = username || localStorage.getItem('app_username') || 'User';
    const totalExpenses = parseFloat(monthlyIncome) - parseFloat(savingsGoal);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username: currentUsername,
          monthly_income: parseFloat(monthlyIncome),
          monthly_expenses: totalExpenses,
          savings_goal: parseFloat(savingsGoal),
          risk_tolerance: riskTolerance
        })
      });

      if (!response.ok) throw new Error('Failed to save backend mapping variables');

      localStorage.setItem('user_monthly_income', monthlyIncome);
      localStorage.setItem('user_unavoidable_expenses', unavoidableExpenses);
      localStorage.setItem('user_savings_goal', savingsGoal);
      localStorage.setItem('user_risk_tolerance', riskTolerance);
      
      setHasProfile(true);
      setShowProfileModal(false);
      fetchChatSessions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmitPrompt = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userId = localStorage.getItem('userId');
    const userPrompt = prompt;
    setPrompt('');

    setMessages((prev) => [...prev, { sender: 'user', text: userPrompt }]);
    setLoading(true);

    let currentSessionId = activeSessionId;

    try {
      if (!currentSessionId) {
        const titleText = userPrompt.length > 26 ? userPrompt.substring(0, 24) + "..." : userPrompt;
        const sessionRes = await fetch('http://127.0.0.1:8000/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, title: titleText })
        });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          currentSessionId = sessionData.session_id;
          setActiveSessionId(currentSessionId);
          fetchChatSessions();
        }
      }

      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          salary: parseFloat(monthlyIncome),
          debt: parseFloat(unavoidableExpenses),
          surplus: parseFloat(savingsGoal),
          session_id: currentSessionId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      setMessages((prev) => [...prev, { sender: 'coach', text: data.strategy, chartData: data.chart_data }]);

      await fetch(`http://127.0.0.1:8000/profile/${userId}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_prompt: userPrompt,
          session_id: currentSessionId,
          conversational_response: data.strategy,
          chart_data: data.chart_data
        })
      });

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR PANEL */}
      <div style={{ width: '300px', backgroundColor: '#020617', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '16px', boxSizing: 'border-box' }}>
        <button onClick={handleStartNewChat} style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', marginBottom: '20px' }}>
          ⊕ New Plan
        </button>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', paddingLeft: '8px', marginBottom: '4px' }}>Recent Strategies</span>
          {sessions.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#334155', paddingLeft: '8px', fontStyle: 'italic' }}>No logged plans yet</div>
          ) : (
            sessions.map((s) => (
              <div 
                key={s.id} 
                onClick={() => handleSelectSession(s)} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px', 
                  borderRadius: '10px', 
                  backgroundColor: activeSessionId === s.id ? '#1e293b' : 'transparent', 
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ color: activeSessionId === s.id ? '#10b981' : '#94a3b8', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: '8px' }}>
                  💬 {s.title}
                </div>
                {/* ─── FIXED: STRIPPED NATIVE USER-AGENT BACKGROUNDS TO CLEAR ACCIDENTAL SQUARE BOXES ─── */}
                <button 
                  onClick={(e) => handleDeleteSession(e, s.id)} 
                  title="Delete strategy thread"
                  style={{ 
                    background: 'transparent', // Explicit transparent layer overrides default grey backgrounds
                    backgroundColor: 'transparent',
                    border: 'none', 
                    outline: 'none',
                    padding: 0,
                    margin: 0,
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer', 
                    transition: 'transform 0.1s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT WORKSPACE CONTEXT VIEWPORT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', boxSizing: 'border-box' }}>
        
        {/* UPPER APP HEADER CONTAINER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '16px', flexShrink: 0 }}>
          <div style={{ padding: 0, margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.025em', color: '#f1f5f9', margin: '0 0 6px 0', padding: 0, fontFamily: 'system-ui, sans-serif' }}>
              AI Financial Workspace
            </h1>
            <span style={{ fontSize: '14px', color: '#94a3b8', margin: 0, padding: 0 }}>
              Welcome, <strong style={{ color: '#10b981', fontSize: '17px', fontWeight: '700', paddingLeft: '2px' }}>{username || 'User'}</strong>
              {hasProfile && (
                <button onClick={() => setShowProfileModal(true)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', marginLeft: '8px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>(Edit Profile)</button>
              )}
            </span>
          </div>
          <button onClick={handleLogout} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>Sign Out</button>
        </div>

        {/* THREAD CONTAINER DISPLAY VIEW */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.6 }}>
              <h2 style={{ fontSize: '22px', color: '#f1f5f9', marginBottom: '8px' }}>AI Financial Coach Active</h2>
              <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '380px', margin: 0, lineHeight: '1.5' }}>
                What financial plan or strategy do you have in mind? Tell me what you are planning to save up for, borrow, or optimize, and I will chart out the parameters.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                <div style={{ 
                  maxWidth: '75%', 
                  backgroundColor: msg.sender === 'user' ? '#1e293b' : '#020617', 
                  border: msg.sender === 'user' ? '1px solid #334155' : '1px solid #1e293b',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
                  padding: '20px', 
                  boxSizing: 'border-box'
                }}>
                  <p style={{ margin: 0, lineHeight: '1.6', color: msg.sender === 'user' ? '#f8fafc' : '#cbd5e1', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                    {msg.text}
                  </p>
                  
                  {msg.sender === 'coach' && msg.chartData && (
                    <SolidPieChart chartData={msg.chartData} />
                  )}
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
              <div style={{ maxWidth: '60%', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px 16px 16px 4px', padding: '16px', color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>
                Coach analysis pipeline calculating parameters...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT LAYOUT TRAY */}
        <form onSubmit={handleSubmitPrompt} style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
          <input 
            type="text" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            disabled={!hasProfile || loading} 
            placeholder={loading ? "Processing transaction metrics..." : "Type a plan or follow up here..."} 
            style={{ flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px', color: '#f8fafc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
          />
          <button type="submit" disabled={!hasProfile || loading} style={{ backgroundColor: '#2563eb', border: 'none', borderRadius: '12px', padding: '0 28px', color: '#fff', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}>
            Send
          </button>
        </form>
      </div>

      {/* MODAL CONFIG OVERLAY */}
      {showProfileModal && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#0f172a', width: '100%', maxWidth: '460px', padding: '32px', borderRadius: '16px', border: '1px solid #1e293b', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#f8fafc', textAlign: 'center' }}>👋 Let's Setup Your Financial Profile!</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>Fill out your core configuration parameters to link securely to PostgreSQL.</p>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Monthly Income (INR)</label>
                <input type="number" required value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="e.g., 75000" style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px 14px', color: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Unavoidable Expenses / Essential Needs (INR)</label>
                <input type="number" required value={unavoidableExpenses} onChange={(e) => setUnavoidableExpenses(e.target.value)} placeholder="e.g., 35000 (Rent, Bills, Food)" style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px 14px', color: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Monthly Savings Goal (INR)</label>
                <input type="number" required value={savingsGoal} onChange={(e) => setSavingsGoal(e.target.value)} placeholder="e.g., 30000" style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px 14px', color: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Risk Tolerance</label>
                <select value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)} style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px 14px', color: '#f8fafc', outline: 'none', boxSizing: 'pointer', cursor: 'pointer' }}>
                  <option value="Low">Low (Conservative Wealth Protection)</option>
                  <option value="Moderate">Moderate (Balanced Strategy Allocation)</option>
                  <option value="High">High (Aggressive Growth Matrix)</option>
                </select>
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', border: 'none', color: '#ffffff', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', marginTop: '10px', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}>OK</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}