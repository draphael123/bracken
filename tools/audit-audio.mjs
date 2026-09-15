// tools/audit-audio.mjs — THE AUDIO COVERAGE AUDIT. Findings only: it measures and reports, it fixes nothing.
// The page is opened headless (tools/cdp.mjs), every method on the SFX object is wrapped to LOG its name and the game
// frame it was called on (music.play, duck, muffle and ambient.set too), and the game is driven through every
// creature (spawned beside the knight and fought, stood in front of, and taken hits from), every boss and mini (the
// boss lab, with BK.sim hooked so every frame's mode changes, hurts and deaths are seen), every hero's every action,
// every pickup, every prop, the menus, and every level's start, ambushes and win. The EVENT x SOUND table is what
// fired on the same frame as each event. Separately every voice is rendered once through an OfflineAudioContext
// (a patched copy of src/audio.js, so the game's own module is untouched) and its peak and RMS measured, and every
// music file is decoded and its loop seam, head and tail silence read.
//   node tools/audit-audio.mjs                 the whole audit -> audits/audio-audit.md and audits/audio-audit.json
//   node tools/audit-audio.mjs foes,heroes     only these passes (foes bosses minis heroes pickups props ui levels music voices)
//   node tools/audit-audio.mjs foes=sprig,archer bosses=wood,kings   one creature or one level at a time
//   PORT=5910 by default; --fast shortens the fights (for a smoke run). Exit code 1 only if the page throws.
// While the labs run the wrapped SFX methods do NOT call the real synth (a fast sim would pile thousands of
// oscillators into one audio second); the log is the measurement. hurtOf/dieOf still return their functions, and
// music/ambient calls go through, so the track and ambience requests are real.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { openPage, ROOT } from './cdp.mjs';

const argv = process.argv.slice(2);
const FAST = argv.includes('--fast');
const only = {}; let passes = null;
for (const a of argv) { if (a.startsWith('--')) continue; for (const p of a.split(',')) { const [k, v] = p.split('='); passes = passes || new Set(); passes.add(k); if (v) only[k] = v.split('+'); } }
const want = p => !passes || passes.has(p);
const PORT = +(process.env.PORT || 5910);

// ---------- what the source says (node side): creatures, homes, tracks, the wind-up predicate ----------
const main = readFileSync(join(ROOT, 'src/main.js'), 'utf8').replace(/\r\n/g, '\n');
const audio = readFileSync(join(ROOT, 'src/audio.js'), 'utf8').replace(/\r\n/g, '\n');
const lvm = await import('../src/level.js');
const LEVELS = lvm.LEVELS, T = lvm.T;
const foeTypes = [...(main.match(/const EHP = \{([\s\S]*?)\};/) || [, ''])[1].matchAll(/(\w+):/g)].map(m => m[1]);
const TRACKS = Object.fromEntries([...(audio.match(/const TRACKS = \{([\s\S]*?)\};/) || [, ''])[1].matchAll(/(\w+): '([^']+)'/g)].map(m => [m[1], m[2]]));
const TRACK_GAIN = Object.fromEntries([...(audio.match(/const TRACK_GAIN = \{([^}]*)\}/) || [, ''])[1].matchAll(/(\w+): ([\d.]+)/g)].map(m => [m[1], +m[2]]));
const MUSIC_NAMES = [...(audio.match(/MUSIC_NAMES = \[([^\]]*)\]/) || [, ''])[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
const SFX_SRC_NAMES = [...new Set([...audio.matchAll(/^  ([a-zA-Z0-9_]+)\([^)]*\) \{/gm)].map(m => m[1]))];
const levelInfo = [], homeOf = {}, bossOf = {}, miniOf = {}, propHome = {};
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  const L = lv.build();
  levelInfo.push({ id: lv.id, music: L.music, boss: L.arena && L.arena.boss, bossMusic: L.arena && L.arena.music, mini: L.mini && L.mini.boss, miniMusic: L.mini && L.mini.music, ambushes: (L.ambushes || []).length, W: L.W, ambient: (L.ambient || []).map(z => z.kind) });
  if (L.arena && L.arena.boss) bossOf[L.arena.boss] = lv.id;
  if (L.mini && L.mini.boss) miniOf[L.mini.boss] = lv.id;
  for (const e of L.ents) { if (!homeOf[e.t]) homeOf[e.t] = lv.id; if (!propHome[e.t]) propHome[e.t] = { lvl: lv.id, x: e.x, y: e.y }; }
  // a crate to break, if the level has one
  const inAmbush = x => (L.ambushes || []).some(a => x >= a.wallL - 2 && x <= a.wallR + 2);
  if (!propHome.CRATE) for (let y = 1; y < L.H - 1 && !propHome.CRATE; y++) for (let x = 2; x < L.W - 2; x++) if (!inAmbush(x) && L.grid[y * L.W + x] === T.CRATE && L.grid[(y + 1) * L.W + x] === T.SOLID && L.grid[y * L.W + x - 1] === T.AIR && L.grid[(y + 1) * L.W + x - 1] === T.SOLID) { propHome.CRATE = { lvl: lv.id, x, y }; break; }
}
for (const lv of LEVELS) { if (!(lv.hidden && !lv.secret)) continue; const L = lv.build(); for (const e of L.ents) if (!homeOf[e.t]) homeOf[e.t] = lv.id; }
const isBoss = t => bossOf[t] || miniOf[t];
const NO_FOE = new Set(['dummy', 'bale', 'folk', 'guest', 'drunk', 'bearer', 'heart', 'krakenarm', 'feeler']);   /* the practice post, hay, townsfolk, a boss's part */
const foeList = only.foes || foeTypes.filter(t => !isBoss(t) && !NO_FOE.has(t));

