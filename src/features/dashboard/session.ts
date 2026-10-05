import type { Session } from "next-auth";

export type DashboardUser = {
  name: string;
  email: string | null;
};

export function getDashboardUser(session: Session | null): DashboardUser | null {
  if (!session?.user) {
    return null;
  }

  const name = normalizeIdentity(session.user.name) ?? normalizeIdentity(session.user.email) ?? "there";
  const email = normalizeIdentity(session.user.email);

  return { name, email };
}

function normalizeIdentity(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
