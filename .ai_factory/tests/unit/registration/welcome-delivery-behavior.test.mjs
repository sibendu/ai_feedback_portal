import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const sourcePath = new URL("../../../../src/features/registration/welcome-delivery.ts", import.meta.url);
const nodeRequire = createRequire(import.meta.url);

function loadDelivery(fakePrisma) {
  const source = readFileSync(sourcePath, "utf8")
    .replace('import "server-only";', "")
    .replace('import { prisma } from "@/lib/prisma";', "const prisma = globalThis.__testPrisma;")
    .replace(
      /import \{ createWelcomeEmailSender, type WelcomeEmailResult, type WelcomeEmailSender, type WelcomeEmailUser \} from "\.\/welcome-email";/,
      'const createWelcomeEmailSender = () => async () => ({ status: "sent" });'
    );
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(output, {
    module: compiledModule,
    exports: compiledModule.exports,
    require: nodeRequire,
    console,
    __testPrisma: fakePrisma
  });
  return compiledModule.exports.deliverWelcomeEmailForNewUser;
}

test("a deterministic sender failure is audited safely while preserving the registration", async () => {
  const calls = [];
  const fakePrisma = {
    user: {
      updateMany: async () => ({ count: 1 }),
      update: async ({ where, data }) => calls.push({ kind: "user-status", where, data })
    },
    $transaction: async (work) =>
      work({
        registrationFailure: { create: async ({ data }) => calls.push({ kind: "audit", data }) },
        user: { update: async ({ where, data }) => calls.push({ kind: "user-status", where, data }) }
      })
  };
  const deliver = loadDelivery(fakePrisma);

  const result = await deliver(
    { id: "new-user", email: "person@example.test" },
    async () => ({
      status: "failed",
      error: "SMTP command timed out; password=super-secret recipient person@example.test"
    })
  );

  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, "failed");
  assert.match(result.errorMessage, /timed out/);
  assert.doesNotMatch(result.errorMessage, /super-secret|person@example\.test/);
  assert.deepEqual(calls.map((call) => call.kind), ["audit", "user-status"]);
  assert.equal(calls[0].data.registrationId, "new-user");
  assert.equal(calls[1].where.id, "new-user");
  assert.equal(calls[1].data.welcomeEmailStatus, "failed");
  assert.equal(calls[1].data.welcomeEmailError, result.errorMessage);
});

test("missing Gmail configuration records failure without deleting the new registration", async () => {
  const calls = [];
  const fakePrisma = {
    user: { updateMany: async () => ({ count: 1 }) },
    $transaction: async (work) =>
      work({
        registrationFailure: { create: async ({ data }) => calls.push(data) },
        user: { update: async ({ data }) => calls.push({ kind: "user-status", data }) }
      })
  };
  const deliver = loadDelivery(fakePrisma);

  const result = await deliver(
    { id: "missing-config-user" },
    async () => ({ status: "missing-configuration", missingKeys: ["GMAIL_APP_PASSWORD"] })
  );

  assert.equal(result.status, "failed");
  assert.equal(calls[0].errorCode, "missing-configuration");
  assert.match(calls[0].errorMessage, /GMAIL_APP_PASSWORD/);
});

test("SMTP provider status is retained without storing the raw provider response", async () => {
  const calls = [];
  const fakePrisma = {
    user: { updateMany: async () => ({ count: 1 }) },
    $transaction: async (work) =>
      work({
        registrationFailure: { create: async ({ data }) => calls.push(data) },
        user: { update: async () => undefined }
      })
  };
  const deliver = loadDelivery(fakePrisma);

  const result = await deliver(
    { id: "smtp-limited-user" },
    async () => ({ status: "failed", error: "SMTP command failed with code 550 (5.4.5)." })
  );

  assert.equal(result.status, "failed");
  assert.equal(calls[0].errorCode, "smtp-550-5.4.5");
  assert.equal(calls[0].errorMessage, "SMTP provider rejected the message with status 550 5.4.5.");
});
