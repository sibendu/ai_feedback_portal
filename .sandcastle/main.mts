import { run, codex, createSandbox } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

import path from "node:path";
import os from "node:os";

// Simple loop: an agent that picks open issues one by one and closes them.
// Run this with: npx tsx .sandcastle/main.mts
// Or add to package.json scripts: "sandcastle": "npx tsx .sandcastle/main.mts"

const hostCodexHome = path.join(os.homedir(), ".codex");
const sandboxCodexMount = "/mnt/host-codex";
const sandboxCodexHome = "/home/agent/.codex";
console.log(`hostCodexHome: ${hostCodexHome}, sandboxCodexHome: ${sandboxCodexHome}`);

const setup = {
  // Sandbox provider — runs the agent inside an isolated container.
  sandbox: docker({
    env: {
      CODEX_HOME: sandboxCodexHome,
      GH_TOKEN: process.env["GH_TOKEN"] ?? "",
    },
    mounts: [
      {
        hostPath: hostCodexHome,
        sandboxPath: sandboxCodexMount,
        readonly: true,
      },
    ],
  }),

  // Leave copyToWorktree unset: copying node_modules across /mnt/c under WSL2
  // can exceed Sandcastle's 60-second copy timeout. Install Linux dependencies
  // inside the sandbox instead, using the hook below.
  // copyToWorktree: ["node_modules"],

  // Lifecycle hooks — commands grouped by where they run (host or sandbox).
  hooks: {
    sandbox: {
      onSandboxReady: [
        {
          command: [
            `mkdir -p "${sandboxCodexHome}"`,
            `test -f "${sandboxCodexMount}/auth.json"`,
            `cp "${sandboxCodexMount}/auth.json" "${sandboxCodexHome}/auth.json"`,
            `if [ -f "${sandboxCodexMount}/config.toml" ]; then cp "${sandboxCodexMount}/config.toml" "${sandboxCodexHome}/config.toml"; fi`,
          ].join(" && "),
        },
        {
          command: "npm ci --no-audit --no-fund",
          // Cold installs on a Windows-mounted WSL worktree can take minutes.
          // Hook timeouts are separate from run().timeouts and agent idle timeouts.
          timeoutMs: 15 * 60_000,
        },
      ],
    },
  },
};

if (process.argv.includes("--check")) {
  // Exercise the same worktree, container and hooks without invoking an agent.
  console.log("Checking sandbox setup (dependency installation may take several minutes)...");
  const sandbox = await createSandbox({
    ...setup,
    branch: `sandcastle/setup-check-${Date.now()}`,
  });
  try {
    const result = await sandbox.exec(
      "node --version && npm --version && codex --version && gh --version && npm ls --depth=0",
    );
    console.log(result.stdout);
    if (result.stderr) console.error(result.stderr);
    if (result.exitCode !== 0) {
      throw new Error(`Sandbox setup check failed (exit ${result.exitCode}).`);
    }
    console.log("Sandbox setup check passed. No agent was invoked.");
    const github = await sandbox.exec("gh auth status");
    if (github.exitCode !== 0) {
      console.warn("GitHub authentication is missing. Export GH_TOKEN before starting the issue worker.");
    }
  } finally {
    await sandbox.close();
  }
} else {
  await run({
    ...setup,
    name: "worker",
    agent: codex("gpt-5.4"),
    promptFile: "./.sandcastle/prompt.md",
    maxIterations: 3,
    branchStrategy: { type: "merge-to-head" },
  });
}
