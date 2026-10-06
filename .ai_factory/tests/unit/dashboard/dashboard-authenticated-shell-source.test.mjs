import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../../../${path}`, import.meta.url), "utf8");

test("dashboard layout protects authenticated content with Auth.js session", () => {
  const source = read("src/app/dashboard/layout.tsx");

  assert.match(source, /const session = await auth\(\)/);
  assert.match(source, /getDashboardUser\(session\)/);
  assert.match(source, /if \(!user\) \{\s*redirect\("\/sign-in\?callbackUrl=\/dashboard"\)/);
  assert.match(source, /<DashboardShell user=\{user\} onLogout=\{logout\}>/);
});

test("successful auth and registration flows target the dashboard", () => {
  const signInSource = read("src/app/sign-in/page.tsx");
  const registerActionsSource = read("src/app/register/actions.ts");

  assert.match(signInSource, /await signIn\(provider\.id, \{ redirectTo: "\/dashboard" \}\)/);
  assert.match(registerActionsSource, /await signIn\(provider, \{ redirectTo: "\/dashboard" \}\)/);
  assert.match(registerActionsSource, /await signIn\("google", \{ redirectTo: "\/dashboard" \}\)/);
});

test("dashboard shell includes collapsible two-level navigation, logout, and theme state", () => {
  const shellSource = read("src/features/dashboard/shell.tsx");
  const provideFeedbackSource = read("src/app/dashboard/feedback/provide/page.tsx");
  const pastFeedbacksSource = read("src/app/dashboard/feedback/past/page.tsx");
  const profileSource = read("src/app/dashboard/configure/profile/page.tsx");
  const changePasswordSource = read("src/app/dashboard/configure/change-password/page.tsx");
  const actionsSource = read("src/app/dashboard/actions.ts");

  assert.match(shellSource, /"use client"/);
  assert.match(shellSource, /usePathname\(\)/);
  assert.match(shellSource, /setCollapsed\(\(current\) => !current\)/);
  assert.match(shellSource, /href: "\/dashboard", label: "Home"/);
  assert.match(shellSource, /label: "Feedback"/);
  assert.match(shellSource, /href: "\/dashboard\/feedback\/provide", label: "Provide Feedback"/);
  assert.match(shellSource, /href: "\/dashboard\/feedback\/past", label: "Past Feedbacks"/);
  assert.match(shellSource, /href: "\/dashboard\/configure\/profile", label: "Profile"/);
  assert.match(shellSource, /href: "\/dashboard\/configure\/change-password", label: "Change Password"/);
  assert.match(shellSource, /aria-expanded=\{isExpanded\}/);
  assert.match(shellSource, /setExpandedSections\(\(current\) => \(\{/);
  assert.match(shellSource, /aria-current=\{isChildActive \? "page" : undefined\}/);
  assert.match(shellSource, /window\.localStorage\.setItem\("dashboard-theme", nextTheme\)/);
  assert.match(shellSource, /aria-label=\{theme === "dark" \? "Switch to light theme" : "Switch to dark theme"\}/);
  assert.match(actionsSource, /await signOut\(\{ redirectTo: "\/" \}\)/);
  assert.match(provideFeedbackSource, /<h1 id="provide-feedback-title">Provide Feedback<\/h1>/);
  assert.match(provideFeedbackSource, /<FeedbackRequestUploadForm \/>/);
  assert.match(pastFeedbacksSource, /<h1 id="past-feedbacks-title">Past Feedbacks<\/h1>/);
  assert.match(profileSource, /<h1 id="profile-title">Profile<\/h1>/);
  assert.match(changePasswordSource, /<h1 id="change-password-title">Change Password<\/h1>/);
});

test("dashboard styles keep expanded and collapsed layouts usable", () => {
  const css = read("src/app/globals.css");

  assert.match(css, /\.dashboard-shell/);
  assert.match(css, /grid-template-columns: 264px minmax\(0, 1fr\)/);
  assert.match(css, /\.dashboard-shell\.is-collapsed/);
  assert.match(css, /grid-template-columns: 84px minmax\(0, 1fr\)/);
  assert.match(css, /\.dashboard-shell\.is-collapsed \.dashboard-nav-link span/);
  assert.match(css, /\.dashboard-nav-child-link/);
  assert.match(css, /\.dashboard-nav-children\[hidden\]\s*\{\s*display: none;\s*\}/);
  assert.match(css, /\.dashboard-shell\.is-collapsed \.dashboard-nav-children/);
  assert.match(css, /\[data-dashboard-theme="dark"\]/);
  assert.match(css, /@media \(max-width: 760px\)/);
});
