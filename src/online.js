// src/online.js - ONLINE CO-OP, THE HOST'S HALF (claude/onlinecoop, phase 1; claude/tavern, phase 2: up to THREE guests; design: codex-handoff
// reference brief-onlinecoop.md, scratch brief-tavern.md).
//
// HOST STREAMS, GUESTS SEND INPUTS. The host's browser runs the game UNCHANGED. Its frame (320x180, or the party's / a boss's wider view) is copied
// at 2x onto ONE canvas that is streamed (canvas.captureStream) with the game's own sound (the master gain, tapped: src/audio.js audioTap) to every
// guest, peer to peer - one stream, one media call per guest; each guest's keys come back on his own data channel and drive HIS SEAT in the party
// (main.js seats: src { kind: 'online', gid }) - the same p.keys / p.press a local pad writes (main.js padIntoPlayer). No game logic, no netcode,
// no determinism: an online guest is a pad that happens to be far away.
//
// THE FLOW. Title -> ONLINE CO-OP -> THE TAVERN with this board up (and the tavern's INVITE BOARD opens it again): HOST A GAME or JOIN with a code
// (which opens ?join=CODE: src/online-guest.js). Hosting shows the four-letter code (chalked on the tavern's board too) and the share link; each
// guest picks a hero from THE HOST'S roster (main.js coopPickList) and the host is armed (api.arm(hero, gid)): in the tavern he WALKS IN THROUGH THE
// DOOR, in a wood he stands up beside player one, on the title or map he joins the party for the next wood. Up to four players in all (local pads +
// guests): a guest who finds the party full is told so ('full'). THE HOST'S SAVE ONLY: the guest page never runs the game.
//
// THE JOIN SNAPSHOT (coordination with scratch brief-coopprogress.md step 1, portable guest saves): the guest's hello is
// { t: 'hi', v: 2, snap? } where snap, when the guest page sends one, is { hero, level, sword, colour } from HIS OWN save. Phase 2 reads only
// snap.colour (his wardrobe colour, if free) and otherwise ignores it; step 1 fills in the rest (the host spawns his seat from it) and adds the
// reward messages. v: 1 guests (no snap) are fine.
//
// DROP-OUT is per seat: a guest leaves (or his link is quiet for 8 s) -> his seat goes (main.js seatDrop; the last one out ends co-op as the pause
// menu's CO-OP OFF does). The room stays open, so he can come back on the same code. Pause: the guests see the host's own pause screen (it is the
// host's picture) and a HOST PAUSED banner from the state this sends four times a second.
//
// main.js knows only: init(api) once, open() from the title row / the tavern board, remote(gid) + intoPlayer(p, gid) in pollGamepad, code() for the
// tavern board, dropGuest(gid) for the tavern door. Everything PeerJS is in src/online-net.js.
import * as NET from './online-net.js';
import * as UI from './online-ui.js';
import { audioTap } from './audio.js';

let api = null, sess = null, board = null, chip = null, gidN = 0;
const HELD = ['jump', 'atk', 'dodge', 'block', 'throw', 'left', 'right', 'down', 'up', 'dance', 'talk'];
const PRESS = ['jump', 'atk', 'dodge', 'throw', 'grab', 'skill2', 'skill3', 'skill4', 'talk', 'flask', 'left', 'right', 'up', 'down'];
const QUIET_RELEASE = 3000, QUIET_DROP = 8000;   // ms of nothing from a guest before his keys let go / before he is dropped
export const MAX_GUESTS = 3;

export function init(a) {
  api = a;
  setInterval(pump, 250);
  addEventListener('keydown', modalKeys, true); addEventListener('keyup', modalKeys, true);
  window.BKONLINE = { open, host: startHost, end: endSession, debug };
}

/* ===== the seam main.js's pollGamepad calls: is this seat's guest here, and his keys into his own hands ===== */
const guestOf = gid => (sess ? sess.guests.find(q => q.gid === gid) : null);
const live = q => !!(q && q.link && q.link.open && q.hero);
export const remote = gid => !!sess && (gid == null ? sess.guests.some(live) : live(guestOf(gid)));
export function intoPlayer(p, gid) {
  const q = gid == null ? (sess && sess.guests.find(live)) : guestOf(gid); if (!q) return;
  const R = q.R;
  if (p !== R.p) { R.p = p; R.prev = {}; }   /* a new wood is a new body: it is handed whatever is held right now */
  for (const k of R.press) if (PRESS.includes(k)) p.press[k] = true;
  R.press.clear();
  for (const k of HELD) { const v = !!R.held[k]; if (v !== !!R.prev[k]) p.keys[k] = v; }
  R.prev = { ...R.held };
}
export const code = () => (sess && sess.phase !== 'error' && sess.phase !== 'opening' ? sess.code : '');
const freshHands = () => ({ held: {}, prev: {}, press: new Set(), p: null });
const releaseAll = q => { if (q) { q.R.held = {}; q.R.press.clear(); } };

