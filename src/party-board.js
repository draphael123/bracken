// src/party-board.js - THE PARTY BOARD (claude/coopprogress; Daniel 10-19: "the party board is THE co-op entry"). The tavern's board station opens it
// (src/tavern.js 'board'): the four seats of the party, and on each EMPTY seat three ways to fill it -
//   JOIN        a player HERE (a pad on this machine): he picks one of this browser's OTHER save slots and a hero of that save, and plays that character;
//               what he earns is written back to that slot (main.js partyJoin / profCredit, src/coop-save.js). Or GUEST - NOTHING SAVED: today's seat.
//               A slot already playing (player one's, another seat's, one a guest page in another tab plays) is shown and refused, with the reason.
//   INVITE      a friend ONLINE: the online room card (src/online.js open: HOST A GAME / JOIN A FRIEND); he brings a save of his own.
//   AI PARTNER  shown, COMING SOON - the AI companions lane fills it (a linked companion builds on the same save API: scratch brief-aicompanions.md).
// A local seat that walked in on a pad's JUMP (a guest) can take a save afterwards: USE A SAVE on his row. Pad Start/JUMP-to-join still works as before.
// Plain DOM over the canvas, dressed like the online boards (src/online-ui.js): arrows walk the buttons, Z / ENTER take one, ESC / X go back; a pad's
// d-pad and A / B do the same. main.js gives it the api (main.js partyBoardOpen): seats, slots, join, attach, invite.
import * as UI from './online-ui.js';

