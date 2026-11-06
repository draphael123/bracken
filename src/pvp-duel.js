// src/pvp-duel.js - DUEL (BETA): a basic PvP mode (claude/pvpduel, Daniel 11-05 live: "ONE ARENA to start, players use their abilities against each other,
// RANKINGS, the winner gets some points"; coordinator rec in scratch/priority-1016.md 'BASIC PvP MODE'). The whole mode sits behind PVP_SHIPS.
//
// HOW A HERO HITS A HERO. Every kit in the game (swings, plunges, skills, fireballs, spears, waves...) already hits ENEMIES. So each seat gets a PROXY in the
// enemies list (t 'duelist', pvpSeat = the body) that stands where he stands; main.js hurtEnemy hands any blow on a proxy straight here (hit) BEFORE any foe
// rule runs, and this routes it onto the seat through the game's own damagePlayer - so the victim's guard, parry, roll, ward, catch and duck all answer
// a hero's blow exactly as they answer a foe's. A seat's own proxy is switched off during his own pass (no self-hits, no auto-aim at himself).
// WHOSE BLOW: inside a seat's pass it is that seat's; a blow from a projectile the world updates OUTSIDE the passes is matched to the nearest effect a seat
// launched (main.js tags new effects with their owner after every pass: ownedNear) - a seat's own effect never hurts him.
// PVP RULES, PvP ONLY (nothing here touches PvE balance): a level-normalised blow (every seat hits at its L1 weight) x DUEL.scale on a PvP health pool of
// DUEL.hp; DUEL.iframe of grace after a landed blow (the PvE mercy is 0.8 s); ANTI-JUGGLE: the juggle.n-th blow inside juggle.t gives juggle.inv and says
// BREAK; NO FLASKS; SUDDEN DEATH from round.fightT: blows ramp x sd.from -> x sd.to over round.sdLen; at round.timeUp the higher health share takes it.
// ROUNDS: best of three (first to round.toWin); 3-2-1 FIGHT; KO banner; the winner screen; REMATCH or back to the inn.
// POINTS + RANKINGS: pts.match to the match winner, pts.round per round won; kept per SAVE SLOT on this device (localStorage RANK_KEY, never inside a save
// file); guests, online guests and bots are not ranked. Online leaderboard: LATER (needs a backend).
// BOTS: botThink (pure) drives a 'duelbot' seat - the opponent when one person duels alone, and the hands of tools/pvp-duel.mjs's AI-vs-AI runs.

const PVP_SHIP_FLAG = false;   /* THE SHIP SWITCH (one line): true = every player sees DUEL (BETA) */
export const PVP_SHIPS = PVP_SHIP_FLAG || (typeof globalThis !== 'undefined' && (!!globalThis.__DUELBETA || (!!globalThis.location && /[?&]duelbeta(=|&|$)/.test(String(globalThis.location.search)))));   /* (pvpduel2) DEV/URL SWITCH: open the game with ?duelbeta (or a tool sets window.__DUELBETA) to see the mode while the ship flag is off */
void 0;   /* (proof146b 11-05) OFF until the warden bot-duel edge (16/16, 24/24) is settled; one line to flip, everything else proven */   /* THE FLAG: false hides the title row, the tavern pit's DUEL card and the RANKINGS board (the pit goes back to COMING SOON) */
export const DUEL = {
  hp: 100, scale: 0.8, probe: 40, iframe: 0.4,
  heroMul: {},   /* (proof146b) per-hero PvP trim hook (empty): a warden trim of x0.8 and x0.5 did NOT move the bot-duel warden win rate (24/24, 7/8): the edge is not blow weight */
  juggle: { n: 3, t: 1.5, inv: 1.1 },
  round: { count: 3, fightT: 90, sdLen: 45, timeUp: 150, ko: 2.4, toWin: 2, maxRounds: 5 },
  sd: { from: 1.5, to: 3 },
  pts: { match: 10, round: 2 },
  seats: { min: 2, max: 4 },
  proxy: { w: 12, h: 22 },
};
export const BOT_HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer', 'berserker', 'ranger'];

/* ---------------- pure rules ---------------- */
export const sdMul = clock => clock < DUEL.round.fightT ? 1 : DUEL.sd.from + (DUEL.sd.to - DUEL.sd.from) * Math.min(1, (clock - DUEL.round.fightT) / DUEL.round.sdLen);
export const suddenDeath = clock => clock >= DUEL.round.fightT;
/* one blow, in PvP health: raw (what the kit would deal a foe) x norm (the attacker's L1 weight / his weight now) x scale x the sudden-death ramp */
export const pvpDamage = (raw, norm = 1, clock = 0) => !(raw > 0) ? 0 : Math.max(1, Math.round(raw * Math.min(1, Math.max(0.05, norm || 1)) * DUEL.scale * sdMul(clock)));
/* what lands of it after the victim's own guard chain: damagePlayer took `landed` of the `probe` it was handed */
export const landedShare = (pd, landed, probe = DUEL.probe) => !(landed > 0) || !(pd > 0) ? 0 : Math.max(1, Math.round(pd * Math.min(1.5, landed / probe)));
/* ANTI-JUGGLE: the hit times this seat took (pruned to juggle.t); returns the grace he gets now */
export function juggleGrace(hits, now) {
  for (let i = hits.length - 1; i >= 0; i--) if (now - hits[i] > DUEL.juggle.t) hits.splice(i, 1);
  hits.push(now);
  if (hits.length >= DUEL.juggle.n) { hits.length = 0; return { inv: DUEL.juggle.inv, broke: true }; }
  return { inv: DUEL.iframe, broke: false };
}

