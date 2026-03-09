"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

export default function NewTransaction() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transDate, setTransDate] = useState(today);
  const [categoryId, setCategoryId] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = async (currentType: "income" | "expense") => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("type", currentType)
      .order("name", { ascending: true });

    if (!error && data) {
      setCategories(data as Category[]);
      setCategoryId(data.length > 0 ? data[0].id : "");
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      await loadCategories(type);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (!loading) {
      loadCategories(type);
    }
  }, [type]);

  const saveData = async () => {
    setMsg("");

    if (!amount || Number(amount) <= 0) {
      setMsg("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        type,
        amount: Number(amount),
        note: note.trim() || null,
        trans_date: transDate,
        category_id: categoryId || null,
      },
    ]);

    if (error) {
      setMsg(error.message);
      return;
    }

    setAmount("");
    setNote("");
    setMsg("บันทึกสำเร็จ");
  };

  if (loading) {
    return <div className="card">กำลังตรวจสอบผู้ใช้...</div>;
  }

  return (
    <div className="card form-card">
      <h1 className="page-title">เพิ่มรายการ</h1>
      <p className="page-subtitle">บันทึกรายรับหรือรายจ่ายใหม่</p>

      <div className="form-grid">
        <div className="form-group">
          <label>ประเภท</label>
          <select className="select" value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}>
            <option value="expense">รายจ่าย</option>
            <option value="income">รายรับ</option>
          </select>
        </div>

        <div className="form-group">
          <label>หมวดหมู่</label>
          <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.length === 0 ? (
              <option value="">ยังไม่มีหมวดหมู่</option>
            ) : (
              categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group">
          <label>จำนวนเงิน</label>
          <input
            className="input"
            type="number"
            placeholder="เช่น 150"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>วันที่</label>
          <input className="input" type="date" value={transDate} onChange={(e) => setTransDate(e.target.value)} />
        </div>

        <div className="form-group">
          <label>โน้ต</label>
          <textarea
            className="textarea"
            placeholder="รายละเอียดเพิ่มเติม"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="actions">
          <button className="button" onClick={saveData} style={{ maxWidth: 180 }}>
            บันทึกข้อมูล
          </button>

          <button
            className="button button-secondary"
            onClick={() => router.push("/categories")}
            style={{ maxWidth: 180 }}
          >
            จัดการหมวดหมู่
          </button>
        </div>

        {msg && <div className="msg">{msg}</div>}
      </div>
    </div>
  );
}
