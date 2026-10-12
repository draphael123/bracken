// src/bug-report-ui.js - THE REPORT A BUG BOARD (claude/shipfix): one line 'what happened?', then the REPORT CODE, copied to the clipboard and shown
// selectable on screen as the fallback. Plain DOM over the canvas like the online board (src/online-ui.js): a line has to be TYPED and a code COPIED,
// which the canvas cannot do. The game under it never sees a key while it is up (the same capture-phase swallow src/online.js uses).
import * as UI from './online-ui.js';
import { buildReport } from './bug-report.js';

let board = null, snapFn = null, onClose = null;
const ID = 'bugboard';
export const isOpen = () => !!(board && board.root.isConnected);
function keys(e) {
  if (!isOpen()) return;
  e.stopImmediatePropagation();
  if (e.type !== 'keydown') return;
  if (e.key === 'Escape') { e.preventDefault(); close(); return; }
  if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Enter') { e.preventDefault(); const b = board.card.querySelector('button.go'); if (b) b.click(); } return; }
  if (e.target && e.target.tagName === 'TEXTAREA') return;
  if (UI.arrowsWalk(board.root, e)) e.preventDefault();
}
let wired = false;
export function close() { if (board) { board.remove(); board = null; } const cb = onClose; onClose = null; if (cb) cb(); }
async function copy(text, ta) {
  try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); return true; } } catch {}
  try { ta.focus(); ta.select(); return !!document.execCommand('copy'); } catch { return false; }
}
/* open(snapshot, afterClose): snapshot() returns the game's facts for the report (main.js bugSnapshot) */
export function open(snapshot, afterClose) {
  if (!wired) { wired = true; addEventListener('keydown', keys, true); addEventListener('keyup', keys, true); }
  snapFn = snapshot; onClose = afterClose || null; UI.styles(); board = UI.board(ID);
  const inp = UI.el('input'); inp.maxLength = 140; inp.placeholder = 'what happened?'; inp.autocomplete = 'off'; inp.spellcheck = true; inp.id = 'bugnote';
  inp.style.cssText = 'width:min(440px,78vw);text-transform:none;letter-spacing:0;font-size:14px;text-align:left';
  const go = UI.el('button.go', 'MAKE REPORT CODE', () => make(inp.value));
  board.set(
    UI.el('h1', 'REPORT A BUG'),
    UI.el('p', 'Tell us in one line what went wrong (you can leave it empty).'),
    UI.row(inp),
    UI.el('p.dim', 'The report is a short code with the version, where you are, your hero, a few settings and the last errors. Never your save. Nothing is sent anywhere.'),
    UI.row(go, UI.el('button', 'CANCEL', () => close())));
}
async function make(note) {
  let made; try { made = await buildReport(snapFn(), note); } catch (e) { made = null; }
  if (!board) return;
  if (!made) { board.set(UI.el('h1', 'REPORT A BUG'), UI.el('p.bad', 'Could not build the report code.'), UI.row(UI.el('button.sel', 'CLOSE', () => close()))); return; }
  const ta = document.createElement('textarea'); ta.readOnly = true; ta.value = made.code; ta.rows = 6; ta.id = 'bugcode';
  ta.style.cssText = 'width:min(480px,82vw);font:12px/1.4 monospace;background:#0b0912;color:#8fd160;border:1px solid #3a2a16;padding:6px;word-break:break-all;resize:none;user-select:all;-webkit-user-select:all';
  const status = UI.el('p.ok', '');
  const done = async () => { const ok = await copy(made.code, ta); status.className = ok ? 'ok' : 'bad'; status.textContent = ok ? 'REPORT CODE COPIED.' : 'Could not copy by itself: select the code below and copy it.'; if (!ok) { ta.focus(); ta.select(); } };
  board.set(
    UI.el('h1', 'REPORT A BUG'), status,
    UI.el('h2', 'PASTE THIS TO THE DEVELOPER'), ta,
    UI.el('p.dim', made.code.length + ' characters'),
    UI.row(UI.el('button.go', 'COPY AGAIN', () => done()), UI.el('button.sel', 'CLOSE', () => close())));
  done();
}
export const test = { open, close, isOpen };