/* ===== THE BOARD ===== */
function modalKeys(e) {
  if (!board || !board.shown()) return;
  e.stopImmediatePropagation();   /* the game under the board does not see these keys */
  if (e.type !== 'keydown') return;
  if (e.key === 'Escape') { e.preventDefault(); back(); return; }
  if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Enter') { e.preventDefault(); const b = board.card.querySelector('button.go'); if (b) b.click(); } return; }
  if (UI.arrowsWalk(board.root, e)) e.preventDefault();
}
function back() { if (sess && !sess.guests.length) { endSession(); } closeBoard(); }
function closeBoard() { if (board) { board.remove(); board = null; } }
export function open() {
  UI.styles(); board = UI.board('olhost');
  if (sess) { roomView(); return; }
  const ok = api.coopOk(), lw = NET.explain('locked')[1];
  const inp = UI.el('input'); inp.maxLength = 200;   /* (a pasted link must reach cleanCode whole: at 6 it was cut to HTTPS: first) */  inp.placeholder = 'CODE'; inp.autocomplete = 'off'; inp.spellcheck = false;
  inp.addEventListener('input', () => { inp.value = NET.cleanCode(inp.value); });
  const go = UI.el('button.go', 'JOIN', () => { const c = NET.cleanCode(inp.value); if (c.length >= 4) joinCode(c); else inp.focus(); });
  board.set(
    UI.el('h1', 'ONLINE CO-OP'),
    UI.el('p', 'Up to four players. The host plays player one in their own save; each guest walks into the host\'s tavern and plays a seat on the host\'s heroes.'),
    UI.el('h2', 'HOST'),
    ok ? UI.el('button.sel', 'HOST A GAME', () => startHost()) : UI.el('p.bad', lw),
    ok ? UI.el('p.dim', 'you get a code and a link to send your friends') : null,
    UI.el('h2', 'JOIN A FRIEND'),
    UI.row(inp, go),
    UI.el('p.dim', 'or open the link they sent you. Your own save is never touched.'),
    UI.row(UI.el('button', 'BACK', () => closeBoard())));
}
function joinCode(c) { location.href = location.pathname + '?join=' + c; }   /* THE GUEST IS ITS OWN PAGE (src/online-guest.js): the game here never runs while joined */

