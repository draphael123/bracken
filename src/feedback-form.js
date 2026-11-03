// src/feedback-form.js - GIVE FEEDBACK (claude/feedback, Daniel 11-03): an IN-GAME form on the title menu, the pause menu and the end-of-demo screen.
// A 1-5 rating; hero + level + build filled in by the game and shown (not editable); 'liked' and 'frustrating' chips; one free text box; SEND and BACK.
// Plain DOM over the canvas, dressed like the game's other boards (src/online-ui.js; the same kind as src/bug-report-ui.js): a text box has to be TYPED into
// (the phone's on-screen keyboard needs a real field). Keyboard, mouse, touch and gamepad all work: arrows / d-pad walk the buttons spatially, Z or A takes,
// X / ESC / B goes back. The game under it never sees a key or a pad press while it is up (capture-phase swallow here; pollGamepad in main.js checks isOpen()).
// WHAT IS SENT (and only this): the rating, the chips, the typed text, and the build, level and hero. NEVER the save, a name, an address or an id.
// WHERE: src/feedback-config.js holds FEEDBACK_FORM_URL (a Google Form's .../formResponse) and the entry.N ids. While the URL is empty NOTHING leaves the
// browser: Send says 'Thanks!' and keeps the note on this device (localStorage). With a URL it is one fetch POST, mode 'no-cors', one a minute.
import * as UI from './online-ui.js';
import * as CFG from './feedback-config.js';

const ID = 'fbform', CSSID = 'fbcss';
const CSS = `
#fbform .ob{max-width:min(600px,96vw);padding:12px 16px}
#fbform h1{font-size:15px;margin:0 0 6px}
#fbform h2{font-size:10px;margin:8px 0 3px;letter-spacing:1px}
#fbform p{margin:3px 0;font-size:11px;line-height:1.4}
#fbform .fbnote{color:#8fd160;font-size:11px}
#fbform .fbwho{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 14px;font-size:10px;color:#a8a090;margin:4px 0}
#fbform .fbwho b{color:#ffd36b;font-weight:400}
#fbform button{font-size:10px;padding:7px 10px;margin:3px;min-height:34px}
#fbform button.fbchip{border-color:#5c3a1d;color:#c8c0b0}
#fbform button.fbchip.on{background:#3a2a16;border-color:#8fd160;color:#8fd160}
#fbform button.fbchip.on::before{content:"+ "}
#fbform .fbbad button.fbchip.on{border-color:#ff9a5c;color:#ff9a5c}
#fbform button.fbrate{min-width:42px;font-size:13px;padding:7px 0}
#fbform button.fbrate.on{background:#3a2a16;border-color:#ffd36b;color:#ffd36b}
#fbform textarea{box-sizing:border-box;width:100%;height:70px;resize:none;font:16px/1.3 "Silkscreen","Press Start 2P",sans-serif;text-transform:none;letter-spacing:0;background:#0b0912;color:#e8dcc0;border:2px solid #8a6a3a;padding:6px;margin:3px 0;-webkit-user-select:text;user-select:text}
#fbform textarea:focus{border-color:#ffd36b;outline:none}
#fbform button:focus,#fbform button.kf,#fbform button.fbchip:focus,#fbform button.fbrate:focus,#fbform button.fbchip.on:focus,#fbform button.fbrate.on:focus{border-color:#ffd36b;color:#ffd36b;background:#3a2a16;box-shadow:0 0 0 2px #ffd36b;outline:none}
#fbform .fbcount{font-size:9px;color:#8a8f80;text-align:right}
#fbform .fbmsg{min-height:15px}
`;
let box = null, snapFn = null, onClose = null, wired = false, raf = 0, padPrev = {};
let draft = { rating: 0, liked: [], bad: [], text: '' };   /* survives a Back and a re-open this session; cleared by a send */
export const isOpen = () => !!(box && box.root.isConnected);