// THE WIND-UP PREDICATE, read: which (creature, mode) pairs windingUp() names, and the generic "any *Tell unless harmless" clause
const wuLine = main.split('\n').find(l => l.startsWith('const windingUp =')) || '';
const WU = {}; let wuGeneric = false;
{ const parts = wuLine.split(/\(e\.t === '/).slice(1);
  for (const p of parts) { const t = p.match(/^(\w+)'/)[1]; const modes = [...p.matchAll(/e\.mode === '(\w+)'/g)].map(m => m[1]); (WU[t] = WU[t] || new Set()); for (const m of modes) WU[t].add(m); if (/endsWith\('Tell'\)/.test(p.split(') ||')[0])) WU[t].add('*Tell'); if (/e\.draw > /.test(p)) WU[t].add('draw>0.3'); }
  wuGeneric = /!e\.harmless && typeof e\.mode === 'string' && e\.mode\.endsWith\('Tell'\)/.test(wuLine); }
const inWindingUp = (t, mode) => (WU[t] && (WU[t].has(mode) || (WU[t].has('*Tell') && mode.endsWith('Tell')))) || (wuGeneric && mode.endsWith('Tell'));

// THE STATIC WIND-UP LIST (the tools/tells.mjs method, for every mode name, not only *Tell): a mode is a wind-up when the
// creature is put into it, the mode itself lands no blow, and the forced chain out of it lands one within three hops.
const staticWindups = [];
{ const funcs = []; const re = /^function (update[A-Za-z]+)\(/gm; let m;
  while ((m = re.exec(main))) { let d = 0, started = false, end = main.length; for (let k = m.index; k < main.length; k++) { const c = main[k]; if (c === '{') { d++; started = true; } else if (c === '}') { d--; if (started && d === 0) { end = k; break; } } } funcs.push({ name: m[1], body: main.slice(m.index, end), at: m.index }); }
  const lower = foeTypes.map(t => t.toLowerCase());
  for (const f of funcs) {
    const nm = f.name.slice(6).toLowerCase(); let t = foeTypes[lower.indexOf(nm)] || foeTypes[lower.findIndex(x => nm.endsWith(x) && x.length > 3)] || null;
    if (f.name === 'updateGoblin') t = null;
    const blocks = new Map(); const cre = /case '([A-Za-z0-9]+)':/g; let c; const hits = [];
    while ((c = cre.exec(f.body))) hits.push({ mode: c[1], at: c.index });
    for (let i = 0; i < hits.length; i++) blocks.set(hits[i].mode, f.body.slice(hits[i].at, i + 1 < hits.length ? hits[i + 1].at : f.body.length));
    const lands = b => /damagePlayer\(|unblockable: true/.test(b);
    const entered = [...new Set([...f.body.matchAll(/e\.mode = '([A-Za-z0-9]+)'/g)].map(x => x[1]))];
    for (const mode of entered) { const b0 = blocks.get(mode); if (!b0 || lands(b0)) continue;
      let mode2 = mode, hit = false; const seen = new Set([mode]);
      for (let hop = 0; hop < 3 && !hit; hop++) { const b = blocks.get(mode2); if (!b) break; const next = [...new Set((b.match(/e\.mode = '([A-Za-z0-9]+)'/g) || []).map(h => h.match(/'([A-Za-z0-9]+)'/)[1]))].filter(x => !seen.has(x)); if (next.length !== 1) break; mode2 = next[0]; seen.add(mode2); const nb = blocks.get(mode2); if (nb && lands(nb)) hit = true; }
      if (!hit) continue;
      const line = main.slice(0, f.at + f.body.indexOf("e.mode = '" + mode + "'")).split('\n').length;
      staticWindups.push({ fn: f.name, t, mode, line, blow: mode2, named: t ? !!inWindingUp(t, mode) : (wuGeneric && mode.endsWith('Tell')) }); }
  } }

// ---------- the page side: instrument, observe, drive ----------
async function pageLib(CFG) {
  const BK = window.BK, P = BK.P, K = BK.keys;
  const A = await import('/src/audio.js');
  const lvm = await import('/src/level.js');
  const idx = id => lvm.LEVELS.findIndex(l => l.id === id);
  const st = { frame: 0, mute: true, tag: '' };
  const log = [], ev = [], acts = [];
  const strip = a => a.map(x => (x && typeof x === 'object') ? '[obj]' : x);
  // the state setters (muffle, duck, lowHealth, ambient.set, jet) are called every frame with the same value: only a CHANGE is logged
  const lastArg = {}; const SETTER = new Set(['music.muffle', 'music.duck', 'music.lowHealth', 'ambient.set', 'jet']);
  const stamp = (n, a) => { const sa = strip(a); if (SETTER.has(n)) { const k = JSON.stringify(sa); if (lastArg[n] === k) return; lastArg[n] = k; } const dbg = A.debugAudio(); log.push({ n, a: sa, f: st.frame, t: +(BK.time || 0).toFixed(3), at: dbg.ac ? +dbg.ac.currentTime.toFixed(3) : -1, em: A.emitNow() ? 1 : 0, tag: st.tag }); };
  for (const k of Object.keys(A.SFX)) { const f = A.SFX[k]; if (typeof f !== 'function') continue;
    A.SFX[k] = function (...a) { stamp(k, a);
      if (k === 'hurtOf' || k === 'dieOf') { const r = f.apply(this, a); if (typeof r !== 'function') return r; const tag = k + ':' + a[0]; return function (...b) { stamp(tag, b); if (!st.mute) return r.apply(this, b); }; }
      if (!st.mute) return f.apply(this, a); }; }
  for (const k of ['play', 'stop', 'duck', 'muffle', 'lowHealth']) { const f = A.music[k]; A.music[k] = function (...a) { stamp('music.' + k, a); return f.apply(this, a); }; }
  { const f = A.ambient.set; A.ambient.set = function (...a) { stamp('ambient.set', a); return f.apply(this, a); }; }
  // the observer: every creature's mode, hp, life, phase and stage, and the hero's own state, diffed every frame
  const ids = new WeakMap(); let nid = 0; const idOf = e => { let i = ids.get(e); if (!i) { i = ++nid; ids.set(e, i); } return i; };
  let prev = new Map(), hprev = null;
  const snap = e => ({ t: e.t, mode: e.mode, hp: e.hp, alive: !!e.alive, phase: e.phase, stage: e.stage, tell: !!BK.telling(e) });
  const resetPrev = () => { prev = new Map(); for (const e of BK.enemies()) prev.set(idOf(e), snap(e)); hprev = null; };
  function observe() {
    const cur = new Map();
    for (const e of BK.enemies()) { const id = idOf(e), p = prev.get(id), s = snap(e);
      const base = { f: st.frame, t: +(BK.time || 0).toFixed(3), id, who: e.t, dist: Math.round(Math.abs(e.x - P.x)), big: !!(e.maxHp || e.big || e.mini), harmless: !!e.harmless, tag: st.tag };
      if (!p) { if (s.alive) ev.push({ ...base, kind: 'spawn', mode: s.mode }); }
      else { if (s.mode !== p.mode) ev.push({ ...base, kind: 'mode', from: p.mode, to: s.mode, tell: s.tell, wasTell: p.tell });
        if (s.alive && p.alive && s.hp < p.hp) ev.push({ ...base, kind: 'hurt', dmg: +(p.hp - s.hp).toFixed(1), mode: s.mode });
        if (!s.alive && p.alive) ev.push({ ...base, kind: 'die', mode: s.mode });
        if (p.phase !== undefined && s.phase !== p.phase) ev.push({ ...base, kind: 'phase', from: p.phase, to: s.phase });
        if (p.stage !== undefined && s.stage !== p.stage) ev.push({ ...base, kind: 'stage', from: p.stage, to: s.stage }); }
      cur.set(id, s); }
    prev = cur;
    const h = { hp: P.hp, dead: P.dead > 0, atk: P.atk >= 0, ground: !!P.ground, dodge: P.dodge > 0, dash: P.dash > 0, block: !!P.block, plunge: !!P.plunge, heavy: !!P.heavy, dashAtk: P.dashAtk > 0, rise: P.riseT > 0, kind: P.swingKind || null, parry: P.parryT > 0, vy: P.vy, aegis: !!P.aegis };
    if (hprev) { const b = { f: st.frame, t: +(BK.time || 0).toFixed(3), who: 'hero', tag: st.tag };
      if (h.hp < hprev.hp) ev.push({ ...b, kind: 'hero:hurt', dmg: +(hprev.hp - h.hp).toFixed(1) });
      if (h.dead && !hprev.dead) ev.push({ ...b, kind: 'hero:die' });
      if (h.atk && !hprev.atk) ev.push({ ...b, kind: 'hero:swing', heavy: h.heavy, dashAtk: h.dashAtk, rise: h.rise, sweep: h.kind });
      if (h.plunge && !hprev.plunge) ev.push({ ...b, kind: 'hero:plunge' });
      if (h.ground && !hprev.ground) ev.push({ ...b, kind: 'hero:land' });
      if (!h.ground && hprev.ground && h.vy < -50) ev.push({ ...b, kind: 'hero:jump' });
      if ((h.dodge || h.dash) && !(hprev.dodge || hprev.dash)) ev.push({ ...b, kind: 'hero:dodge' });
      if (h.block && !hprev.block) ev.push({ ...b, kind: 'hero:block' });
      if (h.parry && !hprev.parry) ev.push({ ...b, kind: 'hero:parry' }); }
    hprev = h;
  }
  const sim0 = BK.sim, load0 = BK.load;
  const tick = (n = 1) => { for (let i = 0; i < n; i++) { st.frame++; sim0.call(BK, 1); observe(); } };
  const act = (what, extra) => acts.push({ f: st.frame, what, tag: st.tag, ...(extra || {}) });
  const yieldNow = () => new Promise(r => setTimeout(r, 0));
  const fresh = (lvId, hero) => { BK.setHero(hero || 'knight'); BK.load(idx(lvId)); BK.state = 'play'; BK.god = false; for (const e of BK.enemies()) e.alive = false; sim0.call(BK, 20); BK.reset(); P.inv = 0; K.left = K.right = K.up = K.down = K.block = K.atk = K.jump = false; resetPrev(); };
  const flush = () => ({ log: log.splice(0), ev: ev.splice(0), acts: acts.splice(0) });
  const threatOf = e => e.alive && (BK.telling(e) || e.draw > 0 || e.liftT > 0);

  const lib = {
    st, flush,
    // EVERY CREATURE: fought (hurt, death, its own blows), stood in front of with the shield up (its wind-ups, blocks), and taken from (its hits)
    async foes(list, homes, opts) {
      const rows = []; const maxF = opts.maxF || 1500;
      for (const t of list) {
        const lvId = homes[t] || 'wood'; const r = { t, lvl: lvId, reps: [] };
        for (const rep of ['fight', 'stand', 'take']) {
          st.tag = 'foe:' + t + ':' + rep; fresh(lvId, 'knight');
          const before = BK.enemies().length; const mark = log.length;
          try { BK.spawnEnt({ t, x: Math.round(P.x / 16) + 4, y: Math.round(P.y / 16) - 1 }); } catch (e) { r.skipped = 'spawnEnt threw: ' + e.message; break; }
          const e = BK.enemies()[BK.enemies().length - 1];
          if (BK.enemies().length === before || !e) { r.skipped = 'spawnEnt added nothing'; break; }
          r.harmless = !!e.harmless; r.hp0 = e.hp; if (rep === 'fight' && e.hp < 45) e.hp = 45;   /* two blows at least, so a HURT is heard before the death */
          observe(); const spawnSounds = log.slice(mark).map(x => x.n); ev.push({ f: st.frame, t: +(BK.time || 0).toFixed(3), id: idOf(e), who: t, dist: 0, kind: 'spawn', tag: st.tag, sounds: spawnSounds });
          let f = 0, tookHit = 0, swings = 0; const stx = P.x;
          for (; f < maxF && e.alive; f++) {
            if (P.dead) { BK.reset(); P.x = stx; }
            const d = e.x - P.x, ad = Math.abs(d); P.face = Math.sign(d) || P.face; P.st = Math.max(P.st, 40);
            K.left = K.right = K.block = false;
            const threat = threatOf(e) && ad < 90 && Math.abs(e.y - P.y) < 60;
            if (rep === 'fight') { const reach = 22 + e.w / 2; if (threat && P.atk < 0) K.block = true; else if (ad > reach - 2 && ad < 400) K[d > 0 ? 'right' : 'left'] = true; else if (P.atk < 0 && Math.abs(e.y - P.y) < 30 && ad <= reach) { BK.press('atk'); swings++; } }
            else if (rep === 'stand') { if (ad > 34 && ad < 400) K[d > 0 ? 'right' : 'left'] = true; K.block = true; if (f > maxF * 0.6 && f % 40 === 0) { P.hp = P.maxHp; } }
            else { if (ad > 22 && ad < 400) K[d > 0 ? 'right' : 'left'] = true; if (P.hp < 30) { P.hp = P.maxHp; } }
            tick(1);
            if (rep !== 'fight' && f > 300 && f % 60 === 0 && ad > 400) break;
          }
          K.left = K.right = K.block = false;
          r.reps.push({ rep, frames: f, killed: !e.alive, swings, endMode: e.mode });
          await yieldNow();
        }
        rows.push(r);
      }
      st.tag = ''; return { rows, ...flush() };
    },
    // EVERY BOSS AND MINI: the boss lab as it is, with every frame observed
    async bosses(levels, opts) {
      const rows = [];
      BK.sim = n => tick(n); BK.load = (...a) => { const r = load0.apply(BK, a); resetPrev(); return r; };
      try {
        for (const lv of levels) { st.tag = (opts.mini ? 'mini:' : 'boss:') + lv;
          let res = null; try { res = await BK.bossLab({ bosses: [lv], heroes: [opts.hero || 'knight'], maxSecs: opts.maxSecs || 90, mini: !!opts.mini, modes: true }); } catch (e) { rows.push({ lvl: lv, error: e.message }); continue; }
          const row = res.rows[0] || {}; const boss = BK.enemies().find(e => e.t === row.boss);
          if (row.killed && !opts.mini) { st.tag = 'win:' + lv; act('boss dead, waiting for the win'); for (let i = 0; i < 900 && BK.state !== 'win'; i++) tick(1); act('state ' + BK.state); await new Promise(r => setTimeout(r, 1200)); tick(30); }   /* the medal is a real-time setTimeout after the win */
          rows.push({ lvl: lv, ...row });
          await yieldNow(); }
      } finally { BK.sim = sim0; BK.load = load0; }
      st.tag = ''; return { rows, ...flush() };
    },
    // EVERY HERO: each action in turn on flat ground, then a sprig for the blocks, the parries, the hurt and the death
    async heroes(list, opts) {
      const rows = [];
      for (const h of list) { st.tag = 'hero:' + h; fresh('wood', h);
        // the heavy blow and the skills are talents: lend this hero all of its skill nodes (and HEAVY), F on the first, G on the second
        const skills = []; try { const tal = BK.PROG.talents = BK.PROG.talents || {}; const mine = (window.BKT.TREE || []).filter(n => n.hero === h && n.active); tal[h] = Object.assign(tal[h] || {}, { heavy: 1 }, Object.fromEntries(mine.map(n => [n.id, 1]))); skills.push(...mine.map(n => n.id)); if (h !== 'reaper') { BK.PROG.skill = skills[0] || 'none'; BK.PROG.skill2 = skills[1] || 'none'; } else BK.PROG.skill2 = skills[0] || 'none'; } catch (e) { acts.push({ f: st.frame, what: 'talents not lent: ' + e.message, tag: st.tag }); }
        A.setHeroVoice(h);
        const settle = () => { for (let i = 0; i < 90 && (P.atk >= 0 || !P.ground || P.dodge > 0 || P.dash > 0 || P.plunge || P.hurt > 0); i++) tick(1); tick(6); P.st = P.maxSt; P.hp = P.maxHp; };
        const press = (k, n = 1) => { BK.press(k); if (K[k] !== undefined) K[k] = true; tick(n); K[k] = false; };
        const swing = () => { for (let i = 0; i < 12 && P.atk < 0; i++) { BK.press('atk'); tick(1); } };
        act('walk'); K.right = true; tick(50); K.right = false; settle();
        act('jump'); press('jump', 6); tick(50); settle();
        act('blow 1'); swing(); tick(16); act('blow 2'); swing(); tick(16); act('blow 3'); swing(); settle();
        act('heavy (atk held)'); K.atk = true; BK.press('atk'); tick(1); K.atk = true; tick(45); K.atk = false; settle();
        act('dodge'); K.right = true; press('dodge', 3); tick(30); K.right = false; settle();
        act('dash attack'); K.right = true; press('dodge', 2); for (let i = 0; i < 24 && P.dash > 0; i++) tick(1); swing(); tick(30); K.right = false; settle();
        act('plunge'); press('jump', 6); tick(8); K.down = true; swing(); tick(45); K.down = false; settle();
        act('rising cut (up + blow)'); K.up = true; swing(); tick(40); K.up = false; settle();
        act('low sweep (down + blow)'); K.down = true; swing(); tick(30); K.down = false; settle();
        act('block raised'); K.block = true; tick(30); K.block = false; settle();
        act('skill F: ' + (BK.skillNow() || 'none')); press('throw', 2); tick(70); settle();
        act('skill G: ' + (BK.PROG.skill2 || 'none')); press('skill2', 2); tick(70); settle();
        if (h === 'pyro') { act('heat to full (a blow at 96)'); P.heat = 96; swing(); tick(40); settle(); act('jet (block held)'); K.block = true; tick(40); K.block = false; settle(); }
        if (h === 'paladin') { act('light to full (a blow at 96)'); P.light = 96; swing(); tick(40); settle(); act('aegis (block held)'); K.block = true; tick(40); K.block = false; settle(); }
        if (h === 'knight') { act('resolve to full (a blow at 96)'); P.resolve = 96; swing(); tick(40); settle(); }
        if (h === 'reaper') { act('harvest to full, F held'); P.harvest = 100; K.throw = true; BK.press('throw'); tick(40); K.throw = false; settle(); act('ward (block held)'); K.block = true; tick(40); K.block = false; settle(); }
        if (h === 'pirate') { act('pistol (atk held, loaded)'); P.loaded = true; K.atk = true; BK.press('atk'); tick(60); K.atk = false; settle(); }
        // a sprig, for what happens when the blow comes in: the guard held through it, tapped as it lands, not raised, and the last hit
        for (const rep of ['hold', 'tap', 'take', 'die']) { fresh('wood', h); A.setHeroVoice(h); st.tag = 'hero:' + h + ':' + rep;
          BK.spawnEnt({ t: 'sprig', x: Math.round(P.x / 16) + 3, y: Math.round(P.y / 16) - 1 }); const e = BK.enemies()[BK.enemies().length - 1]; if (!e) continue;
          act('sprig ' + rep); let hold = 0, tap = 0, wasTell = false;
          for (let f = 0; f < 700 && e.alive; f++) {
            const d = e.x - P.x, ad = Math.abs(d); P.face = Math.sign(d) || P.face; K.left = K.right = false;
            if (rep !== 'die') P.hp = Math.max(P.hp, rep === 'take' ? 40 : P.maxHp); else if (f === 0) P.hp = 1;
            if (ad > 20 && ad < 300 && !P.dead) K[d > 0 ? 'right' : 'left'] = true;
            const tell = BK.telling(e) && ad < 70;
            if (rep === 'hold') { if (tell) hold = 40; K.block = hold > 0; if (hold) hold--; }
            else if (rep === 'tap') { if (wasTell && !tell) tap = 6; K.block = tap > 0; if (tap) tap--; }
            else K.block = false;
            wasTell = tell;
            tick(1);
            if (rep === 'die' && P.dead) { act('dead'); tick(140); break; }
          }
          K.left = K.right = K.block = false; }
        rows.push({ h, skills }); await yieldNow();
      }
      st.tag = ''; return { rows, ...flush() };
    },
    // EVERY PICKUP: a coin, a run of coins, a heart, a silver, a relic, a key, a stray (quest item), a checkpoint
    async pickups(spots) {
      const rows = [];
      const go = (lvl, name, fn) => { st.tag = 'pick:' + name; fresh(lvl, 'knight'); act(name); const mark = log.length; try { fn(); } catch (e) { rows.push({ name, error: e.message }); return; } rows.push({ name, lvl, sounds: log.slice(mark).map(x => x.n) }); };
      go('wood', 'coin', () => { const a = BK.acorns().find(q => !q.got); if (!a) throw new Error('no coin'); P.x = a.x; P.y = a.y + 7; P.vy = 0; tick(15); });
      go('wood', 'coin run', () => { const as = BK.acorns().filter(q => !q.got).slice(0, 6); for (const a of as) { P.x = a.x; P.y = a.y + 7; P.vy = 0; tick(4); } tick(15); });
      go('wood', 'heart', () => { P.hp = 10; BK.healths().push({ x: P.x, y: P.y - 3, got: false }); tick(10); });
      go('wood', 'silver', () => { const s = BK.silvers().find(q => !q.got); if (!s) throw new Error('no silver'); P.x = s.x; P.y = s.y + 7; P.vy = 0; tick(15); });
      for (const [name, t] of [['relic', 'relic'], ['key', 'key'], ['stray (quest)', 'stray']]) { const sp = spots[t]; if (!sp) { rows.push({ name, error: 'none placed' }); continue; }
        go(sp.lvl, name, () => { const pr = BK.props().find(p => p.t === t && !p.got); if (!pr) throw new Error('no ' + t + ' prop'); P.x = pr.x; P.y = pr.y + (t === 'key' ? 6 : 8); P.vy = 0; tick(15); }); }
      { const sp = spots.check; go(sp ? sp.lvl : 'wood', 'checkpoint', () => { BK.tp(sp.x, sp.y); tick(20); }); }
      st.tag = ''; return { rows, ...flush() };
    },
    // EVERY PROP: stand by it, talk to it, hit it twice, jump on it; and a crate broken
    async props(spots) {
      const rows = [];
      for (const [t, sp] of Object.entries(spots)) { st.tag = 'prop:' + t; fresh(sp.lvl, 'knight'); const mark = log.length, evm = ev.length;
        try {
          if (t === 'CRATE') { BK.tp(sp.x - 1, sp.y); P.face = 1; tick(10); for (let i = 0; i < 4; i++) { P.st = P.maxSt; BK.press('atk'); tick(24); } }
          else { const pr = BK.props().find(p => p.t === t); const x = pr ? pr.x : sp.x * 16 + 8, y = pr ? pr.y : (sp.y + 1) * 16;
            P.x = x - 14; P.y = y; P.vy = 0; P.face = 1; tick(12); act('talk'); BK.press('talk'); tick(20); BK.press('talk'); tick(20);
            act('hit'); for (let i = 0; i < 2; i++) { P.st = P.maxSt; BK.press('atk'); tick(24); }
            act('walk through'); K.right = true; tick(30); K.right = false; P.x = x - 12; P.y = y - 4; P.vy = 0;
            act('jump on'); BK.press('jump'); K.jump = true; tick(6); K.jump = false; K.right = true; tick(30); K.right = false; tick(20); }
        } catch (e) { rows.push({ t, lvl: sp.lvl, error: e.message }); continue; }
        rows.push({ t, lvl: sp.lvl, sounds: [...new Set(log.slice(mark).map(x => x.n))], events: ev.slice(evm).length });
        await yieldNow(); }
      st.tag = ''; return { rows, ...flush() };
    },
    // THE MENUS: real key events into the page, state by state
    async ui() {
      const rows = [];
      const key = (k, code) => { for (const type of ['keydown', 'keyup']) window.dispatchEvent(new KeyboardEvent(type, { key: k, code: code || k, bubbles: true })); tick(3); };
      const run = (name, fn) => { const mark = log.length; try { fn(); } catch (e) { rows.push({ name, error: e.message }); return; } rows.push({ name, state: BK.state, sounds: log.slice(mark).map(x => x.n) }); };
      fresh('wood', 'knight'); st.tag = 'ui';
      run('title: down, up, confirm', () => { BK.state = 'title'; tick(5); key('ArrowDown'); key('ArrowUp'); key('Enter'); tick(10); });
      fresh('wood', 'knight');
      run('play: pause opens the menu', () => { key('Escape'); tick(10); });
      run('menu: down, up', () => { key('ArrowDown'); key('ArrowUp'); });
      run('menu: pause closes it', () => { key('Escape'); tick(10); });
      run('talents (q): open, down, close', () => { key('q'); tick(5); key('ArrowDown'); key('q'); tick(5); if (BK.state !== 'play') BK.state = 'play'; });
      run('map: right, left, confirm', () => { BK.state = 'map'; tick(5); key('ArrowRight'); key('ArrowLeft'); key('Enter'); tick(30); });
      fresh('wood', 'knight');
      run('bestiary: open, down, close', () => { BK.state = 'bestiary'; tick(5); key('ArrowDown'); key('Escape'); tick(5); if (BK.state !== 'play') BK.state = 'play'; });
      run('herocard: confirm', () => { BK.state = 'herocard'; tick(5); key('Enter'); tick(5); if (BK.state !== 'play') BK.state = 'play'; });
      run('sign: talk opens, talk closes', () => { const s = BK.textLab.talkers().find(x => x.kind === 'sign'); if (!s) throw new Error('no sign'); BK.tp(s.x, s.y); tick(5); BK.press('talk'); tick(30); BK.press('talk'); tick(30); BK.press('talk'); tick(10); });
      run('store (shop level): confirm', () => { BK.load(idx('shop')); BK.state = 'play'; tick(10); const n = BK.props().find(p => p.t === 'npc'); if (n) { P.x = n.x - 10; P.y = n.y; tick(5); BK.press('talk'); tick(20); key('Enter'); tick(10); key('ArrowDown'); key('Escape'); tick(10); } else throw new Error('no npc in the shop'); });
      st.tag = ''; return { rows, ...flush() };
    },
    // EVERY LEVEL: what plays on the way in, at each ambush, and (from the boss pass) at the win
    async levels(list, amb) {
      const rows = [];
      for (const lv of list) { st.tag = 'level:' + lv; const mark = log.length;
        BK.setHero('knight'); BK.load(idx(lv)); BK.start(); BK.god = true; resetPrev(); tick(90);   /* BK.start() is startGame(): the banner, the level's own music, the ambience */
        const r = { lvl: lv, music: BK.L.music, onLoad: log.slice(mark).map(x => x.n + (x.a.length ? '(' + x.a.join(',') + ')' : '')), ambushes: [] };
        for (const A2 of (BK.ambushes())) { const m2 = log.length, e2 = ev.length; const x0 = A2.trigger !== undefined ? A2.trigger : A2.wallL + 3;
          BK.tp(x0 + 1, A2.row); tick(240); r.ambushes.push({ x: x0, sounds: [...new Set(log.slice(m2).map(x => x.n))], spawned: ev.slice(e2).filter(x => x.kind === 'spawn').length, st: A2.st }); }
        rows.push(r); await yieldNow(); }
      BK.god = false; st.tag = ''; return { rows, ...flush() };
    },
    // EVERY MUSIC FILE, decoded: length, the loop seam, head and tail silence, level
    async music(tracks) {
      const dbg = A.debugAudio(); const ac = dbg.ac; const rows = [];
      for (const [name, url] of Object.entries(tracks)) {
        try { const ab = await (await fetch(url)).arrayBuffer(); const b = await ac.decodeAudioData(ab.slice(0));
          const n = b.length, sr = b.sampleRate, ch = b.numberOfChannels; let peak = 0, sq = 0; const d = b.getChannelData(0);
          for (let i = 0; i < n; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v; sq += d[i] * d[i]; }
          const th = 0.001; let head = 0; while (head < n && Math.abs(d[head]) < th) head++; let tail = 0; while (tail < n && Math.abs(d[n - 1 - tail]) < th) tail++;
          const w = Math.round(sr * 0.03); const rms = (a, bb) => { let s = 0; for (let i = a; i < bb; i++) s += d[i] * d[i]; return Math.sqrt(s / Math.max(1, bb - a)); };
          rows.push({ name, url, secs: +b.duration.toFixed(2), sr, ch, bytes: ab.byteLength, peak: +peak.toFixed(3), rms: +Math.sqrt(sq / n).toFixed(4), headMs: Math.round(head / sr * 1000), tailMs: Math.round(tail / sr * 1000), seamJump: +Math.abs(d[n - 1] - d[0]).toFixed(3), endRms: +rms(n - w, n).toFixed(4), startRms: +rms(0, w).toFixed(4) }); }
        catch (e) { rows.push({ name, url, error: e.message }); }
      }
      return { rows };
    },
    // EVERY VOICE, rendered offline through a patched copy of src/audio.js and measured
    async voices(items) {
      const src = (await (await fetch('/src/audio.js')).text()).replace(/\r\n/g, '\n');
      const patches = [
        ['ac = new (window.AudioContext || window.webkitAudioContext)();', 'ac = window.__auditCtx || new (window.AudioContext || window.webkitAudioContext)();'],
        ['const clips = {}; // name -> [AudioBuffer]', 'const clips = window.__auditClips = window.__auditClips || {};'],
        ["  startSynth();\n  loadTrack(wantTrack);\n  fetch('./audio/manifest.json')", "  if (!window.__auditCtx) { startSynth(); loadTrack(wantTrack); }\n  (window.__auditClipsReady ? Promise.reject(0) : fetch('./audio/manifest.json'))"]];
      let p = src; for (const [a, b] of patches) { if (p.split(a).length !== 2) return { error: 'audio.js no longer has the line the voice render patches: ' + a.slice(0, 60) }; p = p.replace(a, b); }
      const mod = () => import(URL.createObjectURL(new Blob([p], { type: 'text/javascript' })));
      const sr = 48000;
      window.__auditCtx = new OfflineAudioContext(1, sr, sr); const M0 = await mod(); M0.initAudio();
      const manifest = await (await fetch('/audio/manifest.json')).json(); const total = Object.values(manifest).reduce((s, a) => s + a.length, 0);
      const count = () => Object.values(M0.clipCount()).reduce((s, n) => s + n, 0);
      for (let i = 0, last = -1, same = 0; i < 300; i++) { await new Promise(r => setTimeout(r, 100)); const c = count(); if (c >= total) break; if (c === last) { if (++same > 30) break; } else { same = 0; last = c; } }
      window.__auditClipsReady = true; const loaded = count();
      const rows = [];
      for (const it of items) { const peaks = [], rmss = [], durs = []; let err = null;
        for (let rep = 0; rep < 1; rep++) {   /* one render a voice: the synth has no randomness worth a second, and a thousand renders was the cost */
          try { const ctx = new OfflineAudioContext(1, Math.round(sr * 2.6), sr); window.__auditCtx = ctx; const M = await mod(); M.initAudio(); M.music.stop(); if (it.hero) M.setHeroVoice(it.hero);
            if (it.n.startsWith('hurtOf:') || it.n.startsWith('dieOf:')) { const [k, t] = it.n.split(':'); const f = M.SFX[k](t); if (!f) { err = 'no voice: ' + it.n; break; } f(); }
            else M.SFX[it.n](...(it.args || []));
            /* A RENDER THAT NEVER RETURNS is written down and skipped, not waited for */
            const b = await Promise.race([ctx.startRendering(), new Promise((_, rej) => setTimeout(() => rej(new Error('render timed out (8 s)')), 8000))]);
            window.__voicesDone = (window.__voicesDone || 0) + 1; const d = b.getChannelData(0); let peak = 0, first = -1, lastI = -1; const th = 0.003;
            for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v; if (v > th) { if (first < 0) first = i; lastI = i; } }
            let sq = 0; if (first >= 0) for (let i = first; i <= lastI; i++) sq += d[i] * d[i];
            peaks.push(peak); rmss.push(first >= 0 ? Math.sqrt(sq / (lastI - first + 1)) : 0); durs.push(first >= 0 ? (lastI - first) / sr : 0); }
          catch (e) { err = e.message; break; } }
        const db = v => v > 0 ? +(20 * Math.log10(v)).toFixed(1) : -120;
        rows.push({ n: it.n, hero: it.hero || '', args: it.args || [], peakDb: peaks.length ? db(Math.max(...peaks)) : null, rmsDb: rmss.length ? db(rmss.reduce((s, x) => s + x, 0) / rmss.length) : null, ms: durs.length ? Math.round(Math.max(...durs) * 1000) : null, error: err }); }
      window.__auditCtx = null;
      return { rows, clips: loaded, clipsTotal: total };
    },
  };
  window.__aud = lib; return { sfx: Object.keys(A.SFX).filter(k => typeof A.SFX[k] === 'function'), music: A.MUSIC_NAMES, ambient: A.AMBIENT_NAMES, cast: Object.keys(A.castTable()) };
}

// ---------- run ----------
const out = { when: new Date().toISOString(), fast: FAST, passes: {}, static: { staticWindups, WU: Object.fromEntries(Object.entries(WU).map(([k, v]) => [k, [...v]])), wuGeneric, TRACKS, TRACK_GAIN, MUSIC_NAMES, levelInfo, homeOf, bossOf, miniOf } };
const pg = await openPage({ port: PORT });
const t0 = Date.now(); const say = s => console.log('[' + Math.round((Date.now() - t0) / 1000) + 's] ' + s);
try {
  const info = await pg.evalp('(' + pageLib.toString() + ')({})');
  out.page = info;
  /* EVERY PASS IS KEPT: the JSON is written before each pass starts, so a pass that hangs never costs the ones already finished */
  const ex = async (expr) => { try { const d = process.env.SCRATCH || join(ROOT, 'audits', 'audio'); mkdirSync(d, { recursive: true }); writeFileSync(join(d, 'audio-audit.json'), JSON.stringify(out)); } catch {} return await pg.evalp(expr); };
  if (want('foes')) { say('foes: ' + foeList.length + ' creatures'); out.passes.foes = await ex('__aud.foes(' + JSON.stringify(foeList) + ', ' + JSON.stringify(homeOf) + ', ' + JSON.stringify({ maxF: FAST ? 500 : 1500 }) + ')'); say('foes done: ' + out.passes.foes.rows.length + ' rows, ' + out.passes.foes.log.length + ' sounds'); }
  if (want('bosses')) { const list = only.bosses || levelInfo.filter(l => l.boss).map(l => l.id); say('bosses: ' + list.join(' ')); out.passes.bosses = await ex('__aud.bosses(' + JSON.stringify(list) + ', ' + JSON.stringify({ maxSecs: FAST ? 30 : 100 }) + ')'); say('bosses done: ' + out.passes.bosses.log.length + ' sounds'); }
  if (want('minis')) { const list = only.minis || levelInfo.filter(l => l.mini).map(l => l.id); say('minis: ' + list.join(' ')); out.passes.minis = await ex('__aud.bosses(' + JSON.stringify(list) + ', ' + JSON.stringify({ maxSecs: FAST ? 30 : 80, mini: true }) + ')'); say('minis done'); }
  if (want('heroes')) { const list = only.heroes || ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper']; say('heroes'); out.passes.heroes = await ex('__aud.heroes(' + JSON.stringify(list) + ', {})'); say('heroes done: ' + out.passes.heroes.log.length + ' sounds'); }
  if (want('pickups')) { say('pickups'); out.passes.pickups = await ex('__aud.pickups(' + JSON.stringify({ relic: propHome.relic, key: propHome.key, stray: propHome.stray, check: propHome.check }) + ')'); say('pickups done'); }
  if (want('props')) { const kinds = ['CRATE', 'barrel', 'keg', 'puffball', 'door', 'doorway', 'gate', 'lockgate', 'lever', 'crank', 'winch', 'bell', 'seabell', 'tidebell', 'knell', 'cage', 'cargo', 'rack', 'torch', 'brazier', 'well', 'sluice', 'throne', 'window', 'bridge', 'cart', 'plank', 'cannon', 'catapult', 'capstan', 'pump', 'davit', 'minerlamp', 'timber', 'firepit', 'chainpost', 'dropcage', 'plate', 'weight', 'mirror', 'anvil', 'hammer', 'boiler', 'rockfall', 'deadfall', 'nest', 'vent', 'glowbud', 'croppole', 'thresher', 'treehouse', 'towertop'];
    const spots = {}; for (const k of kinds) if (propHome[k]) spots[k] = propHome[k]; if (only.props) for (const k of Object.keys(spots)) if (!only.props.includes(k)) delete spots[k];
    say('props: ' + Object.keys(spots).length); out.passes.props = await ex('__aud.props(' + JSON.stringify(spots) + ')'); say('props done'); }
  if (want('ui')) { say('ui'); out.passes.ui = await ex('__aud.ui()'); say('ui done'); }
  if (want('levels')) { const list = only.levels || levelInfo.map(l => l.id); say('levels'); out.passes.levels = await ex('__aud.levels(' + JSON.stringify(list) + ')'); say('levels done'); }
  if (want('music')) { say('music: ' + Object.keys(TRACKS).length + ' files'); out.passes.music = await ex('__aud.music(' + JSON.stringify(Object.fromEntries(Object.entries(TRACKS).map(([k, v]) => [k, v.replace(/^\.\//, '/')]))) + ')'); say('music done'); }
  if (want('voices')) {
    const items = [];
    const ARGS = { pLand: [['grass'], ['wood'], ['stone'], ['water']], pStep: [['grass'], ['stone']], land: [['grass'], ['wood'], ['stone'], ['water'], ['snow']], step: [['grass'], ['wood'], ['stone'], ['iron']], impact: [['steel'], ['wood'], ['flesh'], ['bone'], ['stone'], ['crystal'], ['steel', true]], swingUp: [[1], [3]], coinUp: [[0], [12]], rattle: [[1]], tell: [[false], [true]], jet: [[true]], dkWardHit: [[0.5]], dkNova: [[0.6]], foeNotice: [['sprig'], ['hound'], ['swornsword']], foeJeer: [['sprig']], foeMutter: [['sprig']], foeGasp: [['sprig']], foeStep: [[false], [true]], foeRelease: [['sprig', 'flesh', false], ['brute', 'steel', true]] };
    const heroP = ['pJump', 'pLand', 'pStep', 'pSlash', 'pHurt', 'pDie', 'pDodge', 'pPogo', 'pEffort'];
    for (const n of info.sfx) { if (n === 'hurtOf' || n === 'dieOf') continue;
      if (heroP.includes(n)) { for (const h of ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper']) for (const a of (ARGS[n] || [[]])) items.push({ n, args: a, hero: h }); continue; }
      for (const a of (ARGS[n] || [[]])) items.push({ n, args: a }); }
    for (const t of foeTypes) { items.push({ n: 'hurtOf:' + t }); items.push({ n: 'dieOf:' + t }); }
    if (only.voices) { const keep = new Set(only.voices); for (let i = items.length - 1; i >= 0; i--) if (!keep.has(items[i].n)) items.splice(i, 1); }
    say('voices: ' + items.length + ' renders x2'); out.passes.voices = await ex('__aud.voices(' + JSON.stringify(items) + ')'); say('voices done: ' + (out.passes.voices.rows || []).length); }
} catch (e) { console.log('AUDIT FAILED: ' + e.message); out.error = e.message; }
out.pageErrors = pg.errors.slice(0, 20);
pg.close();

const OUTDIR = process.env.SCRATCH || join(ROOT, 'audits', 'audio');   /* the raw log is large: keep it out of git (SCRATCH=<dir>) */
mkdirSync(OUTDIR, { recursive: true });
const jsonPath = join(OUTDIR, 'audio-audit.json');
writeFileSync(jsonPath, JSON.stringify(out));
say('wrote ' + jsonPath + (out.pageErrors.length ? ' (page errors: ' + out.pageErrors.length + ')' : ''));
const report = typeof buildReport === 'function' ? buildReport : () => '# (report not built yet)\n';
const md = report(out);
writeFileSync(join(OUTDIR, 'audio-summary.md'), md);   /* audits/audio-audit.md is the written report, built from the JSON: never overwritten by a run */
say('wrote audits/audio-audit.md');
process.exit(out.error ? 1 : 0);
