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

import { setPvpEvenTraits } from './traits.js';
import { DUEL_FOES, FOE, GOBLIN_CHOICES, GOB_NAME, GOB_LINE, FF_LINE, foeModeOf, foeDoorCols, foeAllowed, foePlan, pickDoor, doorFree, foeKind, foeWound } from './duel-foes.js';   /* (claude/duelfoes) THE GOBLINS setting + FRIENDLY FIRE: pure schedule + door data in src/duel-foes.js, behind DUEL_FOES (default OFF) */
import { DUEL_ARENAS, ARENA_CHOICES, arenaName, arenaLine, cleanArena, arenaOfLevel, hopGoal, ventGoal } from './duel-arenas.js';   /* (claude/duelarenas) THE ARENA setting + the bots' climb: pure data in src/duel-arenas.js, behind DUEL_ARENAS (default OFF) */
import { makeRoster } from './duel-roster.js';   /* (claude/duelroster) the Smash-Bros-style pick screen: the DUEL entry (the interim settings card stays as ?duelcard / __DUELCARD) */
const PVP_SHIP_FLAG = true;   /* THE SHIP SWITCH (one line): true = every player sees DUEL (BETA) - FLIPPED 11-06 (Daniel 11:53: the duel goes public in the SAT demo cut, labelled BETA) */
export const PVP_SHIPS = PVP_SHIP_FLAG || (typeof globalThis !== 'undefined' && (!!globalThis.__DUELBETA || (!!globalThis.location && /[?&]duelbeta(=|&|$)/.test(String(globalThis.location.search)))));   /* (pvpduel2) DEV/URL SWITCH: open the game with ?duelbeta (or a tool sets window.__DUELBETA) to see the mode while the ship flag is off */
void 0;   /* (proof146b 11-05) OFF until the warden bot-duel edge (16/16, 24/24) is settled; one line to flip, everything else proven */   /* THE FLAG: false hides the title row, the tavern pit's DUEL card and the RANKINGS board (the pit goes back to COMING SOON) */
export const DUEL = {
  hp: 100, scale: 0.8, probe: 40, iframe: 0.4,
  heroMul: { warden: 0.3, reaper: 0.7, geomancer: 0.6, pyro: 2, paladin: 1.7, ranger: 1.1 },   /* (proof146b) per-hero PvP trim hook (empty): a warden trim of x0.8 and x0.5 did NOT move the bot-duel warden win rate (24/24, 7/8): the edge is not blow weight */
  juggle: { n: 3, t: 1.5, inv: 1.1 },
  round: { count: 3, fightT: 90, sdLen: 45, timeUp: 150, ko: 2.4, toWin: 2, maxRounds: 5 },
  sd: { from: 1.5, to: 3 },
  pts: { match: 10, round: 2 },
  seats: { min: 2, max: 4 },
  proxy: { w: 12, h: 22 },
};
export const BOT_HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer', 'berserker', 'ranger'];

/* ---------------- MATCH OPTIONS (pvpduel3, Daniel 11-06: the players set them) ----------------
   THE SETTINGS OBJECT (what the roster pick screen, src/duel-roster.js, reads and writes through getSettings/setSettings/begin):
   { lives 1-5 (a seat's lives PER ROUND: a K.O. with lives left respawns), health 50|100|150 (% of DUEL.hp), stamina 'normal'|'unlimited',
     rounds 1|3|5 (best of), teams bool (2v2: seats 1+2 vs 3+4 by default; teammates cannot hurt each other; the team wins), level 'even'|'your',
     timeLimit 0|60|90|120 seconds a round (0 = off), then SUDDEN DEATH = everyone on 1 health, one hit; botDifficulty 'easy'|'normal'|'hard' (the default
     for a bot seat), seats: [{ hero: id | 'random' | '' (= as he is), isBot, botDifficulty, team 1|2 }] (2-4; humans first) } */
export const SETTING_CHOICES = { lives: [1, 2, 3, 4, 5], health: [50, 100, 150], stamina: ['normal', 'unlimited'], rounds: [1, 3, 5], teams: [false, true], level: ['even', 'your'], timeLimit: [0, 60, 90, 120], botDifficulty: ['easy', 'normal', 'hard'], goblins: GOBLIN_CHOICES, friendlyFire: [false, true], arena: ARENA_CHOICES };   /* (duelfoes) goblins 'off'|'few'|'many', friendlyFire bool (teams only): both forced to off / false unless DUEL_FOES */
export const SET_KEY = 'bracken.duelSettings';
const pick = (v, list, d) => list.includes(v) ? v : d;
const defTeam = (k, n) => n >= 4 ? (k < 2 ? 1 : 2) : (k === 0 ? 1 : 2);
export function defaultSettings() { return cleanSettings(null); }
export function cleanSettings(raw) {
  const r = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}, C = SETTING_CHOICES;
  const lives = Math.max(1, Math.min(5, Math.floor(+r.lives || 1))), teams = r.teams === true;
  const out = { v: 1, lives, health: pick(+r.health, C.health, 100), stamina: pick(r.stamina, C.stamina, 'normal'), rounds: pick(+r.rounds, C.rounds, 3), teams,
    level: pick(r.level, C.level, 'even'), timeLimit: pick(r.timeLimit === undefined ? 90 : +r.timeLimit, C.timeLimit, 90), botDifficulty: pick(r.botDifficulty, C.botDifficulty, 'normal'), goblins: DUEL_FOES ? foeModeOf(r.goblins) : 'off', friendlyFire: DUEL_FOES && r.friendlyFire === true, ...(DUEL_ARENAS ? { arena: cleanArena(r.arena) } : {}), seats: [] };   /* (duelarenas) flag OFF: no `arena` key at all (a saved one is dropped), so the settings are byte-for-byte the duelfoes ones */   /* (duelfoes) flag OFF: always 'off' / false (an old save with them set still loads clean) */
  const src = Array.isArray(r.seats) ? r.seats.slice(0, DUEL.seats.max) : [];
  const n = Math.max(DUEL.seats.min, teams ? 4 : 0, src.length);   /* teams = 2v2: always four seats */
  for (let k = 0; k < n; k++) { const q = src[k] && typeof src[k] === 'object' ? src[k] : {}, human = k === 0 || (q.isBot === false && k < src.length);
    out.seats.push({ hero: q.hero === 'random' ? 'random' : /^[a-z]{2,12}$/.test(q.hero) ? q.hero : k === 0 ? '' : 'random', isBot: k === 0 ? false : human ? false : true, botDifficulty: pick(q.botDifficulty, C.botDifficulty, out.botDifficulty), team: q.team === 1 || q.team === 2 ? q.team : defTeam(k, n) }); }
  if (teams && !(out.seats.some(q => q.team === 1) && out.seats.some(q => q.team === 2))) out.seats.forEach((q, k) => { q.team = defTeam(k, out.seats.length); });   /* both teams need a body */
  return out;
}
export function loadSettings(ls, key) { try { const j = JSON.parse(ls.getItem(SET_KEY) || '{}'); return cleanSettings(j && j.slots && typeof j.slots === 'object' ? j.slots[key || 'slot0'] : null); } catch { return cleanSettings(null); } }
export function saveSettings(ls, key, S) { try { let j = {}; try { j = JSON.parse(ls.getItem(SET_KEY) || '{}') || {}; } catch {} if (!j.slots || typeof j.slots !== 'object') j = { v: 1, slots: {} }; j.slots[key || 'slot0'] = cleanSettings(S); ls.setItem(SET_KEY, JSON.stringify(j)); return true; } catch { return false; } }
/* what a match runs on, from clean settings */
export const matchOpts = S => ({ fightT: S.timeLimit > 0 ? S.timeLimit : Infinity, timeUp: S.timeLimit > 0 ? S.timeLimit + 60 : 240, toWin: (S.rounds + 1) >> 1, maxRounds: ((S.rounds + 1) >> 1) + 3 });
/* BOT DIFFICULTY: think = how often it re-decides (s), swing = the gap between swings, block / dodge = the odds it answers a swing, react = how long a swing is on screen before it answers */
export const BOT_DIFF = { easy: { think: 0.24, thinkJ: 0.14, cd: 0.55, cdJ: 0.8, block: 0.18, dodge: 0.04, react: 0.32, lazy: 0.25 }, normal: { think: 0.1, thinkJ: 0.06, cd: 0.22, cdJ: 0.38, block: 0.45, dodge: 0.18, react: 0, lazy: 0 }, hard: { think: 0.05, thinkJ: 0.03, cd: 0.14, cdJ: 0.2, block: 0.78, dodge: 0.38, react: 0, lazy: 0 } };


