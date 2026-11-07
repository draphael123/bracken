/* src/demo-end.js - THE END CARD (claude/demoend, Daniel 11-03 18:45 / 18:50). Shown after King Gorm's win card when the DEMO flag is on (src/demo-flag.js).
   Thanks; KEEP YOUR PROGRESS (the save file: the same text SETTINGS > EXPORT SAVE writes, so the full game's IMPORT SAVE takes it); GIVE FEEDBACK (the in-game form,
   src/feedback-form.js); CREDITS (the game's own credits page); a follow line (a link only when FOLLOW_URL is set); BACK TO THE MAP (the Burning Village spur and the Arena Yard
   are still ahead of a player who wants more); MAIN MENU. Plain DOM over the canvas, dressed like the feedback form's board; keyboard, mouse, touch and pad all work.
   The card owns the keys while it is up (the game under it sees none); while the feedback form is over it, the form owns them. */
import * as UI from './online-ui.js';
import * as FB from './feedback-form.js';
import * as CFG from './demo-end-config.js';
import * as TZ from './demo-teaser.js';
const ID = 'demoend', CSSID = 'decss';
const CSS = `
#demoend .ob{max-width:min(560px,96vw);padding:14px 18px;text-align:center}
#demoend h1{font-size:15px;margin:0 0 8px;color:#ffd36b}
#demoend p{margin:5px 0;font-size:11px;line-height:1.5}
#demoend p.dekeep{color:#8fd160}
#demoend p.defollow{color:#a8a090;font-size:10px;margin-top:10px}
#demoend a{color:#ffd36b}
#demoend button{font-size:10px;padding:8px 12px;margin:3px;min-height:40px}
#demoend button.dekeepbtn{background:#2f4a1d;border-color:#8fd160;color:#e8f6d0}
#demoend button:focus,#demoend button.kf{border-color:#ffd36b;color:#ffd36b;background:#3a2a16}
#demoend .demsg{min-height:15px}
#demoend h2{font-size:10px;margin:10px 0 6px;color:#c9b27c}
#demoend .tz{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:4px 0 8px}
#demoend .tz figure{margin:0;min-width:0}
#demoend .tz canvas{display:block;width:100%;height:auto;aspect-ratio:16/9;image-rendering:pixelated;border:2px solid #5c3a1d;box-sizing:border-box;background:#0b0912}
#demoend .tz figcaption{font-size:8px;line-height:1.3;margin-top:3px;color:#a8a090;overflow-wrap:anywhere}
#demoend button.defollowbtn{border-color:#c9b27c}
#demoend button.defollowbtn:disabled{opacity:.55;cursor:default}
@media(max-width:420px){#demoend .tz{grid-template-columns:repeat(3,1fr)}}
`;
let box = null, H = null, wired = false, raf = 0, padPrev = {};
export const isOpen = () => !!(box && box.root.isConnected);
const hidden = () => !isOpen() || box.root.style.display === 'none';
const buttons = () => box ? [...box.card.querySelectorAll('button:not(:disabled)')] : [];
function step(dir) {
  const bs = buttons(); if (!bs.length) return; const i = bs.indexOf(document.activeElement), n = bs.length;
  const next = (dir === 'down' || dir === 'right') ? (i < 0 ? 0 : (i + 1) % n) : (i < 0 ? n - 1 : (i - 1 + n) % n);
  bs[next].focus({ preventScroll: true });
}
function keys(e) {
  if (!isOpen() || hidden() || FB.isOpen()) return;
  e.stopImmediatePropagation();
  const t = e.target, onBtn = !!(t && t.tagName === 'BUTTON');
  if (e.type === 'keyup') { if (e.key === ' ' && onBtn) e.preventDefault(); return; }
  if (e.key === 'Tab') return;
  if (e.key === 'Escape') { e.preventDefault(); if (H) H.map(); return; }
  if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); step('up'); return; }
  if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); step('down'); return; }
  if ((e.key === 'Enter' || e.key === ' ' || e.key === 'z' || e.key === 'Z') && onBtn) { e.preventDefault(); t.click(); }
}
function pads() {
  raf = isOpen() ? requestAnimationFrame(pads) : 0;
  if (!isOpen() || hidden() || FB.isOpen() || !navigator.getGamepads) { padPrev = {}; return; }
  for (const gp of navigator.getGamepads()) { if (!gp || !gp.connected) continue;
    const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes || [];
    const now = { a: b(0), b: b(1), up: b(12) || ax[1] < -0.6, down: b(13) || ax[1] > 0.6, left: b(14) || ax[0] < -0.6, right: b(15) || ax[0] > 0.6 }, was = padPrev[gp.index] || {};
    padPrev[gp.index] = now; const rose = k => now[k] && !was[k];
    if (rose('b')) { if (H) H.map(); return; }
    if (rose('a')) { const f = document.activeElement; if (f && box.root.contains(f) && f.tagName === 'BUTTON') f.click(); return; }
    for (const k of ['up', 'left']) if (rose(k)) { step('up'); return; }
    for (const k of ['down', 'right']) if (rose(k)) { step('down'); return; }
  }
}
const btn = (label, fn, cls) => { const b = UI.el('button' + (cls ? '.' + cls : ''), label, fn); b.type = 'button'; return b; };
/* the follow line: text, and a link only when the page's address is set (https only) */
export function followNode() {
  const p = UI.el('p.defollow'); const ok = /^https:\/\//.test(CFG.FOLLOW_URL);
  if (ok) { const a = document.createElement('a'); a.href = CFG.FOLLOW_URL; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = CFG.FOLLOW_LINE; p.append(a); } else p.textContent = CFG.SOON_LINE;   /* (demoend2) blank URL: a plain 'coming' line, never a promise of a page that is not there */
  return p;
}
/* (demoend2) WISHLIST / FOLLOW: a button that opens the itch page - only when FOLLOW_URL is a real https address. Blank: a shut button that says COMING SOON (not focusable, no link anywhere). */
export const followUrlOk = (u = CFG.FOLLOW_URL) => /^https:\/\/\S+$/.test(u);
export function followButton(open = u => { try { window.open(u, '_blank', 'noopener,noreferrer'); } catch {} }) {
  if (followUrlOk()) { const b = btn(CFG.FOLLOW_BTN, () => open(CFG.FOLLOW_URL), 'defollowbtn'); b.id = 'defollowbtn'; return b; }
  const b = btn(CFG.SOON_BTN, () => {}, 'defollowbtn'); b.id = 'defollowbtn'; b.disabled = true; b.setAttribute('aria-disabled', 'true'); return b;
}
/* (demoend2) WHAT'S IN THE FULL GAME: five small baked pictures (src/demo-teaser.js) with their names */
export function teaserNode() {
  const wrap = UI.el('div'), grid = UI.el('div.tz');
  for (const s of TZ.SCENES) { const fig = document.createElement('figure'), cv = document.createElement('canvas'); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', s.label); try { TZ.paint(cv, s.id); } catch {} const cap = document.createElement('figcaption'); cap.textContent = s.label; fig.append(cv, cap); grid.append(fig); }
  wrap.append(UI.el('h2', CFG.TEASER_HEAD), grid); return wrap;
}
/* h = { keep() -> string (what to say: 'SAVED...' / why not), feedback(), credits(), map(), menu() } */
export function open(h) {
  H = h; padPrev = {};
  if (!wired) { wired = true; addEventListener('keydown', keys, true); addEventListener('keyup', keys, true); }
  if (!document.getElementById(CSSID)) { const s = document.createElement('style'); s.id = CSSID; s.textContent = CSS; document.head.appendChild(s); }
  box = UI.board(ID); box.root.style.display = '';
  const msg = UI.el('p.demsg dekeep', '');
  const keep = btn('KEEP YOUR PROGRESS', () => { msg.textContent = H.keep() || ''; }, 'dekeepbtn'); keep.id = 'dekeep';
  const fb = btn('GIVE FEEDBACK', () => H.feedback()); fb.id = 'defeedback';
  const cr = btn('CREDITS', () => H.credits()); cr.id = 'decredits';
  const mp = btn('BACK TO THE MAP', () => H.map()); mp.id = 'demap';
  const mn = btn('MAIN MENU', () => H.menu()); mn.id = 'demenu';
  box.set(UI.el('h1', 'END OF THE DEMO'), ...CFG.CARD_LINES.map(t => UI.el('p', t)), teaserNode(), msg, UI.row(keep, followButton()), UI.row(fb, cr), UI.row(mp, mn), followNode());
  if (!raf) raf = requestAnimationFrame(pads);
}
export function show() { if (box) { box.root.style.display = ''; const k = box.card.querySelector('#dekeep'); if (k) setTimeout(() => { try { k.focus({ preventScroll: true }); } catch {} }, 0); } }
export function hide() { if (box) box.root.style.display = 'none'; }
export function close() { if (box) { box.remove(); box = null; } H = null; }
export const test = { open, close, isOpen, hide, show, step };
export const KEEP_FILE = CFG.KEEP_FILE;
/* THE MAP CAPTION (batch143, demoend Q4): a plate under the map's header while the cursor is on Kingswood (the end of the demo road) or on any shut node - the road is longer than the demo. Pure canvas, no DOM; text/textW are main.js's own. */
export function mapCaption(g, text, textW, VW, time, nodeId, shut, plates) { if (nodeId !== 'kings' && !shut) return; const s = CFG.MAP_CAPTION, w = Math.ceil(textW(s, 6)) + 10, x0 = Math.round((VW - w) / 2);
  /* (smallfix14) it sits under the header, and steps down past any node plate it would cover (the Kingswood plate sat under it when Kingswood was at the top of the view) */
  /* (claude/mapclean) `plates` is every rect it must not cover - boards, nodes, the card. It tries the strip under the header, then the strip over the footer, then steps down past what is in the way. */
  const free = y => !(plates || []).some(p => p.x < x0 + w + 1 && p.x + p.w > x0 - 1 && p.y < y + 12 && p.y + p.h > y - 1);
  let cy = 21; if (!free(cy) && free(169 - 12 - 2)) cy = 169 - 14; else for (let n = 0; n < 8; n++) { const hit = (plates || []).find(p => p.x < x0 + w + 1 && p.x + p.w > x0 - 1 && p.y < cy + 12 && p.y + p.h > cy - 1); if (!hit) break; cy = Math.ceil(hit.y + hit.h) + 2; }
  g.fillStyle = 'rgba(21,16,34,0.82)'; g.fillRect(x0, cy, w, 10); g.fillStyle = 'rgba(217,194,140,0.5)'; g.fillRect(x0, cy + 10, w, 1); text(s, VW / 2, cy + 2, Math.sin(time * 2.2) > -0.4 ? '#ffd36b' : '#c9b27c', 'center', 6); }
