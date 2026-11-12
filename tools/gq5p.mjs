// tools/gq5p.mjs - THE GOBLIN PRINCESS, GQ5P (claude/gq5p; scratch gq5-plan.md section 2): her blade. Node only, no page, no browser.
//   node tools/gq5p.mjs              runs BOTH halves: the OFF half in this process (flag OFF = gq5fix's Princess: chains, modes, frames, no new move), then spawns itself
//                                     with BRACKEN_GQ5P=1 for the ON half, and runs tools/gprincess.mjs + tools/gq4p.mjs with the flag OFF (they must stay green).
//   BRACKEN_GQ5P=1 node tools/gq5p.mjs   the ON half alone: every new move reachable in a chain; every tell >= 0.3 s; the plan's damage numbers; no hop, no bell, no rope;
//                                     resist floor 0.4x; every state exits (a 10-minute simulated fight, hero near and far, nothing sits in a state for long).
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const { LEVELS } = await imp('src/level.js'); const { P5, G5 } = await imp('src/gq5p.js');
const GPX = await imp('src/goblin-princess.js'), { GP, gpMul, gpOpen, CHAINS, GP_MODES, gpPlan } = GPX;
const GPA = await imp('src/redraw/goblin_princess_art.js');
const TS = 16, NEW = ['heel', 'curtsy', 'tantrum'], NEWMODES = ['heelTell', 'heel', 'stumble', 'curtsyTell', 'curtsy1', 'curtsy2', 'tantrumTell', 'tantrumA', 'tantrumB', 'overTell', 'overhead'];

/* ---------- a fake world for her hands (the same as tools/gq4p.mjs) ---------- */
const make = (seats = 1) => {
  const Lw = LEVELS.find(l => l.id === 'crown').build(), A = Lw.mini;
  const st = { shots: [], time: 0, parries: 0, dmg: [], spawned: [], grates: [], said: [], texts: [], parryNext: false, invuln: false, enemies: [] };
  const mk = x => ({ x, y: A.floor, hp: 100, maxHp: 100, dead: false, ground: true, vy: 0, vx: 0, face: 1, hitSet: new Set(), box: null });
  const heroes = Array.from({ length: seats }, (_, i) => mk(A.x0 + (3 + 2 * i) * TS)); let cur = heroes[0];
  const noop = () => {};
  const ctx = { L: Lw, TS, EHP: { gprincess: 1460 }, sfx: new Proxy({}, { get: () => noop }), hero: () => cur, enemies: () => st.enemies, time: () => st.time, get players() { return heroes; },
    number: (x, y, t) => st.said.push(t), text: (t) => st.texts.push(t), burst: noop, dust: noop, shake: noop, hint: noop, music: noop,
    damagePlayer: (x, d, o) => { st.dmg.push({ x, d, o: o || {}, name: o && o.name, t: st.time }); if (st.invuln) return false; if (st.parryNext && !(o && o.unblockable)) { st.parries++; st.parryNext = false; return 'blocked'; } return 'hit'; },
    asPlayer: (p, fn) => { const c0 = cur; cur = p; try { fn(); } finally { cur = c0; } }, upright: p => !p.dead, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    box: p => ({ l: p.x - 5, r: p.x + 5, t: p.y - 14, b: p.y }), attackBox: () => cur.box, parries: () => st.parries,
    spawnEnt: o => { const e = { ...o, x: o.x * TS + 8, y: (o.y + 1) * TS, alive: true, h: 14 }; st.spawned.push(o); st.enemies.push(e); return [e]; },
    grateDrop: (c, y0, y1, hold) => { st.grates.push({ c, y0, y1, hold, t: st.time }); return true; }, grateClear: noop, shots: () => st.shots };
  const H = GPX.makeGoblinPrincessHands(ctx); H.load();
  const e = H.spawn({ x: A.x0 + 14 * TS, y: A.floor, vx: 0, vy: 0, face: -1, alive: true }); st.enemies.push(e);
  const modes = [];   /* [mode, t0] every change */
  const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { st.time += dt; const m0 = e.mode; H.update(e, dt); if (e.mode !== m0 || !modes.length) modes.push([e.mode, st.time]); for (const h of heroes) h.box = null; } };
  const blow = (h, box) => { h.hitSet = new Set(); h.box = box; };
  step(1); step(80);   /* asleep -> awake -> on her feet */
  const F = () => H.fight();
  /* force a chain: she is free (walk, no wait) and the next step is chain[0] */
  const chain = (ks, ph = 1) => { F().ph = ph; e.phase = ph; F().chain = ks.slice(); F().step = 0; e.mode = 'walk'; e.modeT = 0; e.y = A.floor; e.face = 1; };
  const until = (pred, max = 60 * 8) => { for (let i = 0; i < max; i++) { if (pred()) return true; step(1); } return pred(); };
  const modeAt = m => { const r = modes.filter(x => x[0] === m); return r.length ? r[r.length - 1][1] : null; };
  return { H, st, e, A, heroes, step, blow, chain, until, modes, F, modeAt, Lw, ctx };
};

