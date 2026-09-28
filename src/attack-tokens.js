// src/attack-tokens.js - ATTACK TOKENS: ONE OR TWO AT A TIME (the combat pass, part 1; Daniel, backlog item 13).
//
// A crowd used to be six foes each deciding on its own to swing, and the swings landed together: a pile-on is
// not a fight you can read. Now each hero carries a small purse of ATTACK TOKENS (TOKENS.perHero, two). A common
// foe must hold one to wind up a blow at that hero; it keeps it through the windup, the blow and a short tail
// after, and gives it back. Everyone else WAITS - and a waiting foe is never a statue: it keeps its ground on a
// ring round the hero, pacing in and out, facing him, reloading (its cooldown is held), and it steps in the moment
// a token comes free. Bosses, minis and their scripted adds are outside the purse (TOKENS.exempt), ambushes are in.
//
// HOW IT HOOKS IN (thin, on purpose - src/main.js is three megabytes):
//   tokenPre(board, e, hero, api)    at the top of updateEnemies' loop, before the creature's own update:
//                                    snapshots its mode and, if it cannot have a token, holds its cooldown up.
//   tokenHold(board, e, api, dt)     just before the creature's own update: a foe turned away sits its AI out until there is room.
//   tokenPost(board, enemies, api, dt) once after the loop, before anything is drawn: a foe that STARTED a windup
//                                    this frame is granted a token or put back as it was (its mode, its timer and
//                                    the ! it called are taken back, so the screen never shows a tell that is not
//                                    thrown); holders are released; waiting foes are walked round the ring.
// The creature code is not touched: the token only ever sees windingUp(e), the same predicate the marks read.
//
// THE HOOKS FOR PART 2 (squads, reactive foes, varied told swings, a visible poise break, pogo chains off foes):
//   TOKENS.cost(e)        what a blow costs: 1 now. A squad's heavy (a brute's overhead) can cost 2 and so be alone.
//   TOKENS.cap(hero)      the purse: 2 now. Difficulty, a squad's banner or a hero's state can widen or narrow it.
//   TOKENS.priority(e)    who is served first when two ask on one frame (a squad leader, a foe the hero just hit).
//   claim(board, hero, e) / release(board, e, why)   for code that wants a token on purpose (a squad that plans a
//                         pincer claims for two members at once; a poise break calls release(e, 'broken')).
//   board.on.grant / .cancel / .release(e, why)   events: a granted foe can have a varied delay added to its tell
//                         here (delayed/varied swings), a reactive foe can pick its waiting move on cancel.
//   e.tokWait, e.tokRing  a waiting foe and the ring distance it holds: where the next pogo stepping stone stands.
//   TOKENS.waitMove(e, hero, api, dt) the waiting behaviour itself: replace it per foe for block / flank / reload.

export const TOKENS = {
  perHero: 2,        // at most this many common foes winding up or striking at one hero at once
  tail: 0.45,        // s a holder keeps its token after its windup ends: the blow itself and its follow-through
  rest: 0.7,         // s after giving a token back before the same foe may ask again: the others get their turn
  deny: 0.3,         // s a foe turned away holds its cooldown up before it may ask again
  ring: 58,          // px: the nearest waiting foe holds this far from the hero
  ringStep: 22,      // px: each further waiting foe on the same side holds this much further out
  near: 150,         // px: a waiting foe closer than this is walked round the ring; further out it keeps its own AI
  far: 300,          // px: a holder this far from its hero gives the token back
  idleModes: new Set(['walk', 'idle', 'stalk', 'patrol', 'chase']),   // the plain modes a creature stands about in: never a recovery
  cost: () => 1,
  cap: () => TOKENS.perHero,
  priority: e => (e.elite ? 1 : 0),
  exempt: () => false,   // main.js supplies this (bosses, minis, their adds, trainers, dummies)
  waitMove: null,        // set below
};

export function tokenBoard() {
  return { held: new Map(), reserve: new Map(), frame: 0, order: [], on: {}, stats: { grants: 0, cancels: 0, overflow: 0, maxHeld: 0 } };
}

const heldBy = (board, hero) => { let s = board.held.get(hero); if (!s) board.held.set(hero, s = new Set()); return s; };
const used = (board, hero) => { let n = 0; for (const q of heldBy(board, hero)) n += q.tokCost || 1; return n; };

