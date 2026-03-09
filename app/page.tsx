import Link from "next/link";

export default function Home() {
  return (
    <div className="hero">
      <h1>ระบบบันทึกรายรับรายจ่ายบน Cloud</h1>
      <p>
        โปรเจกต์นี้ใช้ Next.js + Supabase สำหรับจัดเก็บรายรับ รายจ่าย
        แสดงผล Dashboard พร้อมกราฟ และจัดการข้อมูลผ่าน Cloud
      </p>

      <div className="actions">
        <Link href="/login" className="button" style={{ maxWidth: 180, textAlign: "center" }}>
          เริ่มใช้งาน
        </Link>
        <Link
          href="/dashboard"
          className="button button-secondary"
          style={{ maxWidth: 180, textAlign: "center" }}
        >
          ไป Dashboard
        </Link>
      </div>
    </div>
  );
}
