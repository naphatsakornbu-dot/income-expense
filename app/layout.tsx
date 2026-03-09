import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Money App",
  description: "ระบบบันทึกรายรับรายจ่ายบน Cloud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="sidebar-title">Money App</div>
            <nav className="sidebar-nav">
              <Link href="/">หน้าแรก</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/transactions">รายการ</Link>
              <Link href="/transactions/new">เพิ่มรายการ</Link>
              <Link href="/categories">หมวดหมู่</Link>
              <Link href="/profile">โปรไฟล์</Link>
              <Link href="/login">Login</Link>
            </nav>
          </aside>

          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
