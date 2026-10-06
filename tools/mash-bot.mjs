/* tools/mash-bot.mjs - THE MASH BOT (claude/mashbot, 2026-10-01). Daniel, of the Fair, the Theatre and more: "no challenge... the boss is just attack,
   attack". Our pilots are too kind: nothing asked whether a player who ONLY MASHES ATTACK fails. This is that player. He walks toward the boss and
   presses the basic attack every frame it is free. He never blocks, never dodges or rolls, never jumps on purpose, never uses a heavy blow, a skill,
   a mechanic or an opening. The target (docs/LEVEL-QUALITY.md, docs/NEW-LEVEL-CHECKLIST.md): he LOSES to every boss with every hero, and in a level he
   dies or drops under 40% health. One life, normal health, no god mode (the lab's setup, src/lab.js bossLab, minus its bot).
     node tools/mash-bot.mjs <id>[,<id>..]        a level's boss fight (and mini fight) with knight, warden, pyro x 2 seeds, at the level's expected hero level
     node tools/mash-bot.mjs --level <id>[,..]    LEVEL MODE: hold right + mash attack through the level's main route (lifted where it is stuck, counted)
     node tools/mash-bot.mjs --report             per-hero level table from the cache + the levels whose verdict changes when every hero is judged (no browser)
     options: --no-machines (level mode: lift instead of riding barges / lifts / carts / cranks), --quick (level mode: knight only)
     node tools/mash-bot.mjs --all                every campaign boss and mini, both modes   (long: run it by hand, never in the suite)
     options: --heroes=knight,warden,pyro  --seeds=2  --l1  (add the fresh level-1 variant, 1 seed)  --probe (also the chip / reprisal probe)  --mini-only / --arena-only
              --write (stamp docs/mash-bot.json, hash-stamped like docs/level1-pilot.json)  --out=file.json (raw rows)  --secs=150
     node tools/mash-bot.mjs --assert <id>        reads the cache and exits 1 if the mash bot did NOT lose (a boss check's assertion; no browser)
   Hero level: the level's depth on the gate chain (src/campaign-order.js depthsOf; xp.js: level = levels finished), no skills bought, no talents.
   The cache is stamped with levelHash (the level's DATA); a boss module edit does not stale it, so re-run after a boss change. */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import { levelHash, MASH_FILE, MASH_HP, mashVerdict } from './level-quality.mjs';
import { pacing } from './pacing.mjs';
import { carryRows, heroReport } from './mash-rows.mjs';

const args = process.argv.slice(2), has = k => args.includes('--' + k);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const free = args.filter(a => !a.startsWith('-')), depth = depthsOf(LEVELS);
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 2), secs = +opt('secs', 150), WRITE = has('write'), OUT = opt('out', '');

if (has('assert')) {   /* the assertion a boss check imports or shells out to: mash must lose (cache only) */
  let bad = 0;
  for (const id of free) { const lv = LEVELS.find(l => l.id === id); const v = mashVerdict(lv); console.log(id + ': ' + v.msg); if (!v.ok) bad++; }
  process.exit(bad ? 1 : 0);
}

if (has('report')) {   /* (claude/mashmachines) the per-hero level table and the levels whose verdict changes when every hero is judged (cache only, no browser) */
  const { lines, changes, partial } = heroReport(JSON.parse(readFileSync(MASH_FILE, 'utf8')), MASH_HP); console.log(lines.join('\n'));
  console.log('\n' + changes.length + ' level(s) change verdict between knight-only and all heroes: ' + (changes.join(', ') || 'none') + '\n' + partial.length + ' level row(s) do not hold all three heroes yet (re-run --level): ' + (partial.join(', ') || 'none')); process.exit(0);
}

