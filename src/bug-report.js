// src/bug-report.js - REPORT A BUG = A CODE, NOT AN EMAIL (claude/shipfix, Daniel 10-11). No network, no address: the player's report becomes ONE
// pasteable line, 'BRK1-' + base64url(deflate-raw(JSON)), copied to the clipboard; tools/bug-decode.mjs turns what they paste back into a readable report.
// Pure (no DOM): the page builds the report, the tool and the test read it, both through this file. THE CONTENT is small on purpose and never the save:
// version, level, where, hero, hp, flasks, the settings that change how the game plays, the device, the player's one line, the last console
// errors/warnings and the last level events. Kept under MAX_LEN characters (the oldest lines go first).
export const PREFIX = 'BRK1-', MAX_LEN = 1500;
const T0 = (typeof performance !== 'undefined' && performance.now) ? () => performance.now() / 1000 : () => 0;

/* ---- the two rings the report reads: console problems and level events ---- */
const ERR = [], EV = [];
const clip = (s, n) => { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '~' : s; };
const fmtArg = a => { if (a instanceof Error) return a.name + ': ' + a.message; if (typeof a === 'object' && a !== null) { try { return JSON.stringify(a); } catch { return String(a); } } return String(a); };
function push(ring, kind, msg) {
  msg = clip(msg, 140); const last = ring[ring.length - 1];
  if (last && last.m === msg && last.k === kind) { last.n++; return; }
  ring.push({ t: Math.round(T0()), k: kind, m: msg, n: 1 }); if (ring.length > 40) ring.shift();
}
export const logProblem = (kind, msg) => push(ERR, kind, msg);
export const evlog = msg => push(EV, 'ev', msg);
export const problems = () => ERR.slice();
export const events = () => EV.slice();
let tapped = false;
/* the console taps and the page's error events: installed once, at import (src/main.js imports this first thing) */
export function installTap(win = globalThis) {
  if (tapped || !win || !win.console) return; tapped = true;
  for (const k of ['error', 'warn']) {
    const orig = win.console[k] ? win.console[k].bind(win.console) : () => {};
    win.console[k] = (...a) => { try { logProblem(k, a.map(fmtArg).join(' ')); } catch {} orig(...a); };
  }
  if (win.addEventListener) {
    win.addEventListener('error', e => { try { logProblem('error', (e.message || 'error') + (e.filename ? ' @' + String(e.filename).split('/').pop() + ':' + (e.lineno || 0) : '')); } catch {} });
    win.addEventListener('unhandledrejection', e => { try { logProblem('error', 'unhandled: ' + fmtArg(e.reason)); } catch {} });
  }
}
installTap();

/* ---- the code ---- */
const b64u = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = t => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
async function pipe(u8, stream) { const w = stream.writable.getWriter(); w.write(u8).catch(() => {}); w.close().catch(() => {}); return new Uint8Array(await new Response(stream.readable).arrayBuffer()); }
export async function encodeReport(obj) {
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  if (typeof CompressionStream === 'undefined') return PREFIX + 'u' + b64u(raw);   /* (no compression in this browser: 'u' = plain JSON, the decoder reads both) */
  return PREFIX + b64u(await pipe(raw, new CompressionStream('deflate-raw')));
}
async function decodeBody(body) {
  /* (a plain-JSON code starts with 'u'; a deflated one can too, so try the plain reading first and fall back) */
  if (body[0] === 'u') { try { return JSON.parse(new TextDecoder().decode(unb64u(body.slice(1)))); } catch {} }
  return JSON.parse(new TextDecoder().decode(await pipe(unb64u(body), new DecompressionStream('deflate-raw'))));
}
/* the code may sit inside a message ('it crashed! BRK1-... thanks') or be wrapped over lines by a chat app: take the first piece after BRK1- that decodes,
   joining the next pieces on while it does not (a cut-off or half-wrapped code never decodes, so it is never taken for a whole one) */
