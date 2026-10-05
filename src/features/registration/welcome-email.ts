import "server-only";

import { Buffer } from "node:buffer";
import { Socket } from "node:net";
import tls from "node:tls";

export type WelcomeEmailUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
};

export type WelcomeEmailResult =
  | { status: "sent" }
  | { status: "missing-configuration"; missingKeys: string[] }
  | { status: "invalid-recipient" }
  | { status: "failed"; error: string };

export type WelcomeEmailSender = (user: WelcomeEmailUser) => Promise<WelcomeEmailResult>;

type GmailConfig = {
  user: string;
  appPassword: string;
  from: string;
};

type SmtpTransport = (message: SmtpMessage) => Promise<void>;

export type SmtpMessage = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

const GMAIL_HOST = "smtp.gmail.com";
const GMAIL_PORT = 465;
const SMTP_TIMEOUT_MS = 15000;

export function readGmailConfig(env: NodeJS.ProcessEnv = process.env):
  | { ok: true; config: GmailConfig }
  | { ok: false; missingKeys: string[] } {
  const values = {
    GMAIL_USER: env.GMAIL_USER?.trim(),
    GMAIL_APP_PASSWORD: env.GMAIL_APP_PASSWORD?.trim(),
    GMAIL_FROM: env.GMAIL_FROM?.trim()
  };
  const missingKeys = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    return { ok: false, missingKeys };
  }

  const user = values.GMAIL_USER;
  const appPassword = values.GMAIL_APP_PASSWORD;
  const from = values.GMAIL_FROM;

  if (!user || !appPassword || !from) {
    return { ok: false, missingKeys: ["GMAIL_USER", "GMAIL_APP_PASSWORD", "GMAIL_FROM"] };
  }

  return {
    ok: true,
    config: { user, appPassword, from }
  };
}

export function createWelcomeEmailSender(
  env: NodeJS.ProcessEnv = process.env,
  transport: SmtpTransport = (message) => sendWithGmailSmtp(message, env)
): WelcomeEmailSender {
  return async (user) => {
    const config = readGmailConfig(env);

    if (!config.ok) {
      return { status: "missing-configuration", missingKeys: config.missingKeys };
    }

    const recipient = user.email?.trim();

    if (!recipient || !isValidEmailAddress(recipient)) {
      return { status: "invalid-recipient" };
    }

    try {
      await transport(renderWelcomeEmail(user, recipient, config.config.from));
      return { status: "sent" };
    } catch (error) {
      return { status: "failed", error: getSafeErrorMessage(error) };
    }
  };
}

export function renderWelcomeEmail(user: WelcomeEmailUser, recipient: string, from: string): SmtpMessage {
  const greetingName = user.firstName?.trim() || user.name?.trim() || recipient;
  const escapedGreetingName = escapeHtml(greetingName);

  return {
    from,
    to: recipient,
    subject: "Welcome to Customer Feedback Portal",
    text: [
      `Hi ${greetingName},`,
      "",
      "Welcome to Customer Feedback Portal. Your account has been created successfully.",
      "",
      "You can now sign in to manage customer feedback workflows."
    ].join("\n"),
    html: [
      `<p>Hi ${escapedGreetingName},</p>`,
      "<p>Welcome to Customer Feedback Portal. Your account has been created successfully.</p>",
      "<p>You can now sign in to manage customer feedback workflows.</p>"
    ].join("")
  };
}

export async function sendWithGmailSmtp(message: SmtpMessage, env: NodeJS.ProcessEnv = process.env) {
  const config = readGmailConfig(env);

  if (!config.ok) {
    throw new Error(`Missing Gmail configuration: ${config.missingKeys.join(", ")}`);
  }

  const client = new SmtpClient(GMAIL_HOST, GMAIL_PORT, SMTP_TIMEOUT_MS);
  await client.connect();

  try {
    await client.expect(220);
    await client.command(`EHLO ${GMAIL_HOST}`, 250);
    await client.command("AUTH LOGIN", 334);
    await client.command(Buffer.from(config.config.user).toString("base64"), 334);
    await client.command(Buffer.from(config.config.appPassword).toString("base64"), 235);
    await client.command(`MAIL FROM:<${config.config.user}>`, 250);
    await client.command(`RCPT TO:<${message.to}>`, 250);
    await client.command("DATA", 354);
    await client.command(formatEmailMessage(message), 250);
    await client.command("QUIT", 221);
  } finally {
    client.close();
  }
}

function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatEmailMessage(message: SmtpMessage) {
  return [
    `From: ${message.from}`,
    `To: ${message.to}`,
    `Subject: ${message.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: multipart/alternative; boundary=customer-feedback-portal",
    "",
    "--customer-feedback-portal",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    message.text,
    "",
    "--customer-feedback-portal",
    "Content-Type: text/html; charset=UTF-8",
    "",
    message.html,
    "",
    "--customer-feedback-portal--",
    "."
  ].join("\r\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSafeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Welcome email delivery failed.";
}

class SmtpClient {
  private socket?: tls.TLSSocket;
  private buffer = "";

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly timeoutMs: number
  ) {}

  connect() {
    return new Promise<void>((resolve, reject) => {
      const socket = tls.connect({ host: this.host, port: this.port, servername: this.host }, () => {
        this.socket = socket;
        resolve();
      });

      socket.setTimeout(this.timeoutMs, () => {
        socket.destroy(new Error("SMTP connection timed out."));
      });
      socket.on("data", (chunk: Buffer) => {
        this.buffer += chunk.toString("utf8");
      });
      socket.once("error", reject);
      socket.once("close", () => {
        if (!this.socket) reject(new Error("SMTP connection closed before it was established."));
      });
    });
  }

  async command(command: string, expectedCode: number) {
    this.write(`${command}\r\n`);
    await this.expect(expectedCode);
  }

  expect(expectedCode: number) {
    return new Promise<void>((resolve, reject) => {
      const socket = this.socket;
      if (!socket) {
        reject(new Error("SMTP connection is not open."));
        return;
      }

      let settled = false;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        socket.off("data", onData);
        socket.off("error", onError);
        socket.off("close", onClose);
        if (error) reject(error);
        else resolve();
      };
      const check = () => {
        const lines = this.buffer.split(/\r?\n/).filter(Boolean);
        const lastLine = lines.findLast((line) => /^\d{3} /.test(line));

        if (!lastLine) {
          return;
        }

        this.buffer = "";
        const code = Number(lastLine.slice(0, 3));

        if (code === expectedCode) {
          finish();
          return;
        }

        const enhancedStatus = lastLine.match(/^\d{3}\s+(\d\.\d\.\d)\b/)?.[1];
        finish(
          new Error(
            `SMTP command failed with code ${code}${enhancedStatus ? ` (${enhancedStatus})` : ""}.`
          )
        );
      };

      const onData = () => check();
      const onError = (error: Error) => finish(error);
      const onClose = () => finish(new Error("SMTP connection closed before the server replied."));
      const timeout = setTimeout(
        () => finish(new Error(`SMTP command timed out after ${this.timeoutMs}ms.`)),
        this.timeoutMs
      );

      socket.on("data", onData);
      socket.once("error", onError);
      socket.once("close", onClose);

      check();
    });
  }

  close() {
    this.socket?.end();
  }

  private write(value: string) {
    const socket: Socket | undefined = this.socket;

    if (!socket) {
      throw new Error("SMTP connection is not open.");
    }

    socket.write(value);
  }
}