/* WHICH LEVELS: every one with an arena or a mini, discovered in the page (a level's arena is built at load) */
const pageSrc = `(() => {
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rnd = (async () => (await import('/src/px.js')).mulberry)();
  const prep = async (o) => {   /* a fresh hero of o.lvl, no skills, on a seeded dice; returns the restore */
    const { xpFloor } = await import('/src/xp.js'), mulberry = await rnd, real = Math.random;
    const P0 = BKT.PROG; BKT.setHeroLevel(o.hero, o.lvl);
    if (${has('perks') ? 'true' : 'false'}) { const PR = await import('/src/progression.js'); for (let k = 0; k < 10; k++) { const owe = PR.milestonesOwed(P0, o.hero, o.lvl); if (!owe.length) break; PR.pickMilestone(P0, o.hero, owe[0], PR.perkOffer(P0, o.hero, owe[0])[2].id, o.lvl); } }   /* --perks (LEVELING2): every early milestone taken as the hero's OWN, ranks stacked: must not make the mash bot win */
    P0.skillOwned[o.hero] = {}; P0.loadouts[o.hero] = []; if (P0.talents) P0.talents[o.hero] = {};
    Math.random = mulberry(hash(o.id + '|' + o.hero + '|' + o.seed + '|' + (o.mini ? 'm' : 'a') + o.lvl)); return () => { Math.random = real; }; };
  window.__mashBoss = async (o) => {
    BK.manualSimulation = true; const { LEVELS } = await import('/src/level.js'), { LAB_REACH } = await import('/src/lab.js'), TS = 16;
    const done = await prep(o);
    try {
      if (BKT.PROG[o.id]) BKT.PROG[o.id].mini = false;   /* a mini beaten in an earlier row is not spawned again (the boss lab does the same) */
      BK.setHero(o.hero); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === o.id)); BK.start(); BK.god = false; BK.sim(10); BK.reset();
      const L = BK.L, A = o.mini ? L.mini : L.arena; if (!A) return { skipped: o.mini ? 'no mini' : 'no arena' };
      const boss = BK.enemies().find(e => e.t === A.boss && e.alive && (!o.mini || e.mini)); if (!boss) return { skipped: 'no boss' };
      for (const e of BK.enemies()) if (e !== boss && !e.maxHp) e.alive = false;
      if (A.carpet) { BK.board(); BK.sim(30); } else { if (A.start) BK.tp(A.start[0], A.start[1]); else BK.tp(Math.round(A.trigger / 16) + (A.reverse ? -1 : 1), Math.round(A.floor / 16) - 1); BK.sim(30); }
      const P = BK.P, k = BK.keys, reach = LAB_REACH[o.hero] || 22, maxF = o.secs * 60, hp0 = boss.maxHp || boss.hp; P.hp = P.maxHp; P.dead = 0;
      let f = 0, lost = 0, swings = 0, landed = 0, reprisal = 0, calmBlow = -99, chip = [], low = hp0, maxBlowHp = boss.hp;
      const attackish = /tell|wind|swing|slam|charge|dive|lunge|cleave|smash|stomp|spin|volley|fire|cast|summon|bash|rush|sweep|stab|throw|roar|howl|breath/i;
      for (; f < maxF && boss.alive && !P.dead; f++) {
        k.left = k.right = k.up = k.down = k.jump = k.block = k.atk = false; if (k.throw !== undefined) k.throw = false;
        const dx = boss.x - P.x, dy = (boss.y - (boss.h || 20) / 2) - (P.y - 10), edge = (boss.w || 20) / 2;
        if (Math.abs(dx) > Math.min(reach * 0.7, 14) + edge * 0.5) k[dx > 0 ? 'right' : 'left'] = true; else if (Math.abs(dx) > 6) k[dx > 0 ? 'right' : 'left'] = true;
        if (P.swim) { if (dy < -10) k.up = true; else if (dy > 10) k.down = true; }
        if (P.atk < 0) { BK.press('atk'); swings++; }
        const before = P.hp, bhp = boss.hp, m0 = boss.mode; BK.sim(1);
        const d = Math.max(0, before - Math.max(0, P.hp)); lost += d; if (boss.hp < bhp - 1e-6) { landed++; if (!attackish.test(m0 || '')) calmBlow = f; }
        if (d > 0 && f - calmBlow <= 30) reprisal += d; low = Math.min(low, boss.hp);
        if (o.probe && (f === 240 || f === 720 || f === 1500 || f === 3000) && boss.alive && !P.dead) {   /* THE CHIP PROBE: a clean 10-point blow on him NOW (outside any opening the bot made), measured and given back */
          const open = BK.bossOpen ? BK.bossOpen(boss) : null, h0 = boss.hp, gl = boss.greedLog, ca = boss.chipAcc; BKT.hurtAs('light', boss, 40, P.x, false); const got = h0 - boss.hp; boss.hp = h0; boss.greedLog = gl; boss.chipAcc = ca;   /* (claude/combat3) a HERO'S blow, as the chip rule reads one (hurtAs names it); its greed count and chip remainder put back with the health */ chip.push({ f, mul: +(got / 40).toFixed(3), open: open === null || open === undefined ? (boss.open > 0 ? true : null) : !!open, mode: boss.mode }); }
        if (f % 900 === 899) await new Promise(r => setTimeout(r, 0));
      }
      const out = P.dead ? 'dead' : boss.alive ? 'timeout' : 'win';
      return { out, secs: +(f / 60).toFixed(1), hpLostPct: Math.min(100, Math.round(lost / P.maxHp * 100)), bossLeftPct: boss.alive ? Math.round(boss.hp / hp0 * 100) : 0, swings, landed, reprisalPct: lost > 0 ? Math.round(reprisal / lost * 100) : 0, heroLevel: o.lvl, chip, bossT: boss.t };
    } finally { done(); } };
  /* (claude/mashmachines) LEVEL MODE RIDES THE ROUTE'S MACHINES. The bot never jumps, so a barge, lift, cart or crank-driven platform was a
     'lift' (a teleport) and every level number after it was a guess. Now, stalled at a waypoint, it first does the MINIMUM a player must do: it asks the
     route list (src/stuck-guide.js resolve, the same 'what next' the glint uses) what the route needs here, or else takes the nearest mover whose path
     passes the waypoint; it walks onto the mover and stands still on it (the game starts a mover when you are aboard), and it strikes / presses E at a
     crank, winch, capstan or lever the route names. It still fights only by mashing attack, never blocks or dodges, never jumps. Only when no machine gets
     it there does it lift (teleport) as before. The row counts rides, pulls and lifts apart. Not handled (still a lift): a hoist that wants a load carried
     into its well, a ferry's toll, a rope climb that needs a jump. */
  window.__mashLevel = async (o) => {
    BK.manualSimulation = true; const { LEVELS } = await import('/src/level.js'), { resolve } = await import('/src/stuck-guide.js'), TS = 16, done = await prep(o);
    try {
      BK.setHero(o.hero); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === o.id)); BK.state = 'play'; BK.start(); BK.god = false; BK.reset();
      const P = BK.P, k = BK.keys, way = o.way, d0 = BK.stats().deaths; let frames = 0, lifts = 0, held = 0, duels = 0, boardLifts = 0, rides = 0, pulls = 0, reached = 0, minHp = 1, lostHp = 0, spent = 0; const boxes = new Map(), kinds = {}, dbg = [];
      const MACH = /^(lever|crank|winch|capstan|pump|pwheel|awningwinch|sluice|tbell|bell|seabell|tidebell)$/;
      const clear = () => { k.left = k.right = k.up = k.down = k.jump = k.block = k.atk = false; if (k.throw !== undefined) k.throw = false; };
      const step = () => { const before = P.hp; BK.sim(1); frames++; lostHp += Math.max(0, before - Math.max(0, P.hp)); minHp = Math.min(minHp, Math.max(0, P.hp) / P.maxHp); };
      const mash = () => { if (P.atk < 0) BK.press('atk'); };
      const learn = () => { for (const m of BK.movers()) { if (m.x === undefined || m.y === undefined || Number.isNaN(m.y)) continue; const b = boxes.get(m) || { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 };
        const xs = [m.x, m.x + (m.w || 16)], ys = [m.y, m.y + (m.h || 8)]; if (m.x0 !== undefined) xs.push(m.x0, m.x0 + (m.range || 0) + (m.w || 16)); if (m.y0 !== undefined) ys.push(m.y0); if (m.y1 !== undefined) ys.push(m.y1);
        b.x0 = Math.min(b.x0, ...xs); b.x1 = Math.max(b.x1, ...xs); b.y0 = Math.min(b.y0, ...ys); b.y1 = Math.max(b.y1, ...ys); boxes.set(m, b); } };
      const nameOf = m => m.kind || (m.vert ? 'vmover' : 'mover');
      let curWi = 0;   /* a ride can carry the hero PAST waypoints: the furthest waypoint at or after the current one that he stands at counts (and the bot is never lifted back to one behind him) */
      const nearWp = j => Math.abs(P.x - (way[j][0] * TS + 8)) < 10 && (!o.tall || Math.abs(P.y - (way[j][1] + 1) * TS) < 3 * TS);
      const ahead = from => { for (let j = way.length - 1; j >= from; j--) if (nearWp(j)) return j; return -1; };
      const atWp = () => ahead(curWi) >= 0;
      const usable = m => !m.hoist && !m.broken && !m.gone && !(m.ferry && !m.paid && !m.free) && m.x !== undefined && !Number.isNaN(m.y);
      const aimsAt = (m, wx, wy) => { const b = boxes.get(m); if (!b) return false; const px = wx * TS + 8, py = (wy + 1) * TS; return px >= b.x0 - 5 * TS && px <= b.x1 + 5 * TS && py >= b.y0 - 6 * TS && py <= b.y1 + 6 * TS; };
      /* stand on a mover and wait: true once the waypoint is reached from it */
      const ride = (m, wx, wy, gx) => { if (o.debug) dbg.push('  try ' + nameOf(m) + '@' + Math.round(m.x / TS) + ',' + Math.round(m.y / TS) + ' for wp ' + wx + ',' + wy + ' hero ' + Math.round(P.x / TS) + ',' + Math.round(P.y / TS) + ' f' + frames);
        for (let t = 0; t < 180 && P.onMover !== m && !P.dead; t++) { clear(); const cx = m.x + (m.w || 16) / 2; if (Math.abs(P.x - cx) > 5) k[cx > P.x ? 'right' : 'left'] = true; mash(); step(); }
        if (P.onMover !== m && !P.dead && m.x !== undefined) { boardLifts++; P.x = m.x + (m.w || 16) / 2; P.y = m.y - 2; P.vx = P.vy = 0; for (let t = 0; t < 14 && P.onMover !== m; t++) BK.sim(1); }   /* the bot cannot jump aboard: a BOARDING LIFT puts it on the machine (counted apart from the waypoint lifts), and the machine carries it from there */
        if (P.onMover !== m) { if (o.debug) dbg.push('  not boarded; hero ' + Math.round(P.x / TS) + ',' + Math.round(P.y / TS) + ' mover ' + Math.round(m.x / TS) + ',' + Math.round(m.y / TS)); clear(); return false; }
        rides++; kinds[nameOf(m)] = (kinds[nameOf(m)] || 0) + 1; const x0 = m.x, y0 = m.y; let moved = 0;
        for (let t = 0; t < 900 && !P.dead; t++) { clear(); moved = Math.max(moved, Math.abs(m.x - x0) + Math.abs(m.y - y0));
          if (atWp(gx, wy)) return true;
          if (Math.abs(P.y - (wy + 1) * TS) <= 28 && Math.abs(gx - P.x) < 5 * TS) k[gx > P.x ? 'right' : 'left'] = true;   /* (stand still while it carries you; step off only when the waypoint is a few tiles away) */
          if (t % 45 === 44) BK.press('talk'); mash(); step(); if (t === 300 && moved < 8) break; }
        clear(); if (o.debug) dbg.push('  ride ended; hero ' + Math.round(P.x / TS) + ',' + Math.round(P.y / TS) + ' mover ' + Math.round(m.x / TS) + ',' + Math.round(m.y / TS) + ' moved ' + Math.round(moved) + ' onMover ' + (P.onMover === m)); return atWp(gx, wy); };
      /* walk to a crank / winch / capstan / lever, strike it and press E a few times */
      const work = (tx, ty) => {
        for (let t = 0; t < 360 && !P.dead; t++) { clear(); if (Math.abs(P.x - tx) > 12) k[tx > P.x ? 'right' : 'left'] = true; else break; mash(); step(); }
        if (Math.abs(P.x - tx) > 18) { clear(); return false; }
        for (let t = 0; t < 240 && !P.dead; t++) { clear(); P.face = Math.sign(tx - P.x) || P.face; if (t % 15 === 0) BK.press('talk'); mash(); step(); }
        pulls++; clear(); return true; };
      /* (claude/combat2) AN ELITE'S GATE IS NOT LIFTED OVER. A captain's gate (src/main.js eliteGates: PORT tiles in one column, up while he lives) stands
         across the road until he falls, and a lift used to carry the bot straight over it - the Drowned Keep's exam was 'walked' past THE DROWNED
         CAPTAIN, who never had to be fought. Now a waypoint beyond a shut gate is reached only by fighting its elite: walk at him (swim down to him)
         and mash, up to duelSecs; if he still stands, the bot never got through (three lifts' worth of HELD). */
      const gateElite = gx => BK.enemies().find(e => e.elite && e.alive && e.G && e.shut && e.shut.length && (e.G.col * TS + 8 - P.x) * (gx - (e.G.col * TS + 8)) > 0 && Math.abs(e.y - P.y) < 14 * TS);
      const duel = el => { for (let t = 0; t < (o.duelSecs || 60) * 60 && el.alive && !P.dead; t++) { clear(); const dx = el.x - P.x, dy = (el.y - (el.h || 20) / 2) - (P.y - 10);
          if (Math.abs(dx) > 10) k[dx > 0 ? 'right' : 'left'] = true; else P.face = Math.sign(dx) || P.face; if (P.swim) { if (dy < -10) k.up = true; else if (dy > 10) k.down = true; }
          mash(); step(); if (t % 900 === 899) { /* yield */ } }
        clear(); return !el.alive; };
      const assist = (wx, wy, gx) => {
        const f0 = frames, tried = new Set(); if (spent > 14000) return false;
        try { for (let guard = 0; guard < 6 && frames - f0 < 1600 && !atWp(gx, wy) && !P.dead; guard++) {
          const env = { TS, props: BK.props(), movers: BK.movers(), hero: P }, r = resolve(o.id, Math.floor(P.x / TS), Math.floor((P.y - 1) / TS), env); let acted = false;
          if (r) { const t = r.targets.slice().sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0], key = r.key + '@' + Math.round(t.x) + ',' + Math.round(t.y);
            if (!tried.has(key)) { tried.add(key); const m = BK.movers().find(q => usable(q) && Math.abs(q.x + (q.w || 16) / 2 - t.x) < 3 && Math.abs(q.y + 6 - t.y) < 3), pr = BK.props().find(q => MACH.test(q.t) && Math.abs(q.x - t.x) < 20 && Math.abs(q.y - t.y) < 28 && !q.done);
              if (m) { acted = true; if (ride(m, wx, wy, gx)) break; } else if (pr) { acted = true; work(pr.x, pr.y); } } }
          if (!acted) { const cands = BK.movers().filter(m => usable(m) && !tried.has(m) && aimsAt(m, wx, wy) && Math.abs(m.x - P.x) < 22 * TS && Math.abs(m.y - P.y) < 16 * TS).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y));
            if (cands.length) { tried.add(cands[0]); acted = true; if (ride(cands[0], wx, wy, gx)) break; }
            else { const pr = BK.props().filter(q => MACH.test(q.t) && !q.done && !tried.has(q) && Math.abs(q.x - P.x) < 12 * TS && Math.abs(q.y - P.y) < 6 * TS).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; if (pr) { tried.add(pr); acted = true; work(pr.x, pr.y); } } }
          if (!acted) break; } } finally { spent += frames - f0; clear(); }
        return atWp(gx, wy); };
      for (let wi = 0; wi < way.length; wi++) { const [wx, wy] = way[wi]; curWi = wi; if (frames > o.steps) break; let got = false; const gx = wx * TS + 8;
        { const j = ahead(wi + 1); if (j > wi) { reached += j - wi + 1; wi = j; continue; } }   /* (carried past it by a machine) */
        for (let i = 0; i < 240 && frames < o.steps; i++, frames++) {
          clear(); if (Math.abs(P.x - gx) < 10 && (!o.tall || Math.abs(P.y - (wy + 1) * TS) < 3 * TS)) { got = true; break; }
          const aboard = o.machines !== false && P.onMover && usable(P.onMover) && boxes.has(P.onMover) && aimsAt(P.onMover, wx, wy) && Math.abs(gx - P.x) > 5 * TS;   /* (claude/mashmachines) aboard a machine that is going the waypoint's way: let it carry you, do not walk off its front */
          if (aboard) { mash(); learn(); const before = P.hp; BK.sim(1); lostHp += Math.max(0, before - Math.max(0, P.hp)); minHp = Math.min(minHp, Math.max(0, P.hp) / P.maxHp); continue; }   /* (claude/redgorge) ON A TALL LEVEL A WAYPOINT IS REACHED AT ITS OWN HEIGHT: by column alone a climb's waypoints were 'reached' on the floor below them, and the bot never met the ledges' foes */ k[gx > P.x ? 'right' : 'left'] = true; if (P.atk < 0) BK.press('atk');
          if (frames % 6 === 0) learn(); const before = P.hp; BK.sim(1); lostHp += Math.max(0, before - Math.max(0, P.hp)); minHp = Math.min(minHp, Math.max(0, P.hp) / P.maxHp); }
        if (!got && o.machines !== false) { learn(); got = assist(wx, wy, gx); }
        if (!got) { const el = gateElite(gx); if (el) { duels++; if (!duel(el)) held += 3; } }   /* (claude/combat2) THE ELITE'S GATE: a lift does not jump it - he is fought, and a captain the masher cannot put down holds him there (held: not a clear) */
        if (!got) { if (o.debug) { const mv = BK.movers().filter(m => m.x !== undefined).map(m => [Math.round(Math.hypot(m.x - P.x, (m.y || 0) - P.y) / TS), nameOf(m) + (m.hoist ? ':hoist' : '') + '@' + Math.round(m.x / TS) + ',' + Math.round(m.y / TS)]).sort((p, q) => p[0] - q[0])[0]; dbg.push('lift ' + wx + ',' + wy + ' hero ' + Math.round(P.x / TS) + ',' + Math.round(P.y / TS) + (mv ? ' nearest ' + mv[1] + ' ' + mv[0] + 't' : '')); } lifts++; BK.tp(wx, wy); BK.sim(2); if (Math.abs(P.x - gx) > 3 * TS) held++; }   /* (claude/combat2) HELD: the lift did not land - an ambush room or a locked hall put him straight back */ reached++; if (frames % 600 === 0) await new Promise(r => setTimeout(r, 0)); }
      return { deaths: BK.stats().deaths - d0, minHpPct: Math.round(minHp * 100), hpLostPct: Math.round(lostHp / P.maxHp * 100), hits: BK.hitsTaken, walked: Math.round(reached / way.length * 100), lifts, held, duels, boardLifts, rides, pulls, ridden: kinds, dbg: o.debug ? dbg : undefined, machines: o.machines !== false, frames, kills: BK.stats().kills, heroLevel: o.lvl };
    } finally { done(); } };
})()`;

