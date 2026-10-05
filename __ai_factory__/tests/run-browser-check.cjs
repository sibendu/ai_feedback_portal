const { spawn } = require('node:child_process');
const { mkdir, writeFile } = require('node:fs/promises');
const path = require('node:path');

// Explicit local test entry point; never selected automatically by an agent.
const root = path.resolve(__dirname, '../..');
const output = path.join(root, '.ai_factory/tests/reports/local-browser-check.json');
const startedAt = new Date().toISOString();
const child = spawn(process.execPath, [path.join(root, 'node_modules/@playwright/test/cli.js'), 'test', '--reporter=json'], {
  cwd: root,
  windowsHide: true,
  shell: false,
  env: Object.fromEntries(Object.entries(process.env).filter(([key]) => key !== 'DATABASE_URL' && !key.startsWith('POSTGRES_'))),
  stdio: ['ignore', 'pipe', 'pipe'],
});
let stdout = '';
let stderr = '';
let timedOut = false;
child.stdout.on('data', (chunk) => { stdout = (stdout + chunk).slice(-2000000); });
child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-20000); });
const timer = setTimeout(() => {
  timedOut = true;
  if (process.platform === 'win32' && child.pid) {
    const killer = spawn(path.join(process.env.SystemRoot || 'C:/Windows', 'System32/taskkill.exe'), ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    killer.on('error', () => child.kill());
  } else child.kill('SIGTERM');
}, 180000);
child.on('error', (error) => { stderr += error.message; });
child.on('close', async (code) => {
  clearTimeout(timer);
  let report;
  try { report = JSON.parse(stdout); } catch { report = { rawOutput: stdout }; }
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ startedAt, finishedAt: new Date().toISOString(), code, timedOut, stderr, report }, null, 2));
  console.log(JSON.stringify({ code, timedOut, output, stats: report.stats, stderr }));
  process.exitCode = timedOut ? 124 : (code ?? 1);
});