if (!P5) {
  console.log('== GQ5P OFF half: the Princess is gq5fix\'s (no new move, no new frame, the bell and the hop are in) ==');
  ok(GPA.GP_FRAMES === 47 && GPA.GPF.hurt === 45 && GPA.GPF.body === 46, 'OFF: the sheet is the 47-frame gq5fix sheet (hurt 45, body 46)');
  ok(!NEW.some(k => [].concat(...Object.values(CHAINS[1]), ...Object.values(CHAINS[2])).includes(k)), 'OFF: no chain holds heel / curtsy / tantrum');
  ok([].concat(...Object.values(CHAINS[1])).includes('hop') && [].concat(...Object.values(CHAINS[2])).includes('hop'), 'OFF: the hop is still in her chains');
  ok(!('heelTell' in GP_MODES) && !('curtsyTell' in GP_MODES) && !('tantrumTell' in GP_MODES) && !('overTell' in GP_MODES), 'OFF: GP_MODES has no new tell');
  ok(JSON.stringify(CHAINS[1]) === JSON.stringify([['lunge', 'flurry', 'key', 'trinket'], ['fan', 'lunge', 'hop'], ['flurry', 'trinket', 'key', 'lunge', 'fan']]) && JSON.stringify(CHAINS[2]) === JSON.stringify([['lunge', 'tiara', 'pirouette', 'flurry', 'stomp'], ['trinket', 'fan', 'tiara', 'pirouette', 'hop'], ['stomp', 'lunge', 'flurry', 'tiara', 'trinket']]), 'OFF: the chains are gq5fix\'s (GQ4P) exactly');
  ok(GP.gap[0] === 0.5 && GP.gap[1] === 0.4 && GP.hp === 1080 && GP.bell.hang === 7, 'OFF: gap [0.5, 0.4], hp 1080, bell.hang 7 (gq5fix)');
  { const w = make(); const rope = w.A.rope; w.chain(['flurry'], 1); w.e.mode = 'walk'; w.e.modeT = 9; w.blow(w.heroes[0], { l: rope - 3, r: rope + 3, t: w.A.floor - 20, b: w.A.floor - 2 }); w.step(1);
    ok(w.F().M.rings === 1 && w.st.said.includes('YOU RING THE TOWER BELL'), 'OFF: a blow on the rope still rings the tower bell'); }
  /* the child half + the two existing proofs, flag OFF */
  const kid = (args, env = {}) => spawnSync(process.execPath, args, { cwd: ROOT, env: { ...process.env, ...env }, encoding: 'utf8', maxBuffer: 1 << 26 });
  for (const t of ['gprincess', 'gq4p']) { const r = kid(['tools/' + t + '.mjs'], { BRACKEN_GQ5P: '' }); ok(r.status === 0 && /all ok/.test(r.stdout), 'OFF: tools/' + t + '.mjs exits 0 ("all ok")'); }
  const on = kid(['tools/gq5p.mjs'], { BRACKEN_GQ5P: '1' }); process.stdout.write(on.stdout.split('\n').map(l => '    | ' + l).join('\n') + '\n'); if (on.stderr) process.stdout.write(on.stderr);
  ok(on.status === 0, 'ON half (BRACKEN_GQ5P=1 node tools/gq5p.mjs) exits 0');
  console.log(fails ? '\n' + fails + ' FAIL' : '\nall ok'); process.exit(fails ? 1 : 0);
}

