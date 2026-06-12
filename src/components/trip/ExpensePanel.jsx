import { useState } from "react";
import { useTrips } from "../../context/TripContext.jsx";
import Button from "../ui/Button.jsx";

function computeBalances(expenses, travelers) {
  const balances = {};
  travelers.forEach((t) => {
    balances[t.id] = 0;
  });

  expenses.forEach((exp) => {
    const splitCount = exp.splitAmong?.length || travelers.length;
    const share = exp.amount / splitCount;
    balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
    (exp.splitAmong || travelers.map((t) => t.id)).forEach((id) => {
      balances[id] = (balances[id] || 0) - share;
    });
  });

  return balances;
}

export default function ExpensePanel({ trip }) {
  const { addExpense, removeExpense } = useTrips();
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(trip.travelers[0]?.id || "");
  const expenses = trip.expenses || [];
  const travelers = trip.travelers || [];
  const balances = computeBalances(expenses, travelers);

  function handleAdd(e) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!desc.trim() || !num || num <= 0) return;
    addExpense(trip.id, {
      description: desc.trim(),
      amount: num,
      paidBy,
      splitAmong: travelers.map((t) => t.id),
      date: new Date().toISOString().slice(0, 10),
    });
    setDesc("");
    setAmount("");
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Expenses (Splitwise-style)</h3>

      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Dinner, taxi, tickets..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {travelers.map((t) => (
              <option key={t.id} value={t.id}>
                Paid by {t.name}
              </option>
            ))}
          </select>
          <Button type="submit">Add</Button>
        </div>
      </form>

      {expenses.length > 0 && (
        <>
          <ul className="space-y-2">
            {expenses.map((exp) => {
              const payer = travelers.find((t) => t.id === exp.paidBy);
              return (
                <li
                  key={exp.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <span>
                    {exp.description} — ${exp.amount.toFixed(2)} ({payer?.name})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExpense(trip.id, exp.id)}
                    className="text-red-500"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="rounded-lg border border-slate-200 p-3">
            <p className="mb-2 text-sm font-medium text-slate-700">Balances</p>
            {travelers.map((t) => (
              <p key={t.id} className="text-sm text-slate-600">
                {t.name}:{" "}
                <span
                  className={
                    balances[t.id] >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {balances[t.id] >= 0 ? "+" : ""}
                  ${balances[t.id].toFixed(2)}
                </span>
              </p>
            ))}
            <p className="mt-2 text-xs text-slate-400">
              Positive = owed to them. Negative = they owe others.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
