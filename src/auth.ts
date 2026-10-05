import { PrismaAdapter } from "@auth/prisma-adapter";
import { cookies } from "next/headers";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";
import {
  GOOGLE_PROFILE_CONSENT_COOKIE,
  GOOGLE_PROFILE_CONSENT_VALUE,
  REGISTRATION_PROFILE_COOKIE,
  decodeRegistrationProfile,
  getGoogleProfileNames,
  splitDisplayName,
  validateRegistrationProfile
} from "@/features/registration/profile";
import { deliverWelcomeEmailForNewUser } from "@/features/registration/welcome-delivery";

type MutableAuthUser = {
  id?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
};

function applyNamesToUser(user: MutableAuthUser, firstName: string, lastName: string) {
  user.firstName = firstName;
  user.lastName = lastName;
  user.name = user.name ?? `${firstName} ${lastName}`;
}

async function readRegistrationProfile() {
  const cookieStore = await cookies();
  return decodeRegistrationProfile(cookieStore.get(REGISTRATION_PROFILE_COOKIE)?.value);
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Avoid a discovery request during the sign-in action. This keeps the
      // OAuth handoff available when the application cannot reach Google's
      // OpenID discovery endpoint at that moment.
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: { scope: "openid email profile" }
      },
      token: "https://oauth2.googleapis.com/token",
      userinfo: "https://openidconnect.googleapis.com/v1/userinfo"
    }),
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
  ],
  session: { strategy: "database" },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/sign-in" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) {
        return true;
      }

      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId
          }
        },
        select: { userId: true }
      });

      if (existingAccount) {
        return true;
      }

      const profileCookie = await readRegistrationProfile();

      if (account.provider === "google") {
        const cookieStore = await cookies();
        const hasConsent = cookieStore.get(GOOGLE_PROFILE_CONSENT_COOKIE)?.value === GOOGLE_PROFILE_CONSENT_VALUE;

        if (!hasConsent) {
          return "/register/google-consent?error=consentRequired";
        }

        const googleProfileNames = getGoogleProfileNames({
          firstName: typeof profile?.given_name === "string" ? profile.given_name : undefined,
          lastName: typeof profile?.family_name === "string" ? profile.family_name : undefined,
          name: typeof profile?.name === "string" ? profile.name : user.name
        });

        const names = googleProfileNames ?? profileCookie;

        if (!names) {
          return "/register?error=GoogleMissingNames";
        }

        applyNamesToUser(user as MutableAuthUser, names.firstName, names.lastName);
        cookieStore.delete(GOOGLE_PROFILE_CONSENT_COOKIE);
        cookieStore.delete(REGISTRATION_PROFILE_COOKIE);
        return true;
      }

      if (profileCookie) {
        applyNamesToUser(user as MutableAuthUser, profileCookie.firstName, profileCookie.lastName);
        const cookieStore = await cookies();
        cookieStore.delete(REGISTRATION_PROFILE_COOKIE);
        return true;
      }

      const inferredNames = validateRegistrationProfile(splitDisplayName(user.name));

      if (inferredNames.ok) {
        applyNamesToUser(user as MutableAuthUser, inferredNames.profile.firstName, inferredNames.profile.lastName);
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.name = user.name;
        (session.user as typeof session.user & { id?: string }).id = user.id;
      }

      return session;
    }
  },
  events: {
    async createUser({ user }) {
      const createdUser = user as MutableAuthUser;

      if (!createdUser.id) {
        return;
      }

      await deliverWelcomeEmailForNewUser({
        id: createdUser.id,
        email: createdUser.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        name: createdUser.name
      });
    }
  },
  trustHost: true
});