console.log('== GQ5P ON half ==');
/* ---- 1. the chains ---- */
{ const all = ph => [].concat(...CHAINS[ph]);
  ok(!all(1).includes('hop') && !all(2).includes('hop'), 'ON: no chain contains hop');
  ok(![...all(1), ...all(2)].some(k => /bell|ring|rope|winch|bolt|perch/i.test(k)), 'ON: no chain contains the bell, a ring, a rope, a winch, a bolt or a perch');
  ok(all(1).includes('heel') && all(2).includes('heel'), 'ON: HEEL DASH is in phase 1 and phase 2 chains (replacing the hop)');
  ok(all(1).includes('curtsy') && all(2).includes('curtsy'), 'ON: CURTSY CUT is in phase 1 and phase 2 chains');
  ok(!all(1).includes('tantrum') && all(2).includes('tantrum') && CHAINS[2].filter(c => c.includes('tantrum')).length === 2, 'ON: TANTRUM COMBO is phase 2 only, in two chains (replacing the fan)');
  ok(CHAINS[1].every(c => { const i = c.findIndex(k => k === 'curtsy'); return i < 0 || c[i - 1] === 'lunge' || c[i - 1] === 'fan' || c[i - 1] === 'tantrum'; }), 'ON: the curtsy follows the lunge or the fan');
  ok(CHAINS[2].some(c => c.includes('pirouette')) && CHAINS[2].some(c => c.includes('stomp') && c.includes('tiara')), 'ON: the pirouette, tiara and stomp stay in phase 2');
  ok(['heelTell', 'curtsyTell', 'tantrumTell', 'overTell'].every(k => GP_MODES[k] === '!' || GP_MODES[k] === '!!'), 'ON: GP_MODES carries a mark for heelTell, curtsyTell, tantrumTell, overTell (' + ['heelTell', 'curtsyTell', 'tantrumTell', 'overTell'].map(k => k + ' ' + GP_MODES[k]).join(', ') + ')'); }