/* ===== HOSTING ===== */
export async function startHost(tries = 0) {
  if (!api.coopOk()) return { error: 'locked' };
  if (sess && tries === 0) return { code: sess.code };
  api.initAudio();   /* a click is in hand: the sound the guests will hear exists before the call is made */
  const c = NET.newCode();
  sess = { code: c, phase: 'opening', net: null, guests: [], err: '', left: '' };
  if (!board) board = UI.board('olhost');
  roomView();
  const my = sess;
  const net = await NET.host(c, {
    onReady: () => { if (sess !== my) return; my.phase = 'waiting'; roomView(); },
    onGuest: link => guestArrives(my, link),
    onError: kind => {
      if (sess !== my) return;
      if (kind === 'taken' && tries < 5) { my.dead = true; try { my.net && my.net.close(); } catch {} sess = null; startHost(tries + 1); return; }
      my.phase = 'error'; my.err = kind; roomView();
    },
  });
  if (sess !== my || my.dead) { if (net) net.close(); return sess ? { code: sess.code } : { error: 'gone' }; }
  my.net = net; if (!net) { return { error: my.err || 'other' }; }
  return { code: c };
}
/* how many more can come in: the party's free seats (main.js: four less those seated or armed), less the guests already picking */
const roomFor = my => Math.min(MAX_GUESTS - my.guests.length, (api.free ? api.free() : 1) - my.guests.filter(q => !q.hero).length);
function guestArrives(my, link) {
  if (sess !== my) { link.close(); return; }
  if (roomFor(my) <= 0) { const full = () => { link.send({ t: 'full' }); setTimeout(() => link.close('full'), 300); }; if (link.open) full(); else link.onOpen = full; return; }
  const q = { gid: 'g' + (++gidN), link, media: null, hero: null, rtt: 0, last: performance.now(), phase: 'linking', snap: null, R: freshHands() };
  my.guests.push(q); my.left = ''; roomView(); chipView();
  link.onData = m => onMsg(my, q, m);
  link.onClose = why => { if (my.guests.includes(q)) dropGuest(q.gid, why === 'p2p' ? 'NO DIRECT LINK' : 'LEFT'); };
  const opened = () => {
    q.phase = 'picking'; q.last = performance.now(); roomView();
    link.send({ t: 'roster', v: 2, heroes: api.roster(), host: api.heroName() });
    sendArt(link);
    startMedia(my, q);
  };
  if (link.open) opened(); else link.onOpen = opened;
}
function onMsg(my, q, m) {
  if (sess !== my || !my.guests.includes(q)) return;
  q.last = performance.now();
  if (m.t === 'in') { q.R.held = m.h && typeof m.h === 'object' ? m.h : {}; if (Array.isArray(m.p)) for (const k of m.p) q.R.press.add(String(k)); }
  else if (m.t === 'ping') q.link.send({ t: 'pong', t0: m.t0, rtt: q.rtt });
  else if (m.t === 'rtt') q.rtt = +m.ms || 0;
  else if (m.t === 'hi') { q.snap = m.snap && typeof m.snap === 'object' ? m.snap : null; }   /* THE JOIN SNAPSHOT (see the header): kept, colour read at the pick */
  else if (m.t === 'pick') {
    const list = api.roster().map(h => h.id), h = list.includes(m.hero) ? m.hero : null;
    if (!h) { q.link.send({ t: 'roster', v: 2, heroes: api.roster(), host: api.heroName(), why: 'pick again' }); return; }
    if ((api.free ? api.free() : 1) <= 0) { q.link.send({ t: 'full' }); setTimeout(() => dropGuest(q.gid, 'FULL'), 300); return; }
    q.hero = h; q.phase = 'playing'; releaseAll(q); q.R.p = null;
    const n = api.arm(h, q.gid, q.snap); q.link.send({ t: 'go', hero: h, n: n || 0 });
    closeBoard(); chipView();
  } else if (m.t === 'bye') dropGuest(q.gid, 'LEFT');
}
/* THE ROSTER'S FACES, once on join: each hero's baked idle preview frame (the picture the host's own co-op pick draws) as a small PNG data URL with its size.
   The guest shows them pixelated at a whole-number scale; the names stay text. A frame that cannot be read is left out (that hero shows his name alone). */
function sendArt(link) {
  const art = {};
  for (const h of api.roster()) { try { const f = api.art(h.id); if (!f || !f.width) continue; const c = document.createElement('canvas'); c.width = f.width; c.height = f.height; c.getContext('2d').drawImage(f, 0, 0); art[h.id] = { w: f.width, h: f.height, png: c.toDataURL('image/png') }; } catch {} }
  link.send({ t: 'art', v: 1, art });
}
/* A GUEST GOES: his seat drops out (main.js api.drop), and the room waits for him (or another) again */
export function dropGuest(gid, why) {
  const my = sess; if (!my) return;
  const q = guestOf(gid); if (!q) return;
  my.guests = my.guests.filter(x => x !== q);
  const had = !!q.hero;
  { const l = q.link; q.link = null; if (why === 'LEFT THE PARTY' && l && l.open) l.send({ t: 'end', why: 'party' }); try { setTimeout(() => l && l.close('dropped'), why === 'LEFT THE PARTY' ? 200 : 0); } catch {} }
  if (q.media) { try { q.media.close(); } catch {} q.media = null; }
  if (!my.guests.length) stopStream(my);
  releaseAll(q); my.left = why || 'LEFT';
  if (had) api.drop(gid, why);
  if (board) roomView(); chipView();
}
export function endSession() {
  const my = sess; if (!my) return; sess = null;
  for (const q of my.guests) { if (q.link) { q.link.send({ t: 'end' }); const l = q.link; setTimeout(() => l.close('ended'), 200); } if (q.media) try { q.media.close(); } catch {} if (q.hero) api.drop(q.gid, 'ENDED'); releaseAll(q); }
  my.guests = [];
  stopStream(my);
  if (my.net) my.net.close();
  if (chip) { chip.remove(); chip = null; }
  if (board) roomView();
}

