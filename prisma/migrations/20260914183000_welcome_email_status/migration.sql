-- Track one welcome-email delivery attempt per newly created user.
ALTER TABLE "User" ADD COLUMN "welcomeEmailAttemptedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "welcomeEmailSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "welcomeEmailStatus" TEXT;
