ALTER TABLE "User" ADD COLUMN "welcomeEmailError" TEXT;

CREATE TABLE "RegistrationFailure" (
  "id" TEXT NOT NULL,
  "registrationId" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "errorCode" TEXT NOT NULL,
  "errorMessage" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RegistrationFailure_pkey" PRIMARY KEY ("id")
);
