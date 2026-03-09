"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  note: string | null;
  trans_date: string | null;
  category_id: string | null;
  categories?: {
    name: string;
  } | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    setUsername(profile?.username || user.email || "ผู้ใช้");

    const { data, error } = await supabase
      .from("transactions")
      .select("id,type,amount,note,trans_date,category_id,categories(name)")
      .order("trans_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data as unknown as Transaction[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = income - expense;

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  const pieData = useMemo(() => {
    const expenseItems = transactions.filter((item) => item.type === "expense");
    const grouped: Record<string, number> = {};

    expenseItems.forEach((item) => {
      const name = item.categories?.name || "ไม่ระบุหมวดหมู่";
      grouped[name] = (grouped[name] || 0) + Number(item.amount);
    });

    return {
      labels: Object.keys(grouped),
      datasets: [
        {
          label: "รายจ่ายตามหมวดหมู่",
          data: Object.values(grouped),
          backgroundColor: [
            "#ef4444",
            "#f97316",
            "#eab308",
            "#22c55e",
            "#3b82f6",
            "#8b5cf6",
            "#ec4899",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [transactions]);

  const barData = useMemo(() => {
    const grouped: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((item) => {
      const day = item.trans_date || "ไม่ระบุวันที่";
      if (!grouped[day]) grouped[day] = { income: 0, expense: 0 };

      if (item.type === "income") grouped[day].income += Number(item.amount);
      else grouped[day].expense += Number(item.amount);
    });

    const labels = Object.keys(grouped).sort();

    return {
      labels,
      datasets: [
        {
          label: "รายรับ",
          data: labels.map((day) => grouped[day].income),
          backgroundColor: "#22c55e",
        },
        {
          label: "รายจ่าย",
          data: labels.map((day) => grouped[day].expense),
          backgroundColor: "#ef4444",
        },
      ],
    };
  }, [transactions]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">ยินดีต้อนรับ: {username}</p>

        <div className="actions">
          <a href="/transactions/new" className="button" style={{ maxWidth: 180, textAlign: "center" }}>
            เพิ่มรายการ
          </a>
          <a href="/transactions" className="button button-secondary" style={{ maxWidth: 180, textAlign: "center" }}>
            ดูรายการทั้งหมด
          </a>
          <a href="/categories" className="button button-secondary" style={{ maxWidth: 180, textAlign: "center" }}>
            หมวดหมู่
          </a>
          <button onClick={handleLogout} className="button button-secondary" style={{ maxWidth: 180 }}>
            ออกจากระบบ
          </button>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="stat-card stat-income">
          <div className="stat-label">รายรับรวม</div>
          <div className="stat-value">{income.toFixed(2)} บาท</div>
        </div>

        <div className="stat-card stat-expense">
          <div className="stat-label">รายจ่ายรวม</div>
          <div className="stat-value">{expense.toFixed(2)} บาท</div>
        </div>

        <div className="stat-card stat-balance">
          <div className="stat-label">คงเหลือสุทธิ</div>
          <div className="stat-value">{balance.toFixed(2)} บาท</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card chart-card">
          <h2 style={{ marginTop: 0 }}>กราฟรายจ่ายตามหมวดหมู่</h2>
          {pieData.labels.length === 0 ? (
            <p className="empty">ยังไม่มีข้อมูลรายจ่าย</p>
          ) : (
            <Pie data={pieData} options={chartOptions} />
          )}
        </div>

        <div className="card chart-card">
          <h2 style={{ marginTop: 0 }}>กราฟรายรับเทียบรายจ่ายรายวัน</h2>
          {barData.labels.length === 0 ? (
            <p className="empty">ยังไม่มีข้อมูล</p>
          ) : (
            <Bar data={barData} options={chartOptions} />
          )}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>รายการล่าสุด</h2>

        {loading ? (
          <p className="empty">กำลังโหลด...</p>
        ) : transactions.length === 0 ? (
          <p className="empty">ยังไม่มีข้อมูลรายการ</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ประเภท</th>
                  <th>หมวดหมู่</th>
                  <th className="text-right">จำนวนเงิน</th>
                  <th>โน้ต</th>
                  <th>วันที่</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className={`badge ${item.type === "income" ? "badge-income" : "badge-expense"}`}>
                        {item.type === "income" ? "รายรับ" : "รายจ่าย"}
                      </span>
                    </td>
                    <td>{item.categories?.name || "-"}</td>
                    <td className="text-right">{Number(item.amount).toFixed(2)}</td>
                    <td>{item.note || "-"}</td>
                    <td>{item.trans_date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}