/* ===== THE PICTURE AND THE SOUND: one stream, a call per guest ===== */
function startMedia(my, q) {
  const s = streamFor(my); if (!s || !my.net) return;
  q.media = my.net.call(q.link, s);
}
function streamFor(my) {
  if (my.stream) return my.stream;
  const cv = my.cv = document.createElement('canvas'); copyFrame(my);
  let stream; try { stream = cv.captureStream(60); } catch { return null; }
  const v = stream.getVideoTracks()[0]; if (v && 'contentHint' in v) v.contentHint = 'detail';   /* pixel art: keep the edges, not the motion blur */
  const tap = audioTap();
  if (tap) { try { my.dest = tap.ac.createMediaStreamDestination(); tap.master.connect(my.dest); my.tap = tap; for (const t of my.dest.stream.getAudioTracks()) stream.addTrack(t); } catch {} }
  my.stream = stream; frameLoop(my); return stream;
}
/* THE GAME'S OWN FRAME (320x180, or the zoomed / party view's size), at exactly 2x: every game pixel is a 2x2 block, so the video's 4:2:0 colour (one
   colour sample per 2x2) lines up with the art and the guest's integer scale-up stays crisp */
function copyFrame(my) {
  const b = api.buf, cv = my.cv; if (!b || !cv) return;
  const w = b.width * 2, h = b.height * 2;
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; my.g = null; }
  const g = my.g || (my.g = cv.getContext('2d')); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, w, h);
}
function frameLoop(my) { const f = () => { if (!my.stream) return; copyFrame(my); my.raf = requestAnimationFrame(f); }; my.raf = requestAnimationFrame(f); }
function stopStream(my) {
  if (my.raf) cancelAnimationFrame(my.raf); my.raf = 0;
  if (my.stream) for (const t of my.stream.getTracks()) try { t.stop(); } catch {}
  if (my.tap && my.dest) try { my.tap.master.disconnect(my.dest); } catch {}
  my.stream = null; my.dest = null; my.tap = null; my.cv = null; my.g = null;
}

/* ===== the beat: the host's state to each guest, and the quiet-link watchdog ===== */
let lastPump = 0;
function pump() {
  const now = performance.now(), gap = now - lastPump; lastPump = now;
  const my = sess; if (!my) return;
  for (const q of my.guests.slice()) {
    if (gap > 1000) q.last = now;   /* THIS page was busy (a wood loading blocks the thread for seconds): his messages are queued behind it, not missing - the quiet clock restarts */
    if (!live(q)) q.R.press.clear();
    const l = q.link; if (!l || !l.open) continue;
    l.send({ t: 'st', s: api.state(), paused: api.paused(), p2: q.hero, n: api.seatOf ? api.seatOf(q.gid) : 0, g: api.grab ? api.grab(q.gid) : null });   /* g: the guest's GRAB / THROW touch button (claude/partnerthrow) */
    const quiet = performance.now() - q.last;
    if (quiet > QUIET_RELEASE) q.R.held = {};   /* a stalled link lets go of his keys: a hero does not run off a ledge on a held arrow nobody is holding */
    if (quiet > QUIET_DROP) dropGuest(q.gid, 'TIMED OUT');
  }
  chipView();
}