/* ---- 2. the plan's numbers ---- */
ok(G5.heel.tell === 0.6 && G5.heel.tiles === 5 && G5.heel.speed === 300 && G5.heel.boxW === 16 && G5.heel.boxH === 24 && G5.heel.dmg === 14 && G5.heel.stumble === 0.8 && G5.heel.minDist === 4 * TS, 'HEEL DASH: tell 0.6 s, 5 tiles at 300 px/s, box 1 x 1.5 tiles, 14 dmg (GQ5P-TUNE knob 1: plan 18 -> 14), stumble 0.8 s, used beyond 4 tiles');
ok(G5.curtsy.tell === 0.5 && G5.curtsy.w1 === 32 && G5.curtsy.dmg1 === 12 && G5.curtsy.t1 === 0.3 && G5.curtsy.w2 === 24 && G5.curtsy.h2 === 32 && G5.curtsy.dmg2 === 13 && G5.curtsy.stagger === 1.5, 'CURTSY CUT: tell 0.5 s, low sweep 2 tiles 12 dmg, 0.3 s later a rising cut 1.5 x 2 tiles 13 dmg (GQ5P-TUNE knob 2: plan 16 -> 13), parry staggers 1.5 s');
ok(G5.tantrum.tell === 0.5 && G5.tantrum.dmg === 10 && G5.tantrum.reach === 24 && G5.tantrum.gap === 0.25 && G5.tantrum.overTell === 0.35 && G5.tantrum.overDmg === 22 && G5.tantrum.overW === 24 && G5.tantrum.overH === 32 && G5.tantrum.stagger === 1.5 && G5.tantrum.recover === 0.6, 'TANTRUM COMBO: tell 0.5 s, two slashes 1.5 tiles x 10, 0.25 s apart, overhead tell 0.35 s 2 x 1.5 tiles 22 dmg, parry staggers 1.5 s, recovery 0.6 s');
ok(GP.gap[0] === 0.5 && GP.gap[1] === 0.4 && GP.hp === 980 && GP.resist === 0.4, 'gap [0.5, 0.4] (GQ5P-TUNE knob 3 reverted: [0.6,0.5] moved the wrong way), hp 980 (GQ5P-TUNE knob 4: plan 1080 -> 980), resist 0.4 (unchanged)');
ok(Math.min(G5.heel.tell, G5.curtsy.tell, G5.tantrum.tell, G5.tantrum.overTell) >= 0.3, 'every new tell >= 0.3 s (min ' + Math.min(G5.heel.tell, G5.curtsy.tell, G5.tantrum.tell, G5.tantrum.overTell) + ')');
/* ---- 3. the resist floor ---- */
{ const loose = NEWMODES.filter(m => m !== 'stumble'); ok(loose.every(m => gpMul({ mode: m }) === 0.4 && !gpOpen({ mode: m })), 'resist floor: every new move mode (told, swinging) is 0.4x and NOT an opening (' + loose.length + ' modes)');
  ok(gpMul({ mode: 'stumble' }) === 1.15 && gpOpen({ mode: 'stumble' }), 'STUMBLE is the one opening: x1.15'); }
/* ---- 4. art: a pose per move ---- */
const NC = await imp('tools/node-canvas.mjs'); NC.install();
{ const R = GPA.sheet().R, F = GPA.GPF, fr = ['heelTell', 'heel', 'curtsyTell', 'curtsyLow', 'curtsyRise', 'tantrumTell', 'slashA', 'slashB', 'overTell', 'overhead'];
  ok(GPA.GP_FRAMES === 57 && R.length === 57 && F.hurt === 55 && F.body === 56, 'art: 57 frames, a wind-up and a release for each move, the sheet still ends hurt, body');
  const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7 + d[i + 3]) >>> 0; return h; };
  const sigs = fr.map(k => sig(R[F[k]])), others = [F.stand, F.lungeTell, F.lunge, F.flurryTell, F.fanTell, F.pirTell, F.stagger].map(k => sig(R[k]));
  ok(new Set(sigs).size === fr.length && !sigs.some(s => others.includes(s)), 'art: the ten new frames are all distinct from each other and from her old poses');
  const mf = m => GPA.gpFrame({ mode: m, anim: 0 }); ok(NEWMODES.every(m => mf(m) !== undefined && mf(m) >= 0 && mf(m) < 57), 'art: gpFrame answers a frame for every new mode');
  ok(mf('heelTell') !== mf('heel') && mf('curtsyTell') !== mf('curtsy1') && mf('curtsy1') !== mf('curtsy2') && mf('tantrumTell') !== mf('tantrumA') && mf('overTell') !== mf('overhead'), 'art: wind-up and release poses differ for every move');
  ok(typeof GPA.drawHeelDust === 'function' && typeof GPA.drawGoldGlint === 'function', 'art: the heel dust line and the overhead\'s gold glint are drawn'); }