/* ---- the facts (the game's own snapshot: hero, level, build) - nothing else leaves ---- */
export function facts(snap) {
  const s = (snap && snap()) || {}, v = s.v || {};
  const build = ('batch' + (v.b || 0) + (v.d ? ' ' + v.d : '') + (v.s ? ' ' + v.s : '')).slice(0, 60);
  return { hero: String(s.h || '').slice(0, 30), level: String(s.ln || '').slice(0, 60), build };
}
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } };
const URL_OK = /^https:\/\/docs\.google\.com\/forms\/d\/e\/[\w-]+\/formResponse$/;
let cfg = { url: CFG.FEEDBACK_FORM_URL, fields: CFG.FEEDBACK_FIELDS };   /* a tool may swap this for a dummy URL (test.setConfig); the game never does */
const wired_ = () => !!cfg.url && URL_OK.test(cfg.url);

/* the form body: entry.N=value, a checkbox question repeats its key once per ticked option (what a Google Form's formResponse takes) */
export function buildBody(p) {
  const f = cfg.fields || {}, body = new URLSearchParams();
  const put = (k, v) => { if (f[k] && v !== '' && v != null) body.append(f[k], String(v)); };
  put('rating', p.rating); put('hero', p.hero); put('level', p.level); put('build', p.build); put('text', p.text);
  for (const t of p.liked) put('liked', t); for (const t of p.bad) put('frustrating', t);
  return body;
}
function remember(p, sent) {
  let a = []; try { a = JSON.parse(lsGet('bracken-fb-local') || '[]'); if (!Array.isArray(a)) a = []; } catch { a = []; }
  a.push({ t: Date.now(), sent: !!sent, ...p }); lsSet('bracken-fb-local', JSON.stringify(a.slice(-5)));
}
/* one send: returns 'wait' (rate limit), 'sent' or 'kept' (stored here only: no form wired, or the network said no). Never throws, never shows an error. */
export async function send(p, now = Date.now()) {
  const last = +(lsGet('bracken-fb-last') || 0);
  if (last && now - last < CFG.FEEDBACK_GAP_MS && now >= last) return 'wait';
  lsSet('bracken-fb-last', String(now));
  const clean = { rating: p.rating | 0, hero: p.hero, level: p.level, build: p.build, liked: p.liked.slice(0, 10), bad: p.bad.slice(0, 10), text: String(p.text || '').slice(0, CFG.FEEDBACK_MAX_CHARS) };
  if (!wired_() || typeof fetch !== 'function') { remember(clean, false); return 'kept'; }
  try {
    await fetch(cfg.url, { method: 'POST', mode: 'no-cors', body: buildBody(clean), credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true });
    return 'sent';
  } catch { remember(clean, false); return 'kept'; }   /* offline: fail quietly, keep the note here */
}

