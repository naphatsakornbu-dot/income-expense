"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

export default function CategoriesPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [msg, setMsg] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("type", { ascending: true })
      .order("name", { ascending: true });

    setCategories((data || []) as Category[]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addCategory = async () => {
    setMsg("");

    if (!name.trim()) {
      setMsg("กรุณากรอกชื่อหมวดหมู่");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("categories").insert([
      {
        user_id: user.id,
        name: name.trim(),
        type,
      },
    ]);

    if (error) {
      setMsg(error.message);
      return;
    }

    setName("");
    setMsg("เพิ่มหมวดหมู่สำเร็จ");
    loadData();
  };

  const seedDefault = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const defaultCategories = [
      { name: "อาหาร", type: "expense" },
      { name: "เดินทาง", type: "expense" },
      { name: "ค่าเรียน", type: "expense" },
      { name: "ของใช้", type: "expense" },
      { name: "อื่นๆ", type: "expense" },
      { name: "เงินเดือน", type: "income" },
      { name: "รายได้เสริม", type: "income" },
      { name: "อื่นๆ", type: "income" },
    ];

    const payload = defaultCategories.map((item) => ({
      user_id: user.id,
      name: item.name,
      type: item.type as "income" | "expense",
    }));

    const { error } = await supabase.from("categories").insert(payload);

    if (error) {
      setMsg("อาจมีข้อมูลซ้ำ หรือเพิ่มไม่สำเร็จ");
      return;
    }

    setMsg("เพิ่มหมวดหมู่เริ่มต้นสำเร็จ");
    loadData();
  };

  const removeCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    loadData();
  };

  return (
    <div className="grid grid-2">
      <div className="card">
        <h1 className="page-title">จัดการหมวดหมู่</h1>
        <p className="page-subtitle">เพิ่มหมวดหมู่สำหรับรายรับและรายจ่าย</p>

        <div className="form-grid">
          <div className="form-group">
            <label>ชื่อหมวดหมู่</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น อาหาร"
            />
          </div>

          <div className="form-group">
            <label>ประเภท</label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}>
              <option value="expense">รายจ่าย</option>
              <option value="income">รายรับ</option>
            </select>
          </div>

          <div className="actions">
            <button className="button" onClick={addCategory} style={{ maxWidth: 200 }}>
              เพิ่มหมวดหมู่
            </button>

            <button className="button button-secondary" onClick={seedDefault} style={{ maxWidth: 220 }}>
              เพิ่มหมวดหมู่เริ่มต้น
            </button>
          </div>

          {msg && <div className="msg">{msg}</div>}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>รายการหมวดหมู่</h2>

        {categories.length === 0 ? (
          <p className="empty">ยังไม่มีหมวดหมู่</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ชื่อหมวดหมู่</th>
                  <th>ประเภท</th>
                  <th>ลบ</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <span className={`badge ${item.type === "income" ? "badge-income" : "badge-expense"}`}>
                        {item.type === "income" ? "รายรับ" : "รายจ่าย"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="button button-danger"
                        style={{ maxWidth: 90 }}
                        onClick={() => removeCategory(item.id)}
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
    </div>
  );
}