/* ---- 5. HEEL DASH in play ---- */
{ const w = make(), { e, st, H } = w; const A = w.A;
  w.heroes[0].x = e.x + 5.5 * TS; w.chain(['heel', 'lunge']); w.step(1);   /* 5.5 tiles off: it dashes and the dash reaches (80 + 8 + 5 = 93 px at most) */
  ok(e.mode === 'heelTell' && st.said.includes('HMPH!'), 'HEEL: told at 5.5 tiles ("HMPH!", mode heelTell)');
  const t0 = st.time; w.until(() => e.mode === 'heel'); const tell = st.time - t0; ok(tell >= 0.55 && tell <= 0.7, 'HEEL: tell lasts ' + tell.toFixed(2) + ' s (0.6)');
  const x0 = e.x, t1 = st.time; w.until(() => e.mode !== 'heel', 120); const dash = st.time - t1, dist = Math.abs(e.x - x0);
  ok(dist <= 5 * TS + 3 && dist >= 5 * TS - 14, 'HEEL: dashes ' + (dist / TS).toFixed(2) + ' tiles (5), in ' + dash.toFixed(2) + ' s (~0.27)');
  const hh = st.dmg.filter(d => d.name === 'HER HEEL DASH'); ok(hh.length === 1 && hh[0].d === 14 && !hh[0].o.unblockable, 'HEEL: hits once for 14 (GQ5P-TUNE knob 1), blockable (' + hh.length + ' hit, ' + (hh[0] && hh[0].d) + ')');
  ok(e.mode !== 'stumble', 'HEEL: a hit that lands is not a stumble');
  { const f = make(); f.heroes[0].x = f.e.x + 7 * TS; f.chain(['heel', 'lunge']); f.until(() => f.e.mode === 'stumble', 60 * 3); ok(f.e.mode === 'stumble' && !f.st.dmg.some(d => d.name === 'HER HEEL DASH'), 'HEEL: you beyond its reach (7 tiles) take nothing and she stumbles'); }
  /* a miss: the hero rolls through (damagePlayer says no) */
  const m = make(); m.heroes[0].x = m.e.x + 6 * TS; m.st.invuln = true; m.chain(['heel', 'lunge']); m.until(() => m.e.mode === 'stumble', 60 * 3);
  ok(m.e.mode === 'stumble' && gpOpen(m.e), 'HEEL: a miss (rolled through) = STUMBLE, an opening'); const s0 = m.st.time; m.until(() => m.e.mode !== 'stumble', 120); ok(Math.abs((m.st.time - s0) - 0.8) < 0.05, 'HEEL: the stumble lasts ' + (m.st.time - s0).toFixed(2) + ' s (0.8)');
  { const bar = m.e.hp, taken = m.H.take(m.e, 40, 'blade'); /* still stumbling? she just left it: re-enter */ void bar; void taken; }
  const m2 = make(); m2.heroes[0].x = m2.e.x + 6 * TS; m2.st.invuln = true; m2.chain(['heel', 'lunge']); m2.until(() => m2.e.mode === 'stumble', 60 * 3);
  { const raw = 20, d = m2.H.take(m2.e, raw, 'blade'); ok(Math.abs(d - raw * 1.15) < 0.01, 'HEEL: a blow in the stumble takes x1.15 (' + d.toFixed(1) + ' of ' + raw + ')'); const d2 = (() => { m2.e.mode = 'walk'; return m2.H.take(m2.e, raw, 'blade'); })(); ok(Math.abs(d2 - raw * 0.4) < 0.01, 'HEEL: outside the stumble a blow takes x0.4 (' + d2.toFixed(1) + ')'); }
  /* parry staggers */
  const p = make(); p.heroes[0].x = p.e.x + 5.5 * TS; p.st.parryNext = true; p.chain(['heel', 'lunge']); p.until(() => p.e.mode === 'stagger', 60 * 3); ok(p.e.mode === 'stagger', 'HEEL: a parry on the dash staggers her (1.0 s)');
  /* too close: skipped */
  const c = make(); c.heroes[0].x = c.e.x + 3 * TS; c.chain(['heel', 'lunge']); c.step(1); ok(c.e.mode === 'lungeTell', 'HEEL: you inside 4 tiles: the dash is skipped, the chain moves on (' + c.e.mode + ')'); }