let B = null, api = null, view = { k: 'seats' }, msg = null, hooked = false, padPrev = {};
export const shown = () => !!(B && B.shown());
export function open(a) { api = a; view = { k: 'seats' }; msg = null; UI.styles(); B = UI.board('olparty'); hook(); render(); }
export function close() { if (B) { B.remove(); B = null; } view = { k: 'seats' }; }
function hook() {
  if (hooked) return; hooked = true;
  addEventListener('keydown', keys, true); addEventListener('keyup', e => { if (shown()) e.stopImmediatePropagation(); }, true);
  const loop = () => { pads(); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
}
function keys(e) {
  if (!shown()) return;
  e.stopImmediatePropagation();   /* the game under the board does not see these keys */
  if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') { e.preventDefault(); back(); return; }
  if (e.key === 'Enter') { const f = document.activeElement; if (f && B.root.contains(f) && f.tagName === 'BUTTON') { e.preventDefault(); f.click(); } return; }
  if (UI.arrowsWalk(B.root, e)) e.preventDefault();
}
/* a pad walks the board too: the d-pad or the stick, A takes, B goes back */
function pads() {
  if (!shown() || !navigator.getGamepads) { padPrev = {}; return; }
  for (const gp of navigator.getGamepads()) { if (!gp || !gp.connected) continue;
    const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes || [];
    const now = { a: b(0), b: b(1), up: b(12) || ax[1] < -0.6, down: b(13) || ax[1] > 0.6, left: b(14) || ax[0] < -0.6, right: b(15) || ax[0] > 0.6 }, was = padPrev[gp.index] || {};
    padPrev[gp.index] = now; const rose = k => now[k] && !was[k];
    if (rose('b')) { back(); return; }
    if (rose('a')) { const f = document.activeElement; if (f && B.root.contains(f) && f.tagName === 'BUTTON') f.click(); return; }
    for (const [k, key] of [['up', 'ArrowUp'], ['down', 'ArrowDown'], ['left', 'ArrowLeft'], ['right', 'ArrowRight']]) if (rose(k)) { UI.arrowsWalk(B.root, { key }); return; }
  }
}
function back() { if (view.k === 'seats') { close(); api && api.sfx && api.sfx('menuClose'); return; } view = view.k === 'hero' ? { ...view, k: 'slot' } : { k: 'seats' }; msg = null; render(); }
const say = (t, ok) => { msg = { t, ok }; };

function render() {
  if (!B || !api) return;
  const parts = [];
  if (view.k === 'seats') {
    parts.push(UI.el('h1', 'THE PARTY'), UI.el('p.dim', 'FOUR SEATS. A FRIEND HERE PLAYS A SAVE OF THEIR OWN FROM THIS BROWSER; A FRIEND ONLINE BRINGS THEIRS. WHAT THEY EARN IS SAVED TO IT.'));
    const room = api.room();
    for (const s of api.seats()) {
      if (s.empty) {
        const r = UI.row(UI.el('span.seat', 'P' + s.n + '  EMPTY'));
        const j = UI.el('button' + (room > 0 ? '.sel' : ''), 'JOIN', () => { view = { k: 'slot', mode: 'join', n: s.n }; msg = null; render(); }); j.dataset.seat = s.n; j.dataset.act = 'join'; if (room <= 0) j.disabled = true;
        const inv = UI.el('button', 'INVITE', () => { close(); api.invite(); }); inv.dataset.seat = s.n; inv.dataset.act = 'invite';
        const ai = UI.el('button', 'AI PARTNER - SOON'); ai.disabled = true; ai.title = 'COMING SOON: AI COMPANIONS'; ai.dataset.act = 'ai';
        r.append(j, inv, ai); parts.push(r); continue;
      }
      const from = s.kind === 'ally' ? 'COMPUTER' : s.saved ? (s.kind === 'online' ? 'ONLINE, ' : '') + 'SLOT ' + (s.slot + 1) : s.kind === 'online' ? 'ONLINE GUEST - NOTHING SAVED' : 'GUEST - NOTHING SAVED';
      const r = UI.row(UI.el('span.seat' + (s.saved ? '.ok' : ''), 'P' + s.n + '  ' + s.hero + (s.lv != null ? ' LV ' + s.lv : '') + '  ' + from));
      if (s.kind === 'local' && !s.saved) { const u = UI.el('button', 'USE A SAVE', () => { view = { k: 'slot', mode: 'attach', n: s.n }; msg = null; render(); }); u.dataset.seat = s.n; u.dataset.act = 'attach'; r.append(u); }
      parts.push(r);
    }
    if (msg) parts.push(UI.el(msg.ok ? 'p.ok' : 'p.bad', msg.t));
    parts.push(UI.el('p.dim', 'A PAD\'S JUMP OR START ANYWHERE IN THE INN STILL WALKS A GUEST IN.'), UI.row(UI.el('button', 'BACK', () => back())));
  } else if (view.k === 'slot') {
    parts.push(UI.el('h1', 'P' + view.n + ': PICK A SAVE'), UI.el('p.dim', 'ONE OF THIS BROWSER\'S SAVE SLOTS. AN EMPTY ONE STARTS A NEW SAVE.'));
    for (const sl of api.slots()) { const b = UI.el('button' + (sl.ok ? '' : '.no'), sl.line + (sl.ok ? '' : '  (' + sl.why + ')'), () => { if (!sl.ok) return; view = { ...view, k: 'hero', slot: sl.i, heroes: sl.heroes }; msg = null; render(); }); b.dataset.slot = sl.i; if (!sl.ok) b.disabled = true; parts.push(UI.row(b)); }
    if (view.mode === 'join') { const g = UI.el('button', 'GUEST - NOTHING SAVED', () => { view = { ...view, k: 'hero', slot: -1, heroes: api.visitHeroes() }; msg = null; render(); }); g.dataset.slot = -1; parts.push(UI.row(g)); }
    if (msg) parts.push(UI.el(msg.ok ? 'p.ok' : 'p.bad', msg.t));
    parts.push(UI.row(UI.el('button', 'BACK', () => back())));
  } else if (view.k === 'hero') {
    parts.push(UI.el('h1', 'P' + view.n + ': PICK A HERO'), UI.el('p.dim', view.slot >= 0 ? 'FROM SLOT ' + (view.slot + 1) + ': ITS LEVEL, KIT AND TALENTS COME WITH THE HERO' : 'A GUEST: NOTHING IS SAVED'));
    const r = UI.row();
    for (const h of view.heroes || []) { const b = UI.el('button', api.heroName(h), () => take(h)); b.dataset.hero = h; r.append(b); }
    parts.push(r);
    if (msg) parts.push(UI.el(msg.ok ? 'p.ok' : 'p.bad', msg.t));
    parts.push(UI.row(UI.el('button', 'BACK', () => back())));
  }
  B.set(...parts);
}
function take(h) {
  const r = view.mode === 'attach' ? api.attach(view.n, view.slot, h) : api.join(view.slot, h);
  if (!r || !r.ok) { say((r && r.why) || 'THAT DID NOT WORK', false); render(); return; }
  const where = view.slot >= 0 ? ' ON SLOT ' + (view.slot + 1) : ' AS A GUEST';
  say('P' + r.n + ' ' + (view.mode === 'attach' ? 'PLAYS' : 'JOINS') + where + (view.mode === 'join' ? ': PRESS A BUTTON ON A FREE PAD' : ''), true);
  view = { k: 'seats' }; render();
}
export function debug() { return { shown: shown(), view: view.k, mode: view.mode || null, text: B ? B.card.innerText : '', buttons: B ? [...B.card.querySelectorAll('button')].map(b => ({ t: b.textContent, dis: b.disabled, act: b.dataset.act || null, slot: b.dataset.slot ?? null, hero: b.dataset.hero || null })) : [] }; }
