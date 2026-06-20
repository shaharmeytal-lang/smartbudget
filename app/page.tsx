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

export default function Page() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("אוכל");
  const [date, setDate] = useState("");

  const [editId, setEditId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");

  // 📥 Load data
  const load = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    setTransactions((data as Transaction[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  // 💾 Save (insert / update)
  const save = async () => {
    if (!title || !amount || !date) return;

    if (editId) {
      await supabase
        .from("transactions")
        .update({
          title,
          amount: Number(amount),
          type,
          category,
          date,
        })
        .eq("id", editId);
    } else {
      await supabase.from("transactions").insert([
        {
          title,
          amount: Number(amount),
          type,
          category,
          date,
        },
      ]);
    }

    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("אוכל");
    setDate("");
    setEditId(null);

    load();
  };

  // 🗑 Delete
  const remove = async (id: string) => {
    await supabase.from("transactions").delete().eq("id", id);
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

  // 📅 Filter by month
  const monthFiltered = useMemo(() => {
    return transactions.filter((t) =>
      month ? t.date.startsWith(month) : true
    );
  }, [transactions, month]);

  // 🔎 Search
  const filtered = monthFiltered.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  // 💰 totals
  const income = monthFiltered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expense = monthFiltered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const balance = income - expense;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">

        <h1 className="text-2xl font-bold mb-4">💰 SmartBudget</h1>

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>הכנסות: ₪{income}</div>
          <div>הוצאות: ₪{expense}</div>
          <div>יתרה: ₪{balance}</div>
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 mb-4">
          <input
            className="border p-2 flex-1"
            placeholder="חיפוש..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="month"
            className="border p-2"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        {/* FORM */}
        <div className="space-y-2 mb-6">

          <input
            className="border p-2 w-full"
            placeholder="כותרת"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="border p-2 w-full"
            placeholder="סכום (ניתן להקליד)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className="border p-2 w-full"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="expense">הוצאה</option>
            <option value="income">הכנסה</option>
          </select>

          <select
            className="border p-2 w-full"
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
            className="border p-2 w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button
            onClick={save}
            className="bg-black text-white w-full p-2"
          >
            {editId ? "עדכן" : "הוסף"}
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex justify-between border p-2 rounded bg-white"
            >
              <div>
                <div className="font-bold">{t.title}</div>
                <div className="text-xs text-gray-500">
                  {t.category} | {t.date}
                </div>
              </div>

              <div className="flex gap-2 items-center">
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
                <button onClick={() => remove(t.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}