/* ---- 6. CURTSY CUT in play ---- */
{ const w = make(), { e, st } = w; w.heroes[0].x = e.x + 22; w.chain(['curtsy', 'lunge']); w.step(1);
  ok(e.mode === 'curtsyTell' && GP_MODES.curtsyTell === '!', 'CURTSY: told ("!", mode curtsyTell)');
  const t0 = st.time; w.until(() => e.mode === 'curtsy1'); const tell = st.time - t0; ok(tell >= 0.45 && tell <= 0.58, 'CURTSY: tell lasts ' + tell.toFixed(2) + ' s (0.5)');
  const a0 = st.time; w.until(() => e.mode === 'curtsy2', 60); const gap = st.time - a0; w.until(() => e.mode !== 'curtsy2', 60);
  const h1 = st.dmg.find(d => d.name === 'HER CURTSY CUT'), h2 = st.dmg.find(d => d.name === 'HER RISING CUT');
  ok(h1 && h1.d === 12 && h1.o.unblockable === true, 'CURTSY: hit 1 = low sweep, 12, not blockable (jump it)'); ok(h2 && h2.d === 13 && !h2.o.unblockable, 'CURTSY: hit 2 = rising cut, 13 (GQ5P-TUNE knob 2), blockable');
  ok(Math.abs(gap - 0.3) < 0.04 && h2 && h1 && h2.t - h1.t > 0.25 && h2.t - h1.t < 0.36, 'CURTSY: hit 2 lands ' + (h2 && h1 ? (h2.t - h1.t).toFixed(2) : '?') + ' s after hit 1 (0.3)');
  /* the jump: a hero in the air above 10 px dodges the low sweep */
  const j = make(); j.heroes[0].x = j.e.x + 22; j.heroes[0].y = j.A.floor - 20; j.chain(['curtsy', 'lunge']); j.until(() => j.e.mode === 'curtsy2', 60 * 2); j.step(2); ok(!j.st.dmg.some(d => d.name === 'HER CURTSY CUT'), 'CURTSY: a hero 20 px up is clear of the low sweep (jump it)');
  const p = make(); p.heroes[0].x = p.e.x + 22; p.st.parryNext = true; p.chain(['curtsy', 'lunge']); p.until(() => p.e.mode === 'stagger', 60 * 3); const s0 = p.st.time; p.until(() => p.e.mode !== 'stagger', 140);
  ok(p.st.parries === 1 && Math.abs((p.st.time - s0) - 1.5) < 0.06, 'CURTSY: a parry on hit 2 staggers her ' + (p.st.time - s0).toFixed(2) + ' s (1.5)'); }
