import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const expected = 'Process your customer signals into clearer next moves';
const old = 'Turn every customer signal into a clearer next move.';
const contentPath = 'src/features/landing/content.ts';
const clientPath = 'src/features/landing/client.ts';
const pagePath = 'src/app/page.tsx';
const specPath = '__ai_factory__/tests/functional/feedback/build-saas-landing-home.spec.ts';
const read = (path) => readFileSync(path, 'utf8');
const baseline = (path) => execFileSync('git', ['show', `HEAD:${path}`], { encoding: 'utf8' });

// Compile real source in memory; replace only explicit import seams for fixtures.
function load(source, filename, imports = {}) {
  const evaluatedModule = { exports: {} };
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2017,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true
    },
    fileName: filename
  }).outputText;
  const resolve = (id) => {
    if (Object.hasOwn(imports, id)) return imports[id];
    if (id === 'react/jsx-runtime') return require(id);
    throw new Error(`Unexpected import: ${id}`);
  };
  vm.runInNewContext(compiled, { module: evaluatedModule, exports: evaluatedModule.exports, require: resolve }, { filename });
  return evaluatedModule.exports;
}

const content = load(read(contentPath), contentPath);
const client = (provider = content.getLandingContentResponse) => load(read(clientPath), clientPath, {
  './content': { ...content, getLandingContentResponse: provider }
});

test('UH-001: shared default, real provider and client expose exact requested copy', async () => {
  assert.equal(content.fallbackLandingContent.hero.title, expected);
  assert.equal(content.getLandingContentResponse().data.hero.title, expected);
  assert.equal((await client().fetchLandingPageContent()).hero.title, expected);
});

test('UH-004: invalid titles normalize to the shared replacement', async (t) => {
  for (const [name, title] of [['missing', undefined], ['empty', ''], ['whitespace', ' \t\n'], ['null', null], ['numeric', 42]]) {
    await t.test(name, async () => {
      const data = structuredClone(content.fallbackLandingContent);
      if (name === 'missing') delete data.hero.title;
      else data.hero.title = title;
      assert.equal((await client(() => ({ data })).fetchLandingPageContent()).hero.title, expected);
    });
  }
});

test('UH-005: provider errors and malformed envelopes use shared fallback', async (t) => {
  for (const [name, provider] of [
    ['throw', () => { throw new Error('injected provider failure'); }],
    ['null data', () => ({ data: null })],
    ['undefined response', () => undefined]
  ]) {
    await t.test(name, async () => {
      const result = await client(provider).fetchLandingPageContent();
      assert.equal(result, content.fallbackLandingContent);
      assert.equal(result.hero.title, expected);
    });
  }
});

test('regression: valid supplied titles retain existing normalization behavior', async () => {
  const data = structuredClone(content.fallbackLandingContent);
  data.hero.title = 'Valid supplied title';
  assert.equal((await client(() => ({ data })).fetchLandingPageContent()).hero.title, data.hero.title);
});

test('UH-006: only headline changes in content; page, client and styles match baseline', () => {
  const before = load(baseline(contentPath), contentPath).fallbackLandingContent;
  const after = structuredClone(content.fallbackLandingContent);
  assert.equal(before.hero.title, old);
  after.hero.title = old;
  assert.equal(JSON.stringify(after), JSON.stringify(before));
  for (const path of [pagePath, clientPath, 'src/app/globals.css']) assert.equal(read(path), baseline(path));
});

test('integrated Node rendering: one exact h1, labelled hero and preserved actions', async () => {
  const { default: Home } = load(read(pagePath), pagePath, {
    '@/features/landing/client': client(),
    'next/link': { __esModule: true, default: (props) => React.createElement('a', props) }
  });
  const html = renderToStaticMarkup(await Home());
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.ok(html.includes(`<h1 id="hero-title">${expected}</h1>`));
  assert.ok(html.includes('<section class="hero" aria-labelledby="hero-title">'));
  assert.ok(!html.includes(old));
  assert.ok(html.includes('<a class="primary-action" href="/sign-in">Create your account</a>'));
  assert.ok(html.includes('<a class="secondary-action" href="#product">Explore the platform</a>'));
});

test('UH-007: both legacy headline assertions require exact full level-1 heading', () => {
  const spec = read(specPath);
  const matcher = /level: 1,\s*name: "Process your customer signals into clearer next moves",\s*exact: true/g;
  assert.equal([...spec.matchAll(matcher)].length, 2);
  assert.ok(!spec.includes('Turn every customer signal'));
  assert.ok(spec.includes('width: 390, height: 844'));
  const original = baseline(specPath);
  const expectedSpec = original
    .replace(`name: "${old}"`, `level: 1,\n        name: "${expected}",\n        exact: true`)
    .replace('    await expect(page.getByRole("heading", { name: /Turn every customer signal/ })).toBeVisible();',
      `    await expect(\n      page.getByRole("heading", {\n        level: 1,\n        name: "${expected}",\n        exact: true\n      })\n    ).toBeVisible();`);
  assert.equal(spec, expectedSpec);
});