/* WHOSE BLOW. victim: the seat hit; pass: whose pass is running (null between); fromX/fromY: where it came from; owned: [{x, y, own}] the effects seats
   launched; seats: every seat; upright(p). Returns the attacker, or null (his own blow, or nobody's) */
export function attackerOf({ victim, pass, fromX, fromY, owned = [], seats = [], upright = () => true }) {
  if (pass && pass !== victim) return pass;
  let best = null, bd = 30, self = false;
  for (const o of owned) { if (!o || !o.own || !Number.isFinite(o.x)) continue;
    const d = Math.abs(o.x - fromX) + (Number.isFinite(o.y) && Number.isFinite(fromY) ? Math.abs(o.y - fromY) * 0.25 : 0);
    if (d > 30) continue;
    if (o.own === victim) { self = true; continue; }
    if (d < bd) { bd = d; best = o.own; } }
  if (best) return best;
  if (pass === victim || self) return null;
  let q = null, qd = 1e9;
  for (const s of seats) { if (s === victim || !upright(s)) continue; const d = Math.abs(s.x - victim.x); if (d < qd) { qd = d; q = s; } }
  return q;
}

/* THE MATCH: ids are seat numbers (1..4) */
export function newMatch(ids) { const wins = {}; for (const i of ids) wins[i] = 0; return { ids: ids.slice(), phase: 'count', t: DUEL.round.count, round: 1, clock: 0, wins, draws: 0, last: null, winner: null, log: [], sdSaid: false }; }
/* one step. standing: ids still on their feet; share: id -> health share 0..1. Returns the event this step made: 'fight' | 'ko' | 'time' | 'draw' | 'round' | 'over' | null */
export function stepMatch(m, dt, standing, share = {}) {
  if (m.phase === 'count') { m.t -= dt; if (m.t <= 0) { m.phase = 'fight'; m.clock = 0; m.sdSaid = false; return 'fight'; } return null; }
  if (m.phase === 'fight') {
    m.clock += dt; let win = null, ev = null;
    if (standing.length <= 1) { win = standing.length ? standing[0] : null; ev = win === null ? 'draw' : 'ko'; }
    else if (m.clock >= DUEL.round.timeUp) {
      const ranked = standing.slice().sort((a, b) => (share[b] || 0) - (share[a] || 0));
      if ((share[ranked[0]] || 0) > (share[ranked[1]] || 0) + 1e-6) { win = ranked[0]; ev = 'time'; } else ev = 'draw';
    }
    if (!ev) return null;
    m.phase = 'ko'; m.t = DUEL.round.ko; m.last = { round: m.round, win, how: ev };
    if (win !== null) m.wins[win] = (m.wins[win] || 0) + 1; else m.draws++;
    m.log.push(m.last); return ev;
  }
  if (m.phase === 'ko') {
    m.t -= dt; if (m.t > 0) return null;
    const top = m.ids.find(i => m.wins[i] >= DUEL.round.toWin);
    if (top !== undefined) { m.phase = 'over'; m.winner = top; return 'over'; }
    if (m.round >= DUEL.round.maxRounds) {   /* five rounds and nobody has two: the most rounds wins it; level = a drawn match */
      const most = Math.max(...m.ids.map(i => m.wins[i])), lead = m.ids.filter(i => m.wins[i] === most);
      m.phase = 'over'; m.winner = lead.length === 1 && most > 0 ? lead[0] : null; return 'over';
    }
    m.round++; m.phase = 'count'; m.t = DUEL.round.count; m.clock = 0; return 'round';
  }
  return null;
}
export const matchPoints = (m, id) => (m.winner === id ? DUEL.pts.match : 0) + (m.wins[id] || 0) * DUEL.pts.round;