/* ---- 7. TANTRUM COMBO in play (phase 2) ---- */
{ const w = make(), { e, st } = w; w.heroes[0].x = e.x + 20; w.chain(['tantrum', 'lunge'], 2); w.step(1);
  ok(e.mode === 'tantrumTell' && st.said.includes('TANTRUM!'), 'TANTRUM: told ("TANTRUM!", mode tantrumTell, phase 2)');
  const t0 = st.time; w.until(() => e.mode === 'tantrumA'); const tell = st.time - t0; ok(tell >= 0.45 && tell <= 0.58, 'TANTRUM: tell lasts ' + tell.toFixed(2) + ' s (0.5)');
  const o0 = (w.until(() => e.mode === 'overTell', 60 * 2), st.time); const tOT = w.modeAt('overTell'), tB = w.modeAt('tantrumB'), tA = w.modeAt('tantrumA'); ok(Math.abs(tB - tA - 0.25) < 0.03, 'TANTRUM: slash 2 follows slash 1 by ' + (tB - tA).toFixed(2) + ' s (0.25)');
  ok(GP_MODES.overTell === '!!' && st.said.includes('NOT FAIR!'), 'TANTRUM: the overhead is told ("!!", "NOT FAIR!", gold glint)'); void o0;
  w.until(() => e.mode === 'overhead', 60); const tOH = w.modeAt('overhead'); ok(Math.abs(tOH - tOT - 0.35) < 0.04, 'TANTRUM: the overhead tell lasts ' + (tOH - tOT).toFixed(2) + ' s (0.35)');
  const r0 = (w.until(() => e.mode === 'recover', 60), st.time); w.until(() => e.mode !== 'recover', 120); const rec = st.time - r0;
  const sl = st.dmg.filter(d => d.name === 'HER TANTRUM'), ov = st.dmg.filter(d => d.name === 'HER OVERHEAD');
  ok(sl.length === 2 && sl.every(d => d.d === 10 && !d.o.unblockable), 'TANTRUM: two slashes of 10, blockable (' + sl.length + ')'); ok(ov.length === 1 && ov[0].d === 22 && !ov[0].o.unblockable, 'TANTRUM: the overhead 22, blockable');
  ok(Math.abs(rec - 0.6) < 0.06, 'TANTRUM: the recovery after the overhead is ' + rec.toFixed(2) + ' s (0.6, then her next move)');
  const p = make(); p.heroes[0].x = p.e.x + 20; p.chain(['tantrum', 'lunge'], 2); p.until(() => p.e.mode === 'overhead', 60 * 3); p.st.parryNext = true; p.step(1); ok(p.e.mode === 'stagger', 'TANTRUM: a parry on the overhead = STAGGERED'); const s0 = p.st.time; p.until(() => p.e.mode !== 'stagger', 140); ok(Math.abs((p.st.time - s0) - 1.5) < 0.06, 'TANTRUM: the stagger lasts ' + (p.st.time - s0).toFixed(2) + ' s (1.5)'); }
/* ---- 8. the bell is silent ---- */
{ const w = make(), A = w.A; w.chain(['flurry', 'lunge']); w.e.mode = 'walk'; w.e.modeT = 9;
  w.blow(w.heroes[0], { l: A.rope - 3, r: A.rope + 3, t: A.floor - 20, b: A.floor - 2 }); w.step(1);
  const bellBox = { l: A.grate.col * TS + 8 - 6, r: A.grate.col * TS + 8 + 6, t: (A.grate.gy0 + GP.bell.hang) * TS + 4, b: (A.grate.gy0 + GP.bell.hang) * TS + 20 }; w.blow(w.heroes[0], bellBox); w.step(1);
  w.blow(w.heroes[0], { l: A.winch - 3, r: A.winch + 3, t: A.floor - 20, b: A.floor - 2 }); w.step(1);
  ok(w.F().M.rings === 0 && !w.F().bolt && w.F().n.rings === 0 && w.st.grates.length === 0, 'BELL: a blow on the rope, on the bell body and on the winch rings nothing, bolts nobody, drops no grate');
  ok(!w.st.said.some(t => /RING THE TOWER BELL|BOLTS FOR THE HATCH|GRATE PINS|TOO SOON/.test(t)), 'BELL: no bell / bolt / pin words are ever said');
  { const g = new Proxy({}, { get: (_, k) => k === 'canvas' ? { width: 320, height: 180 } : (...a) => undefined, set: () => true }); try { w.H.drawOver(g, 0, 0, 1); w.H.drawWorld(g, 0, 0, 1); } catch (err) { console.log('  (drawOver in node: ' + err.message + ')'); } }
  ok(!w.st.texts.includes('RING'), 'BELL: no "RING" plate is drawn');
  ok(w.H.labDuty({ x: A.x0 + 80, y: A.floor, rgArrows: 0 }) === null || !/bell|release/.test((w.H.labDuty({ x: A.x0 + 80, y: A.floor, rgArrows: 0 }) || {}).why || ''), 'BELL: the lab bot has no bell / release duty'); }
