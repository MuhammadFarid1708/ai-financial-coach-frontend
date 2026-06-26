import React, { useState, useEffect } from "react";

// Dynamically use Vercel production environment variable or fall back to local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function FinancialCoach() {
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

    // Pull active authentication context values stored during login
    const storedUserId = localStorage.getItem("user_id");
    const storedUsername = localStorage.getItem("username") || "User";

    try {
      // FIX: Used proper backticks (`) for string evaluation to fix the 404 /%7B%7B bug
      const res = await fetch(`${API_BASE_URL}/api/save-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: storedUserId,
          username: storedUsername,
          monthly_income: Number(monthlyIncome),
          monthly_expenses: Number(monthlyExpenses), // Matches backend variable name exactly
          savings_goal: Number(monthlySavingsGoal),    // Matches backend variable name exactly
          risk_tolerance: riskTolerance,
        }),
      });

      if (!res.ok) {
        throw new Error("Server responded with a validation error");
      }

      const data = await res.json();
      
      setStrategy(`Strategy Engine Activated!\n\nMetrics saved successfully into PostgreSQL tables.\n\nMonthly Income: ₹${monthlyIncome}\nMonthly Expenses: ₹${monthlyExpenses}\nSavings Target: ₹${monthlySavingsGoal}\nRisk Profile: ${riskTolerance}`);
      setStep(2); 
    } catch (err) {
      console.error(err);
      alert("Failed to save backend mapping variables. Ensure user context is loaded.");
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
            <p className="text-sm text-slate-400 mt-2">
              Fill out your core configuration parameters to link securely to PostgreSQL.
            </p>
          </div>

          <form onSubmit={handleSubmitProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Monthly Income (INR)
              </label>
              <input
                type="number"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="e.g. 500000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Monthly Expenses / Essential Needs (INR)
              </label>
              <input
                type="number"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                placeholder="e.g. 50000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Monthly Savings Goal (INR)
              </label>
              <input
                type="number"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                value={monthlySavingsGoal}
                onChange={(e) => setMonthlySavingsGoal(e.target.value)}
                placeholder="e.g. 300000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Risk Tolerance
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
              >
                <option value="Conservative (Capital Preservation Focus)">Conservative (Capital Preservation Focus)</option>
                <option value="Moderate (Balanced Strategy Allocation)">Moderate (Balanced Strategy Allocation)</option>
                <option value="Aggressive (High-Growth Market Focus)">Aggressive (High-Growth Market Focus)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {loading ? "Saving Parameters..." : "OK"}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
          <h2 className="text-3xl font-extrabold text-emerald-400 mb-4">Your Custom Strategy Engine 🚀</h2>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-300 leading-relaxed whitespace-pre-wrap">
            {strategy}
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            ← Modify Parameters
          </button>
        </div>
      )}
    </div>
  );
}