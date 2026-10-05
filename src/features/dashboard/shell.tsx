"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ConfigureIcon, FeedbackIcon, HomeIcon, LogoutIcon, MenuIcon, MoonIcon, SunIcon } from "./icons";
import type { DashboardUser } from "./session";

type DashboardShellProps = {
  children: React.ReactNode;
  user: DashboardUser;
  onLogout: () => Promise<void>;
};

const navItems = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/dashboard/feedback-request", label: "Feedback Request", icon: FeedbackIcon },
  { href: "/dashboard/configure", label: "Configure", icon: ConfigureIcon }
];

export function DashboardShell({ children, user, onLogout }: DashboardShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("dashboard-theme");
    const initialTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
    setTheme(initialTheme);
    document.documentElement.dataset.dashboardTheme = initialTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("dashboard-theme", nextTheme);
    document.documentElement.dataset.dashboardTheme = nextTheme;
  }

  return (
    <div className={`dashboard-shell${collapsed ? " is-collapsed" : ""}`}>
      <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
        <div className="dashboard-sidebar-header">
          <Link className="dashboard-brand" href="/dashboard" aria-label="Dashboard home">
            <span className="brand-mark" aria-hidden="true">CF</span>
            <span className="dashboard-brand-text">Customer Feedback Portal</span>
          </Link>
          <button
            className="icon-button"
            type="button"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((current) => !current)}
          >
            <MenuIcon className="dashboard-icon" />
          </button>
        </div>
        <nav className="dashboard-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                className={`dashboard-nav-link${isActive ? " is-active" : ""}`}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                key={item.href}
              >
                <Icon className="dashboard-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="dashboard-workspace">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-title">
            <span>Dashboard</span>
          </div>
          <div className="dashboard-session">
            <span className="dashboard-user" title={user.email ?? user.name}>{user.name}</span>
            <button
              className="icon-button"
              type="button"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <SunIcon className="dashboard-icon" /> : <MoonIcon className="dashboard-icon" />}
            </button>
            <form action={onLogout}>
              <button className="logout-button" type="submit">
                <LogoutIcon className="dashboard-icon" />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </header>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
