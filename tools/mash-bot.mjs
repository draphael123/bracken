/* tools/mash-bot.mjs - THE MASH BOT (claude/mashbot, 2026-10-01). Daniel, of the Fair, the Theatre and more: "no challenge... the boss is just attack,
   attack". Our pilots are too kind: nothing asked whether a player who ONLY MASHES ATTACK fails. This is that player. He walks toward the boss and
   presses the basic attack every frame it is free. He never blocks, never dodges or rolls, never jumps on purpose, never uses a heavy blow, a skill,
   a mechanic or an opening. The target (docs/LEVEL-QUALITY.md, docs/NEW-LEVEL-CHECKLIST.md): he LOSES to every boss with every hero, and in a level he
   dies or drops under 40% health. One life, normal health, no god mode (the lab's setup, src/lab.js bossLab, minus its bot).
     node tools/mash-bot.mjs <id>[,<id>..]        a level's boss fight (and mini fight) with knight, warden, pyro x 2 seeds, at the level's expected hero level
     node tools/mash-bot.mjs --level <id>[,..]    LEVEL MODE: hold right + mash attack through the level's main route (lifted where it is stuck, counted)
     node tools/mash-bot.mjs --all                every campaign boss and mini, both modes   (long: run it by hand, never in the suite)
     options: --heroes=knight,warden,pyro  --seeds=2  --l1  (add the fresh level-1 variant, 1 seed)  --probe (also the chip / reprisal probe)  --mini-only / --arena-only
              --write (stamp docs/mash-bot.json, hash-stamped like docs/level1-pilot.json)  --out=file.json (raw rows)  --secs=150
     node tools/mash-bot.mjs --assert <id>        reads the cache and exits 1 if the mash bot did NOT lose (a boss check's assertion; no browser)
   Hero level: the level's depth on the gate chain (src/campaign-order.js depthsOf; xp.js: level = levels finished), no skills bought, no talents.
   The cache is stamped with levelHash (the level's DATA); a boss module edit does not stale it, so re-run after a boss change. */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import { levelHash, MASH_FILE, mashVerdict } from './level-quality.mjs';
import { pacing } from './pacing.mjs';

const args = process.argv.slice(2), has = k => args.includes('--' + k);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const free = args.filter(a => !a.startsWith('-')), depth = depthsOf(LEVELS);
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 2), secs = +opt('secs', 150), WRITE = has('write'), OUT = opt('out', '');

if (has('assert')) {   /* the assertion a boss check imports or shells out to: mash must lose (cache only) */
  let bad = 0;
  for (const id of free) { const lv = LEVELS.find(l => l.id === id); const v = mashVerdict(lv); console.log(id + ': ' + v.msg); if (!v.ok) bad++; }
  process.exit(bad ? 1 : 0);
}

/* WHICH LEVELS: every one with an arena or a mini, discovered in the page (a level's arena is built at load) */
const pageSrc = `(() => {
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rnd = (async () => (await import('/src/px.js')).mulberry)();
  const prep = async (o) => {   /* a fresh hero of o.lvl, no skills, on a seeded dice; returns the restore */
    const { xpFloor } = await import('/src/xp.js'), mulberry = await rnd, real = Math.random;
    const P0 = BKT.PROG; P0.xp[o.hero] = o.lvl > 0 ? xpFloor(o.lvl) : 0; P0.skillOwned[o.hero] = {}; P0.loadouts[o.hero] = []; if (P0.talents) P0.talents[o.hero] = {};
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
  window.__mashLevel = async (o) => {
    BK.manualSimulation = true; const { LEVELS } = await import('/src/level.js'), TS = 16, done = await prep(o);
    try {
      BK.setHero(o.hero); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === o.id)); BK.state = 'play'; BK.start(); BK.god = false; BK.reset();
      const P = BK.P, k = BK.keys, way = o.way, d0 = BK.stats().deaths; let frames = 0, lifts = 0, reached = 0, minHp = 1, lostHp = 0;
      for (const [wx, wy] of way) { if (frames > o.steps) break; let got = false; const gx = wx * TS + 8;
        for (let i = 0; i < 240 && frames < o.steps; i++, frames++) {
          k.left = k.right = k.up = k.down = k.jump = k.block = k.atk = false; if (k.throw !== undefined) k.throw = false;
          if (Math.abs(P.x - gx) < 10) { got = true; break; } k[gx > P.x ? 'right' : 'left'] = true; if (P.atk < 0) BK.press('atk');
          const before = P.hp; BK.sim(1); lostHp += Math.max(0, before - Math.max(0, P.hp)); minHp = Math.min(minHp, Math.max(0, P.hp) / P.maxHp); }
        if (!got) { lifts++; BK.tp(wx, wy); BK.sim(2); } reached++; if (frames % 600 === 0) await new Promise(r => setTimeout(r, 0)); }
      return { deaths: BK.stats().deaths - d0, minHpPct: Math.round(minHp * 100), hpLostPct: Math.round(lostHp / P.maxHp * 100), hits: BK.hitsTaken, walked: Math.round(reached / way.length * 100), lifts, frames, kills: BK.stats().kills, heroLevel: o.lvl };
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
    const entry = (cache[id] = cache[id] && cache[id].hash === levelHash(lv) ? cache[id] : { hash: levelHash(lv) });
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
      for (const hero of (has('all') || has('quick') ? ['knight'] : heroes)) {
        let r; try { r = await pg.evalp(`__mashLevel(${JSON.stringify({ id, hero, seed: 1, mini: false, lvl: lvOf(id), way, steps: 40000 })})`, 1800000); }
        catch (e) { console.log(id + ' LEVEL ' + hero + ' ERR ' + e.message.slice(0, 120)); pg.close(); pg = await openPage({ audio: false, fonts: false }); await pg.evalp(pageSrc); continue; }
        lres[hero] = r; rows.push({ id, level: true, hero, ...r });
        console.log(id + ' LEVEL L' + r.heroLevel + ' ' + hero + ': lowest hp ' + r.minHpPct + '%, hp lost ' + r.hpLostPct + '%, deaths ' + r.deaths + ', walked ' + r.walked + '% of waypoints, ' + r.lifts + ' lifts, ' + r.hits + ' blows taken'); }
      if (Object.keys(lres).length) entry.level = lres;
    }
  }
  if (WRITE) { writeFileSync(MASH_FILE, JSON.stringify(cache, null, 1) + '\n'); console.log('wrote docs/mash-bot.json'); }
  if (OUT) { writeFileSync(OUT, JSON.stringify(rows)); console.log('wrote raw rows to ' + OUT); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
