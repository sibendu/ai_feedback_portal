import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/features/dashboard/shell";
import { getDashboardUser } from "@/features/dashboard/session";

import { logout } from "./actions";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = getDashboardUser(session);

  if (!user) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }

  return (
    <DashboardShell user={user} onLogout={logout}>
      {children}
    </DashboardShell>
  );
}