const { openPage } = await import('./cdp.mjs');
const rows = [], cache = existsSync(MASH_FILE) ? JSON.parse(readFileSync(MASH_FILE, 'utf8')) : {};
const wantLevels = has('all') ? LEVELS.filter(l => !/^(shop|trial_|custom)/.test(l.id)).map(l => l.id) : free.flatMap(x => x.split(','));
const modeLevel = has('level') || has('all'), modeBoss = !has('level') || has('all');
if (!wantLevels.length) { console.log('usage: node tools/mash-bot.mjs [--level] <id>[,<id>..] | --all  [--write] [--l1] [--probe] [--assert <id>]'); process.exit(2); }
const lvOf = id => Math.max(1, depth[id] ?? 1);
let pg = await openPage({ audio: false, fonts: false }); await pg.evalp(pageSrc);
try {
  for (const id of wantLevels) {
    const lv = LEVELS.find(l => l.id === id); if (!lv) { console.log(id + ': no such level'); continue; }
    const entry = (cache[id] = carryRows(cache[id], levelHash(lv), { boss: modeBoss, level: modeLevel }, m => console.log(id + ': ' + m)));   /* (claude/mashmachines) a changed level hash used to DROP the other mode's rows: boss/mini rows are carried through a level-only write now */
    if (modeBoss) for (const mini of [false, true].filter(m => m ? !has('arena-only') : !has('mini-only'))) {
      const variants = [{ lvl: lvOf(id), n: seeds, tag: 'expected' }].concat(has('l1') ? [{ lvl: 0, n: 1, tag: 'l1' }] : []), res = [];
      for (const v of variants) for (const hero of heroes) for (let seed = 1; seed <= v.n; seed++) {
        let r; try { r = await pg.evalp(`__mashBoss(${JSON.stringify({ id, hero, seed, mini, lvl: v.lvl, secs, probe: has('probe') && hero === 'knight' && seed === 1 && v.tag === 'expected' })})`, 1200000); }
        catch (e) { console.log(id + ' ' + hero + ' ERR ' + e.message.slice(0, 120)); pg.close(); pg = await openPage({ audio: false, fonts: false }); await pg.evalp(pageSrc); continue; }
        if (r.skipped) { if (!res.length && !(mini && r.skipped === 'no mini')) console.log(id + (mini ? ' mini' : ' boss') + ': ' + r.skipped); break; }
        const row = { id, mini, hero, seed, tag: v.tag, ...r }; res.push(row); rows.push(row);
        console.log(id + (mini ? ' MINI' : ' BOSS') + ' ' + v.tag + ' L' + v.lvl + ' ' + hero + '#' + seed + ': ' + r.out.toUpperCase() + ' ' + r.secs + 's, hero lost ' + r.hpLostPct + '%, boss left ' + r.bossLeftPct + '%, ' + r.landed + '/' + r.swings + ' blows' + (r.chip && r.chip.length ? ', chip ' + r.chip.map(c => 'x' + c.mul + (c.open ? '(open)' : '')).join(' ') : '')); }
      if (res.length) { const exp = res.filter(r => r.tag === 'expected'); entry[mini ? 'mini' : 'boss'] = { boss: exp[0] && exp[0].bossT, wins: exp.filter(r => r.out === 'win').length, fights: exp.length, byHero: Object.fromEntries(heroes.map(h => [h, exp.filter(r => r.hero === h).map(r => r.out + ':' + r.hpLostPct + '/' + r.bossLeftPct)])), rows: res.map(r => ({ hero: r.hero, seed: r.seed, tag: r.tag, out: r.out, secs: r.secs, hpLostPct: r.hpLostPct, bossLeftPct: r.bossLeftPct, landed: r.landed, swings: r.swings, reprisalPct: r.reprisalPct, chip: r.chip })) }; }
    }
    if (modeLevel) {
      const P = pacing(lv), way = []; for (const [x, y] of P.route) { const l = way[way.length - 1]; if (!l || Math.abs(x - l[0]) >= 8 || Math.abs(y - l[1]) >= 6) way.push([x, y]); }
      const lres = {};
      for (const hero of (has('quick') ? ['knight'] : heroes)) {   /* (claude/mashmachines) all three starter-era heroes, --all too; --quick is knight only */
        let r; try { r = await pg.evalp(`__mashLevel(${JSON.stringify({ id, hero, seed: 1, mini: false, lvl: lvOf(id), way, steps: 120000, tall: !!P.tall, machines: !has('no-machines'), debug: has('debug') })})`, 1800000); }
        catch (e) { console.log(id + ' LEVEL ' + hero + ' ERR ' + e.message.slice(0, 120)); pg.close(); pg = await openPage({ audio: false, fonts: false }); await pg.evalp(pageSrc); continue; }
        lres[hero] = r; rows.push({ id, level: true, hero, ...r });
        console.log(id + ' LEVEL L' + r.heroLevel + ' ' + hero + ': lowest hp ' + r.minHpPct + '%, hp lost ' + r.hpLostPct + '%, deaths ' + r.deaths + ', walked ' + r.walked + '% of waypoints, ' + r.rides + ' rides ' + JSON.stringify(r.ridden || {}) + ', ' + r.pulls + ' pulls, ' + r.boardLifts + ' boarding lifts, ' + r.lifts + ' lifts' + (r.held ? ' (' + r.held + ' HELD: put back by a room it could not finish)' : '') + ', ' + r.hits + ' blows taken' + (r.dbg ? '\n   ' + r.dbg.join('\n   ') : '')); }
      if (Object.keys(lres).length) entry.level = lres;
    }
  }
  if (WRITE) { writeFileSync(MASH_FILE, JSON.stringify(cache, null, 1) + '\n'); console.log('wrote docs/mash-bot.json'); }
  if (OUT) { writeFileSync(OUT, JSON.stringify(rows)); console.log('wrote raw rows to ' + OUT); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