/* ---------------- rankings (this device, per save slot; never inside a save) ---------------- */
export const RANK_KEY = 'bracken.duelRanks';
const nat = v => Math.max(0, Math.min(999999, Math.floor(+v || 0)));
export function cleanRanks(raw) {
  const r = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}, rows = {};
  const src = r.rows && typeof r.rows === 'object' && !Array.isArray(r.rows) ? r.rows : {};
  for (const k in src) { if (!/^slot[1-9]$/.test(k)) continue; const q = src[k] && typeof src[k] === 'object' ? src[k] : {};
    rows[k] = { name: String(q.name || k.replace('slot', 'SAVE ')).slice(0, 16).toUpperCase(), hero: /^[a-z]{2,12}$/.test(q.hero) ? q.hero : '', w: nat(q.w), l: nat(q.l), pts: nat(q.pts), rw: nat(q.rw), m: nat(q.m) }; }
  return { v: 1, rows };
}
/* entries: [{ key, name, hero, won, rounds, pts }] - a key of null is not ranked (a guest, a bot) */
export function recordMatch(ranks, entries) {
  const R = cleanRanks(ranks);
  for (const e of entries) { if (!e || !e.key || !/^slot[1-9]$/.test(e.key)) continue;
    const row = R.rows[e.key] || (R.rows[e.key] = { name: e.name || e.key, hero: '', w: 0, l: 0, pts: 0, rw: 0, m: 0 });
    row.name = String(e.name || row.name).slice(0, 16).toUpperCase(); if (e.hero) row.hero = e.hero;
    row.m++; if (e.won) row.w++; else row.l++; row.rw += nat(e.rounds); row.pts += nat(e.pts); }
  return R;
}
export const rankRows = ranks => Object.entries(cleanRanks(ranks).rows).map(([key, r]) => ({ key, ...r })).sort((a, b) => b.pts - a.pts || b.w - a.w || a.l - b.l || a.key.localeCompare(b.key));
export function loadRanks(ls) { try { return cleanRanks(JSON.parse(ls.getItem(RANK_KEY) || '{}')); } catch { return cleanRanks(null); } }
export function saveRanks(ls, R) { try { ls.setItem(RANK_KEY, JSON.stringify(cleanRanks(R))); return true; } catch { return false; } }
export function forgetSlot(ls, i) { const R = loadRanks(ls); delete R.rows['slot' + (i + 1)]; return saveRanks(ls, R); }

/* ---------------- the bot (pure: a body in, keys out) ---------------- */
/* how far each hero likes to stand off (px): the casters and the bow keep range, the spear a little, the rest close in */
export const BOT_RANGE = { pyro: 72, ranger: 96, warden: 34, geomancer: 26, paladin: 22, knight: 20, pirate: 24, reaper: 24, berserker: 18 };
export const freshBot = () => ({ think: 0, cd: 0.5, blockT: 0, dodgeCd: 1, skillCd: 3, jumpCd: 1, stuckT: 0, lastX: null, held: {} });
/* me/foe: { x, y, vx, face, ground, atk, hp, hero, block, dodge }; s: freshBot(); rnd: () => 0..1; dt. Returns { keys, press } */
export function botThink(me, foe, s, rnd, dt) {
  const keys = { left: false, right: false, up: false, down: false, jump: false, atk: false, block: false, dodge: false, throw: false }, press = {};
  s.cd -= dt; s.dodgeCd -= dt; s.skillCd -= dt; s.jumpCd -= dt; s.blockT -= dt; s.think -= dt;
  if (!foe) return { keys, press };
  const dx = foe.x - me.x, dist = Math.abs(dx), dir = Math.sign(dx) || me.face || 1, want = BOT_RANGE[me.hero] || 22, ranged = want >= 60;
  if (s.lastX !== null && Math.abs(me.x - s.lastX) < 0.2 && s.held.move) s.stuckT += dt; else s.stuckT = 0; s.lastX = me.x;
  if (s.think <= 0) {   /* a decision a tenth of a second, held in between: hands, not a frame-perfect machine */
    s.think = 0.1 + rnd() * 0.06; s.held = {};
    if (dist > want + 8) s.held.move = dir;
    else if (ranged && dist < want - 18 && dist > 30 && s.stuckT < 0.3) s.held.move = -dir;   /* the caster and the bow back off to their range - cornered or in his face, they fight where they stand (the bow knifes point-blank) */
    const foeSwing = foe.atk >= 0 || !!foe.plunge;
    if (foeSwing && dist < 44 && s.dodgeCd <= 0 && rnd() < 0.18) { press.dodge = true; s.dodgeCd = 1.2 + rnd(); }
    else if (foeSwing && dist < 40 && rnd() < 0.45) s.blockT = 0.25 + rnd() * 0.2;
    if (s.blockT <= 0 && dist <= want + 12 && s.cd <= 0) { press.atk = true; s.held.face = dir; s.cd = 0.22 + rnd() * 0.38; }
    if (s.skillCd <= 0 && dist < 110 && rnd() < 0.5) { press.throw = true; s.held.face = dir; s.skillCd = 3 + rnd() * 3; }
    if (s.jumpCd <= 0 && ((foe.y < me.y - 28 && dist < 90) || s.stuckT > 0.6 || rnd() < 0.02)) { press.jump = true; s.jumpCd = 0.8 + rnd(); s.stuckT = 0; }
    if (foe.y > me.y + 28 && me.ground && rnd() < 0.3) s.held.drop = true;   /* he is under the plank: down through it */
  }
  if (s.blockT > 0) keys.block = true;
  const mv = s.held.face || s.held.move || 0;
  if (mv < 0) keys.left = true; else if (mv > 0) keys.right = true;
  if (s.held.drop) { keys.down = true; press.jump = press.jump || rnd() < 0.2; }
  if (press.atk) keys.atk = true;
  return { keys, press };
}

