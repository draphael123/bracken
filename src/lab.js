// src/lab.js — THE FIGHT LAB and THE BOSS LAB.
// The playtest bot walks levels. These FIGHT, and measure what a player feels: how long a foe or a boss takes to
// kill, and how much of your health it costs. Both yield between fights, so a page can be polled while they run.
//   await BK.fightLab({ levels: ['wood', 'spire', 'waymeet'], heroes: [...], foes: [...], reps: 2 })   -> window.__lab
//   await BK.bossLab({ bosses: ['wood', 'kings', ...], heroes: [...] })                                -> window.__bossLab

// each hero's real reach (attackBox in main.js), so the bot swings from where the blow actually lands
export const LAB_REACH = { knight: 22, pyro: 30, paladin: 24, pirate: 20, reaper: 34 };
export const LAB_FOES = ['sprig', 'shield', 'swornsword', 'archer', 'hedgeknight', 'cutlass', 'harpy', 'crab', 'tideguard', 'scout'];
const HEROES = ['knight', 'pyro', 'paladin', 'pirate', 'reaper'];
const threatOf = e => e.alive && ((e.mode && /Tell|tell|wind|aim|draw|charge|lunge|raise/.test(e.mode)) || e.draw > 0 || e.liftT > 0);
const yieldNow = () => new Promise(r => setTimeout(r, 0));

// Every hero against the common foes, one at a time, in an early, a middle and a late level (so the tier scaling of
// hp and damage is in it). The bot closes to its reach and swings; when the foe winds up it defends the way its hero
// does: the knight, the paladin and the death knight hold C, the freebooter taps it to parry, the pyromancer rolls.
export async function fightLab(BK, opts = {}) {
  const lvm = await import('./level.js');
  const heroes = opts.heroes || HEROES, foes = opts.foes || LAB_FOES;
  const levels = opts.levels || ['wood', 'spire', 'waymeet'], reps = opts.reps || 2, maxF = opts.maxF || 1800;
  const rows = [], out = { rows, started: Date.now(), progress: 0, total: levels.length * heroes.length * foes.length };
  if (typeof window !== 'undefined') window.__lab = out;
  for (const lvId of levels) for (const h of heroes) for (const t of foes) {
    const fights = [];
    for (let rep = 0; rep < reps; rep++) {
      BK.setHero(h); BK.load(lvm.LEVELS.findIndex(l => l.id === lvId)); BK.state = 'play'; BK.god = false;
      for (const e of BK.enemies()) e.alive = false; BK.sim(20);
      const P = BK.P, k = BK.keys; P.hp = P.maxHp; P.st = P.maxSt; P.inv = 0;
      const before = BK.enemies().length; BK.spawnEnt({ t, x: Math.round(P.x / 16) + 5, y: Math.round(P.y / 16) - 1 });
      const e = BK.enemies()[BK.enemies().length - 1];
      if (BK.enemies().length === before || !e) { fights.push({ skipped: true }); continue; }
      let f = 0, taken = 0, swings = 0, defends = 0, died = false, last = P.hp; const ehp = e.hp;
      for (; f < maxF && e.alive; f++) {
        if (P.dead) { died = true; break; }
        const d = e.x - P.x, ad = Math.abs(d), reach = LAB_REACH[h] + e.w / 2; P.face = Math.sign(d) || P.face;
        const threat = threatOf(e) && ad < 70 && Math.abs(e.y - P.y) < 50;
        k.left = false; k.right = false; k.block = false;
        if (threat && P.atk < 0) {
          defends++;
          if (h === 'pyro') { if (f % 20 === 0) { k[d > 0 ? 'left' : 'right'] = true; BK.press('dodge'); } }
          else if (h === 'pirate') { if (f % 12 === 0) k.block = true; }
          else k.block = true;
        } else if (ad > reach - 2) k[d > 0 ? 'right' : 'left'] = true;
        else if (P.atk < 0 && P.st >= 8 && Math.abs(e.y - P.y) < 26) { BK.press('atk'); swings++; }
        BK.sim(1);
        if (P.hp < last) taken += last - P.hp; last = P.hp;
      }
      k.left = false; k.right = false; k.block = false;
      fights.push({ killed: !e.alive, died, secs: f * (BK.SET.speed || 1) / 60, taken, swings, defends, ehp, maxHp: P.maxHp });
      for (const q of BK.enemies()) q.alive = false;
      await yieldNow();
    }
    const ok = fights.filter(x => !x.skipped), ks = ok.filter(x => x.killed);
    const avg = (a, fn) => a.length ? a.reduce((s, x) => s + fn(x), 0) / a.length : null;
    out.progress++;
    if (!ok.length) { rows.push({ lvl: lvId, h, t, skipped: true }); continue; }
    rows.push({ lvl: lvId, h, t, ehp: ok[0].ehp, kills: ks.length + '/' + ok.length, deaths: ok.filter(x => x.died).length,
      ttk: ks.length ? +avg(ks, x => x.secs).toFixed(2) : null, taken: +avg(ok, x => x.taken).toFixed(1),
      takenPct: +(100 * avg(ok, x => x.taken / x.maxHp)).toFixed(1), swings: +avg(ok, x => x.swings).toFixed(1), defends: Math.round(avg(ok, x => x.defends)) });
  }
  // per level and hero: the average time to kill a common foe, and the share of health one costs
  const acc = {};
  for (const r of rows) {
    if (r.skipped) continue;
    const s = acc[r.lvl + '/' + r.h] || (acc[r.lvl + '/' + r.h] = { n: 0, ttk: 0, ttkN: 0, pct: 0, deaths: 0, unkilled: 0 });
    s.n++; if (r.ttk != null) { s.ttk += r.ttk; s.ttkN++; } else s.unkilled++; s.pct += r.takenPct; s.deaths += r.deaths;
  }
  out.summary = {};
  for (const key in acc) { const s = acc[key]; out.summary[key] = { ttk: s.ttkN ? +(s.ttk / s.ttkN).toFixed(2) : null, hpPerFoe: +(s.pct / s.n).toFixed(1), deaths: s.deaths, unkilled: s.unkilled }; }
  out.done = true; out.ms = Date.now() - out.started;
  return out;
}

