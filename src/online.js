// src/online.js - ONLINE CO-OP, THE HOST'S HALF (claude/onlinecoop, phase 1; design: codex-handoff reference brief-onlinecoop.md).
//
// HOST STREAMS, GUEST SENDS INPUTS. The host's browser runs the game UNCHANGED. Its 320x180 frame is copied at 2x onto a canvas that is
// streamed (canvas.captureStream) with the game's own sound (the master gain, tapped: src/audio.js audioTap) to the guest, peer to peer;
// the guest's keys come back on a data channel and drive PLAYER TWO through the EXISTING local co-op slot - the same p.keys / p.press a
// second pad writes (main.js padIntoPlayer). No game logic, no netcode, no determinism: player two is a pad that happens to be far away.
//
// THE FLOW. Title -> ONLINE CO-OP -> this board: HOST A GAME (locked, with the local co-op words, until the save owns a second hero -
// main.js coopOk, the same gate) or JOIN with a code (which opens ?join=CODE: src/online-guest.js). Hosting shows the four-letter code and
// the share link; the guest picks a hero from THE HOST'S roster (main.js coopPickList, as local player two does) and the host is armed
// (coopWant) - in a wood he stands up at once beside player one, on the title the host goes on to the map. THE HOST'S SAVE ONLY: the guest
// page never runs the game, so his own save is never read or written.
//
// DROP-OUT is local co-op's: the guest leaves (or his link is quiet for 8 s) -> coopWant off and coopEnd(), exactly the pause menu's
// "co-op off". The room stays open, so he can come back on the same code. Pause: the guest sees the host's own pause screen (it is the
// host's picture) and a HOST PAUSED banner from the state this sends four times a second.
//
// main.js knows only: init(api) once, open() from the title row, remote() + intoPlayer(p) in pollGamepad. Everything PeerJS is in
// src/online-net.js.
import * as NET from './online-net.js';
import * as UI from './online-ui.js';
import { audioTap } from './audio.js';

let api = null, sess = null, board = null, chip = null;
/* THE FAR HANDS: what the guest holds now, and the one-shot presses waiting for the next frame */
const R = { held: {}, prev: {}, press: new Set(), p: null };
const HELD = ['jump', 'atk', 'dodge', 'block', 'throw', 'left', 'right', 'down', 'up', 'dance', 'talk'];
const PRESS = ['jump', 'atk', 'dodge', 'throw', 'skill2', 'skill3', 'skill4', 'talk', 'flask', 'left', 'right', 'up', 'down'];
const QUIET_RELEASE = 3000, QUIET_DROP = 8000;   // ms of nothing from the guest before his keys let go / before he is dropped

export function init(a) {
  api = a;
  setInterval(pump, 250);
  addEventListener('keydown', modalKeys, true); addEventListener('keyup', modalKeys, true);
  window.BKONLINE = { open, host: startHost, end: endSession, debug };
}

/* ===== the seam main.js's pollGamepad calls: is player two remote, and his keys into his own hands ===== */
export const remote = () => !!(sess && sess.link && sess.link.open && sess.hero);
export function intoPlayer(p) {
  if (p !== R.p) { R.p = p; R.prev = {}; }   /* a new wood is a new body: it is handed whatever is held right now */
  for (const k of R.press) if (PRESS.includes(k)) p.press[k] = true;
  R.press.clear();
  for (const k of HELD) { const v = !!R.held[k]; if (v !== !!R.prev[k]) p.keys[k] = v; }
  R.prev = { ...R.held };
}
const releaseAll = () => { R.held = {}; R.press.clear(); };

