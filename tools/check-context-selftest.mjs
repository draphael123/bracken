// tools/check-context-selftest.mjs - A BORROWED BROWSER MUST NEVER BORROW A SAVE.
// Run on demand while changing the suite pool: node tools/check-context-selftest.mjs. It is not another release gate.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { browserExecutable, openPage } from './cdp.mjs';
import { launchBrowser } from './browser-profile.mjs';
import { portFor } from './ports.mjs';

const port = portFor(1), url = 'http://localhost:' + port + '/';
const server = spawn(process.execPath, ['serve.mjs'], { cwd: fileURLToPath(new URL('..', import.meta.url)), stdio: 'ignore',
  env: { ...process.env, PORT: String(port), BRACKEN_PARENT: String(process.pid) } });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let browser;
try {
  let up = false; for (let i = 0; i < 60 && !up; i++) { try { up = (await fetch(url, { signal: AbortSignal.timeout(1000) })).ok; } catch { await sleep(250); } }
  assert.ok(up, 'the self-test server started');
  browser = launchBrowser(browserExecutable(), ['--headless=new', '--remote-debugging-port=auto', '--no-first-run', 'about:blank'], 'look');
  process.env.BRACKEN_BROWSER_PORT = String(await browser.devtoolsPort());
  const first = await openPage({ port, audio: false, fonts: false });
  try { await first.evalp("localStorage.setItem('bracken-context-selftest', 'must not cross')"); } finally { await first.close(); }
  const second = await openPage({ port, audio: false, fonts: false });
  try { assert.equal(await second.evalp("localStorage.getItem('bracken-context-selftest')"), null); } finally { await second.close(); }
  console.log('ok  check-context-selftest  consecutive borrowed pages have separate storage');
} finally { delete process.env.BRACKEN_BROWSER_PORT; if (browser) await browser.close(); server.kill(); }