/* ---------------- pure rules ---------------- */
export const sdMul = (clock, fightT = DUEL.round.fightT) => clock < fightT ? 1 : DUEL.sd.from + (DUEL.sd.to - DUEL.sd.from) * Math.min(1, (clock - fightT) / DUEL.round.sdLen);
export const suddenDeath = (clock, fightT = DUEL.round.fightT) => clock >= fightT;   /* (pvpduel3) fightT = the match's ROUND TIME LIMIT (Infinity = off): at it every standing seat drops to 1 health = ONE HIT */
/* one blow, in PvP health: raw (what the kit would deal a foe) x norm (the attacker's L1 weight / his weight now) x scale x the sudden-death ramp */
export const pvpDamage = (raw, norm = 1, clock = 0, fightT = DUEL.round.fightT) => !(raw > 0) ? 0 : Math.max(1, Math.round(raw * Math.min(1, Math.max(0.05, norm || 1)) * DUEL.scale * sdMul(clock, fightT)));
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
/* ids: seat numbers (1..4), or TEAM numbers when teams are on (the caller maps seats to teams). o: { fightT, timeUp, toWin, maxRounds } (pvpduel3: the match options) */
export function newMatch(ids, o = {}) { const wins = {}; for (const i of ids) wins[i] = 0; const toWin = o.toWin ?? DUEL.round.toWin; return { ids: ids.slice(), phase: 'count', t: DUEL.round.count, round: 1, clock: 0, wins, draws: 0, last: null, winner: null, log: [], sdSaid: false, fightT: o.fightT ?? DUEL.round.fightT, timeUp: o.timeUp ?? DUEL.round.timeUp, toWin, maxRounds: o.maxRounds ?? (toWin === DUEL.round.toWin ? DUEL.round.maxRounds : toWin + 3) }; }
/* one step. standing: ids still on their feet; share: id -> health share 0..1. Returns the event this step made: 'fight' | 'ko' | 'time' | 'draw' | 'round' | 'over' | null */
export function stepMatch(m, dt, standing, share = {}) {
  if (m.phase === 'count') { m.t -= dt; if (m.t <= 0) { m.phase = 'fight'; m.clock = 0; m.sdSaid = false; return 'fight'; } return null; }
  if (m.phase === 'fight') {
    m.clock += dt; let win = null, ev = null;
    if (standing.length <= 1) { win = standing.length ? standing[0] : null; ev = win === null ? 'draw' : 'ko'; }
    else if (m.clock >= m.timeUp) {
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
    const top = m.ids.find(i => m.wins[i] >= m.toWin);
    if (top !== undefined) { m.phase = 'over'; m.winner = top; return 'over'; }
    if (m.round >= m.maxRounds) {   /* five rounds and nobody has two: the most rounds wins it; level = a drawn match */
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
export const freshBot = (diff = 'normal') => ({ think: 0, cd: 0.5, blockT: 0, dodgeCd: 1, skillCd: 3, jumpCd: 1, stuckT: 0, lastX: null, held: {}, diff: BOT_DIFF[diff] ? diff : 'normal', swSeen: 0 });
/* me/foe: { x, y, vx, face, ground, atk, hp, hero, block, dodge }; s: freshBot(); rnd: () => 0..1; dt. Returns { keys, press } */
export function botThink(me, foe, s, rnd, dt, hops, vents) {   /* hops (duelarenas): the arena's climbing map (src/duel-arenas.js hopGoal); undefined = nothing to climb (the Pit) */
  const keys = { left: false, right: false, up: false, down: false, jump: false, atk: false, block: false, dodge: false, throw: false }, press = {};
  s.cd -= dt; s.dodgeCd -= dt; s.skillCd -= dt; s.jumpCd -= dt; s.blockT -= dt; s.think -= dt;
  if (!foe) return { keys, press };
  const dx = foe.x - me.x, dist = Math.abs(dx), dir = Math.sign(dx) || me.face || 1, want = BOT_RANGE[me.hero] || 22, ranged = want >= 60;
  if (s.lastX !== null && Math.abs(me.x - s.lastX) < 0.2 && s.held.move) s.stuckT += dt; else s.stuckT = 0; s.lastX = me.x;
  if (hops && hops.length) s.hopSeen = foe.y < me.y - 44 ? (s.hopSeen || 0) + dt : 0;   /* the foe has stood a tier or more above us for a moment (not just a jump of his) */
  const D = BOT_DIFF[s.diff] || BOT_DIFF.normal, foeSwing = foe.atk >= 0 || !!foe.plunge;
  s.swSeen = foeSwing ? (s.swSeen || 0) + dt : 0;   /* (pvpduel3) how long the foe's swing has been on screen: the bot answers it only after D.react */
  if (s.think <= 0) {   /* a decision a tenth of a second, held in between: hands, not a frame-perfect machine */
    s.think = D.think + rnd() * D.thinkJ; if (D.lazy && rnd() < D.lazy) { s.held = {}; return { keys, press }; } s.held = {};
    if (dist > want + 8) s.held.move = dir;
    else if (ranged && dist < want - 18 && dist > 30 && s.stuckT < 0.3) s.held.move = -dir;   /* the caster and the bow back off to their range - cornered or in his face, they fight where they stand (the bow knifes point-blank) */
    const sees = foeSwing && s.swSeen >= D.react;
    if (sees && dist < 44 && s.dodgeCd <= 0 && rnd() < D.dodge) { press.dodge = true; s.dodgeCd = 1.2 + rnd(); }
    else if (sees && dist < 40 && rnd() < D.block) s.blockT = 0.25 + rnd() * 0.2;
    if (s.blockT <= 0 && dist <= want + 12 && s.cd <= 0) { press.atk = true; s.held.face = dir; s.cd = D.cd + rnd() * D.cdJ; }
    if (s.skillCd <= 0 && dist < 110 && rnd() < 0.5) { press.throw = true; s.held.face = dir; s.skillCd = 3 + rnd() * 3; }
    if (s.jumpCd <= 0 && ((foe.y < me.y - 28 && dist < 90 && !(hops && hops.length && s.hopSeen >= 0.45)) || s.stuckT > 0.6 || rnd() < 0.02) && !s.ventWait) { press.jump = true; s.jumpCd = 0.8 + rnd(); s.stuckT = 0; }
    if (foe.y > me.y + 28 && me.ground && rnd() < 0.3) s.held.drop = true;   /* he is under the plank: down through it */
    if (hops && hops.length) {   /* (duelarenas) HOPS: he is a tier or more up and there is a board we can jump from here: walk under it, jump, and steer onto it in the air */
      if (me.ground) { s.hopB = null; if (!(s.hopSeen >= 0.45)) s.ventWait = false; }
      if (!me.ground && s.hopB) { s.held.move = me.x < s.hopX - 3 ? 1 : me.x > s.hopX + 3 ? -1 : 0; }   /* in the air: steer for the middle of where we mean to land (the board's own middle if it is narrow) */
      else if (s.hopSeen >= 0.45 && vents && vents.length && (s.vg = ventGoal(me, foe, vents, hops))) {   /* (duelarenas-b) A SPORE VENT: walk onto it and WAIT for the puff (no jump), then steer to stay over it in the air */
        const vg = s.vg, ddx = vg.tx - me.x; s.held.move = vg.ok ? 0 : Math.abs(ddx) > 4 ? Math.sign(ddx) : 0; s.ventWait = vg.ok; s.hopB = vg.board; s.hopX = vg.tx; }
      else if (s.hopSeen >= 0.45) { s.ventWait = false; const hg = hopGoal(me, foe, hops); if (hg) { const ddx = hg.tx - me.x; s.held.move = Math.abs(ddx) > 5 ? Math.sign(ddx) : 0; if (hg.jump && s.jumpCd <= 0) { press.jump = true; s.jumpCd = 0.8 + rnd() * 0.4; s.stuckT = 0; s.hopB = hg.board; const bw = hg.board[2] - hg.board[1] + 1; s.hopX = bw >= 3 ? Math.max(hg.board[1] * 16 + 16, Math.min((hg.board[2] + 1) * 16 - 16, hg.tx)) : (hg.board[1] + hg.board[2] + 1) * 8; } } } }
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
          rankOf(p) -> { key, name } | null, ls() -> localStorage | null, leave(), enter(botHero, settings), card hooks,
          (pvpduel3) hand(p) -> { base, add } (his blow's L1 weight and what his level adds), setSeatHero(p, hero) } */
export const isBotSeat = p => !!p && (!!p.duelBot || !!(p.src && p.src.kind === 'duelbot'));
export function makeDuel(api) {
  const st = { m: null, seats: [], prox: new Map(), hits: new Map(), norm: new Map(), bots: new Map(), card: null, ranks: false, result: null, rnd: rng(7), cfg: cleanSettings(null), plan: null, lvl: new Map(), settings: null, stats: { blows: 0, landed: 0, blocked: 0, self: 0, nobody: 0, kos: 0, breaks: 0, rounds: 0, matches: 0 }, banner: null, seed: 7, foe: null };
  const on = () => PVP_SHIPS && !!api.L() && !!api.L().duelPit && !!st.m;
  const idOf = p => p.n;
  const seatById = id => st.seats.find(p => p.n === id) || null;
  const col = p => api.colourOf(p.n).c;
  const label = p => api.tagOf(p) + ' ' + api.heroName(p.hero);
  const keyOf = p => st.cfg.teams ? (p.duelTeam || 1) : idOf(p);   /* the match counts TEAMS when teams are on, seats otherwise */
  const maxOf = p => p.duelMax || DUEL.hp;
  const TEAM_COL = { 1: '#6ec1ff', 2: '#ff9a6e' };
  const winName = k => st.cfg.teams ? 'TEAM ' + k : (seatById(k) ? label(seatById(k)) : '');
  const winCol = k => st.cfg.teams ? TEAM_COL[k] || '#fff6e0' : (seatById(k) ? col(seatById(k)) : '#fff6e0');

  function proxyOf(p) {
    let e = st.prox.get(p);
    if (!e) { e = { t: 'duelist', pvpSeat: p, x: p.x, y: p.y, w: DUEL.proxy.w, h: DUEL.proxy.h, hp: DUEL.hp * 1.5, maxHp: DUEL.hp * 1.5, alive: false, harmless: false,   /* maxHp: a BIG body to every kit (no throw, no wall-slam, no knock-into chain on a proxy: the hero is knocked back by damagePlayer) */  face: p.face || 1, flash: 0, stagger: 0, anim: 0, vx: 0, vy: 0, mode: 'duel', noXp: true }; st.prox.set(p, e); }
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
    if (st.cfg.teams && !st.cfg.friendlyFire && att !== victim && att.duelTeam === victim.duelTeam) { st.stats.friendly = (st.stats.friendly || 0) + 1; return true; }   /* (pvpduel3) TEAMS: a teammate's blow is nothing (no damage, no knock) */
    const pd = pvpDamage(dmg * (st.lvl.get(att) ?? 1), (st.norm.get(att) ?? 1) * (DUEL.heroMul[att.hero] ?? 1), st.m.clock, st.m.fightT);
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
  const mirror = p => { p.hp = p.duelHp > 0 ? Math.max(1, Math.min(p.maxHp, Math.round(p.maxHp * p.duelHp / maxOf(p)))) : p.hp; };   /* the co-op HUD plates read the real bar: it shows the PvP share */
  function ko(victim, att) {
    st.stats.kos++; victim.duelKoBy = att ? att.n : 0;
    api.goDown(victim, { name: att ? label(att) : 'THE PIT', red: false, rule: '' });
    api.float(victim.x, victim.y - 48, 'K.O.', '#ff6b6b'); api.sfx('crack');
  }

  /* ===== a round ===== */
  const spotsOf = () => (api.L().duelPit && api.L().duelPit.spots) || [5, 20, 9, 16];
  /* a K.O. with lives left: back up at the spot farthest from the others, a moment of grace, full health (ONE health in sudden death) */
  function respawn(p) {
    const L = api.L(), spots = spotsOf(), TS = api.TS, fy = L.duelPit.floor * TS, others = st.seats.filter(q => q !== p && api.upright(q));
    let best = spots[0], bd = -1; for (const c of spots) { const d = others.length ? Math.min(...others.map(q => Math.abs(q.x - (c * TS + TS / 2)))) : 1; if (d > bd) { bd = d; best = c; } }
    const cx = best * TS + TS / 2, mid = (L.W || 26) * TS / 2;
    api.asPlayer(p, () => { const P = api.P(); Object.assign(P, { x: cx, y: fy, vx: 0, vy: 0, hp: P.maxHp, hpShown: P.maxHp, inv: 1.5, hurt: 0, dead: 0, down: 0, reviveT: 0, atk: -1, plunge: false, onMover: null, block: false, dodge: 0, drinkT: 0, face: cx < mid ? 1 : -1, killer: null }); if (P.hitSet) P.hitSet.clear(); });
    p.duelRespawn = 0; p.duelHp = st.m && suddenDeath(st.m.clock, st.m.fightT) ? 1 : maxOf(p); p.duelGrace = api.time() + 1.5; st.hits.set(p, []); mirror(p); api.sfx('bell');
  }
  function placeAll() {
    const L = api.L(), spots = spotsOf(), TS = api.TS, fy = L.duelPit.floor * TS;
    st.seats.forEach((p, k) => { const cx = spots[k % spots.length] * TS + TS / 2, mid = (L.W || 26) * TS / 2;
      api.asPlayer(p, () => { const P = api.P(); Object.assign(P, { x: cx, y: fy, vx: 0, vy: 0, hp: P.maxHp, hpShown: P.maxHp, st: P.maxSt, inv: 1, hurt: 0, dead: 0, down: 0, reviveT: 0, atk: -1, plunge: false, onMover: null, block: false, dodge: 0, drinkT: 0, flasks: 0, face: cx < mid ? 1 : -1, killer: null }); if (P.hitSet) P.hitSet.clear(); });
      p.duelHp = maxOf(p); p.duelGrace = 0; p.duelKoBy = 0; p.duelLives = st.cfg.lives; p.duelRespawn = 0; st.hits.set(p, []); });
  }
  /* ===== (claude/duelfoes) GOBLINS: a told entry, wound-only blows, NOTHING for a kill (Daniel 11-12). All dormant at goblins 'off' / flag OFF. The schedule and doors are pure (src/duel-foes.js). ===== */
  const bump = k => { st.stats[k] = (st.stats[k] || 0) + 1; };
  const foeMode = () => DUEL_FOES ? foeModeOf(st.cfg && st.cfg.goblins) : 'off';
  const foeReady = () => foeMode() !== 'off' && !!st.foe && !!api.foeSpawn;
  const foeFresh = () => ({ next: FOE.first, pend: [], list: [], said: false, flee: false });
  const arenaId = () => arenaOfLevel(api.L());   /* (duelarenas) which arena the level is ('pit' for the Pit's own level) */
  const foeCols = () => foeDoorCols((api.L() && api.L().W) || 26, arenaId());
  /* every goblin out of the Pit with no death, no reward (between rounds, a K.O., the end) */
  function foeClear() { const F = st.foe; if (!F) return; for (const e of F.list) { e.alive = false; e.dying = 0; e.duelDone = true; } F.list.length = 0; F.pend.length = 0; F.next = FOE.first; F.flee = false; }
  /* once a frame, after the match step: prune the dead, flee at sudden death, tell and send the next one */
  function foeTick() {
    const F = st.foe; if (!F || !foeReady()) return; const m = st.m, L = api.L();
    for (let i = F.list.length - 1; i >= 0; i--) if (!F.list[i].alive) F.list.splice(i, 1);
    if (m.phase !== 'fight') return;
    if (!foeAllowed(m.phase, m.clock, m.fightT)) { if (!F.flee) { F.flee = true; F.pend.length = 0; for (const e of F.list) e.duelFlee = true; } return; }   /* sudden death: the live ones run for the doors, none are told */
    const xs = st.seats.filter(p => api.upright(p)).map(p => p.x), cols = foeCols(), TS = api.TS;
    for (let i = F.pend.length - 1; i >= 0; i--) { const q = F.pend[i]; if (m.clock < q.at) continue;   /* the '!' has stood its second: in he walks - unless a seat has since come within 6 tiles of that door */
      if (!doorFree(cols[q.door], xs, TS)) { q.at = m.clock + FOE.popRetry; if (++q.tries > FOE.popTries) F.pend.splice(i, 1); continue; }
      F.pend.splice(i, 1); const e = api.foeSpawn(cols[q.door], L.duelPit.floor - 1, q.kind, q.door === 0 ? 1 : -1); if (e) { e.duelFoe = true; F.list.push(e); bump('gobSpawned'); } }
    const di = pickDoor(cols, xs, TS), pl = foePlan(foeMode(), F, m.clock, F.list.length + F.pend.length, di >= 0);
    if (pl.tell) { F.pend.push({ door: di, at: pl.at, kind: foeKind(st.rnd(), arenaId()), tries: 0 }); api.sfx('hornBlast'); if (!F.said) { F.said = true; banner('GOBLINS IN THE PIT', '#8fd160', 2.2); } }
  }
  /* main.js updateEnemies hands a fleeing goblin here instead of its AI: along the floor to the nearest door and out (no death, no reward) */
  function foeFlee(e, dt) {
    const L = api.L(), TS = api.TS, cols = foeCols(), fy = L.duelPit.floor * TS; let tx = cols[0] * TS + TS / 2, best = 1e9;
    for (const c of cols) { const x = c * TS + TS / 2, d = Math.abs(x - e.x); if (d < best) { best = d; tx = x; } }
    const dir = Math.sign(tx - e.x) || 1; e.face = dir; e.vx = 0; if (e.y < fy) e.y = Math.min(fy, e.y + 160 * dt);
    if (best <= 3) { e.alive = false; e.dying = 0; e.duelDone = true; return; }
    e.x += dir * FOE.flee * dt;
  }
  /* A GOBLIN'S BLOW on a seat (main.js damagePlayer hands it here): through the victim's own guard chain, then a flat share of his duel health, NEVER below 1 - a goblin wounds, only a hero K.O.s.
     null = not a duel goblin's blow (damagePlayer carries on as before); otherwise the result damagePlayer would give. */
  function foeBlow(victim, src, fromX, o) {
    if (!src || !src.duelFoe || !on() || !api.foeProbe) return null;
    if (st.m.phase !== 'fight' || !api.upright(victim) || !(victim.duelHp > 0) || (victim.duelGrace || 0) > api.time()) return false;   /* the grace that follows ANY landed blow covers a goblin's too: no chain-lock */
    const { r, landed } = api.foeProbe(victim, fromX, DUEL.probe, o);
    if (r === 'blocked') { bump('foeBlocked'); return r; }
    if (r !== 'hit' || !(landed > 0)) return r;
    const w = foeWound(victim.duelHp, maxOf(victim)); victim.duelHp = w.hp; victim.duelFoeLoss = (victim.duelFoeLoss || 0) + w.loss; bump('foeBlows');
    const hits = st.hits.get(victim) || []; st.hits.set(victim, hits); const g = juggleGrace(hits, api.time());   /* the same anti-juggle as a hero's blow */
    victim.duelGrace = api.time() + g.inv; victim.inv = g.inv; mirror(victim);
    api.float(victim.x, victim.y - 30, '-' + w.loss, '#8fd160');
    if (g.broke) { bump('breaks'); api.float(victim.x, victim.y - 42, 'BREAK', '#bfe6f5'); }
    return 'hit';
  }
  /* a goblin cut down (main.js hurtEnemy's duel branch): NO heal, NO XP, NO coins, NO drops - only the GOBLINS count on the results card. by: the seat whose blow it was (null = the nearest seat) */
  function foeDied(e, by) {
    if (!e || e.duelDone) return; e.duelDone = true; let who = by && st.seats.includes(by) ? by : null;
    if (!who) { let bd = 60; for (const p of st.seats) { const d = Math.abs(p.x - e.x); if (d < bd) { bd = d; who = p; } } }
    if (who) { who.duelGobs = (who.duelGobs || 0) + 1; bump('gobKills'); } else bump('gobOther');
  }
  const lineOf = (id, S) => id === 'arena' ? arenaLine(cleanArena(S.arena)) : id === 'goblins' ? GOB_LINE[foeModeOf(S.goblins)] : FF_LINE[!!S.friendlyFire];   /* the plain-words line under the row */

  /* ===== the settings (pvpduel3): the roster pick screen and the card both read and write these ===== */
  const slotKey = () => { try { const r = api.players().length ? api.rankOf(api.players()[0]) : null; return r && r.key || 'slot0'; } catch { return 'slot0'; } };
  const humansIn = () => api.players().filter(p => !isBotSeat(p)).length;
  function getSettings() { if (!st.settings) st.settings = api.ls() ? loadSettings(api.ls(), slotKey()) : cleanSettings(null); return JSON.parse(JSON.stringify(st.settings)); }
  function setSettings(patch = {}) {   /* merges a patch (any subset, seats as a whole list), cleans it, REMEMBERS it (this device, this save slot), returns the clean object */
    const cur = getSettings(); st.settings = cleanSettings({ ...cur, ...patch, seats: patch.seats !== undefined ? patch.seats : cur.seats });
    if (api.ls()) saveSettings(api.ls(), slotKey(), st.settings); return JSON.parse(JSON.stringify(st.settings));
  }
  /* seat k of the list: patch { hero, isBot, botDifficulty, team } */
  function setSeat(k, patch = {}) { const S = getSettings(); if (!S.seats[k]) return S; S.seats[k] = { ...S.seats[k], ...patch }; return setSeats(S.seats); }
  function setSeats(list) { return setSettings({ seats: list }); }
  /* how many seats (2-4); teams force four; never fewer than the humans at the table */
  function setSeatCount(n) { const S = getSettings(), want = Math.max(DUEL.seats.min, humansIn(), Math.min(DUEL.seats.max, S.teams ? 4 : n | 0)); const list = S.seats.slice(0, want); while (list.length < want) list.push({ hero: 'random', isBot: true, botDifficulty: S.botDifficulty, team: 0 }); return setSeats(list); }
  const seatList = () => getSettings().seats;
  function pickHeroes(n, taken, ok) { const pool = BOT_HEROES.filter(h => !taken.includes(h) && (!ok || ok(h))), out = []; for (let i = 0; i < n; i++) { const from = pool.length ? pool : BOT_HEROES.filter(h => !ok || ok(h)).length ? BOT_HEROES.filter(h => !ok || ok(h)) : BOT_HEROES, k = Math.floor(st.rnd() * from.length), h = from[k]; out.push(h); const j = pool.indexOf(h); if (j >= 0) pool.splice(j, 1); } return out; }
  function begin(o = {}) {
    if (!PVP_SHIPS || !api.L() || !api.L().duelPit) return false;
    st.seed = o.seed ?? ((Date.now() & 0xffff) || 7); st.rnd = rng(st.seed);
    const S = cleanSettings(o.settings || null);   /* a caller with no settings gets the plain defaults (the AI-vs-AI tools): never the remembered ones */
    for (const p of api.players().slice()) if (isBotSeat(p) && p !== api.players()[0]) api.seatDrop(p);
    if (o.bots === 'all') for (const p of api.players()) { p.duelBot = true; st.bots.set(p, freshBot(S.botDifficulty)); }
    const humans = api.players().filter(p => !p.duelBot);
    const want = Math.max(DUEL.seats.min, humans.length, Math.min(DUEL.seats.max, o.seats || (o.settings ? S.seats.length : 0)));
    while (S.seats.length < want) S.seats.push({ hero: 'random', isBot: true, botDifficulty: S.botDifficulty, team: 0 });
    /* the bots' heroes: a caller's botHeroes (the tools), the seat's own pick, else a random one nobody wears */
    const used = api.players().map(p => p.hero), botHeroes = o.botHeroes || (o.botHero && !o.settings ? [o.botHero] : null), nb = Math.max(0, want - api.players().length), rnd = pickHeroes(nb, used);
    let k = 0, ri = 0; const resolved = [];
    while (api.players().length < want || api.players().length < DUEL.seats.min) { const i = api.players().length, sp = S.seats[i] || {}; const h = botHeroes ? botHeroes[k % botHeroes.length] : sp.hero && sp.hero !== 'random' ? sp.hero : rnd[ri++ % Math.max(1, rnd.length)] || 'knight';
      const p = api.seatAdd({ hero: h, src: { kind: 'duelbot' } }); if (!p) break; p.duelBot = true; st.bots.set(p, freshBot(sp.botDifficulty || S.botDifficulty)); k++; }
    st.seats = api.players().slice(0, DUEL.seats.max);
    if (st.seats.length < DUEL.seats.min) return false;
    S.teams = S.teams && st.seats.length >= 3;
    st.seats.forEach((p, i) => { const sp = S.seats[i] || {}; p.duelDealt = 0; p.duelGobs = 0; p.duelFoeLoss = 0; p.duelMax = Math.max(1, Math.round(DUEL.hp * S.health / 100)); p.duelTeam = S.teams ? (sp.team === 1 || sp.team === 2 ? sp.team : defTeam(i, st.seats.length)) : 0;
      if (p.duelBot) { st.bots.set(p, freshBot(sp.botDifficulty || S.botDifficulty)); }
      else if (sp.hero && (sp.hero !== p.hero || sp.hero === 'random') && api.setSeatHero) { if (!st.restore && p === api.players()[0]) st.restore = p.hero;   /* (duelroster, Daniel 11-06) the campaign's equipped hero is put back when the duel ends */ api.setSeatHero(p, sp.hero === 'random' ? pickHeroes(1, st.seats.filter(q => q !== p).map(q => q.hero), p === api.players()[0] && api.owns ? api.owns : null)[0] : sp.hero); }   /* a human's pick: where the game lets him (a hero he owns) */
      resolved.push({ ...sp, hero: p.hero, isBot: !!p.duelBot }); });
    if (S.teams && !(st.seats.some(p => p.duelTeam === 1) && st.seats.some(p => p.duelTeam === 2))) st.seats.forEach((p, i) => { p.duelTeam = defTeam(i, st.seats.length); });
    st.arena = { id: arenaId(), random: DUEL_ARENAS && S.arena === 'random' }; st.cfg = S; st.plan = { ...S, seats: resolved };   /* (duelarenas) the arena this match is in (RANDOM was resolved before the level loaded); a rematch stays in it */
    st.foe = DUEL_FOES ? foeFresh() : null;   /* (duelfoes) a fresh goblin clock for the match */
    /* THE LEVEL: EVEN = every seat at its L1 hand (today's duel); YOUR = each at his own level, a bot at the highest human's */
    setPvpEvenTraits(S.level !== 'your');   /* (claude/traitframe) EVEN L1 = core only, no traits; YOUR LEVEL = each seat's worn traits (inert while TRAITS_SHIP is off) */
    st.norm.clear(); st.lvl.clear();
    const hands = new Map(st.seats.map(p => [p, api.hand ? api.hand(p) : null]));
    const top = Math.max(0, ...st.seats.filter(p => !p.duelBot).map(p => (hands.get(p) || { add: 0 }).add));
    for (const p of st.seats) { const h = hands.get(p);
      if (S.level === 'your') { st.norm.set(p, 1); st.lvl.set(p, p.duelBot && h ? (h.base + top) / Math.max(1, h.base + h.add) : 1); }
      else { st.norm.set(p, api.norm(p)); st.lvl.set(p, 1); } }
    st.m = newMatch(S.teams ? [1, 2] : st.seats.map(idOf), matchOpts(S)); st.result = null; st.card = null; st.ranks = false; st.banner = null;
    placeAll(); sync(null); api.sfx('bell');
    return true;
  }
  function end() { st.arena = null; setPvpEvenTraits(false); foeClear(); st.foe = null; clearProxies(); for (const p of api.players().slice()) if (isBotSeat(p) && p !== api.players()[0]) api.seatDrop(p); for (const p of api.players()) { p.duelBot = false; p.duelHp = 0; p.duelTeam = 0; p.duelRespawn = 0; p.duelLives = 0; } st.bots.clear(); st.lvl.clear(); st.m = null; st.seats = []; if (st.restore) { const h = st.restore; st.restore = null; try { if (api.players()[0] && api.players()[0].hero !== h && api.restoreHero) api.restoreHero(h); } catch {} }   /* (duelroster, Daniel 11-06) player one's campaign hero comes back (after the bots leave, so none wears him) */ }

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
    let foe = null, fd = 1e9; for (const q of st.seats) { if (q === p || !api.upright(q) || (st.cfg.teams && q.duelTeam === p.duelTeam)) continue; const d = Math.abs(q.x - p.x) + Math.abs(q.y - p.y) * 0.5; if (d < fd) { fd = d; foe = q; } }
    /* (duelfoes) A GOBLIN WITHIN 40 PX that is closer than the nearest enemy seat is the target for now (same distance as the seat pick); an EASY bot ignores goblins half the time (re-rolled each second) */
    let gob = null; if (foeReady()) { let gd = 1e9; for (const e of st.foe.list) { if (!e.alive || e.duelFlee) continue; const d = Math.abs(e.x - p.x) + Math.abs(e.y - p.y) * 0.5; if (d <= 40 && d < fd && d < gd) { gd = d; gob = e; } }
      if (gob && s.diff === 'easy') { s.gobT = (s.gobT || 0) - 1 / 60; if (s.gobT <= 0) { s.gobT = 1; s.gobIgn = st.rnd() < 0.5; } if (s.gobIgn) gob = null; } }
    const P = api.P(), me = { x: P.x, y: P.y, vx: P.vx, face: P.face, ground: !!P.ground, atk: P.atk, hero: p.hero };
    const f = gob ? { x: gob.x, y: gob.y, atk: -1, plunge: false, hero: 'goblin' } : foe ? { x: foe.x, y: foe.y, atk: foe.atk, plunge: foe.plunge, hero: foe.hero } : null;
    const out = botThink(me, f, s, st.rnd, 1 / 60, DUEL_ARENAS && api.L().duelPit.hops, DUEL_ARENAS && api.L().duelPit.vents);
    api.keysWrite(out.keys); api.pressWrite(out.press);
  }
  function rematch() { const bh = st.seats.filter(p => p.duelBot).map(p => p.hero), pl = st.plan; begin({ settings: pl || undefined, botHeroes: bh.length ? bh : undefined, seed: st.seed + 1 }); }

  /* ===== once a frame, after the passes (never inside one: a load, a rematch's new seats or a leave would change the party under the loop) ===== */
  function post(dt) {
    if (st.m && !(api.L() && api.L().duelPit)) end();   /* left the pit some other way (the title, a load): the bots go, the proxies go */
    else if (!st.m) for (const p of api.players().slice(1)) if (isBotSeat(p)) api.seatDrop(p);   /* a duel bot never follows the party out */
    if (st.card && st.card.roster) { if (!(api.L() && api.L().tavern)) { st.card = null; roster.R.open = false; } else roster.tick(dt); }
    const w = st.want; st.want = null;
    if (w && w.k === 'enter' && PVP_SHIPS) { api.enter(w.bot, w.settings); return; }
    if (w && w.k === 'leave' && on()) { api.leave(); return; }
    if (w && w.k === 'rematch' && on()) { rematch(); return; }
    tick(dt);
  }
  function tick(dt) {
    if (!on()) return;
    const m = st.m;
    const fight = m.phase === 'fight';
    for (const p of st.seats) { if (p.down > 0) p.down = Math.max(p.down, 5); else if (p.duelHp > 0) mirror(p);   /* a KO lies there until the round is called (never the shrine, never a revive: main.js) */
      if (fight && p.duelLives > 0 && !p.duelRespawn && !api.upright(p) && api.players().includes(p)) {   /* a K.O.: a life gone; with one left he is back in a moment */
        p.duelLives--; if (p.duelLives > 0) { p.duelRespawn = api.time() + 1.6; api.float(p.x, p.y - 56, p.duelLives + (p.duelLives === 1 ? ' LIFE LEFT' : ' LIVES LEFT'), '#ffd36b'); } else p.duelHp = 0; }
      if (fight && p.duelRespawn && api.time() >= p.duelRespawn && p.duelLives > 0) respawn(p);
      if (st.cfg.stamina === 'unlimited' && api.players().includes(p)) api.asPlayer(p, () => { const P = api.P(); if (P.st < P.maxSt) P.st = P.maxSt; }); }
    const live = p => p.duelLives > 0 && api.players().includes(p), share = {}, mem = {};
    const standing = [...new Set(st.seats.filter(live).map(keyOf))];
    for (const p of st.seats) { const k = keyOf(p); mem[k] = (mem[k] || 0) + 1; share[k] = (share[k] || 0) + (live(p) ? (Math.max(0, p.duelLives - 1) + Math.max(0, p.duelHp || 0) / maxOf(p)) / st.cfg.lives : 0); }
    for (const k in share) share[k] /= mem[k];
    const ev = stepMatch(m, dt, standing, share);
    if (m.phase === 'fight' && suddenDeath(m.clock, m.fightT) && !m.sdSaid) { m.sdSaid = true; banner('SUDDEN DEATH: ONE HIT', '#ff6b6b', 2.4); api.sfx('sting'); for (const p of st.seats) if (live(p) && p.duelHp > 1) { p.duelHp = 1; if (api.upright(p)) mirror(p); } }
    if (ev === 'fight') { banner('FIGHT!', '#ffd36b', 0.9); api.sfx('uiSel'); }   /* (duelarenas) the arena's name is drawn under it (arenaLabel) */
    else if (ev === 'ko' || ev === 'time') { const w = m.last.win; st.stats.rounds++; banner((ev === 'time' ? 'TIME! ' : 'K.O.! ') + (w ? winName(w) + ' TAKES ROUND ' + m.last.round : ''), w ? winCol(w) : '#fff6e0', DUEL.round.ko); api.sfx('sting'); }
    else if (ev === 'draw') { st.stats.rounds++; banner('DRAW: ROUND ' + m.last.round + ' AGAIN', '#fff6e0', DUEL.round.ko); }
    else if (ev === 'round') placeAll();
    else if (ev === 'over') finish();
    if (st.foe && m.phase !== 'fight') foeClear();   /* (duelfoes) cleared at every K.O. / time / draw / the winner screen, so the next round starts with none */
    foeTick();
    sync(null);
  }
  const arenaLabel = () => !DUEL_ARENAS || !st.arena ? '' : arenaName(st.arena.id) + (st.arena.random ? ' (RANDOM)' : '');
  function banner(txt, c, t) { st.banner = { txt, c, t, at: api.time() }; }
  function finish() {
    const m = st.m; st.stats.matches++;
    const practice = st.seats.some(p => p.duelBot);   /* a duel with a bot in it is PRACTICE: unranked (no points farmed off the bot) */
    const rows = st.seats.map(p => { const id = idOf(p), kk = keyOf(p), rk = practice ? null : api.rankOf(p); return { p, id, won: m.winner === kk, rounds: m.wins[kk] || 0, pts: matchPoints(m, kk), key: rk ? rk.key : null, name: rk ? rk.name : null, hero: p.hero }; });
    const ls = api.ls(); let ranked = false;
    if (ls) { const R = recordMatch(loadRanks(ls), rows.map(r => ({ key: r.key, name: r.name, hero: r.hero, won: r.won, rounds: r.rounds, pts: r.pts }))); ranked = saveRanks(ls, R); }
    st.result = { practice, winner: m.winner, teams: !!st.cfg.teams, rows: rows.map(r => ({ n: r.id, tag: api.tagOf(r.p), hero: r.hero, won: r.won, rounds: r.rounds, pts: r.pts, ranked: !!r.key, name: r.name, dealt: r.p.duelDealt || 0, gobs: r.p.duelGobs || 0 })), ranked, foes: foeMode() !== 'off' };
    banner(m.winner ? winName(m.winner) + ' WINS THE DUEL' : 'A DRAWN DUEL', m.winner ? winCol(m.winner) : '#fff6e0', 999); api.sfx('win');
  }

  /* ===== the tavern pit's DUEL (BETA) card: opened by a player at the pit; his own keys drive it ===== */
  /* THE SETTINGS CARD (pvpduel3): until the roster pick screen (src/duel-roster.js) is in, this is how a player sets the match. UP/DOWN walk the rows, LEFT/RIGHT change one,
     JUMP or ATTACK on FIGHT starts. Every change is remembered (getSettings/setSettings: this device, this save slot). */
  const OPTS = [
    { id: 'arena', name: 'ARENA', fmt: v => arenaName(cleanArena(v)), arenas: true },   /* (duelarenas) only with DUEL_ARENAS */
    { id: 'lives', name: 'LIVES', fmt: v => String(v) },
    { id: 'health', name: 'HEALTH', fmt: v => v + '%' },
    { id: 'stamina', name: 'STAMINA', fmt: v => v === 'unlimited' ? 'UNLIMITED' : 'NORMAL' },
    { id: 'rounds', name: 'ROUNDS', fmt: v => 'BEST OF ' + v },
    { id: 'timeLimit', name: 'ROUND TIME', fmt: v => v ? v + ' S, THEN 1 HIT' : 'OFF' },
    { id: 'level', name: 'LEVEL', fmt: v => v === 'your' ? 'YOUR LEVEL' : 'EVEN - LEVEL 1' },
    { id: 'teams', name: 'TEAMS', fmt: v => v ? '2 VS 2' : 'OFF' },
    { id: 'seats', name: 'FIGHTERS', fmt: v => String(v) },
    { id: 'goblins', name: 'GOBLINS', fmt: v => GOB_NAME[foeModeOf(v)], foes: true },
    { id: 'friendlyFire', name: 'FRIENDLY FIRE', fmt: v => v ? 'ON' : 'OFF', foes: true },   /* (duelfoes) only with DUEL_FOES */
    { id: 'botDifficulty', name: 'BOT SKILL', fmt: v => v.toUpperCase(), bots: true },
    { id: 'botHero', name: 'BOT HERO', fmt: v => v === 'random' ? 'RANDOM' : api.heroName(v), bots: true },
  ];
  const foeIdx = S => S.teams ? 2 : Math.min(S.seats.length - 1, humansIn());
  const optVal = (o, S) => o.id === 'seats' ? S.seats.length : o.id === 'botHero' ? (S.seats[foeIdx(S)] && S.seats[foeIdx(S)].hero) || 'random' : S[o.id];
  const cardRows = () => { const S = getSettings(), bots = S.seats.length > humansIn(); return ['FIGHT', ...OPTS.filter(o => (!o.bots || bots) && (!o.foes || DUEL_FOES) && (!o.arenas || DUEL_ARENAS)).map(o => o.id), 'RANKINGS', 'CLOSE']; };
  function cycleOpt(id, dir) {
    const S = getSettings(), C = SETTING_CHOICES;
    if (id === 'seats') { if (S.teams) return false; setSeatCount(S.seats.length + dir > DUEL.seats.max ? Math.max(DUEL.seats.min, humansIn()) : S.seats.length + dir < Math.max(DUEL.seats.min, humansIn()) ? DUEL.seats.max : S.seats.length + dir); return true; }
    if (id === 'botHero') { const hs = ['random', ...BOT_HEROES], i = S.seats[foeIdx(S)] ? Math.max(0, hs.indexOf(S.seats[foeIdx(S)].hero)) : 0; setSeat(foeIdx(S), { hero: hs[(i + dir + hs.length) % hs.length] }); return true; }
    if (id === 'botDifficulty') { const l = C.botDifficulty, v = l[(l.indexOf(S.botDifficulty) + dir + l.length) % l.length]; setSettings({ botDifficulty: v, seats: S.seats.map(q => q.isBot ? { ...q, botDifficulty: v } : q) }); return true; }
    const l = C[id]; if (!l) return false; const v = l[(Math.max(0, l.indexOf(S[id])) + dir + l.length) % l.length]; setSettings({ [id]: v }); return true;
  }
  const roster = makeRoster({ get heroes() { return api.heroPick ? api.heroPick() : []; }, heroName: h => api.heroName(h), owns: h => api.owns ? api.owns(h) : true,
    humans: () => api.players().filter(p => !isBotSeat(p)).map(p => ({ n: p.n, ai: !!p.ai, hero: p.hero })), colourOf: n => api.colourOf(n),
    getSettings, setSettings, setSeat, setSeatCount, cycleOpt, submit: S => { const bi = S.seats.findIndex((q, i) => i >= humansIn()); st.want = { k: 'enter', bot: bi >= 0 ? S.seats[bi].hero : 'random', settings: S }; st.card = null; },
    close: () => { st.card = null; }, sfx: k => api.sfx(k), text: (s, x, y, c, a, z) => api.text(s, x, y, c, a, z), board: (x, y, w, h) => api.board(x, y, w, h),
    icon: (h, x, y, cw, ch, k, a) => api.heroBig && api.heroBig(h, x, y, cw, ch, k, a), rect: (x, y, w, h, c) => api.rect && api.rect(x, y, w, h, c), frame: (x, y, w, h, c) => api.frame && api.frame(x, y, w, h, c),
    foes: () => DUEL_FOES, arenas: () => DUEL_ARENAS, ruleLine: (id, S) => lineOf(id, S), fit: (s, w, z) => api.fit ? api.fit(s, w, z) : s, inkW: (s, z) => api.inkW ? api.inkW(s, z) : String(s).length * 5, key: a => api.keyLabel ? api.keyLabel(a) : a.toUpperCase() });
  const useRoster = () => !(typeof globalThis !== 'undefined' && (globalThis.__DUELCARD || (globalThis.location && /[?&]duelcard(=|&|$)/.test(String(globalThis.location.search)))));
  function openCard(p) { if (!PVP_SHIPS) return false; if (api.heroPick && useRoster()) { st.card = { p, roster: true }; roster.open(); api.sfx('uiSel'); return true; } st.card = { p, row: 0, top: 0, ranks: false }; getSettings(); api.sfx('uiSel'); return true; }
  function cardHands(p, pr, keys) {
    const c = st.card; if (c && c.roster) { if (!roster.isOpen() || !api.players().includes(c.p) || c.p.dead || c.p.down > 0) { roster.close(); return false; } return roster.hands(p, pr, keys); }
    if (!c || c.p !== p) return false;
    if (!api.players().includes(p) || p.dead || p.down > 0) { st.card = null; return false; }
    const rows = cardRows(); if (c.row >= rows.length) c.row = 0;
    if (c.ranks) { if (pr.talk || pr.atk || pr.dodge || pr.jump || pr.left || pr.right) { c.ranks = false; api.sfx('menuClose'); } }
    else {
      if (pr.down) { c.row = (c.row + 1) % rows.length; api.sfx('ui'); }
      if (pr.up) { c.row = (c.row + rows.length - 1) % rows.length; api.sfx('ui'); }
      const r = rows[c.row];
      if ((pr.left || pr.right) && OPTS.some(o => o.id === r)) { if (cycleOpt(r, pr.left ? -1 : 1)) api.sfx('equip'); }
      if (pr.jump || pr.atk) { if (r === 'FIGHT') { const S = getSettings(), bi = S.seats.findIndex((q, i) => i >= humansIn()); st.want = { k: 'enter', bot: bi >= 0 ? S.seats[bi].hero : 'random', settings: S }; st.card = null; api.sfx('uiSel'); } else if (r === 'RANKINGS') { c.ranks = true; api.sfx('uiSel'); } else if (r === 'CLOSE') { st.card = null; api.sfx('menuClose'); } else if (OPTS.some(o => o.id === r)) { if (cycleOpt(r, 1)) api.sfx('equip'); } }
      else if (pr.talk || pr.dodge) { st.card = null; api.sfx('menuClose'); }
    }
    for (const k in pr) pr[k] = false;
    for (const k of ['left', 'right', 'up', 'down', 'jump', 'atk', 'dodge', 'block', 'throw']) keys[k] = false;
    return true;
  }

  /* ===== drawing ===== */
  function drawWorld(g, cx, cy) {   /* a bar over every seat's head, in his colour: who is who, and how much he has left */
    if (!on()) return;
    for (const p of st.seats) { const x = Math.round(p.x - cx) - 11, y = Math.round(p.y - cy) - 40, sh = Math.max(0, Math.min(1, (p.duelHp || 0) / maxOf(p)));
      g.fillStyle = 'rgba(10,8,16,0.8)'; g.fillRect(x - 1, y - 1, 24, 5); g.fillStyle = '#3a2a2a'; g.fillRect(x, y, 22, 3); g.fillStyle = col(p); g.fillRect(x, y, Math.round(22 * sh), 3); }
    if (foeReady()) { const cols = foeCols(), TS = api.TS, F = st.foe; for (const q of F.pend) { const bob = Math.round(Math.sin(api.time() * 12) * 1.5); api.text('!', Math.round(cols[q.door] * TS + TS / 2 - cx), Math.round(api.L().duelPit.floor * TS - 46 - cy) + bob, '#ffd36b', 'center', 16); } }   /* (duelfoes) THE TELL: a '!' over the door for the second before he walks in */
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
    if (st.card && st.card.roster) return;   /* the roster is drawn last, over the whole frame (drawRoster) */
    if (st.card && api.L() && api.L().tavern) {
      const c = st.card, w = 196, rows = cardRows(), S = getSettings(), VIS = 8, hum = api.players();
      if (c.row < c.top) c.top = c.row; if (c.row >= c.top + VIS) c.top = c.row - VIS + 1;
      const h = c.ranks ? 96 : 30 + Math.min(hum.length, 4) * 9 + (S.seats.length > hum.length ? 9 : 0) + Math.min(VIS, rows.length) * 9 + 14, x = Math.round(VW / 2 - w / 2), y = Math.max(2, Math.round((VH - h) / 2) - 6);
      api.board(x, y, w, h);
      if (c.ranks) { drawRanks(x + 4, y + 4, w - 8); T('ANY KEY: BACK', x + w / 2, y + h - 10, '#8a8f80', 'center', 8); return; }
      T('DUEL (BETA)' + (S.teams ? ' - 2 VS 2' : ''), x + w / 2, y + 4, '#ffd36b', 'center', 8);
      let yy = y + 15; for (const p of hum) { T(api.tagOf(p) + ' ' + api.heroName(p.hero), x + 8, yy, col(p), 'left', 8); yy += 9; }
      if (S.seats.length > hum.length) { T('+ ' + (S.seats.length - hum.length) + ' BOT' + (S.seats.length - hum.length > 1 ? 'S' : ''), x + 8, yy, '#c2c9c2', 'left', 8); yy += 9; }
      yy += 3;
      rows.slice(c.top, c.top + VIS).forEach((r, i) => { const k = c.top + i, sel = k === c.row, o = OPTS.find(q => q.id === r), v = o ? '< ' + o.fmt(optVal(o, S)) + ' >' : '';
        T((sel ? '> ' : '  ') + (o ? o.name : r), x + 8, yy, sel ? '#a8e06e' : '#c2c9c2', 'left', 8); if (v) T(v, x + w - 8, yy, sel ? '#fff6e0' : '#c2c9c2', 'right', 8); yy += 9; });
      if (c.top > 0) T('^', x + w - 8, y + 4, '#8a8f80', 'right', 8); if (c.top + VIS < rows.length) T('v', x + w - 8, y + h - 20, '#8a8f80', 'right', 8);
      const sr = rows[c.row]; if ((DUEL_FOES && (sr === 'goblins' || sr === 'friendlyFire')) || (DUEL_ARENAS && sr === 'arena')) T(api.fit ? api.fit(lineOf(sr, S), w - 12, 8) : lineOf(sr, S), x + w / 2, y + h - 10, '#c2c9c2', 'center', 8);   /* (duelfoes) the plain-words line */ else
      T('LEFT/RIGHT: CHANGE   JUMP: SELECT', x + w / 2, y + h - 10, '#8a8f80', 'center', 8);
      return;
    }
    if (!on()) return;
    const m = st.m;
    /* the seats' bars along the top, each in his colour, with his round pips */
    const n = st.seats.length, bw = Math.min(110, Math.floor((VW - 16) / n) - 6), cf = st.cfg;
    st.seats.forEach((p, k) => { const x = Math.round(8 + k * (bw + 6)), y = 6, sh = Math.max(0, Math.min(1, (p.duelHp || 0) / maxOf(p)));
      T((cf.teams ? 'T' + p.duelTeam + ' ' : '') + label(p), x, y, col(p), 'left', 8);
      g2(x, y + 10, bw, 5, sh, col(p));
      if (cf.lives > 1) T('x' + Math.max(0, p.duelLives || 0), x, y + 17, (p.duelLives || 0) > 0 ? '#ffd36b' : '#6a6a6a', 'left', 8);
      if (!cf.teams) for (let i = 0; i < m.toWin; i++) T((m.wins[idOf(p)] || 0) > i ? '*' : '-', x + bw - 12 - (m.toWin - 2) * 7 + i * 7, y, (m.wins[idOf(p)] || 0) > i ? '#ffd36b' : '#6a6a6a', 'left', 8); });
    if (cf.teams) { const wl = k => { let t = ''; for (let i = 0; i < m.toWin; i++) t += (m.wins[k] || 0) > i ? '*' : '-'; return t; }; T('T1 ' + wl(1) + '   T2 ' + wl(2), VW - 6, 6, '#c2c9c2', 'right', 8); }
    const cyT = 24;
    if (m.phase === 'fight') { const fin = Number.isFinite(m.fightT), left = Math.max(0, m.fightT - m.clock), sd = suddenDeath(m.clock, m.fightT);
      T(sd ? 'SUDDEN DEATH: ONE HIT' : fin ? Math.ceil(left) + '' : '--', VW / 2, cyT, sd ? '#ff6b6b' : '#fff6e0', 'center', sd || !fin ? 8 : 12);
      T('ROUND ' + m.round, VW / 2, cyT + (sd ? 9 : 14), '#9aa39a', 'center', 8); }
    if (m.phase === 'count') { T('ROUND ' + m.round, VW / 2, VH / 2 - 30, '#fff6e0', 'center', 16); T(String(Math.max(1, Math.ceil(m.t))), VW / 2, VH / 2 - 8, '#ffd36b', 'center', 24); const al = arenaLabel(); if (al) T(al, VW / 2, VH / 2 + 22, '#c2c9c2', 'center', 8); }   /* (duelarenas) which arena, and that RANDOM picked it */
    const b = st.banner; if (b && (api.time() - b.at < b.t) && m.phase !== 'count') { T(b.txt, VW / 2, VH / 2 - 40, b.c, 'center', b.txt.length > 18 ? 8 : 16); if (b.txt === 'FIGHT!') { const al = arenaLabel(); if (al) T(al, VW / 2, VH / 2 - 21, '#c2c9c2', 'center', 8); } }   /* (duelarenas) the FIGHT banner names the arena */
    if (m.phase === 'over' && st.result) {
      const w = st.result.foes ? 260 : 220, h = 72 + st.result.rows.length * 9 + 80,   /* (duelproofs-2 11-13) the GOBLINS column leaves only 50 px for the name on the 220 px board: 'P1 GEOMA', 'P3 PALADI', 'P4 WARDE' - 260 px gives it 90 */ x = Math.round(VW / 2 - w / 2), y = Math.round(VH / 2 - h / 2) + 8;
      api.board(x, y, w, h);
      T(st.result.winner ? winName(st.result.winner) + ' WINS' : 'A DRAWN DUEL', x + w / 2, y + 5, st.result.winner ? winCol(st.result.winner) : '#fff6e0', 'center', 8);
      if (st.result.practice) T('PRACTICE: UNRANKED', x + w / 2, y + 15, '#9aa39a', 'center', 8); if (!st.result.foes) T('ROUNDS  DEALT  POINTS', x + w - 6, y + 25, '#9aa39a', 'right', 8);
      else { const hx = [x + w - 6, x + w - 50, x + w - 96, x + w - 144]; ['POINTS', 'GOBLINS', 'DEALT', 'ROUNDS'].forEach((hd, i) => T(hd, hx[i], y + 25, '#9aa39a', 'right', 8)); }   /* (duelfoes) the GOBLINS column: four right-aligned columns, the name fitted to what is left */   /* (proof146b) the two lines each had a row: side by side they overran the 220 px board */
      st.result.rows.forEach((r, k) => { const p = seatById(r.n), yy = y + 35 + k * 9; const nm = r.tag + ' ' + api.heroName(r.hero) + (r.ranked || st.result.practice ? '' : ' (GUEST)'); if (!st.result.foes) { T(nm, x + 6, yy, p ? col(p) : '#c2c9c2', 'left', 8); T(r.rounds + '   ' + r.dealt + '   +' + r.pts, x + w - 6, yy, '#fff6e0', 'right', 8); }
        else { T(api.fit ? api.fit(nm, w - 170, 8) : nm, x + 6, yy, p ? col(p) : '#c2c9c2', 'left', 8); [['+' + r.pts, 6], [String(r.gobs), 50], [String(r.dealt), 96], [String(r.rounds), 144]].forEach(([v, o]) => T(v, x + w - o, yy, '#fff6e0', 'right', 8)); } });
      const ry = y + 41 + st.result.rows.length * 9; drawRanks(x + 6, ry, w - 12, 5);
      T('JUMP: REMATCH    E: BACK TO THE INN', x + w / 2, y + h - 10, '#a8e06e', 'center', 8);
    }
  }
  const g2 = (x, y, w, h, sh, c) => api.bar(x, y, w, h, sh, c);

  function debug() { return { on: on(), m: st.m ? JSON.parse(JSON.stringify({ ...st.m })) : null, seats: st.seats.map(p => ({ n: p.n, hero: p.hero, hp: p.duelHp, max: p.duelMax, lives: p.duelLives, team: p.duelTeam, diff: (st.bots.get(p) || {}).diff, bot: !!p.duelBot, up: api.upright(p), x: Math.round(p.x), dealt: p.duelDealt || 0 })), result: st.result, arena: st.arena ? { ...st.arena } : null, foe: st.foe ? { next: st.foe.next, pend: st.foe.pend.length, alive: st.foe.list.filter(e => e.alive).length, said: st.foe.said, flee: st.foe.flee } : null, stats: { ...st.stats }, card: st.card ? { n: st.card.p.n, row: st.card.row, ranks: st.card.ranks } : null, cfg: st.cfg, lvl: st.seats.map(p => st.lvl.get(p) ?? 1), proxies: [...st.prox.values()].map(e => ({ n: e.pvpSeat.n, alive: e.alive, x: Math.round(e.x) })) }; }
  return { st, on, sync, hit, begin, end, getSettings, setSettings, setSeat, setSeats, setSeatCount, seatList, defaultSettings, cycleOpt, hands, tick, post, openCard, cardHands, roster, rosterOpen: () => !!(st.card && st.card.roster && roster.isOpen()), rosterMouse: (x, y, d) => roster.mouse(x, y, d), rosterEsc: () => roster.esc(), drawWorld, drawHud, drawRoster: (VW, VH) => { if (st.card && st.card.roster && api.L() && api.L().tavern) roster.draw(VW, VH); }, debug, clearProxies, rematch, foeBlow, foeDied, foeFlee, foeTick, foeClear, cardOpen: () => !!st.card };
}
