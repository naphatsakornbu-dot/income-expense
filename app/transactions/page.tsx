"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

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

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchType = filterType === "all" ? true : item.type === filterType;

      const matchSearch =
        search.trim() === ""
          ? true
          : (item.note || "").toLowerCase().includes(search.toLowerCase()) ||
            (item.categories?.name || "").toLowerCase().includes(search.toLowerCase());

      const matchMonth = month ? (item.trans_date || "").startsWith(month) : true;

      return matchType && matchSearch && matchMonth;
    });
  }, [transactions, filterType, search, month]);

  const deleteItem = async (id: string) => {
    const ok = window.confirm("ต้องการลบรายการนี้ใช่หรือไม่?");
    if (!ok) return;

    await supabase.from("transactions").delete().eq("id", id);
    loadData();
  };

  const exportCSV = () => {
    const headers = ["ประเภท", "หมวดหมู่", "จำนวนเงิน", "โน้ต", "วันที่"];
    const rows = filteredTransactions.map((item) => [
      item.type === "income" ? "รายรับ" : "รายจ่าย",
      item.categories?.name || "",
      String(item.amount),
      item.note || "",
      item.trans_date || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <h1 className="page-title">รายการทั้งหมด</h1>
      <p className="page-subtitle">ข้อมูลรายรับและรายจ่ายทั้งหมดของคุณ</p>

      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label>ค้นหา</label>
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาจากโน้ตหรือหมวดหมู่"
          />
        </div>

        <div className="form-group">
          <label>กรองประเภท</label>
          <select className="select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">ทั้งหมด</option>
            <option value="income">รายรับ</option>
            <option value="expense">รายจ่าย</option>
          </select>
        </div>

        <div className="form-group">
          <label>กรองเดือน</label>
          <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      <div className="actions" style={{ marginBottom: 16 }}>
        <a href="/transactions/new" className="button" style={{ maxWidth: 180, textAlign: "center" }}>
          เพิ่มรายการใหม่
        </a>

        <button className="button button-secondary" style={{ maxWidth: 180 }} onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      {loading ? (
        <p className="empty">กำลังโหลดข้อมูล...</p>
      ) : filteredTransactions.length === 0 ? (
        <p className="empty">ไม่พบรายการ</p>
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
                <th>ลบ</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((item) => (
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
                  <td>
                    <button
                      className="button button-danger"
                      style={{ maxWidth: 80 }}
                      onClick={() => deleteItem(item.id)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
