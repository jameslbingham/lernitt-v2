// @ts-nocheck
"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppShell({ children }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', path: '/tutor', icon: '🏠' },
    { label: 'Lessons', path: '/my-lessons', icon: '📅' },
    { label: 'Community', path: '/forum', icon: '💬' },
    { label: 'Notebooks', path: '/student/notebooks', icon: '📝' },
    { label: 'Profile', path: '/tutor/profile', icon: '👤' },
  ];

  return (
    <div className="shell-wrapper">
      <nav className="sidebar">
        <div className="logo">LERNITT</div>
        <div className="nav-links">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`nav-item ${pathname === item.path ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <main className="main-viewport">
        {children}
      </main>

      <style jsx>{`
        .shell-wrapper { display: flex; min-height: 100vh; }
        .sidebar { 
          width: 240px; 
          background: #fff; 
          border-right: 4px solid #000; 
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .logo { 
          font-size: 28px; 
          font-weight: 900; 
          letter-spacing: -2px; 
          margin-bottom: 50px; 
          padding-left: 10px;
        }
        .nav-links { display: flex; flex-direction: column; gap: 10px; }
        .nav-item { 
          display: flex; 
          align-items: center; 
          gap: 15px; 
          padding: 15px; 
          text-decoration: none; 
          color: #000;
          font-weight: 700;
          border-radius: 14px;
          transition: 0.2s;
        }
        .nav-item:hover { background: #f3f4f6; }
        .nav-item.active { background: #000; color: #fff; }
        .icon { font-size: 18px; }
        
        .main-viewport { flex: 1; background: #f9fafb; overflow-y: auto; }
      `}</style>
    </div>
  );
}