/* ===== the room card and the chip ===== */
function shareLink(c) { return location.origin + location.pathname + '?join=' + c; }
/* the room's state, from its guests: waiting / linking / picking / playing (the first that applies, playing first) */
function phaseOf(my) {
  if (my.phase === 'opening' || my.phase === 'error') return my.phase;
  if (my.guests.some(q => q.hero)) return 'playing';
  if (my.guests.some(q => q.phase === 'picking')) return 'picking';
  if (my.guests.length) return 'linking';
  return 'waiting';
}
function roomView() {
  const my = sess; if (!board) return;
  if (!my) { open(); return; }
  const parts = [UI.el('h1', 'ONLINE CO-OP')], ph = phaseOf(my);
  if (ph === 'error') {
    const [t, w] = NET.explain(my.err, my.code);
    parts.push(UI.el('p.bad', t), UI.el('p', w), UI.row(UI.el('button.sel', 'TRY AGAIN', () => { sess = null; startHost(); }), UI.el('button', 'BACK', () => { sess = null; closeBoard(); })));
    board.set(...parts); return;
  }
  if (ph === 'opening') { parts.push(UI.el('p', 'OPENING A ROOM...'), UI.el('p.dim', 'asking the matchmaker for code ' + my.code), UI.row(UI.el('button', 'CANCEL', () => { endSession(); closeBoard(); }))); board.set(...parts); return; }
  const link = shareLink(my.code);
  const copy = UI.el('button.sel', 'COPY LINK', () => { const done = () => { copy.textContent = 'COPIED'; setTimeout(() => { copy.textContent = 'COPY LINK'; }, 1500); };
    try { navigator.clipboard.writeText(link).then(done, () => { selectLink(); }); } catch { selectLink(); } });
  const lk = UI.el('div.link', link);
  const selectLink = () => { const r = document.createRange(); r.selectNodeContents(lk); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = 'CTRL+C NOW'; };
  parts.push(UI.el('p', 'ROOM CODE'), UI.el('div.code', my.code), lk, UI.row(copy));
  for (const q of my.guests) parts.push(UI.el('p.ok', q.hero ? 'P' + ((api.seatOf && api.seatOf(q.gid)) || '?') + ' IS IN: ' + q.hero.toUpperCase() + (q.rtt ? '  ' + q.rtt + ' MS' : '') : q.phase === 'picking' ? 'A FRIEND IS PICKING A HERO...' : 'SOMEBODY IS CONNECTING...'));
  const free = Math.max(0, roomFor(my));
  const status = !my.guests.length ? (my.left ? 'A FRIEND ' + my.left + '. WAITING FOR FRIENDS...' : 'WAITING FOR FRIENDS...') : free > 0 ? 'ROOM FOR ' + free + ' MORE' : 'THE PARTY IS FULL';
  parts.push(UI.el('p' + (my.guests.length ? '.ok' : ''), status), UI.el('p.dim', 'keep this tab in front while you play: a hidden tab stops sending the picture'));
  parts.push(UI.row(my.guests.some(q => q.hero) ? UI.el('button', 'BACK TO THE GAME', () => closeBoard()) : UI.el('button', 'BACK', () => closeBoard()), UI.el('button', 'END ONLINE CO-OP', () => { endSession(); closeBoard(); })));
  board.set(...parts);
}
function chipView() {
  const my = sess;
  if (!my || my.phase === 'opening' || my.phase === 'error' || (board && board.shown())) { if (chip) chip.style.display = 'none'; return; }
  UI.styles();
  if (!chip) { chip = UI.el('div.olchip'); chip.id = 'olchip'; document.body.appendChild(chip); }
  chip.style.display = '';
  const st = my.guests.length ? my.guests.map(q => q.hero ? '<span class="ok">P' + ((api.seatOf && api.seatOf(q.gid)) || '?') + ' ' + esc(api.nameOf(q.hero)) + '</span>' + (q.rtt ? ' ' + q.rtt + ' MS' : '') : '<span class="ok">PICKING</span>').join(' ')
    : (my.left ? '<span class="bad">' + esc(my.left) + '</span> ' : '') + 'WAITING';
  const html = 'ONLINE <b>' + my.code + '</b> ' + st + ' <button data-a="room">ROOM</button>';
  if (chip.dataset.h !== html) { chip.dataset.h = html; chip.innerHTML = html; chip.querySelector('button').onclick = e => { e.preventDefault(); e.currentTarget.blur(); open(); }; }
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
/* (the phase-1 shape, for tools/online-coop.mjs: sess.hero / rtt / link / held are the FIRST guest's; guests lists them all) */
function debug() {
  const my = sess, q0 = my ? (my.guests.find(live) || my.guests[0]) : null;
  return { open: !!(board && board.shown()), chip: !!(chip && chip.style.display !== 'none'), remote: remote(), held: q0 ? { ...q0.R.held } : {},
    sess: my ? { code: my.code, phase: phaseOf(my), hero: q0 ? q0.hero : null, rtt: q0 ? q0.rtt : 0, err: my.err, left: my.left, link: !!(q0 && q0.link && q0.link.open), streaming: !!my.stream, audio: !!(my.stream && my.stream.getAudioTracks().length), size: my.cv ? [my.cv.width, my.cv.height] : null,
      guests: my.guests.map(q => ({ gid: q.gid, hero: q.hero, phase: q.phase, rtt: q.rtt, link: !!(q.link && q.link.open), seat: api.seatOf ? api.seatOf(q.gid) : 0, held: { ...q.R.held } })) } : null };
}
