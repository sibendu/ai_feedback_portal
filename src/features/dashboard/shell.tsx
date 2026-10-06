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

type IconComponent = (props: { className?: string }) => React.ReactNode;

type NavChildItem = {
  href: string;
  label: string;
};

type NavItem =
  | {
      href: string;
      label: string;
      icon: IconComponent;
    }
  | {
      id: "feedback" | "configure";
      label: string;
      icon: IconComponent;
      children: NavChildItem[];
    };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  {
    id: "feedback",
    label: "Feedback",
    icon: FeedbackIcon,
    children: [
      { href: "/dashboard/feedback/provide", label: "Provide Feedback" },
      { href: "/dashboard/feedback/past", label: "Past Feedbacks" }
    ]
  },
  {
    id: "configure",
    label: "Configure",
    icon: ConfigureIcon,
    children: [
      { href: "/dashboard/configure/profile", label: "Profile" },
      { href: "/dashboard/configure/change-password", label: "Change Password" }
    ]
  }
];

type ExpandableNavItem = Extract<NavItem, { children: NavChildItem[] }>;
type ExpandedSectionState = Record<ExpandableNavItem["id"], boolean>;

function getActiveExpandedSections(pathname: string): ExpandedSectionState {
  return {
    feedback: pathname.startsWith("/dashboard/feedback"),
    configure: pathname.startsWith("/dashboard/configure")
  };
}

export function DashboardShell({ children, user, onLogout }: DashboardShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [expandedSections, setExpandedSections] = useState<ExpandedSectionState>(() =>
    getActiveExpandedSections(pathname)
  );

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("dashboard-theme");
    const initialTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
    setTheme(initialTheme);
    document.documentElement.dataset.dashboardTheme = initialTheme;
  }, []);

  useEffect(() => {
    const activeSections = getActiveExpandedSections(pathname);
    setExpandedSections((current) => ({
      feedback: current.feedback || activeSections.feedback,
      configure: current.configure || activeSections.configure
    }));
  }, [pathname]);

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
            const hasChildren = "children" in item;

            if (!hasChildren) {
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
            }

            const isExpanded = expandedSections[item.id];
            const isParentActive = item.children.some((child) => pathname === child.href);

            return (
              <div className="dashboard-nav-group" key={item.id}>
                <button
                  className={`dashboard-nav-link dashboard-nav-button${isParentActive ? " is-active" : ""}`}
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`dashboard-nav-${item.id}`}
                  title={collapsed ? item.label : undefined}
                  onClick={() =>
                    setExpandedSections((current) => ({
                      ...current,
                      [item.id]: !current[item.id]
                    }))
                  }
                >
                  <Icon className="dashboard-icon" />
                  <span>{item.label}</span>
                </button>
                <div
                  className="dashboard-nav-children"
                  id={`dashboard-nav-${item.id}`}
                  hidden={!isExpanded}
                >
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href;

                    return (
                      <Link
                        className={`dashboard-nav-child-link${isChildActive ? " is-active" : ""}`}
                        href={child.href}
                        aria-current={isChildActive ? "page" : undefined}
                        key={child.href}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
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