/* ---- keys and pad: the game under the board sees none ---- */
function keys(e) {
  if (!isOpen()) return;
  e.stopImmediatePropagation();
  const t = e.target, inText = !!(t && t.tagName === 'TEXTAREA'), onBtn = !!(t && t.tagName === 'BUTTON');
  if (e.type === 'keyup') { if (e.key === ' ' && onBtn) e.preventDefault(); return; }
  if (e.key === 'Escape') { e.preventDefault(); close(); return; }
  if (e.key === 'Tab') return;   /* the browser's own Tab order is the DOM order, which is the visual one */
  if (inText) {
    const ta = t;
    if (e.key === 'ArrowUp' && (ta.selectionStart === 0 || !ta.value.slice(0, ta.selectionStart).includes('\n') && ta.scrollHeight <= ta.clientHeight + 2)) { e.preventDefault(); walk('up'); }
    else if (e.key === 'ArrowDown' && (ta.selectionEnd === ta.value.length || !ta.value.slice(ta.selectionEnd).includes('\n') && ta.scrollHeight <= ta.clientHeight + 2)) { e.preventDefault(); walk('down'); }
    return;
  }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); walk(e.key.slice(5).toLowerCase()); return; }
  if (e.key === 'x' || e.key === 'X') { e.preventDefault(); close(); return; }
  if ((e.key === 'Enter' || e.key === ' ' || e.key === 'z' || e.key === 'Z') && onBtn) { e.preventDefault(); t.click(); }
}
const focusables = () => box ? [...box.card.querySelectorAll('button:not(:disabled), textarea')] : [];
/* SPATIAL WALK: up/down go to the next row of controls (nearest column), left/right along the row, both wrap */
export function walk(dir) {
  const fs = focusables(); if (!fs.length) return false;
  const R = e => { const r = e.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, h: r.height }; };
  const cur = fs.indexOf(document.activeElement) >= 0 ? document.activeElement : null;
  if (!cur) { fs[0].focus(); return true; }
  const c = R(cur), rs = fs.map(e => ({ e, ...R(e) })).filter(r => r.e !== cur);
  let pick = null;
  if (dir === 'left' || dir === 'right') {
    const row = rs.filter(r => Math.abs(r.cy - c.cy) < Math.max(r.h, c.h) / 2).sort((a, b) => a.cx - b.cx);
    if (row.length) pick = dir === 'right' ? (row.find(r => r.cx > c.cx) || row[0]) : ([...row].reverse().find(r => r.cx < c.cx) || row[row.length - 1]);
  } else {
    const below = dir === 'down', side = rs.filter(r => below ? r.cy > c.cy + c.h / 2 : r.cy < c.cy - c.h / 2);
    const pool = side.length ? side : rs;   /* nothing further that way: wrap to the far end */
    if (pool.length) { const ys = pool.map(r => r.cy), rowY = below ? Math.min(...ys) : Math.max(...ys); pick = pool.filter(r => Math.abs(r.cy - rowY) < 3).sort((x, y) => Math.abs(x.cx - c.cx) - Math.abs(y.cx - c.cx))[0]; }
  }
  if (!pick) return false;
  pick.e.focus({ preventScroll: true }); try { pick.e.scrollIntoView({ block: 'nearest' }); } catch {}
  return true;
}
function pads() {
  raf = isOpen() ? requestAnimationFrame(pads) : 0;
  if (!isOpen() || !navigator.getGamepads) { padPrev = {}; return; }
  for (const gp of navigator.getGamepads()) { if (!gp || !gp.connected) continue;
    const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes || [];
    const now = { a: b(0), b: b(1), up: b(12) || ax[1] < -0.6, down: b(13) || ax[1] > 0.6, left: b(14) || ax[0] < -0.6, right: b(15) || ax[0] > 0.6 }, was = padPrev[gp.index] || {};
    padPrev[gp.index] = now; const rose = k => now[k] && !was[k];
    if (rose('b')) { close(); return; }
    if (rose('a')) { const f = document.activeElement; if (f && box.root.contains(f) && f.tagName === 'BUTTON') f.click(); return; }
    for (const k of ['up', 'down', 'left', 'right']) if (rose(k)) { walk(k); return; }
  }
}
export function close() { if (box) { box.remove(); box = null; } const cb = onClose; onClose = null; if (cb) cb(); }

