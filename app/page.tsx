"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string; // YYYY-MM-DD
};

const defaultCategories = ["אוכל", "תחבורה", "בילויים", "שכר", "אחר"];

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("אוכל");
  const [date, setDate] = useState("");

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("הכל");
  const [month, setMonth] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);

  // Load
  useEffect(() => {
    const data = localStorage.getItem("transactions");
    if (data) setTransactions(JSON.parse(data));
  }, []);

  // Save
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Month filter
  const monthFiltered = useMemo(() => {
    return transactions.filter((t) =>
      month ? t.date.startsWith(month) : true
    );
  }, [transactions, month]);

  // Search + category
  const filtered = monthFiltered.filter((t) => {
    const matchesSearch = t.title.includes(search);
    const matchesCategory =
      filterCategory === "הכל" || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Totals
  const income = monthFiltered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expense = monthFiltered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const savings = income - expense;

  // Budget is derived from income
  const budget = income;
  const remainingBudget = budget - expense;
  const isOverBudget = remainingBudget < 0;

  // Categories
  const categories = ["הכל", ...new Set(transactions.map((t) => t.category))];

  // Chart (expenses per category)
  const chartData = defaultCategories.map((cat) => {
    const total = monthFiltered
      .filter((t) => t.category === cat && t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    return { name: cat, amount: total };
  });

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("אוכל");
    setDate("");
    setEditId(null);
  };

  const addOrUpdate = () => {
    if (!title || !amount || !date) return;

    if (editId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editId
            ? { ...t, title, amount: Number(amount), type, category, date }
            : t
        )
      );
    } else {
      const newT: Transaction = {
        id: Date.now().toString(),
        title,
        amount: Number(amount),
        type,
        category,
        date,
      };
      setTransactions([newT, ...transactions]);
    }

    resetForm();
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const startEdit = (t: Transaction) => {
    setTitle(t.title);
    setAmount(String(t.amount));
    setType(t.type);
    setCategory(t.category);
    setDate(t.date);
    setEditId(t.id);
  };

  return (
    <main
      className={
        darkMode
          ? "bg-gray-900 text-white min-h-screen p-6"
          : "bg-gray-100 min-h-screen p-6"
      }
    >
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow p-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">💰 SmartBudget</h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 border rounded"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-green-100 p-3 rounded text-center">
            הכנסות <div className="font-bold">₪{income}</div>
          </div>

          <div className="bg-red-100 p-3 rounded text-center">
            הוצאות <div className="font-bold">₪{expense}</div>
          </div>

          <div className="bg-blue-100 p-3 rounded text-center">
            חיסכון <div className="font-bold">₪{savings}</div>
          </div>
        </div>

        {/* Budget */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-4 bg-yellow-100 rounded">
            💰 תקציב (מהכנסות): ₪{budget}
          </div>

          <div
            className={`p-4 rounded ${
              isOverBudget ? "bg-red-200" : "bg-green-200"
            }`}
          >
            💸 נשאר: ₪{remainingBudget}
          </div>
        </div>

        {isOverBudget && (
          <div className="mt-3 p-3 bg-red-100 text-red-700 rounded">
            ⚠️ חרגת מהתקציב!
          </div>
        )}

        {/* Month */}
        <input
          type="month"
          className="mt-4 p-2 border rounded"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        {/* Chart */}
        <div className="h-64 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#111827" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filters */}
        <div className="mt-6 flex gap-2">
          <input
            className="flex-1 p-2 border rounded"
            placeholder="חיפוש..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-2 border rounded"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Form */}
        <div className="mt-6 space-y-2">
          <input
            className="w-full border p-2 rounded"
            placeholder="כותרת"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="סכום"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className="w-full border p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="expense">הוצאה</option>
            <option value="income">הכנסה</option>
          </select>

          <select
            className="w-full border p-2 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {defaultCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <input
            type="date"
            className="w-full border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button
            onClick={addOrUpdate}
            className="w-full bg-black text-white p-2 rounded"
          >
            {editId ? "עדכן עסקה" : "הוסף עסקה"}
          </button>
        </div>

        {/* List */}
        <div className="mt-6 space-y-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <div>
                <div className="font-bold">{t.title}</div>
                <div className="text-xs text-gray-500">
                  {t.category} | {t.date}
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <span
                  className={
                    t.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  ₪{t.amount}
                </span>

                <button onClick={() => startEdit(t)}>✏️</button>
                <button onClick={() => deleteTransaction(t.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}