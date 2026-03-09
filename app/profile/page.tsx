"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single();

    setUsername(data?.username || "");
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    setMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: username.trim(),
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("บันทึกข้อมูลสำเร็จ");
  };

  if (loading) {
    return <div className="card">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="card form-card">
      <h1 className="page-title">โปรไฟล์</h1>
      <p className="page-subtitle">แก้ไขชื่อผู้ใช้ของคุณ</p>

      <div className="form-grid">
        <div className="form-group">
          <label>ชื่อผู้ใช้</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="เช่น Somchai"
          />
        </div>

        <button className="button" onClick={saveProfile} style={{ maxWidth: 180 }}>
          บันทึก
        </button>

        {msg && <div className="msg">{msg}</div>}
      </div>
    </div>
  );
}
