// tools/paladin-boss.mjs - THE PALADIN AS THE HERO BOSS (claude/church2, LIT CHURCH 2; RE-POINTED to the PALADIN 4 kit and the church's flame by claude/church3).
// Node only: no page, no port, no Chrome. src/paladin-boss.js in a fake world (the real src/holy-ground.js makeHolyGround for his aura). What it holds:
//   - B5: every move of his is the HERO's PALADIN 4 kit (HG's numbers, scaled to a boss; the catalog has the skill he throws); one new told move a phase (VERDICT in
//     the Bastion, DAWNFALL in the Earthbreaker); his sprite is the hero's sheet (every pose he uses exists in the paladin rig, src/chars.js)
//   - B16: every told move has its OWN windup frame and its OWN release frame (no two moves share either)
//   - B17: at least four told attacks, and the central mechanic is the level's verb - THE FLAME: a brazier lit BESIDE him breaks his light-ward (he falters);
//     lit far off he prays at it; his spenders are gated by his conviction pips; the Bastion snuffs his braziers
//   - B11/B15: always hittable - his LIGHT-WARD (the Paladin 4 ward: all round) turns a blow from ANY side on guard at >= 0.4x and FEEDS him; committed it lands
//     whole; hammering the ward a minute never opens him
//   - B10/B4/B3: the falter is open >= 2.5 s, he stands still in it, then a told ward; the open rule and FULL_DAMAGE are his; marks are src/marks.js's
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as PBM from '../src/paladin-boss.js';
import { makeHolyGround, HG } from '../src/holy-ground.js';
import { FIGHT } from '../src/flame.js';
import { BY_HAND, ANSWER } from '../src/marks.js';
import { OPEN_RULE, FULL_DAMAGE } from '../src/boss-greed.js';
import { DIAL_EXEMPT } from '../src/boss-pressure.js';
const { PB } = PBM; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const TS = 16, A = { pb: { sx: 275, R: 41 } }, G = PBM.geom(A, TS);
const cat = readFileSync(new URL('../src/progression-catalog.js', import.meta.url), 'utf8'), chars = readFileSync(new URL('../src/chars.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

/* ---------- THE KIT IS THE HERO'S PALADIN 4 (B5) ---------- */
const KIT = { chain: 'the war hammer (his X)', smite: 'SMITE (1 pip: HG.smiteQ)', twin: 'TWIN SMITE (2 pips: HG.twin)', radiance: 'RADIANCE (3 pips: HG.burst; RADIANCE+ 4: HG.burstPlus)',
  spear: 'the SPEAR OF LIGHT (lightLance: HG.lance)', verdict: 'VERDICT (hold X: HG.verdict)', dawn: 'DAWNFALL (his plunge: HG.dawn)' };
for (const ph of [1, 2, 3]) for (const m of PBM.CYCLES[ph].flat()) ok(KIT[m], 'his ' + m + ' is the hero\'s own: ' + KIT[m]);
ok(HG.smiteQ && HG.twin && HG.burst && HG.burstPlus && HG.lance && HG.verdict && HG.dawn && HG.aura && HG.conv && HG.ward && HG.pray && HG.step && HG.arc, 'every piece of his kit is the hero\'s Paladin 4 kit (src/holy-ground.js HG: smite, twin, burst, burstPlus, lance, verdict, dawn, aura, conv, ward, pray, step, arc)');
ok(/"id": "lightLance",\s*"hero": "paladin"/.test(cat), 'the hero\'s catalog has the SPEAR OF LIGHT (lightLance)');
ok(PB.conv.pips === HG.conv.pips && PB.radiance.cost === HG.burst.cost / HG.conv.pip && PB.radPlus.cost === HG.burstPlus.cost / HG.conv.pip && PB.twin.cost === HG.twin.cost / HG.conv.pip && PB.smite.cost === HG.smiteQ.cost / HG.conv.pip,
  'CONVICTION is the hero\'s: five pips, every tier at the hero\'s price (smite 1, twin 2, radiance 3, radiance+ 4, sunfall 5)');
ok(PB.radiance.r >= HG.burst.r && PB.radPlus.r >= HG.burstPlus.r && PB.spear.range >= HG.lance.range && PB.dawn.r >= HG.dawn.r && PB.aura.r >= HG.aura.r && PB.smite.reach >= HG.smiteQ.reach,
  'his numbers are the hero\'s scaled to a boss (radiance r ' + HG.burst.r + ' -> ' + PB.radiance.r + ', spear ' + HG.lance.range + ' -> ' + PB.spear.range + ', aura ' + HG.aura.r + ' -> ' + PB.aura.r + ')');
{ const moves = ph => new Set(PBM.CYCLES[ph].flat()); const p1 = moves(1), p2 = moves(2), p3 = moves(3);
  ok([...p2].filter(m => !p1.has(m)).join() === 'verdict' && [...p3].filter(m => !p2.has(m)).join() === 'dawn', 'one new told move a phase (B5): VERDICT (the Bastion), then DAWNFALL (the Earthbreaker)'); }
ok(PB.scale >= 1.3 && PB.scale <= 1.7 && /SPR\.paladinboss = palHeroSet\(bakePaladin\(\{\}\)\)/.test(main) && /e\.t === 'paladinboss' \? PBG\.PB\.scale/.test(main), 'his body is the hero\'s own sheet (bakePaladin), drawn x' + PB.scale + ' like the Death Knight boss');
for (const [k] of PBM.PAL_POSES) ok(new RegExp('(F\\.' + k + ' = |\\b' + k + ': )').test(chars), 'the pose ' + k + ' is the hero paladin\'s (src/chars.js)');
ok(PBM.PAL_POSES[PBM.PAL_IDX.falter][0] === 'slump' && PBM.PAL_IDX.hurt === PBM.PAL_POSES.length - 1 && PBM.PAL_POSES[PBM.PAL_IDX.hurt][0] === 'hurt' && /PBG\.PAL_IDX\.falter/.test(main), 'his falter and hurt rows are named (PAL_IDX) and main.js re-makes them by name; the last row is his hurt');

/* ---------- B16: OWN WINDUP + OWN RELEASE A MOVE ---------- */
{ const e0 = (mode, modeT = 0.3, o = {}) => PBM.palFrame({ mode, modeT, anim: 0, ...o });
  const pairs = { chain: [e0('chainTell'), e0('chain', 0.01)], smite: [e0('smiteTell'), e0('smite')], twin2: [e0('twinGap'), e0('twin', 0.1, { twin2: true })], radiance: [e0('radianceTell'), e0('radiance')],
    radPlus: [e0('radianceTell', 0.3, { plus: true }), e0('radiance', 0.3, { plus: true })], sunfall: [e0('sunfallTell'), e0('sunfall')], spear: [e0('spearTell'), e0('spear')], arc: [e0('arcTell'), e0('arc')],
    verdict: [e0('verdictTell', 0.3, { sigils: 1 }), e0('verdict')], dawn: [e0('dawnTell'), e0('dawn', 0.1, { lift: 30 })], snuff: [e0('snuffTell'), e0('snuff')] };
  const wind = Object.values(pairs).map(p => p[0]), rel = Object.values(pairs).map(p => p[1]);
  ok(new Set(wind).size === wind.length && new Set(rel).size === rel.length && Object.values(pairs).every(([a, b]) => a !== b) && !wind.some(w => rel.includes(w)), 'every told move has its own windup frame and its own release frame (B16): ' + JSON.stringify(pairs));
  ok(wind.concat(rel).every(f => f > 0 && f < PBM.PAL_POSES.length - 1), '(none of them is the idle or the hurt frame)');
  ok(e0('verdictTell', 0.3, { sigils: 0 }) !== e0('verdictTell', 0.3, { sigils: 1 }) && e0('twinTell') === e0('smiteTell'), 'VERDICT winds in two beats (the wind, then the hold); TWIN SMITE opens on the smite\'s own windup and its backhand has its own pair'); }

/* ---------- A FAKE WORLD ---------- */
const mkWorld = (lit = 0) => { const c = { said: [], marks: [], hits: [], snuffed: [], t: 0, mended: 0 };
  c.lampsArr = G.lamps.map((l, i) => ({ id: l.id, x: l.x, lit: i < lit }));
  Object.assign(c, { lamps: () => c.lampsArr, snuff: id => { const l = c.lampsArr.find(q => q.id === id); if (l && l.lit) { l.lit = false; c.snuffed.push(id); return true; } return false; },
    hit: (b, d, name) => { c.hits.push({ b, d, name }); return false; }, number: (x, y, s) => c.said.push(s), mark: m => c.marks.push(m), sound() {}, fx() {}, shake() {}, music() {}, time: () => c.t, mend: k => { c.mended += k; }, rng: () => 0 });
  c.hg = makeHolyGround({ time: () => c.t, g: () => null, parts: null, targets: () => [], hurt() {}, healers: () => [], heal() {} });
  return c; };
const mk = () => { const S = PBM.newFight(G), e = { t: 'paladinboss', x: G.x0 + 21 * TS + 8, y: G.floorY, hp: PB.hp, maxHp: PB.hp, face: -1, mode: 'walk', modeT: 5, open: 0, alive: true }; S.script = ['chain']; return { S, e }; };
const step = (e, S, c, h, secs) => { for (let i = 0; i < secs * 60; i++) { c.t += 1 / 60; PBM.stepPaladin(e, S, 1 / 60, h, c); c.hg.update(1 / 60); } };

/* ---------- B11 / B15: THE LIGHT-WARD (all round) ---------- */
{ const { S, e } = mk(), c = mkWorld(); S.conv = 2; const C0 = S.conv;
  const r1 = PBM.blowOn(e, S, c, 30); ok(r1.read === 'guard' && r1.dmg === Math.round(30 * PB.ward.take) && PB.ward.take >= 0.4 && S.conv > C0, 'HIS LIGHT-WARD turns a blow on guard - at x' + PB.ward.take + ' (B15) - and it FEEDS his conviction');
  for (const m of ['walk', 'recover', 'guard', 'step']) { e.mode = m; ok(PBM.blowOn(e, S, c, 30).read === 'guard', 'on guard (' + m + ') the ward turns it from any side: the Paladin 4 ward is all round'); }
  for (const m of ['chainTell', 'smiteTell', 'twinTell', 'radianceTell', 'sunfallTell', 'spearTell', 'arcTell', 'verdictTell', 'dawnTell', 'radiance', 'sunfall', 'land', 'reel', 'pray', 'prayTell', 'snuffTell', 'prayWalk', 'snuffWalk']) { e.mode = m; ok(PBM.blowOn(e, S, c, 30).read === 'landed', 'committed (' + m + ') a blow lands whole'); } }
{ const { S, e } = mk(), c = mkWorld(); let opened = false; const h = [{ x: e.x - 30, y: e.y, alive: true, ground: true }];
  for (let i = 0; i < 60 * 60; i++) { c.t += 1 / 60; h[0].x = e.x + (e.face || -1) * 30; if (i % 30 === 0 && PBM.isGuardMode(e.mode)) PBM.blowOn(e, S, c, 20); PBM.stepPaladin(e, S, 1 / 60, h, c); c.hg.update(1 / 60); if (PBM.pbOpen(e)) opened = true; }
  ok(!opened, 'hammering his LIGHT-WARD for a minute never opens him (it feeds him)'); }

/* ---------- THE CENTRAL MECHANIC: THE FLAME, THE BRAZIERS ---------- */
ok(G.lamps.length === 3 && G.fires.length === 2 && FIGHT.beside === PB.brazier.near, 'the sanctuary has three BRAZIERS (dark) and two fires that always burn (the votive stand, the altar fire); "beside him" is the shared verb\'s (src/flame.js FIGHT.beside ' + FIGHT.beside + ' px)');
{ const { S, e } = mk(), c = mkWorld(); e.mode = 'walk'; const x0 = e.x;
  ok(PBM.brazierLit(e, S, c, e.x + 30) === 'break' && PBM.pbOpen(e) && e.open >= 2.5 && S.n.breaks === 1 && c.said.some(s => /BREAKS HIS LIGHT-WARD/.test(s)), 'A BRAZIER LIT BESIDE HIM breaks his light-ward: HE FALTERS (open ' + e.open.toFixed(1) + ' s, told)');
  let still = true, t = 0; while (PBM.pbOpen(e)) { PBM.stepPaladin(e, S, 1 / 60, [{ x: e.x + 60, y: e.y, alive: true }], c); if (Math.abs(e.x - x0) > 0.01) still = false; t += 1 / 60; if (t > 5) break; } ok(still && t >= 2.5, 'he stands still through it (B4): ' + t.toFixed(2) + ' s');
  ok(S.ward > 0 && PBM.blowOn(e, S, c, 30).read === 'ward' && S.conv >= PB.conv.refill, 'then a told ward (B3) as his conviction comes back to ' + PB.conv.refill);
  ok(PBM.brazierLit(e, S, c, e.x + 20) === 'ward' && !PBM.pbOpen(e), 'warded, a brazier lit beside him does not open him again (told: NOT YET)');
  const o = mk(); o.e.mode = 'falter'; o.e.open = 3; ok(PBM.blowOn(o.e, o.S, c, 100).dmg === Math.round(100 * PB.falterMul), 'open, a blow lands x' + PB.falterMul);
  ok(PB.falterMul >= 1.5 && PB.falterMul <= 2, '(B15: openings pay 1.5-2x)');
  const cap = mk(); cap.e.mode = 'falter'; cap.e.open = 3; let sum = 0; for (let i = 0; i < 40; i++) sum += PBM.blowOn(cap.e, cap.S, c, 80).dmg; ok(sum <= Math.ceil(PB.hp * PB.falterCap) + 1, 'a falter pays at most ' + Math.round(PB.falterCap * 100) + '% of him (' + sum + ')'); }
{ const { S, e } = mk(), c = mkWorld(); e.mode = 'walk'; ok(PBM.brazierLit(e, S, c, e.x + PB.brazier.near + 40) === 'far' && !PBM.pbOpen(e) && S.n.litFar === 1, 'lit FAR from him it opens nothing (told: light one beside him)'); }
{ /* PRAYER: low on pips with a brazier lit, he goes to kneel at it - x3 there, slow anywhere - and a blow (or the brazier put out) breaks it */
  const { S, e } = mk(), c = mkWorld(1); S.conv = 0.5; S.prayCd = 0; e.mode = 'recover'; e.modeT = 0; const h = [{ x: e.x + 200, y: e.y, alive: true }];
  PBM.stepPaladin(e, S, 1 / 60, h, c); ok(e.mode === 'prayWalk' && S.kneelId === 'arena0', 'low on pips with a brazier lit, he goes to PRAY at it (the hero\'s crouch rule)');
  let t = 0; while (e.mode === 'prayWalk' && t < 5) { PBM.stepPaladin(e, S, 1 / 60, h, c); t += 1 / 60; } ok(e.mode === 'prayTell' || e.mode === 'pray', 'he reaches it and kneels (told: ' + c.said.filter(s => /PRAYS/.test(s)).join() + ')');
  step(e, S, c, h, 0.5); const c1 = S.conv; step(e, S, c, h, 0.6); ok(e.mode === 'pray' && S.conv > c1 + 0.5, 'at a lit brazier his prayer fills fast (' + c1.toFixed(2) + ' -> ' + S.conv.toFixed(2) + ' pips in 0.6 s)');
  PBM.blowOn(e, S, c, 20); ok(e.mode === 'recover' && S.n.praysCut === 1, 'a blow that lands BREAKS the prayer');
  const f = mk(); f.S.conv = 0.5; f.S.prayCd = 0; f.e.mode = 'recover'; f.e.modeT = 0; let tt = 0; while (f.e.mode !== 'pray' && tt < 6) { PBM.stepPaladin(f.e, f.S, 1 / 60, h, c); tt += 1 / 60; }
  const l = c.lampsArr.find(q => q.id === f.S.kneelId); l.lit = false; PBM.brazierOut(f.e, f.S, c, l.id); ok(f.e.mode === 'recover', 'putting out the brazier he kneels at breaks it too');
  const a = mk(), ca = mkWorld(0); a.S.conv = 0.5; a.S.prayCd = 0; a.e.mode = 'recover'; a.e.modeT = 0; PBM.stepPaladin(a.e, a.S, 1 / 60, [{ x: a.e.x + 200, y: a.e.y, alive: true }], ca); step(a.e, a.S, ca, [{ x: a.e.x + 200, y: a.e.y, alive: true }], 1.0);
  ok(a.e.mode === 'pray' && a.S.conv - 0.5 < (S.conv - c1) * 0.6 + 0.01 && PB.conv.kneel >= PB.conv.anywhere * HG.pray.holyMul - 0.01, 'with every brazier dark and you far off he prays where he stands - slowly (the hero\'s x' + HG.pray.holyMul + ' at a holy light)'); }
{ /* THE SPENDERS ARE GATED BY HIS PIPS */
  const { S, e } = mk(), c = mkWorld(0), seen = new Set(); const h = [{ x: e.x - 60, y: e.y, alive: true, ground: true }]; S.prayCd = 99;
  for (let i = 0; i < 60 * 40; i++) { c.t += 1 / 60; S.conv = Math.min(S.conv, 0.4); PBM.stepPaladin(e, S, 1 / 60, h, c); seen.add(e.mode); h[0].x = Math.max(G.x0 + 30, Math.min(G.x1 - 30, e.x + (e.x > (G.x0 + G.x1) / 2 ? -60 : 60))); }
  ok(!['smiteTell', 'twinTell', 'radianceTell', 'sunfallTell'].some(m => seen.has(m)) && seen.has('chainTell'), 'with no pips he smites nothing, bursts nothing, never calls the sunfall - his hammer and his spear only (' + [...seen].join(' ') + ')'); }
{ const { S, e } = mk(), c = mkWorld(), seen = new Set(); const h = [{ x: e.x - 80, y: e.y, alive: true, ground: true }];
  for (let i = 0; i < 60 * 90; i++) { c.t += 1 / 60; S.conv = Math.max(S.conv, 3.2); PBM.stepPaladin(e, S, 1 / 60, h, c); c.hg.update(1 / 60); seen.add(e.mode); const far = Math.floor(i / 240) % 3 === 0 ? 140 : 50; h[0].x = Math.max(G.x0 + 30, Math.min(G.x1 - 30, e.x + (e.x > (G.x0 + G.x1) / 2 ? -far : far))); }
  ok(['chainTell', 'smiteTell', 'twinTell', 'radianceTell', 'spearTell'].every(m => seen.has(m)), 'with pips he plays his whole phase-one kit: ' + ['chainTell', 'smiteTell', 'twinTell', 'radianceTell', 'spearTell'].filter(m => seen.has(m)).join(' ')); }
{ /* SUNFALL: five pips, it spends them all; every spend lights his HALLOWED AURA, which walks with him */
  const { S, e } = mk(), c = mkWorld(); S.conv = 5; e.mode = 'recover'; e.modeT = 0; const h = [{ x: e.x - 40, y: e.y, alive: true }];
  PBM.stepPaladin(e, S, 1 / 60, h, c); ok(e.mode === 'sunfallTell' && S.marks.length >= 5 && S.conv < 0.01, 'five pips: SUNFALL, told by ' + S.marks.length + ' crosses round him; it spends all five');
  const au = c.hg.of(e); ok(au && au.aura && au.side === 'foe' && au.life >= PB.aura.base, 'the spend lights his HALLOWED AURA (the hero\'s rule)');
  step(e, S, c, h, PB.sunfall.tell + 0.05); ok(c.hits.some(q => q.name === PBM.MOVE_NAME.sunfall), 'the light comes down on the crosses');
  e.mode = 'walk'; e.modeT = 1; const x0 = c.hg.of(e).x; e.x += 40; PBM.stepPaladin(e, S, 1 / 60, [{ x: e.x - 200, y: e.y, alive: true }], c); ok(Math.abs(c.hg.of(e).x - e.x) < 3 && Math.abs(x0 - e.x) > 30, 'and the aura walks with him'); }
{ /* HIS HALLOWED AURA burns a hero who stands in it and mends him (the hero's module, his side) */
  let burnt = 0, mend = 0; const t = { x: 110, y: 200 }, e = { x: 100, y: 200, hp: 500, maxHp: 1000, alive: true };
  const hg = makeHolyGround({ time: () => 0, g: () => null, parts: null, targets: () => [t], hurt: (b, d) => { burnt += d; }, healers: () => [e], heal: (b, nn) => { mend += nn; } });
  const a = hg.plant(e, 100, 200, { r: PB.aura.r, life: 9, side: 'foe' }); a.aura = true; for (let i = 0; i < 120; i++) hg.update(1 / 60);
  ok(burnt > 0 && mend > 0 && hg.of(e).side === 'foe', 'his aura (side foe) burns a hero standing in it (' + burnt + ' in 2 s) and mends him'); }

/* ---------- HIS OTHER TOLD MOVES ---------- */
{ /* HEAVEN'S ARC: a hero hanging over his head */
  const { S, e } = mk(), c = mkWorld(); e.mode = 'walk'; e.modeT = 1; PBM.stepPaladin(e, S, 1 / 60, [{ x: e.x + 8, y: e.y - 50, alive: true, air: true }], c);
  ok(e.mode === 'arcTell' && c.marks.includes('!'), 'a hero over his head: HEAVEN\'S ARC (told !)'); step(e, S, c, [{ x: e.x + 8, y: e.y - 50, alive: true, air: true }], PB.arc.tell + 0.05); ok(c.hits.some(q => q.name === PBM.MOVE_NAME.arc), 'the whirl strikes over him'); }
{ /* THE SPEAR OF LIGHT: thrown at range, it flies at the waist and stops at the first hero */
  const { S, e } = mk(), c = mkWorld(); S.script = ['spear']; S.step = 0; S.spearCd = 0; e.mode = 'recover'; e.modeT = 0; const h = [{ x: e.x - 160, y: e.y, alive: true, ground: true }];
  PBM.stepPaladin(e, S, 1 / 60, h, c); ok(e.mode === 'spearTell', 'at range: the SPEAR OF LIGHT (told)'); step(e, S, c, h, PB.spear.tell + 0.05); ok(S.spear && Math.abs(S.spear.y - (G.floorY - PB.spear.hy)) < 1, 'the spear flies at the waist');
  step(e, S, c, h, 0.6); ok(!S.spear, 'and stops at the first hero'); }
{ /* VERDICT (the Bastion): a sigil where you stand, and again, then light on them all */
  const { S, e } = mk(), c = mkWorld(); S.ph = 2; S.snuffCd = 99; S.script = ['verdict']; S.step = 0; e.mode = 'recover'; e.modeT = 0; const h = [{ x: e.x - 90, y: e.y, alive: true, ground: true }];
  PBM.stepPaladin(e, S, 1 / 60, h, c); ok(e.mode === 'verdictTell' && c.marks.includes('!!'), 'VERDICT (told !!)');
  for (let i = 0; i < 90; i++) { h[0].x -= 0.8; c.t += 1 / 60; PBM.stepPaladin(e, S, 1 / 60, h, c); }
  ok(S.sigils.length === PB.verdict.max && new Set(S.sigils.map(q => Math.round(q.x))).size === PB.verdict.max, 'the sigils fall where you stood: ' + S.sigils.map(q => Math.round(q.x)).join(' '));
  step(e, S, c, h, 0.6); ok(c.hits.filter(q => q.name === PBM.MOVE_NAME.verdict).length === PB.verdict.max, 'then the light strikes every one'); }
{ /* DAWNFALL (the Earthbreaker) */
  const { S, e } = mk(), c = mkWorld(); e.hp = e.maxHp * 0.25; S.ph = 3; S.snuffCd = 99; S.script = ['dawn']; S.step = 0; e.mode = 'recover'; e.modeT = 0; const h = [{ x: e.x - 160, y: e.y, alive: true }];
  PBM.stepPaladin(e, S, 1 / 60, h, c); ok(e.mode === 'dawnTell' && S.leap, 'THE EARTHBREAKER: DAWNFALL, a ring at your feet');
  const tx = S.leap.x; step(e, S, c, h, PB.dawn.tell + PB.dawn.fly + 0.05); const au = c.hg.of(e); ok(Math.abs(e.x - tx) < 1 && S.waves.length >= 1 && au && Math.abs(au.x - tx) < 1 && c.hits.some(q => q.name === PBM.MOVE_NAME.dawn), 'he comes down hammer-first on it: the pillar, the quake both ways, and his aura lit where he lands'); }

/* ---------- THE PHASES TURN THE RULE (B5) ---------- */
{ const { S, e } = mk(), c = mkWorld(2); e.hp = e.maxHp * 0.6; e.mode = 'walk'; e.modeT = 1; const h = [{ x: e.x - 200, y: e.y, alive: true }]; PBM.stepPaladin(e, S, 1 / 60, h, c);
  ok(S.ph === 2 && c.said.some(s => /SNUFFS HIS BRAZIERS/.test(s)), 'THE BASTION (P2): told - he puts out his braziers');
  let t = 0, told = false; while (t < 8 && !c.snuffed.length) { PBM.stepPaladin(e, S, 1 / 60, h, c); if (e.mode === 'snuffTell') told = true; t += 1 / 60; }
  ok(told && c.snuffed.length === 1, 'he walks to a lit brazier and SNUFFS it (a told move, its own windup): ' + c.snuffed.join());
  const b = mk(), cb = mkWorld(3); b.S.ph = 2; b.S.snuffCd = 0; b.e.mode = 'recover'; b.e.modeT = 0; let tt = 0; while (b.e.mode !== 'snuffTell' && tt < 6) { PBM.stepPaladin(b.e, b.S, 1 / 60, h, cb); tt += 1 / 60; }
  PBM.blowOn(b.e, b.S, cb, 20); ok(b.e.mode === 'recover' && b.S.n.snuffsCut === 1 && !cb.snuffed.length, 'a blow in his snuff stays his hammer'); }
{ /* THE SANCTUARY STEP (the Bastion): a hero with a flame closing on him by a dark brazier - he may step off it */
  const { S, e } = mk(), c = mkWorld(0); S.ph = 2; S.stepCd = 0; S.snuffCd = 99; e.mode = 'walk'; e.modeT = 2; const bx = G.lamps[1].x; e.x = bx + 10;
  PBM.stepPaladin(e, S, 1 / 60, [{ x: bx - 20, y: e.y, alive: true, ground: true, flame: 6 }], c); ok(e.mode === 'step' && e.stepDir > 0, 'a hero with a flame at the dark brazier beside him: he STEPS off it (away from the fire)');
  step(e, S, c, [{ x: bx - 20, y: e.y, alive: true, ground: true, flame: 6 }], PB.step.t + 0.02); ok(Math.abs(e.x - bx) > PB.brazier.near - 20, '(' + Math.round(e.x - bx) + ' px off it)'); }

/* ---------- THE BOT READS THE RULE ---------- */
{ const pl = o => PBM.pbPlan({ P: { x: G.x0 + 40, y: G.floorY, face: 1, ground: true, atk: -1 }, e: { x: G.lamps[1].x + 30, y: G.floorY, mode: 'walk', face: -1, modeT: 1 }, S: { G, act: 1, ward: 0, ph: 1, waves: [], marks: [], sigils: [] },
    lamps: G.lamps.map(l => ({ ...l, lit: false })), fires: G.fires, reach: 30, t: 9, rng: () => 0.9, mem: {}, v2: true, ...o });
  const a = pl({ flame: 0 }), b = pl({ flame: 8 }), c2 = pl({ flame: 8, P: { x: G.lamps[1].x, y: G.floorY, face: 1, ground: true, atk: -1 } }), d = pl({ flame: 8, P: { x: G.lamps[1].x, y: G.floorY, face: 1, ground: true, atk: -1 }, e: { x: G.lamps[1].x + 70, y: G.floorY, mode: 'walk', face: -1, modeT: 1 } });
  ok(/flame/.test(a.why) && b.gx > G.x0 + 40 && /brazier/.test(b.why) && c2.talk && !d.talk && /wait/.test(d.why), 'the bot plays the rule: no flame - to a fire; a flame - to the brazier by him, E when he stands beside it, and waits for him when he is not (' + [a.why, b.why, c2.why, d.why].join(' / ') + ')'); }

/* ---------- THE TABLES ---------- */
ok(Object.values(PBM.MOVES).filter(m => m.mark).length >= 4, 'B17: at least four told attacks (' + Object.entries(PBM.MOVES).filter(([, m]) => m.mark).map(([k]) => k).join(' ') + ')');
for (const [mode, mv] of Object.entries(PBM.MOVES)) ok(BY_HAND['paladinboss|' + mode] === mv.mark && (!mv.answer || ANSWER['paladinboss|' + mode] === mv.answer), 'his ' + mode + ' wears ' + (mv.mark || 'no mark') + ' in src/marks.js');
ok(OPEN_RULE.paladinboss && FULL_DAMAGE.paladinboss, 'he has an opening rule and is on FULL_DAMAGE (a duelist: no chip)');
ok(DIAL_EXEMPT.has('paladinboss'), 'he is self-tuned in his lane: DIAL_EXEMPT (src/boss-pressure.js)');
ok(/coinBoss: true, feat: 'boss:church'/.test(main) && /PROG\.bossDown\.church = true/.test(main), 'beating him is the Paladin\'s hero fight: PROG.bossDown.church opens the hero (silver after; the feat boss:church)');
console.log('ok  paladin-boss  ' + n + ' checks: the hero\'s Paladin 4 kit and sheet (B5), own windup + release a move (B16), four+ told attacks and THE FLAME as the central mechanic (B17: a brazier lit beside him breaks his light-ward), the all-round light-ward at >= 0.4x (B11/B15), the falter, still, then a ward (B10/B4/B3), prayer, conviction tiers, sunfall and the aura, heaven\'s arc, the spear, verdict, dawnfall, the Bastion\'s snuff and step, the bot, the tables');