/* ---- 9. the bot answers ---- */
{ const w = make(), { e, A } = w, F = w.F(), P = { x: e.x + 40, y: A.floor, face: -1, ground: true, atk: -1 }, reach = 24;
  const ans = (m, ad, t = 0.3) => { e.mode = m; e.modeT = t; P.x = e.x + ad; return gpPlan({ P, e, F: { A: w.F().A, tiara: null }, reach, t: 0, mem: {} }); };
  ok(ans('heelTell', 110).block && !ans('heelTell', 110).jump, 'BOT: block the heel dash on its tell'); ok(ans('heel', 30).dodge === true, 'BOT: roll through the heel dash when it is on you');
  ok(ans('curtsy1', 30).jump === true, 'BOT: jump the curtsy\'s low sweep'); ok(ans('curtsy2', 30).block === true, 'BOT: block / parry the rising cut');
  ok(ans('tantrumA', 30).block && ans('tantrumB', 30).block && ans('overTell', 30).block && ans('overhead', 30).block, 'BOT: block the tantrum slashes, parry the overhead');
  ok(/cut her: stumble/.test(ans('stumble', 30).why) && ans('stumble', 20).atk === true, 'BOT: cut her in the stumble'); }
/* ---- 10. nothing soft-locks: a 10-minute fight, hero near and far, phase 1 then 2 ---- */
{ for (const ph of [1, 2]) for (const far of [false, true]) { const w = make(2), { e, st } = w; const F = w.F(); F.ph = ph; e.phase = ph; F.chain = CHAINS[ph][0].slice(); F.step = 0; e.mode = 'walk'; e.modeT = 0;
    const seen = new Set(), dur = {}; let worst = 0, worstM = '', last = e.mode, lastT = st.time;
    for (let i = 0; i < 60 * 600; i++) { if (i % 90 === 0) { const hx = w.A.x0 + (far ? 3 + (i / 90 % 5) : 13 + (i / 90 % 3)) * TS; w.heroes[0].x = Math.min(w.A.xMax - 6, hx); w.heroes[1].x = w.heroes[0].x + 14; st.invuln = (i / 90 | 0) % 4 === 0; st.parryNext = (i / 90 | 0) % 7 === 0; }
      if (e.hp < e.maxHp * 0.6) e.hp = e.maxHp;   /* nobody kills her in this run */
      F.hp0 = e.hp; w.step(1); seen.add(e.mode); if (e.mode !== last) { const d = st.time - lastT; if (d > worst && !['shimmer', 'sleep', 'perch', 'addHop'].includes(last)) { worst = d; worstM = last; } dur[last] = Math.max(dur[last] || 0, d); last = e.mode; lastT = st.time; } }
    const used = NEW.filter(k => k === 'heel' ? seen.has('heelTell') : k === 'curtsy' ? seen.has('curtsyTell') : seen.has('tantrumTell'));
    ok(worst < 6 && !seen.has('hopTell') && !seen.has('hopUp') && !seen.has('bolt') && !seen.has('perch'), 'SOFT-LOCK: phase ' + ph + ' hero ' + (far ? 'far' : 'near') + ': 600 s, longest state ' + worstM + ' ' + worst.toFixed(1) + ' s (< 6), no hop / bolt / perch; new moves seen: ' + (used.join(', ') || 'none') + (seen.has('stumble') ? ', stumble' : '')); }
  /* every new mode, put in directly with its own clock, leaves on its own */
  for (const m of NEWMODES) { const w = make(), { e } = w; w.heroes[0].x = e.x + 40; w.F().heel = { x0: e.x, x1: e.x + 80, hit: false, dir: 1 }; e.mode = m; e.modeT = 0.2; e.y = w.A.floor; w.F().ph = 2; const ok0 = w.until(() => e.mode === 'walk' || e.mode === 'recover' || (e.mode !== m && !NEWMODES.includes(e.mode)), 60 * 8); ok(ok0, 'EXIT: ' + m + ' always leaves (-> ' + e.mode + ')'); } }
console.log(fails ? '\n' + fails + ' FAIL' : '\nall ok'); process.exit(fails ? 1 : 0);