export async function decodeReport(text) {
  const s = String(text), at = s.indexOf(PREFIX);
  if (at < 0) throw Error('no BRK1- report code in that text');
  const pieces = s.slice(at + PREFIX.length).split(/\s+/).filter(Boolean).slice(0, 80); let last = null;
  for (let n = 1; n <= pieces.length; n++) {
    const body = (pieces.slice(0, n).join('').match(/^[A-Za-z0-9_-]*/) || [''])[0]; if (!body) break;
    try { return await decodeBody(body); } catch (e) { last = e; }
  }
  throw last || Error('the BRK1- code is empty');
}

/* the report for a snapshot (from main.js bugSnapshot) and the player's line, fitted to MAX_LEN */
export async function buildReport(snap, note = '') {
  const rep = { c: 1, t: Math.round(Date.now() / 1000), ...snap, n: clip(note, 140), er: ERR.slice(-20).map(e => [e.t, e.k[0], e.m, e.n > 1 ? e.n : undefined]), ev: EV.slice(-20).map(e => [e.t, e.m, e.n > 1 ? e.n : undefined]) };
  let code = await encodeReport(rep);
  for (let guard = 0; code.length > MAX_LEN && guard < 80; guard++) {
    if (rep.ev.length > 6) rep.ev.shift(); else if (rep.er.length > 4) rep.er.shift(); else if (rep.ev.length) rep.ev.shift(); else if (rep.er.length) rep.er.shift(); else if (rep.n.length > 40) rep.n = rep.n.slice(0, rep.n.length - 20); else break;
    code = await encodeReport(rep);
  }
  return { code, report: rep };
}

/* ---- the report, readable (tools/bug-decode.mjs prints this; the test reads it) ---- */
const SETS = { df: 'difficulty', sp: 'game speed', zm: 'zoom', sc: 'pixel scale', hud: 'hud', rm: 'reduce motion', fl: 'flashes', as: 'assist', ir: 'iron knight', bt: 'big text', cs: 'colour tells' };
export function formatReport(r) {
  const o = [], v = r.v || {};
  o.push('BRACKEN BUG REPORT  (code v' + r.c + ', ' + (r.t ? new Date(r.t * 1000).toISOString().replace('T', ' ').slice(0, 19) + 'Z' : 'no time') + ')');
  o.push('build      batch ' + (v.b || '?') + (v.d ? '  ' + v.d : '') + (v.s ? '  sha ' + v.s : '  (no sha stamped)'));
  o.push('where      ' + (r.lv ? r.lv + (r.ln ? ' (' + r.ln + ')' : '') + '  col ' + r.x + ' row ' + r.y : '(not in a level)') + '   screen: ' + r.st + (r.co ? '   CO-OP' : ''));
  o.push('hero       ' + r.h + '   hp ' + (r.hp || []).join('/') + '   flasks ' + r.fl + '   save ' + (r.sl + 1) + (r.dfl ? '   level difficulty ' + r.dfl : ''));
  if (r.dev) o.push('device     ' + r.dev.w + 'x' + r.dev.h + ' @' + r.dev.r + 'x' + (r.dev.t ? ' touch' : '') + '  ' + r.dev.ua);
  if (r.set) o.push('settings   ' + Object.keys(r.set).map(k => (SETS[k] || k) + '=' + r.set[k]).join(', '));
  o.push('player says: ' + (r.n ? '"' + r.n + '"' : '(nothing)'));
  o.push('console problems (' + (r.er || []).length + ', newest last):');
  for (const [t, k, m, n] of r.er || []) o.push('  ' + String(t).padStart(5) + 's ' + (k === 'e' ? 'ERROR' : 'warn ') + ' ' + m + (n ? '  x' + n : ''));
  o.push('level events (' + (r.ev || []).length + ', newest last):');
  for (const [t, m, n] of r.ev || []) o.push('  ' + String(t).padStart(5) + 's ' + m + (n ? '  x' + n : ''));
  return o.join('\n');
}