// Each hero into each boss's room, swinging until it falls or the clock runs out. The hero's health is put back every
// frame and what the boss took is counted, so it measures both sides: how long the boss lasts, and how much damage per
// minute a hero has to survive to see it through.
export async function bossLab(BK, opts = {}) {
  const lvm = await import('./level.js');
  const heroes = opts.heroes || HEROES;
  const bosses = opts.bosses || ['wood', 'kings', 'spire', 'crown', 'hurricane', 'waymeet'], maxSecs = opts.maxSecs || 120;
  const rows = [], out = { rows, started: Date.now(), progress: 0, total: bosses.length * heroes.length };
  if (typeof window !== 'undefined') window.__bossLab = out;
  for (const lvId of bosses) for (const h of heroes) {
    BK.setHero(h); BK.load(lvm.LEVELS.findIndex(l => l.id === lvId)); BK.state = 'play'; BK.god = false; BK.sim(10);
    const A = BK.L.arena; out.progress++;
    if (!A) { rows.push({ lvl: lvId, h, skipped: 'no arena' }); continue; }
    const boss = BK.enemies().find(e => e.t === A.boss && e.alive);
    if (!boss) { rows.push({ lvl: lvId, h, skipped: 'no boss' }); continue; }
    for (const e of BK.enemies()) if (e !== boss && !e.maxHp) e.alive = false;
    BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(30);
    const P = BK.P, k = BK.keys, hp0 = boss.hp, maxF = Math.round(maxSecs * 60 / (BK.SET.speed || 1));
    let f = 0, taken = 0, swings = 0;
    for (; f < maxF && boss.alive; f++) {
      P.hp = P.maxHp; P.dead = 0; P.st = Math.max(P.st, 30);
      const d = boss.x - P.x, ad = Math.abs(d), reach = LAB_REACH[h] + (boss.w || 20) / 2; P.face = Math.sign(d) || P.face;
      k.left = false; k.right = false;
      if (ad > reach - 2) k[d > 0 ? 'right' : 'left'] = true;
      else if (P.atk < 0) { BK.press('atk'); swings++; }
      if (f % 90 === 0 && boss.y < P.y - 30) BK.press('jump');
      const was = P.hp; BK.sim(1); if (P.hp < was) taken += was - P.hp;
      if (f % 600 === 599) await yieldNow();
    }
    k.left = false; k.right = false;
    const secs = f * (BK.SET.speed || 1) / 60;
    rows.push({ lvl: lvId, boss: boss.t, h, killed: !boss.alive, secs: +secs.toFixed(1), bossHp: hp0, hpLeftPct: boss.alive ? Math.round(100 * boss.hp / hp0) : 0,
      takenPerMin: Math.round(taken / Math.max(1 / 60, secs) * 60), heroHp: P.maxHp, swings });
    await yieldNow();
  }
  out.done = true; out.ms = Date.now() - out.started;
  return out;
}
