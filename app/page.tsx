"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
};

const resetForm = {
  title: "",
  amount: "",
  type: "expense" as "income" | "expense",
  category: "אוכל",
};

export default function Page() {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [title, setTitle] = useState(resetForm.title);
  const [amount, setAmount] = useState(resetForm.amount);
  const [type, setType] = useState<"income" | "expense">(resetForm.type);
  const [category, setCategory] = useState(resetForm.category);
  const [date, setDate] = useState(today);

  const [editId, setEditId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(currentMonth);

  // 📥 Load data
  const load = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      alert(`שגיאה בטעינת הנתונים: ${error.message}`);
      return;
    }

    setTransactions((data as Transaction[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  // 🧹 Reset form
  const clearForm = () => {
    setTitle(resetForm.title);
    setAmount(resetForm.amount);
    setType(resetForm.type);
    setCategory(resetForm.category);
    setDate(today);
    setEditId(null);
  };

  // 💾 Save / Update
  const save = async () => {
    if (!title.trim()) {
      alert("יש להזין כותרת");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("יש להזין סכום תקין");
      return;
    }

    if (!date) {
      alert("יש לבחור תאריך");
      return;
    }

    let error;

    if (editId) {
      ({ error } = await supabase
        .from("transactions")
        .update({
          title: title.trim(),
          amount: Number(amount),
          type,
          category,
          date,
        })
        .eq("id", editId));
    } else {
      ({ error } = await supabase
        .from("transactions")
        .insert([
          {
            title: title.trim(),
            amount: Number(amount),
            type,
            category,
            date,
          },
        ]));
    }

    if (error) {
      alert(error.message);
      return;
    }

    clearForm();
    load();
  };

  // 🗑 Delete
  const remove = async (id: string) => {
    const confirmed = confirm("למחוק את העסקה?");

    if (!confirmed) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    load();
  };

  // ✏️ Edit
  const startEdit = (t: Transaction) => {
    setTitle(t.title);
    setAmount(String(t.amount));
    setType(t.type);
    setCategory(t.category);
    setDate(t.date);
    setEditId(t.id);
  };

  // 📅 Month filter
  const monthFiltered = useMemo(() => {
    return transactions.filter((t) =>
      month ? t.date.startsWith(month) : true
    );
  }, [transactions, month]);

  // 🔎 Search filter
  const filtered = useMemo(() => {
    return monthFiltered.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [monthFiltered, search]);

  // 💰 Summary
  const income = monthFiltered
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = monthFiltered
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        {/* TITLE */}
        <h1 className="text-2xl font-bold mb-4">
          💰 SmartBudget
        </h1>

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-500">הכנסות</div>
            <div className="text-lg font-bold text-green-600">
              ₪{income}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500">הוצאות</div>
            <div className="text-lg font-bold text-red-600">
              ₪{expense}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500">יתרה</div>
            <div
              className={`text-lg font-bold ${
                balance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₪{balance}
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 mb-4">
          <input
            className="border p-2 flex-1 rounded"
            placeholder="חיפוש..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="month"
            className="border p-2 rounded"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        {/* FORM */}
        <div className="space-y-2 mb-6">
          <input
            className="border p-2 w-full rounded"
            placeholder="כותרת"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="number"
            min="0"
            step="0.01"
            className="border p-2 w-full rounded"
            placeholder="סכום"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className="border p-2 w-full rounded"
            value={type}
            onChange={(e) =>
              setType(e.target.value as "income" | "expense")
            }
          >
            <option value="expense">הוצאה</option>
            <option value="income">הכנסה</option>
          </select>

          <select
            className="border p-2 w-full rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>אוכל</option>
            <option>תחבורה</option>
            <option>בילויים</option>
            <option>שכר</option>
            <option>אחר</option>
          </select>

          <input
            type="date"
            className="border p-2 w-full rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button
            onClick={save}
            className="bg-black text-white w-full p-2 rounded hover:opacity-90"
          >
            {editId ? "עדכן עסקה" : "הוסף עסקה"}
          </button>

          {editId && (
            <button
              onClick={clearForm}
              className="border w-full p-2 rounded"
            >
              ביטול עריכה
            </button>
          )}
        </div>

        {/* LIST */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              אין עסקאות להצגה
            </div>
          )}

          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex justify-between border p-3 rounded bg-white"
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
                      ? "font-bold text-green-600"
                      : "font-bold text-red-600"
                  }
                >
                  ₪{t.amount}
                </span>

                <button
                  onClick={() => startEdit(t)}
                  title="עריכה"
                >
                  ✏️
                </button>

                <button
                  onClick={() => remove(t.id)}
                  title="מחיקה"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}