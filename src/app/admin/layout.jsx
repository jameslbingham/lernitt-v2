// @ts-nocheck
import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from 'next/link';

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  /**
   * Security Guard: If the user is not logged in or is not an admin,
   * redirect them to the home page immediately.
   */
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="admin-root">
      {/* Persistent Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          LERNITT <span>ADMIN</span>
        </div>
        
        <nav className="sidebar-nav">
          <Link href="/admin/dashboard" className="nav-item">
            <span className="nav-icon">📊</span> Revenue
          </Link>
          <Link href="/admin/disputes" className="nav-item">
            <span className="nav-icon">⚖️</span> Disputes
          </Link>
          <Link href="/admin/users" className="nav-item">
            <span className="nav-icon">👥</span> Users
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link href="/" className="back-link">← Public Site</Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {children}
      </main>

      <style jsx>{`
        .admin-root {
          display: flex;
          min-height: 100vh;
          background: #f9f9f9;
        }
        .admin-sidebar {
          width: 260px;
          background: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          padding: 30px 20px;
        }
        .sidebar-brand {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -1px;
          margin-bottom: 40px;
        }
        .sidebar-brand span {
          color: #facc15;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .nav-item {
          color: #ccc;
          text-decoration: none;
          padding: 12px 15px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: 0.2s;
        }
        .nav-item:hover {
          background: #222;
          color: #fff;
        }
        .nav-icon {
          font-size: 18px;
        }
        .sidebar-footer {
          border-top: 1px solid #333;
          padding-top: 20px;
        }
        .back-link {
          color: #666;
          text-decoration: none;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }
        .admin-main {
          flex: 1;
          padding: 40px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