/* ---- the form ---- */
const chip = (label, set, bad) => { const b = UI.el('button.fbchip', label.toUpperCase(), () => { const i = set.indexOf(label); if (i < 0) set.push(label); else set.splice(i, 1); b.classList.toggle('on', i < 0); b.setAttribute('aria-pressed', i < 0 ? 'true' : 'false'); say(''); }); b.type = 'button'; b.dataset.topic = label; b.setAttribute('aria-pressed', set.includes(label) ? 'true' : 'false'); if (set.includes(label)) b.classList.add('on'); return b; };
let msgEl = null;
const say = (t, cls) => { if (msgEl) { msgEl.textContent = t; msgEl.className = 'fbmsg ' + (cls || ''); } };
export function open(snapshot, afterClose) {
  if (!wired) { wired = true; addEventListener('keydown', keys, true); addEventListener('keyup', keys, true); }
  snapFn = snapshot; onClose = afterClose || null; padPrev = {};
  if (!document.getElementById(CSSID)) { const s = document.createElement('style'); s.id = CSSID; s.textContent = CSS; document.head.appendChild(s); }
  box = UI.board(ID); const F = facts(snapFn);
  box.root.addEventListener('focusin', e => { for (const x of box.root.querySelectorAll('.kf')) x.classList.remove('kf'); if (e.target && e.target.classList) e.target.classList.add('kf'); });
  box.root.addEventListener('focusout', e => { if (e.target && e.target.classList) e.target.classList.remove('kf'); });   /* the focus ring is a class too: a window without OS focus still shows where the pad is */
  const rate = UI.row(...[1, 2, 3, 4, 5].map(n => { const b = UI.el('button.fbrate', String(n), () => { draft.rating = n; for (const x of rate.children) { x.classList.toggle('on', +x.dataset.n === n); x.setAttribute('aria-checked', +x.dataset.n === n ? 'true' : 'false'); } say(''); }); b.type = 'button'; b.dataset.n = n; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', draft.rating === n ? 'true' : 'false'); if (draft.rating === n) b.classList.add('on'); return b; }));
  const likeRow = UI.row(...CFG.FEEDBACK_TOPICS.map(t => chip(t, draft.liked))), badRow = UI.row(...CFG.FEEDBACK_TOPICS.map(t => chip(t, draft.bad)));
  const ta = UI.el('textarea'); ta.id = 'fbtext'; ta.maxLength = CFG.FEEDBACK_MAX_CHARS; ta.value = draft.text; ta.placeholder = 'anything else? (optional)'; ta.spellcheck = true; ta.autocomplete = 'off'; ta.setAttribute('aria-label', 'Your feedback');
  const count = UI.el('div.fbcount', ''), upd = () => { draft.text = ta.value; count.textContent = ta.value.length + ' / ' + CFG.FEEDBACK_MAX_CHARS; }; ta.addEventListener('input', upd); upd();
  msgEl = UI.el('p.fbmsg', '');
  const go = UI.el('button.go', 'SEND', () => submit(F)); go.type = 'button'; go.id = 'fbsend';
  const back = UI.el('button', 'BACK', () => close()); back.type = 'button'; back.id = 'fbback';
  const who = UI.el('div.fbwho'); for (const [k, v] of [['HERO', F.hero || '-'], ['LEVEL', F.level || 'MENU'], ['BUILD', F.build]]) { const s = UI.el('span', k + ' '); s.append(UI.el('b', String(v).toUpperCase())); who.append(s); }
  const bad = UI.el('div.fbbad'); bad.append(badRow);
  box.set(
    UI.el('h1', 'GIVE FEEDBACK'),
    UI.el('p.fbnote', 'Sends only what you type, plus build, level and hero.'),
    who,
    UI.el('h2', 'HOW WAS IT?  1 = BAD   5 = GREAT'), rate,
    UI.el('h2', 'WHAT DID YOU LIKE?'), likeRow,
    UI.el('h2', 'WHAT WAS FRUSTRATING?'), bad,
    UI.el('h2', 'TELL US MORE'), ta, count, msgEl,
    UI.row(go, back));
  const first = box.card.querySelector('button.fbrate'); setTimeout(() => { if (first) try { first.focus({ preventScroll: true }); } catch {} }, 0);   /* (board.set focuses the first button too) */
  if (!raf) raf = requestAnimationFrame(pads);
}
async function submit(F) {
  if (!draft.rating) { say('PICK A RATING FROM 1 TO 5 FIRST.', 'bad'); const r = box.card.querySelector('button.fbrate'); if (r) r.focus(); return; }
  const go = box.card.querySelector('#fbsend'); if (go) go.disabled = true;
  const res = await send({ rating: draft.rating, hero: F.hero, level: F.level, build: F.build, liked: draft.liked, bad: draft.bad, text: draft.text.trim() });
  if (!box) return;
  if (res === 'wait') { if (go) go.disabled = false; say('ONE NOTE A MINUTE - TRY AGAIN IN A MOMENT.', 'bad'); return; }
  draft = { rating: 0, liked: [], bad: [], text: '' };
  const done = UI.el('button.sel', 'CLOSE', () => close()); done.type = 'button'; done.id = 'fbdone';
  box.set(UI.el('h1', 'THANKS!'), UI.el('p', 'Every note gets read. It helps make THORNROAD better.'), UI.row(done));
}
export const test = { open, close, isOpen, walk, send, buildBody, facts, setConfig: c => { cfg = { url: c.url || '', fields: c.fields || {} }; }, getDraft: () => draft, resetDraft: () => { draft = { rating: 0, liked: [], bad: [], text: '' }; } };
