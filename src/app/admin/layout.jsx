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