// IS THERE ROOM FOR IT? An elite captain near his hero keeps one token back for himself: his minions share the rest, so the
// captain is never the one left waiting on a minion (and his own moves, which remember where they were, are never taken back).
export function room(board, hero, e) {
  const cap = e.elite ? TOKENS.cap(hero) : Math.max(1, TOKENS.cap(hero) - (board.reserve.get(hero) || 0));
  return used(board, hero) + (TOKENS.cost(e) || 1) <= cap;
}
export function claim(board, hero, e, force = false) {
  const cost = TOKENS.cost(e) || 1;
  if (!room(board, hero, e)) { if (!force) return false; board.stats.overflow++; }
  heldBy(board, hero).add(e); e.tokHeld = hero; e.tokCost = cost; e.tokTail = TOKENS.tail; e.tokWait = false;
  board.stats.grants++; if (board.on.grant) board.on.grant(e);
  return true;
}
export function release(board, e, why = 'done') {
  if (!e.tokHeld) return;
  const s = board.held.get(e.tokHeld); if (s) s.delete(e);
  e.tokHeld = null; e.tokRest = TOKENS.rest;
  if (board.on.release) board.on.release(e, why);
}

// BEFORE THE CREATURE THINKS. Everything it needs to be put back, and a held cooldown if it may not ask.
export function tokenPre(board, e, hero, api) {
  if (TOKENS.exempt(e)) { if (e.tokHeld) release(board, e, 'exempt'); e.tokFrame = -1; e.tokWait = false; return; }
  e.tokFrame = board.frame; e.tokHero = hero;
  e.tokSnap = { mode: e.mode, modeT: e.modeT, draw: e.draw, cd: e.cd, x: e.x, wu: api.windingUp(e) };
  board.order.push([e, api.nums().length]);
  if (e.tokRest > 0) e.tokRest -= api.dt;
  if (e.tokDeny > 0) e.tokDeny -= api.dt;
  if (e.tokHeld) return;
  const shut = e.tokRest > 0 || e.tokDeny > 0 || !room(board, hero, e);
  e.tokWait = shut;
  if (shut && typeof e.cd === 'number') e.cd = Math.max(e.cd, 0.12);   /* RELOADING: its next blow is held, not thrown */
}

// HELD OUT: A FOE TURNED AWAY DOES NOT THINK AGAIN UNTIL THERE IS ROOM. Put back once, a creature whose blow waits on nothing
// but range (the hedge knight's leap, the pike's thrust) would reach for it again next frame, and the next - every frame a
// windup begun and taken back, and every frame its SFX. So until a token is free it is not asked: it falls, it holds the ring
// (tokenPost walks it), and its own update is skipped. Called just before the creature's own update, after its knocks and
// staggers have been dealt with, so a waiting foe can still be thrown, broken and killed.
export function tokenHold(board, e, api, dt) {
  if (!e.tokOut || e.tokHeld || e.tokFrame !== board.frame) return false;
  if ((room(board, e.tokHero, e) && !(e.tokDeny > 0)) || !api.grounded(e) || e.tokHero.dead) { e.tokOut = false; return false; }
  e.vy = Math.min(320, (e.vy || 0) + 1000 * dt); const r = api.fall(e, e.vy * dt); if (r && r.ground) e.vy = 0;
  e.tokWait = true;
  return true;
}