/* ===== THE BOARD ===== */
function modalKeys(e) {
  if (!board || !board.shown()) return;
  e.stopImmediatePropagation();   /* the game under the board does not see these keys */
  if (e.type !== 'keydown') return;
  if (e.key === 'Escape') { e.preventDefault(); back(); return; }
  if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Enter') { e.preventDefault(); const b = board.card.querySelector('button.go'); if (b) b.click(); } return; }
  if (UI.arrowsWalk(board.root, e)) e.preventDefault();
}
function back() { if (sess && !sess.hero) { endSession(); } closeBoard(); }
function closeBoard() { if (board) { board.remove(); board = null; } }
export function open() {
  UI.styles(); board = UI.board('olhost');
  if (sess) { roomView(); return; }
  const ok = api.coopOk(), lw = NET.explain('locked')[1];
  const inp = UI.el('input'); inp.maxLength = 6; inp.placeholder = 'CODE'; inp.autocomplete = 'off'; inp.spellcheck = false;
  inp.addEventListener('input', () => { inp.value = NET.cleanCode(inp.value); });
  const go = UI.el('button.go', 'JOIN', () => { const c = NET.cleanCode(inp.value); if (c.length >= 4) joinCode(c); else inp.focus(); });
  board.set(
    UI.el('h1', 'ONLINE CO-OP'),
    UI.el('p', 'Two players on two machines. The host plays player one in their own save; the guest plays player two on the host\'s heroes.'),
    UI.el('h2', 'HOST'),
    ok ? UI.el('button.sel', 'HOST A GAME', () => startHost()) : UI.el('p.bad', lw),
    ok ? UI.el('p.dim', 'you get a code and a link to send your friend') : null,
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
  api.initAudio();   /* a click is in hand: the sound the guest will hear exists before the call is made */
  const code = NET.newCode();
  sess = { code, phase: 'opening', net: null, link: null, media: null, hero: null, rtt: 0, last: 0, err: '', left: '' };
  if (!board) board = UI.board('olhost');
  roomView();
  const my = sess;
  const net = await NET.host(code, {
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
  return { code };
}
function guestArrives(my, link) {
  if (sess !== my) { link.close(); return; }
  if (my.link && my.link.open) { link.onOpen = () => { link.send({ t: 'full' }); setTimeout(() => link.close('full'), 300); }; return; }   /* phase one is two players */
  my.link = link; my.phase = 'linking'; my.last = performance.now(); roomView();
  link.onData = m => onMsg(my, link, m);
  link.onClose = why => { if (my.link === link) dropGuest(my, why === 'p2p' ? 'NO DIRECT LINK' : 'LEFT'); };
  const opened = () => {
    my.phase = 'picking'; my.last = performance.now(); roomView();
    link.send({ t: 'roster', v: 1, heroes: api.roster(), host: api.heroName() });
    sendArt(link);
    startMedia(my, link);
  };
  if (link.open) opened(); else link.onOpen = opened;
}
function onMsg(my, link, m) {
  if (sess !== my || my.link !== link) return;
  my.last = performance.now();
  if (m.t === 'in') { R.held = m.h && typeof m.h === 'object' ? m.h : {}; if (Array.isArray(m.p)) for (const k of m.p) R.press.add(String(k)); }
  else if (m.t === 'ping') link.send({ t: 'pong', t0: m.t0, rtt: my.rtt });
  else if (m.t === 'rtt') my.rtt = +m.ms || 0;
  else if (m.t === 'pick') {
    const list = api.roster().map(h => h.id), h = list.includes(m.hero) ? m.hero : null;
    if (!h) { link.send({ t: 'roster', v: 1, heroes: api.roster(), host: api.heroName(), why: 'pick again' }); return; }
    my.hero = h; my.phase = 'playing'; releaseAll(); R.p = null;
    api.arm(h); link.send({ t: 'go', hero: h });
    closeBoard(); chipView();
  } else if (m.t === 'bye') dropGuest(my, 'LEFT');
}
/* THE ROSTER'S FACES, once on join: each hero's baked idle preview frame (the picture the host's own co-op pick draws) as a small PNG data URL with its size.
   The guest shows them pixelated at a whole-number scale; the names stay text. A frame that cannot be read is left out (that hero shows his name alone). */
function sendArt(link) {
  const art = {};
  for (const h of api.roster()) { try { const f = api.art(h.id); if (!f || !f.width) continue; const c = document.createElement('canvas'); c.width = f.width; c.height = f.height; c.getContext('2d').drawImage(f, 0, 0); art[h.id] = { w: f.width, h: f.height, png: c.toDataURL('image/png') }; } catch {} }
  link.send({ t: 'art', v: 1, art });
}
/* THE GUEST GOES: player two drops out exactly as local co-op's does (coopWant off, coopEnd), and the room waits for him again */
function dropGuest(my, why) {
  if (sess !== my) return;
  const had = !!my.hero;
  if (my.link) { const l = my.link; my.link = null; try { l.close('dropped'); } catch {} }
  if (my.media) { try { my.media.close(); } catch {} my.media = null; }
  stopStream(my);
  releaseAll(); my.hero = null; my.rtt = 0; my.left = why || 'LEFT';
  if (had) api.drop(why);
  my.phase = 'waiting';
  if (board) roomView(); chipView();
}
export function endSession() {
  const my = sess; if (!my) return; sess = null;
  if (my.link) { my.link.send({ t: 'end' }); const l = my.link; setTimeout(() => l.close('ended'), 200); }
  if (my.media) try { my.media.close(); } catch {}
  stopStream(my);
  if (my.hero) api.drop('ENDED');
  releaseAll();
  if (my.net) my.net.close();
  if (chip) { chip.remove(); chip = null; }
  if (board) roomView();
}

/* ===== THE PICTURE AND THE SOUND ===== */
function startMedia(my, link) {
  const s = streamFor(my); if (!s || !my.net) return;
  my.media = my.net.call(link, s);
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
/* THE GAME'S OWN 320x180 (or the zoomed view's size), at exactly 2x: every game pixel is a 2x2 block, so the video's 4:2:0 colour (one
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

/* ===== the beat: the host's state to the guest, and the quiet-link watchdog ===== */
let lastPump = 0;
function pump() {
  const now = performance.now(), gap = now - lastPump; lastPump = now;
  const my = sess; if (!my) return;
  if (gap > 1000) my.last = now;   /* THIS page was busy (a wood loading blocks the thread for seconds): his messages are queued behind it, not missing - the quiet clock restarts */
  if (!remote()) R.press.clear();
  const l = my.link; if (!l || !l.open) { chipView(); return; }
  l.send({ t: 'st', s: api.state(), paused: api.paused(), p2: my.hero });
  const quiet = performance.now() - my.last;
  if (quiet > QUIET_RELEASE) R.held = {};   /* a stalled link lets go of his keys: a hero does not run off a ledge on a held arrow nobody is holding */
  if (quiet > QUIET_DROP) { dropGuest(my, 'TIMED OUT'); return; }
  chipView();
}

/* ===== the room card and the chip ===== */
function shareLink(code) { return location.origin + location.pathname + '?join=' + code; }
function roomView() {
  const my = sess; if (!board) return;
  if (!my) { open(); return; }
  const parts = [UI.el('h1', 'ONLINE CO-OP')];
  if (my.phase === 'error') {
    const [t, w] = NET.explain(my.err, my.code);
    parts.push(UI.el('p.bad', t), UI.el('p', w), UI.row(UI.el('button.sel', 'TRY AGAIN', () => { sess = null; startHost(); }), UI.el('button', 'BACK', () => { sess = null; closeBoard(); })));
    board.set(...parts); return;
  }
  if (my.phase === 'opening') { parts.push(UI.el('p', 'OPENING A ROOM...'), UI.el('p.dim', 'asking the matchmaker for code ' + my.code), UI.row(UI.el('button', 'CANCEL', () => { endSession(); closeBoard(); }))); board.set(...parts); return; }
  const link = shareLink(my.code);
  const copy = UI.el('button.sel', 'COPY LINK', () => { const done = () => { copy.textContent = 'COPIED'; setTimeout(() => { copy.textContent = 'COPY LINK'; }, 1500); };
    try { navigator.clipboard.writeText(link).then(done, () => { selectLink(); }); } catch { selectLink(); } });
  const lk = UI.el('div.link', link);
  const selectLink = () => { const r = document.createRange(); r.selectNodeContents(lk); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = 'CTRL+C NOW'; };
  parts.push(UI.el('p', 'ROOM CODE'), UI.el('div.code', my.code), lk, UI.row(copy));
  const status = my.phase === 'waiting' ? (my.left ? 'PLAYER TWO ' + my.left + '. WAITING FOR THEM AGAIN...' : 'WAITING FOR PLAYER TWO...')
    : my.phase === 'linking' ? 'SOMEBODY IS CONNECTING...' : my.phase === 'picking' ? 'PLAYER TWO IS PICKING A HERO...' : 'PLAYER TWO IS IN: ' + (my.hero || '').toUpperCase();
  parts.push(UI.el('p' + (my.phase === 'waiting' ? '' : '.ok'), status), UI.el('p.dim', 'keep this tab in front while you play: a hidden tab stops sending the picture'));
  parts.push(UI.row(my.phase === 'playing' ? UI.el('button', 'BACK TO THE GAME', () => closeBoard()) : null, UI.el('button', 'END ONLINE CO-OP', () => { endSession(); closeBoard(); })));
  board.set(...parts);
}
function chipView() {
  const my = sess;
  if (!my || my.phase === 'opening' || my.phase === 'error' || (board && board.shown())) { if (chip) chip.style.display = 'none'; return; }
  UI.styles();
  if (!chip) { chip = UI.el('div.olchip'); chip.id = 'olchip'; document.body.appendChild(chip); }
  chip.style.display = '';
  const st = my.hero ? '<span class="ok">P2 ' + esc(api.nameOf(my.hero)) + '</span> ' + (my.rtt ? my.rtt + ' MS' : '')
    : my.link && my.link.open ? '<span class="ok">P2 PICKING</span>' : (my.left ? '<span class="bad">P2 ' + esc(my.left) + '</span> ' : '') + 'WAITING';
  const html = 'ONLINE <b>' + my.code + '</b> ' + st + ' <button data-a="room">ROOM</button>';
  if (chip.dataset.h !== html) { chip.dataset.h = html; chip.innerHTML = html; chip.querySelector('button').onclick = e => { e.preventDefault(); e.currentTarget.blur(); open(); }; }
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function debug() { const my = sess; return { open: !!(board && board.shown()), chip: !!(chip && chip.style.display !== 'none'), remote: remote(), held: { ...R.held }, sess: my ? { code: my.code, phase: my.phase, hero: my.hero, rtt: my.rtt, err: my.err, left: my.left, link: !!(my.link && my.link.open), streaming: !!my.stream, audio: !!(my.stream && my.stream.getAudioTracks().length), size: my.cv ? [my.cv.width, my.cv.height] : null } : null }; }
