// src/online-ui.js - ONLINE CO-OP'S SCREENS (claude/onlinecoop, phase 1): the host's room card and status chip (src/online.js) and the
// guest's whole page (src/online-guest.js) are plain DOM over the canvas - a code has to be TYPED and a link COPIED, which the canvas
// cannot do - dressed like the game's own boards: the dark slate inside a wood frame, gold titles, the strict pair of pixel faces.
const CSS = `
.olx{position:fixed;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(8,6,14,.72);font:14px/1.5 "Silkscreen","Press Start 2P",sans-serif;color:#e8dcc0;-webkit-user-select:none;user-select:none;touch-action:manipulation}
.olx .ob{background:#14101e;border:3px solid #5c3a1d;box-shadow:0 0 0 2px #2a1a0e,inset 0 0 0 1px #8a6a3a;padding:18px 22px;max-width:min(560px,92vw);max-height:92vh;overflow:auto;text-align:center;box-sizing:border-box}
.olx h1{font:18px/1.4 "Press Start 2P",sans-serif;color:#ffd36b;margin:0 0 12px;letter-spacing:1px}
.olx h2{font:12px/1.4 "Press Start 2P",sans-serif;color:#c9b27c;margin:14px 0 6px}
.olx p{margin:6px 0;color:#c8c0b0}.olx .dim{color:#8a8f80;font-size:12px}.olx .bad{color:#ff9a5c}.olx .ok{color:#8fd160}
.olx button{font:12px/1 "Press Start 2P",sans-serif;color:#e8dcc0;background:#2a1a0e;border:2px solid #8a6a3a;padding:10px 14px;margin:5px;cursor:pointer;min-height:40px}
.olx button:hover,.olx button:focus{background:#3a2a16;border-color:#ffd36b;color:#ffd36b;outline:none}
.olx button.sel{border-color:#8fd160;color:#8fd160}.olx button:disabled{opacity:.45;cursor:default}
.olx input{font:20px/1 "Press Start 2P",sans-serif;width:7.2em;text-align:center;text-transform:uppercase;background:#0b0912;color:#ffd36b;border:2px solid #8a6a3a;padding:8px;margin:5px;letter-spacing:4px}
.olx .code{font:34px/1.2 "Press Start 2P",sans-serif;color:#ffd36b;letter-spacing:8px;margin:6px 0}
.olx .link{font-size:12px;color:#8fd160;word-break:break-all;background:#0b0912;padding:6px;border:1px solid #3a2a16;-webkit-user-select:all;user-select:all}
.olx button.hero{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px;min-width:84px}
.olx button.hero img{image-rendering:pixelated;display:block}
.olx .row{display:flex;flex-wrap:wrap;justify-content:center;align-items:center}
.olchip{position:fixed;left:8px;bottom:8px;z-index:19;font:11px/1.3 "Press Start 2P",sans-serif;color:#e8dcc0;background:rgba(20,16,30,.78);border:2px solid #5c3a1d;padding:5px 7px;display:flex;gap:8px;align-items:center;pointer-events:auto}
.olchip b{color:#ffd36b;font-weight:400}.olchip .ok{color:#8fd160}.olchip .bad{color:#ff9a5c}
.olchip button{font:10px/1 "Press Start 2P",sans-serif;color:#e8dcc0;background:#2a1a0e;border:1px solid #8a6a3a;padding:4px 6px;cursor:pointer}
`;
export function styles() { if (document.getElementById('olcss')) return; const s = document.createElement('style'); s.id = 'olcss'; s.textContent = CSS; document.head.appendChild(s); }
/* el('p.dim', 'text') / el('button', 'LABEL', fn) */
export function el(spec, text, onClick) {
  const [tag, ...cls] = spec.split('.'); const e = document.createElement(tag || 'div'); if (cls.length) e.className = cls.join(' ');
  if (text != null) e.textContent = text; if (onClick) e.addEventListener('click', ev => { ev.preventDefault(); onClick(ev); });
  return e;
}
/* THE BOARD: a full-screen veil with one framed card in it. Returns { root, card, set(...nodes), remove() } */
export function board(id) {
  styles(); let root = document.getElementById(id);
  if (!root) { root = el('div.olx'); root.id = id; const card = el('div.ob'); root.appendChild(card); document.body.appendChild(root); }
  const card = root.firstChild;
  return { root, card, set(...nodes) { card.replaceChildren(...nodes.filter(Boolean)); const f = card.querySelector('input,button.sel,button'); if (f) setTimeout(() => { try { f.focus({ preventScroll: true }); } catch {} }, 0); }, remove() { root.remove(); }, shown: () => root.isConnected && root.style.display !== 'none' };
}
export const row = (...nodes) => { const r = el('div.row'); r.append(...nodes.filter(Boolean)); return r; };
/* ARROW KEYS WALK THE BUTTONS of a board (the game is played on keys; a mouse should never be required) */
export function arrowsWalk(root, e) {
  const bs = [...root.querySelectorAll('button:not(:disabled)')]; if (!bs.length) return false;
  const i = bs.indexOf(document.activeElement);
  if (['ArrowDown', 'ArrowRight'].includes(e.key)) { bs[(i + 1 + bs.length) % bs.length].focus(); return true; }
  if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { bs[(i - 1 + bs.length * 2) % bs.length].focus(); return true; }
  if (['z', 'Z'].includes(e.key) && i >= 0) { bs[i].click(); return true; }
  return false;
}