// AFTER EVERY CREATURE HAS THOUGHT, BEFORE ANYTHING IS DRAWN.
export function tokenPost(board, enemies, api, dt) {
  const nums = api.nums(), order = board.order, drop = [];
  // who asked this frame, best first (TOKENS.priority), then in the order they moved
  const fresh = [];
  for (let i = 0; i < order.length; i++) {
    const [e, n0] = order[i], n1 = i + 1 < order.length ? order[i + 1][1] : nums.length;
    if (e.tokFrame !== board.frame || !e.tokSnap) continue;
    const wu = e.alive && api.windingUp(e);
    if (e.tokHeld) {
      const hero = e.tokHeld;
      if (!e.alive || e.knock > 0 || e.broken > 0 || e.pinned > 0 || Math.abs(e.x - hero.x) > TOKENS.far) { release(board, e, !e.alive ? 'dead' : 'broken'); continue; }
      if (wu) e.tokTail = TOKENS.tail; else if ((e.tokTail -= dt) <= 0) release(board, e, 'done');
      continue;
    }
    if (wu && !e.tokSnap.wu) fresh.push([e, n0, n1, i]);
    else if (wu) claim(board, e.tokHero, e, true);   /* already mid-tell when it came under the rule: let it finish, and count it */
  }
  fresh.sort((a, b) => (TOKENS.priority(b[0]) - TOKENS.priority(a[0])) || (a[3] - b[3]));
  for (const [e, n0, n1] of fresh) {
    if (claim(board, e.tokHero, e, !!e.elite)) continue;
    // TURNED AWAY: put it back exactly as it was before this frame's decision, and take back the mark it called
    const s = e.tokSnap; e.mode = s.mode; e.modeT = s.modeT; if (s.draw !== undefined || e.draw !== undefined) e.draw = s.draw || 0;
    if (typeof s.cd === 'number') e.cd = Math.max(s.cd, 0.12);
    e.tokDeny = TOKENS.deny; e.tokWait = true; e.tokOut = true; board.stats.cancels++;
    for (let k = Math.min(n1, nums.length) - 1; k >= n0; k--) { const n = nums[k]; if (n && (n.txt === '!' || n.txt === '!!')) drop.push(k); }
    if (board.on.cancel) board.on.cancel(e);
  }
  drop.sort((a, b) => b - a); for (const k of drop) nums.splice(k, 1);
  // THE DEAD GIVE THEIRS BACK, wherever they fell
  for (const [hero, set] of board.held) for (const q of set) if (!q.alive || !enemies.includes(q)) { set.delete(q); q.tokHeld = null; }
  for (const [, set] of board.held) board.stats.maxHeld = Math.max(board.stats.maxHeld, set.size);
  board.reserve.clear();
  for (const [e] of order) if (e.elite && e.alive && !e.tokHeld && e.tokFrame === board.frame && Math.abs(e.x - e.tokHero.x) < 200)
    board.reserve.set(e.tokHero, Math.min(1, (board.reserve.get(e.tokHero) || 0) + 1));
  // THE WAITING RING: rank the waiting walkers on each side of their hero, nearest first. Waiting is two things: turned away
  // by the purse (tokWait), or RELOADING - and either way only in its plain walking mode, never in a recovery (rest, reel,
  // stun: the hero's opening, which must stay where it is). Reloading is at arm's length: its own blow on a cooldown it keeps in e.cd. It steps back out to
  // the ring while it reloads, and its own AI walks it in again the moment the cooldown is up.
  const ring = new Map();
  for (const [e] of order) {
    if (e.tokFrame !== board.frame || !e.alive || e.tokHeld || !api.walker(e)) { e.tokRing = 0; continue; }
    const hero = e.tokHero, d = e.x - hero.x;
    const idle = !e.tokWait && typeof e.cd === 'number' && e.cd > 0.3 && TOKENS.idleModes.has(e.mode) && !(e.stagger > 0) && Math.abs(d) < TOKENS.ring && !api.windingUp(e);
    if (!(e.tokWait || idle) || !TOKENS.idleModes.has(e.mode) || Math.abs(d) > TOKENS.near || Math.abs(e.y - hero.y) > 40 || hero.dead) { e.tokRing = 0; continue; }
    const key = hero; let l = ring.get(key); if (!l) ring.set(key, l = []); l.push(e);
  }
  for (const [hero, l] of ring) {
    for (const side of [-1, 1]) {
      const mine = l.filter(e => (Math.sign(e.x - hero.x) || 1) === side).sort((a, b) => Math.abs(a.x - hero.x) - Math.abs(b.x - hero.x));
      mine.forEach((e, k) => { e.tokRing = TOKENS.ring + k * TOKENS.ringStep; TOKENS.waitMove(e, hero, api, dt); });
    }
  }
  board.frame++; board.order = [];
}

// THE WAITING MOVE: hold the ring, pace in and out on it, face the hero. Its own step toward him this frame is
// taken back first (x only: it still falls, and still turns its guard). Never off a ledge, into spikes or water.
TOKENS.waitMove = (e, hero, api, dt) => {
  if (e.knock > 0 || e.stagger > 0 || e.broken > 0 || e.pinned > 0 || e.carried > 0) return;
  const s = e.tokSnap; if (!s || Math.abs(e.x - s.x) > 6) return;   /* something bigger than a walk moved it: leave it */
  e.x = s.x;
  if (e.tokPh === undefined) e.tokPh = Math.random() * 6.28;
  const side = Math.sign(e.x - hero.x) || 1, ad = Math.abs(e.x - hero.x);
  const goal = e.tokRing + Math.sin(api.time * 1.6 + e.tokPh) * 12;
  const spd = Math.min(e.speed || 40, 60) * 0.75;
  let v = ad < goal - 3 ? side * spd : ad > goal + 3 ? -side * spd : side * spd * 0.6 * Math.sign(Math.sin(api.time * 2.3 + e.tokPh));
  if (v && !api.safeStep(e.x + Math.sign(v) * ((e.w || 10) / 2 + 3), e.y)) v = 0;
  e.face = -side; e.vx = v;
  if (v) api.move(e, v * dt);
};
