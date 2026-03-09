"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push("/dashboard");
        return;
      }

      setCheckingUser(false);
    };

    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    if (!email || !password) {
      setMsg("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    if (password.length < 6) {
      setMsg("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (isRegister && !username.trim()) {
      setMsg("กรุณากรอกชื่อผู้ใช้");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setMsg(signUpError.message);
          setLoading(false);
          return;
        }

        if (data.user?.id) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username: username.trim(),
          });
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setMsg("สมัครสำเร็จ แต่เข้าสู่ระบบอัตโนมัติไม่สำเร็จ กรุณาล็อกอินอีกครั้ง");
          setIsRegister(false);
          setLoading(false);
          return;
        }

        router.push("/dashboard");
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setMsg(loginError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setMsg("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  if (checkingUser) {
    return (
      <div className="card form-card">
        <h1 className="page-title">กำลังตรวจสอบผู้ใช้...</h1>
        <p className="page-subtitle">กรุณารอสักครู่</p>
      </div>
    );
  }

  return (
    <div className="card form-card">
      <h1 className="page-title">{isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}</h1>
      <p className="page-subtitle">ระบบบันทึกรายรับรายจ่ายบน Cloud</p>

      <form onSubmit={handleSubmit} className="form-grid">
        {isRegister && (
          <div className="form-group">
            <label>ชื่อผู้ใช้</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="เช่น Somchai"
            />
          </div>
        )}

        <div className="form-group">
          <label>อีเมล</label>
          <input
            className="input"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>รหัสผ่าน</label>
          <input
            className="input"
            type="password"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? "กำลังดำเนินการ..." : isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
        </button>
      </form>

      <div className="actions" style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setMsg("");
          }}
          className="button button-secondary"
          style={{ maxWidth: 240 }}
        >
          {isRegister ? "มีบัญชีแล้ว? เข้าสู่ระบบ" : "ยังไม่มีบัญชี? สมัครสมาชิก"}
        </button>
      </div>

      {msg && <div className="msg">{msg}</div>}
    </div>
  );
}