/* a small seeded random for the bots and the harness */
export function rng(seed) { let a = (seed >>> 0) || 1; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------------- the runtime (main.js wires it: makeDuel(api)) ----------------
   api: { L, players, time, asPlayer(p, fn), passOn(), upright(p), enemies(), owned() -> [arrays], goDown(p, killer), seatAdd(spec), seatDrop(p),
          float(x, y, txt, col), callout(s), hint(s, t), sfx(k), colourOf(n) -> { c, name }, tagOf(p), heroName(h), heroes(), text, board, TS,
          damage(victim, fromX, probe, whoProxy) -> { r, landed }, norm(p) -> 0..1, p1Press() -> {..}, eatPress(), keysWrite(o), pressWrite(o),
          rankOf(p) -> { key, name } | null, ls() -> localStorage | null, leave(), enter(botHero), card hooks } */
export const isBotSeat = p => !!p && (!!p.duelBot || !!(p.src && p.src.kind === 'duelbot'));
export function makeDuel(api) {
  const st = { m: null, seats: [], prox: new Map(), hits: new Map(), norm: new Map(), bots: new Map(), card: null, ranks: false, result: null, rnd: rng(7), stats: { blows: 0, landed: 0, blocked: 0, self: 0, nobody: 0, kos: 0, breaks: 0, rounds: 0, matches: 0 }, banner: null, seed: 7 };
  const on = () => PVP_SHIPS && !!api.L() && !!api.L().duelPit && !!st.m;
  const idOf = p => p.n;
  const seatById = id => st.seats.find(p => p.n === id) || null;
  const col = p => api.colourOf(p.n).c;
  const label = p => api.tagOf(p) + ' ' + api.heroName(p.hero);

  function proxyOf(p) {
    let e = st.prox.get(p);
    if (!e) { e = { t: 'duelist', pvpSeat: p, x: p.x, y: p.y, w: DUEL.proxy.w, h: DUEL.proxy.h, hp: DUEL.hp, maxHp: DUEL.hp, alive: false, harmless: false,   /* maxHp: a BIG body to every kit (no throw, no wall-slam, no knock-into chain on a proxy: the hero is knocked back by damagePlayer) */  face: p.face || 1, flash: 0, stagger: 0, anim: 0, vx: 0, vy: 0, mode: 'duel', noXp: true }; st.prox.set(p, e); }
    return e;
  }
  /* the proxies stand where the seats stand; a seat's own is OFF in his own pass; all are off outside a fight */
  function sync(pass) {
    if (!on()) return;
    const E = api.enemies();
    for (const p of st.seats) { const e = proxyOf(p);
      if (!E.includes(e)) E.push(e);
      e.x = p.x; e.y = p.y; e.face = p.face || 1; e.vx = 0; e.vy = 0; e.hp = Math.max(0, p.duelHp || 0); e.stagger = 0; e.flash = 0; e.burn = 0;
      e.alive = st.m.phase === 'fight' && api.upright(p) && p !== pass && api.players().includes(p); }
  }
  function clearProxies() { const E = api.enemies(); for (const e of st.prox.values()) { e.alive = false; const i = E.indexOf(e); if (i >= 0) E.splice(i, 1); } st.prox.clear(); }

  /* ===== a blow on a proxy (main.js hurtEnemy, before anything else): true = it was a duel blow, handled ===== */
  function hit(e, dmg, fromX) {
    if (!e || !e.pvpSeat) return false;
    if (!on() || st.m.phase !== 'fight' || !(dmg > 0)) return true;
    const victim = e.pvpSeat; if (!api.upright(victim) || (victim.duelGrace || 0) > api.time()) return true;
    const owned = []; for (const arr of api.owned()) if (Array.isArray(arr)) for (const o of arr) if (o && o._duelOwn) owned.push({ x: o.x, y: o.y, own: o._duelOwn });
    const att = attackerOf({ victim, pass: api.passOn(), fromX, fromY: victim.y - 10, owned, seats: st.seats, upright: api.upright });
    st.stats.blows++;
    if (!att) { if (api.passOn() === victim) st.stats.self++; else st.stats.nobody++; return true; }
    const pd = pvpDamage(dmg, (st.norm.get(att) ?? 1) * (DUEL.heroMul[att.hero] ?? 1), st.m.clock);
    const { r, landed } = api.damage(victim, fromX, DUEL.probe, proxyOf(att));
    if (r === 'blocked') { st.stats.blocked++; return true; }
    if (r !== 'hit' || !(landed > 0)) return true;
    const loss = landedShare(pd, landed);
    victim.duelHp = Math.max(0, (victim.duelHp || 0) - loss); att.duelDealt = (att.duelDealt || 0) + loss; st.stats.landed++;
    const hits = st.hits.get(victim) || []; st.hits.set(victim, hits);
    const g = juggleGrace(hits, api.time());
    victim.duelGrace = api.time() + g.inv;
    victim.inv = g.inv; mirror(victim);   /* PvP grace replaces the PvE mercy (damagePlayer set 0.8) */   /* (the seat IS the body: no pass needed to write it) */
    api.float(victim.x, victim.y - 30, api.tagOf(att) + ' -' + loss, col(att));   /* WHO HIT WHOM: the number in the hitter's colour, his tag on it */
    if (g.broke) { st.stats.breaks++; api.float(victim.x, victim.y - 42, 'BREAK', '#bfe6f5'); }
    if (victim.duelHp <= 0) ko(victim, att);
    return true;
  }
  const mirror = p => { p.hp = p.duelHp > 0 ? Math.max(1, Math.round(p.maxHp * p.duelHp / DUEL.hp)) : p.hp; };   /* the co-op HUD plates read the real bar: it shows the PvP share */
  function ko(victim, att) {
    st.stats.kos++; victim.duelKoBy = att ? att.n : 0;
    api.goDown(victim, { name: att ? label(att) : 'THE PIT', red: false, rule: '' });
    api.float(victim.x, victim.y - 48, 'K.O.', '#ff6b6b'); api.sfx('crack');
  }

  /* ===== a round ===== */
  function placeAll() {
    const L = api.L(), spots = (L.duelPit && L.duelPit.spots) || [5, 20, 9, 16], TS = api.TS, fy = L.duelPit.floor * TS;
    st.seats.forEach((p, k) => { const cx = spots[k % spots.length] * TS + TS / 2, mid = (L.W || 26) * TS / 2;
      api.asPlayer(p, () => { const P = api.P(); Object.assign(P, { x: cx, y: fy, vx: 0, vy: 0, hp: P.maxHp, hpShown: P.maxHp, st: P.maxSt, inv: 1, hurt: 0, dead: 0, down: 0, reviveT: 0, atk: -1, plunge: false, onMover: null, block: false, dodge: 0, drinkT: 0, flasks: 0, face: cx < mid ? 1 : -1, killer: null }); if (P.hitSet) P.hitSet.clear(); });
      p.duelHp = DUEL.hp; p.duelGrace = 0; p.duelKoBy = 0; st.hits.set(p, []); });
  }
  function begin(o = {}) {
    if (!PVP_SHIPS || !api.L() || !api.L().duelPit) return false;
    st.seed = o.seed ?? ((Date.now() & 0xffff) || 7); st.rnd = rng(st.seed);
    for (const p of api.players().slice()) if (isBotSeat(p) && p !== api.players()[0]) api.seatDrop(p);
    if (o.bots === 'all') for (const p of api.players()) { p.duelBot = true; st.bots.set(p, freshBot()); }
    const want = Math.max(DUEL.seats.min, Math.min(DUEL.seats.max, o.seats || 0));
    const botHeroes = o.botHeroes || [o.botHero || 'knight'];
    let k = 0; while (api.players().length < want || api.players().length < DUEL.seats.min) { const p = api.seatAdd({ hero: botHeroes[k % botHeroes.length], src: { kind: 'duelbot' } }); if (!p) break; p.duelBot = true; st.bots.set(p, freshBot()); k++; }
    st.seats = api.players().slice(0, DUEL.seats.max);
    if (st.seats.length < DUEL.seats.min) return false;
    for (const p of st.seats) { p.duelDealt = 0; if (p.duelBot && !st.bots.has(p)) st.bots.set(p, freshBot()); }
    st.norm.clear(); for (const p of st.seats) st.norm.set(p, api.norm(p));
    st.m = newMatch(st.seats.map(idOf)); st.result = null; st.card = null; st.ranks = false; st.banner = null;
    placeAll(); sync(null); api.sfx('bell');
    return true;
  }
  function end() { clearProxies(); for (const p of api.players().slice()) if (isBotSeat(p) && p !== api.players()[0]) api.seatDrop(p); for (const p of api.players()) { p.duelBot = false; p.duelHp = 0; } st.bots.clear(); st.m = null; st.seats = []; }

  /* ===== hands: once a frame per seat, in his own pass, BEFORE the buffers read the presses ===== */
  function hands(p) {
    if (!on()) return;
    const ph = st.m.phase;
    if (ph === 'over' && p === api.players()[0]) {   /* the winner screen: player one's JUMP is REMATCH, his E (or ROLL) is BACK TO THE INN */
      const pr = api.pressRead();
      if (pr.jump) { api.eatPress(); st.want = { k: 'rematch' }; }
      else if (pr.talk || pr.dodge) { api.eatPress(); st.want = { k: 'leave' }; }
    }
    if (ph !== 'fight') { api.keysWrite({}); api.pressWrite({}); return; }   /* the count, the KO and the winner screen: nobody acts */
    if (!p.duelBot || !api.upright(p)) return;
    const s = st.bots.get(p) || freshBot(); st.bots.set(p, s);
    let foe = null, fd = 1e9; for (const q of st.seats) { if (q === p || !api.upright(q)) continue; const d = Math.abs(q.x - p.x) + Math.abs(q.y - p.y) * 0.5; if (d < fd) { fd = d; foe = q; } }
    const P = api.P(), me = { x: P.x, y: P.y, vx: P.vx, face: P.face, ground: !!P.ground, atk: P.atk, hero: p.hero };
    const f = foe ? { x: foe.x, y: foe.y, atk: foe.atk, plunge: foe.plunge, hero: foe.hero } : null;
    const out = botThink(me, f, s, st.rnd, 1 / 60);
    api.keysWrite(out.keys); api.pressWrite(out.press);
  }
  function rematch() { const bh = st.seats.filter(p => p.duelBot).map(p => p.hero); begin({ botHeroes: bh.length ? bh : undefined, seed: st.seed + 1 }); }

  /* ===== once a frame, after the passes (never inside one: a load, a rematch's new seats or a leave would change the party under the loop) ===== */
  function post(dt) {
    if (st.m && !(api.L() && api.L().duelPit)) end();   /* left the pit some other way (the title, a load): the bots go, the proxies go */
    else if (!st.m) for (const p of api.players().slice(1)) if (isBotSeat(p)) api.seatDrop(p);   /* a duel bot never follows the party out */
    const w = st.want; st.want = null;
    if (w && w.k === 'enter' && PVP_SHIPS) { api.enter(w.bot); return; }
    if (w && w.k === 'leave' && on()) { api.leave(); return; }
    if (w && w.k === 'rematch' && on()) { rematch(); return; }
    tick(dt);
  }
  function tick(dt) {
    if (!on()) return;
    const m = st.m;
    for (const p of st.seats) { if (p.down > 0) p.down = Math.max(p.down, 5); else if (p.duelHp > 0) mirror(p); }   /* a KO lies there until the round is called (never the shrine, never a revive: main.js) */
    const standing = st.seats.filter(p => api.upright(p) && api.players().includes(p)).map(idOf), share = {};
    for (const p of st.seats) share[idOf(p)] = Math.max(0, p.duelHp || 0) / DUEL.hp;
    const ev = stepMatch(m, dt, standing, share);
    if (m.phase === 'fight' && suddenDeath(m.clock) && !m.sdSaid) { m.sdSaid = true; banner('SUDDEN DEATH', '#ff6b6b', 2); api.sfx('sting'); }
    if (ev === 'fight') { banner('FIGHT!', '#ffd36b', 0.9); api.sfx('uiSel'); }
    else if (ev === 'ko' || ev === 'time') { const w = seatById(m.last.win); st.stats.rounds++; banner((ev === 'time' ? 'TIME! ' : 'K.O.! ') + (w ? label(w) + ' TAKES ROUND ' + m.last.round : ''), w ? col(w) : '#fff6e0', DUEL.round.ko); api.sfx('sting'); }
    else if (ev === 'draw') { st.stats.rounds++; banner('DRAW: ROUND ' + m.last.round + ' AGAIN', '#fff6e0', DUEL.round.ko); }
    else if (ev === 'round') placeAll();
    else if (ev === 'over') finish();
    sync(null);
  }
  function banner(txt, c, t) { st.banner = { txt, c, t, at: api.time() }; }
  function finish() {
    const m = st.m; st.stats.matches++;
    const practice = st.seats.some(p => p.duelBot);   /* a duel with a bot in it is PRACTICE: unranked (no points farmed off the bot) */
    const rows = st.seats.map(p => { const id = idOf(p), rk = practice ? null : api.rankOf(p); return { p, id, won: m.winner === id, rounds: m.wins[id] || 0, pts: matchPoints(m, id), key: rk ? rk.key : null, name: rk ? rk.name : null, hero: p.hero }; });
    const ls = api.ls(); let ranked = false;
    if (ls) { const R = recordMatch(loadRanks(ls), rows.map(r => ({ key: r.key, name: r.name, hero: r.hero, won: r.won, rounds: r.rounds, pts: r.pts }))); ranked = saveRanks(ls, R); }
    st.result = { practice, winner: m.winner, rows: rows.map(r => ({ n: r.id, tag: api.tagOf(r.p), hero: r.hero, won: r.won, rounds: r.rounds, pts: r.pts, ranked: !!r.key, name: r.name, dealt: r.p.duelDealt || 0 })), ranked };
    const w = seatById(m.winner); banner(w ? label(w) + ' WINS THE DUEL' : 'A DRAWN DUEL', w ? col(w) : '#fff6e0', 999); api.sfx('win');
  }

  /* ===== the tavern pit's DUEL (BETA) card: opened by a player at the pit; his own keys drive it ===== */
  const CARD_ROWS = () => api.players().length < 2 ? ['FIGHT', 'OPPONENT', 'RANKINGS', 'CLOSE'] : ['FIGHT', 'RANKINGS', 'CLOSE'];
  function openCard(p) { if (!PVP_SHIPS) return false; st.card = { p, row: 0, bot: st.card && st.card.bot || 'knight', ranks: false }; api.sfx('uiSel'); return true; }
  function cardHands(p, pr, keys) {
    const c = st.card; if (!c || c.p !== p) return false;
    if (!api.players().includes(p) || p.dead || p.down > 0) { st.card = null; return false; }
    const rows = CARD_ROWS(); if (c.row >= rows.length) c.row = 0;
    if (c.ranks) { if (pr.talk || pr.atk || pr.dodge || pr.jump || pr.left || pr.right) { c.ranks = false; api.sfx('menuClose'); } }
    else {
      if (pr.down) { c.row = (c.row + 1) % rows.length; api.sfx('ui'); }
      if (pr.up) { c.row = (c.row + rows.length - 1) % rows.length; api.sfx('ui'); }
      const r = rows[c.row];
      if (r === 'OPPONENT' && (pr.left || pr.right)) { const hs = api.heroes().length ? api.heroes() : BOT_HEROES, i = Math.max(0, hs.indexOf(c.bot)); c.bot = hs[(i + (pr.left ? -1 : 1) + hs.length) % hs.length]; api.sfx('equip'); }
      if (pr.jump || pr.atk) { if (r === 'FIGHT') { st.want = { k: 'enter', bot: c.bot }; st.card = null; api.sfx('uiSel'); } else if (r === 'RANKINGS') { c.ranks = true; api.sfx('uiSel'); } else if (r === 'CLOSE') { st.card = null; api.sfx('menuClose'); } }
      else if (pr.talk || pr.dodge) { st.card = null; api.sfx('menuClose'); }
    }
    for (const k in pr) pr[k] = false;
    for (const k of ['left', 'right', 'up', 'down', 'jump', 'atk', 'dodge', 'block', 'throw']) keys[k] = false;
    return true;
  }

  /* ===== drawing ===== */
  function drawWorld(g, cx, cy) {   /* a bar over every seat's head, in his colour: who is who, and how much he has left */
    if (!on()) return;
    for (const p of st.seats) { const x = Math.round(p.x - cx) - 11, y = Math.round(p.y - cy) - 40, sh = Math.max(0, Math.min(1, (p.duelHp || 0) / DUEL.hp));
      g.fillStyle = 'rgba(10,8,16,0.8)'; g.fillRect(x - 1, y - 1, 24, 5); g.fillStyle = '#3a2a2a'; g.fillRect(x, y, 22, 3); g.fillStyle = col(p); g.fillRect(x, y, Math.round(22 * sh), 3); }
  }
  function drawRanks(x, y, w, n = 6) {
    const rows = rankRows(api.ls() ? loadRanks(api.ls()) : null).slice(0, n), T = api.text;
    T('RANKINGS - THIS DEVICE', x + w / 2, y, '#ffd36b', 'center', 8);
    T('SAVE', x + 4, y + 11, '#9aa39a', 'left', 8); T('W  L  PTS', x + w - 4, y + 11, '#9aa39a', 'right', 8);
    if (!rows.length) T('NO DUELS YET', x + w / 2, y + 23, '#c2c9c2', 'center', 8);
    rows.forEach((r, k) => { const yy = y + 21 + k * 9; T((k + 1) + '. ' + r.name + (r.hero ? ' ' + api.heroName(r.hero) : ''), x + 4, yy, k ? '#c2c9c2' : '#fff6e0', 'left', 8); T(r.w + '  ' + r.l + '  ' + r.pts, x + w - 4, yy, k ? '#c2c9c2' : '#fff6e0', 'right', 8); });
    return 21 + Math.max(1, rows.length) * 9;
  }
  function drawHud(VW, VH) {
    const T = api.text;
    if (st.card && api.L() && api.L().tavern) {
      const c = st.card, w = 180, rows = CARD_ROWS(), h = c.ranks ? 96 : 40 + api.players().length * 9 + rows.length * 9 + 12, x = Math.round(VW / 2 - w / 2), y = 24;
      api.board(x, y, w, h);
      if (c.ranks) { drawRanks(x + 4, y + 4, w - 8); T('ANY KEY: BACK', x + w / 2, y + h - 10, '#8a8f80', 'center', 8); return; }
      T('DUEL (BETA) - BEST OF 3', x + w / 2, y + 4, '#ffd36b', 'center', 8);
      let yy = y + 16; for (const p of api.players()) { T(api.tagOf(p) + ' ' + api.heroName(p.hero), x + 8, yy, col(p), 'left', 8); yy += 9; }
      if (api.players().length < 2) { T('+ BOT ' + api.heroName(c.bot), x + 8, yy, '#c2c9c2', 'left', 8); yy += 9; }
      yy += 3; rows.forEach((r, k) => { const sel = k === c.row, v = r === 'OPPONENT' ? '< ' + api.heroName(c.bot) + ' >' : ''; T((sel ? '> ' : '  ') + (r === 'OPPONENT' ? 'BOT HERO' : r), x + 8, yy, sel ? '#a8e06e' : '#c2c9c2', 'left', 8); if (v) T(v, x + w - 8, yy, sel ? '#fff6e0' : '#c2c9c2', 'right', 8); yy += 9; });
      T('WARDROBE CHANGES HEROES. FRIENDS: A PAD\'S JUMP OR THE BOARD', x + w / 2, y + h - 10, '#8a8f80', 'center', 8);
      return;
    }
    if (!on()) return;
    const m = st.m;
    /* the seats' bars along the top, each in his colour, with his round pips */
    const n = st.seats.length, bw = Math.min(110, Math.floor((VW - 16) / n) - 6);
    st.seats.forEach((p, k) => { const x = Math.round(8 + k * (bw + 6)), y = 6, sh = Math.max(0, Math.min(1, (p.duelHp || 0) / DUEL.hp));
      T(label(p), x, y, col(p), 'left', 8);
      g2(x, y + 10, bw, 5, sh, col(p));
      for (let i = 0; i < DUEL.round.toWin; i++) T((m.wins[idOf(p)] || 0) > i ? '*' : '-', x + bw - 12 + i * 7, y, (m.wins[idOf(p)] || 0) > i ? '#ffd36b' : '#6a6a6a', 'left', 8); });
    const cyT = 24;
    if (m.phase === 'fight') { const left = Math.max(0, DUEL.round.fightT - m.clock), sd = suddenDeath(m.clock);
      T(sd ? 'SUDDEN DEATH x' + sdMul(m.clock).toFixed(1) : Math.ceil(left) + '', VW / 2, cyT, sd ? '#ff6b6b' : '#fff6e0', 'center', sd ? 8 : 12);
      T('ROUND ' + m.round, VW / 2, cyT + (sd ? 9 : 14), '#9aa39a', 'center', 8); }
    if (m.phase === 'count') { T('ROUND ' + m.round, VW / 2, VH / 2 - 30, '#fff6e0', 'center', 16); T(String(Math.max(1, Math.ceil(m.t))), VW / 2, VH / 2 - 8, '#ffd36b', 'center', 24); }
    const b = st.banner; if (b && (api.time() - b.at < b.t) && m.phase !== 'count') T(b.txt, VW / 2, VH / 2 - 40, b.c, 'center', b.txt.length > 18 ? 8 : 16);
    if (m.phase === 'over' && st.result) {
      const w = 220, h = 72 + st.result.rows.length * 9 + 80, x = Math.round(VW / 2 - w / 2), y = Math.round(VH / 2 - h / 2) + 8;
      api.board(x, y, w, h);
      const W0 = seatById(st.result.winner); T(W0 ? label(W0) + ' WINS' : 'A DRAWN DUEL', x + w / 2, y + 5, W0 ? col(W0) : '#fff6e0', 'center', 8);
      if (st.result.practice) T('PRACTICE: UNRANKED', x + w / 2, y + 15, '#9aa39a', 'center', 8); T('ROUNDS  DEALT  POINTS', x + w - 6, y + 25, '#9aa39a', 'right', 8);   /* (proof146b) the two lines each had a row: side by side they overran the 220 px board */
      st.result.rows.forEach((r, k) => { const p = seatById(r.n), yy = y + 35 + k * 9; T(r.tag + ' ' + api.heroName(r.hero) + (r.ranked || st.result.practice ? '' : ' (GUEST)'), x + 6, yy, p ? col(p) : '#c2c9c2', 'left', 8); T(r.rounds + '   ' + r.dealt + '   +' + r.pts, x + w - 6, yy, '#fff6e0', 'right', 8); });
      const ry = y + 41 + st.result.rows.length * 9; drawRanks(x + 6, ry, w - 12, 5);
      T('JUMP: REMATCH    E: BACK TO THE INN', x + w / 2, y + h - 10, '#a8e06e', 'center', 8);
    }
  }
  const g2 = (x, y, w, h, sh, c) => api.bar(x, y, w, h, sh, c);

  function debug() { return { on: on(), m: st.m ? JSON.parse(JSON.stringify({ ...st.m })) : null, seats: st.seats.map(p => ({ n: p.n, hero: p.hero, hp: p.duelHp, bot: !!p.duelBot, up: api.upright(p), x: Math.round(p.x), dealt: p.duelDealt || 0 })), result: st.result, stats: { ...st.stats }, card: st.card ? { n: st.card.p.n, row: st.card.row, bot: st.card.bot, ranks: st.card.ranks } : null, proxies: [...st.prox.values()].map(e => ({ n: e.pvpSeat.n, alive: e.alive, x: Math.round(e.x) })) }; }
  return { st, on, sync, hit, begin, end, hands, tick, post, openCard, cardHands, drawWorld, drawHud, debug, clearProxies, rematch, cardOpen: () => !!st.card };
}
