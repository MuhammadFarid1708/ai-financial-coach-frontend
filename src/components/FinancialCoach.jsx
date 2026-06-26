import React, { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function FinancialCoach({ onProfileSetupComplete }) {
  const [step, setStep] = useState(1);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState("");
  const [riskTolerance, setRiskTolerance] = useState("Moderate (Balanced Strategy Allocation)");
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const storedUserId = localStorage.getItem("user_id");
    const storedUsername = localStorage.getItem("username") || "User";

    try {
      const res = await fetch(`${API_BASE_URL}/api/save-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: storedUserId,
          username: storedUsername,
          monthly_income: Number(monthlyIncome),
          monthly_expenses: Number(monthlyExpenses),
          savings_goal: Number(monthlySavingsGoal),
          risk_tolerance: riskTolerance,
        }),
      });

      if (!res.ok) throw new Error("Validation Error");

      setStrategy(`Strategy Engine Activated!\n\nMetrics saved successfully into PostgreSQL tables.\n\nMonthly Income: ₹${monthlyIncome}\nMonthly Expenses: ₹${monthlyExpenses}\nSavings Target: ₹${monthlySavingsGoal}\nRisk Profile: ${riskTolerance}`);
      setStep(2); 
    } catch (err) {
      console.error(err);
      alert("Failed to save backend parameters. Ensure backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      {step === 1 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">👋 Let's Setup Your Financial Profile!</h2>
            <p className="text-sm text-slate-400 mt-2">Fill out parameters to link to PostgreSQL securely.</p>
          </div>

          <form onSubmit={handleSubmitProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Monthly Income (INR)</label>
              <input type="number" required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="e.g. 500000" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Monthly Expenses (INR)</label>
              <input type="number" required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)} placeholder="e.g. 50000" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Monthly Savings Goal (INR)</label>
              <input type="number" required className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors" value={monthlySavingsGoal} onChange={(e) => setMonthlySavingsGoal(e.target.value)} placeholder="e.g. 300000" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Risk Tolerance</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors" value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)}>
                <option value="Conservative">Conservative</option>
                <option value="Moderate">Moderate</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50">
              {loading ? "Saving Parameters..." : "OK"}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl text-center">
          <h2 className="text-3xl font-extrabold text-emerald-400 mb-4">Your Custom Strategy Engine 🚀</h2>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-300 text-left mb-6 whitespace-pre-wrap">{strategy}</div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setStep(1)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-6 rounded-xl transition-colors">
              ← Modify Parameters
            </button>
            <button onClick={onProfileSetupComplete} className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-emerald-900/20">
              Proceed to Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}