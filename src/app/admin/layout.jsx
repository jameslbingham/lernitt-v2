// @ts-nocheck
import React from 'react';
import { getServerSession } from "next-auth/next";
/** * FIXED PATH FOR LERNITT-V2
 * We use two sets of dots (../) to go from /admin/ up to /app/ 
 * and then into /api/ to find the login logic.
 */
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from 'next/link';

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  /**
   * Security Guard: Ensures only users with 'admin' role can enter.
   * Redirects unauthorized users to the home page if they try to sneak in.
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
          <div className="nav-group-label">Overview</div>
          <Link href="/admin/dashboard" className="nav-item">
            <span className="nav-icon">📊</span> Revenue
          </Link>

          <div className="nav-group-label">Management</div>
          <Link href="/admin/users" className="nav-item">
            <span className="nav-icon">👥</span> User Directory
          </Link>
          <Link href="/admin/disputes" className="nav-item">
            <span className="nav-icon">⚖️</span> Lesson Disputes
          </Link>

          <div className="nav-group-label">Finance</div>
          <Link href="/admin/payouts" className="nav-item">
            <span className="nav-icon">💰</span> Payout Requests
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link href="/" className="back-link">← Return to Site</Link>
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
          background: #fdfdfd;
        }
        .admin-sidebar {
          width: 280px;
          background: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          padding: 40px 24px;
        }
        .sidebar-brand {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -1.5px;
          margin-bottom: 48px;
        }
        .sidebar-brand span {
          color: #facc15;
        }
        .nav-group-label {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          color: #555;
          margin: 20px 0 8px 12px;
          letter-spacing: 1px;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .nav-item {
          color: #999;
          text-decoration: none;
          padding: 14px 16px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-item:hover {
          background: #1a1a1a;
          color: #fff;
        }
        .nav-icon {
          font-size: 18px;
        }
        .sidebar-footer {
          border-top: 1px solid #222;
          padding-top: 24px;
        }
        .back-link {
          color: #444;
          text-decoration: none;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .back-link:hover {
          color: #888;
        }
        .admin-main {
          flex: 1;
          padding: 40px;
          overflow-y: auto;
          background: #fff;
        }
      `}</style>
    </div>
  );
}
