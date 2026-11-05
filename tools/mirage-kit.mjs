/* tools/mirage-kit.mjs - MIRAGES (src/mirage-kit.js; docs/desertkit.md) on desert-rules.js's MIRAGE. NODE ONLY (no page, no browser).
   Proves: fades from far to near like desert-rules' mirageAlpha; always shimmers a little (the read from afar), more as you come; a REAL thing never
   shimmers; never footing; co-op: the nearest live seat fades it, it comes back when all walk away; no mirage at night / indoors / in a gust; 'seen' once;
   the SHADE STALKER's look (faint in glare, plain in shade, a told shimmer before it commits); lintMirages (a trick, never a trap) on the lab + broken cases. */
import assert from 'node:assert/strict';
import { MIRAGE, mirageAlpha } from '../src/desert-rules.js';
import { MIRAGEKIT, mirageInit, mirageStep, mirageSolid, stalkerLook, lintMirages } from '../src/mirage-kit.js';
import { labLevel } from '../src/desertkit-lab.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';

const DT = 1 / 60, HEROES = [...HERO_MOVE_IDS, 'sunpriest', 'rimebinder'];
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const L = labLevel(), get = (M, id) => M.list.find(m => m.def.id === id);
const at = (x, dead) => ({ x, y: 22 * 16, dead });

/* 1. the fade matches desert-rules (a point mirage), shimmer always on, stronger near; a real thing never */
{ const M = mirageInit({ mirages: [{ id: 'p', kind: 'oasis', box: [50, 21, 50, 21] }, { id: 'r', kind: 'oasis', box: [50, 21, 50, 21], real: true }] }), cx = 50 * 16 + 8; let same = true;
  for (let dx = 0; dx < 220; dx += 3) { mirageStep(M, DT, { seats: [{ x: 50 * 16 + 16 + dx, y: 22 * 16 + 7 }] }); const ref = mirageAlpha({ x: 50 * 16 + 16 }, 50 * 16 + 16 + dx); if (Math.abs(get(M, 'p').alpha - ref) > 1e-9) same = false; }
  ok(same, 'the fade is desert-rules\' mirageAlpha (far ' + MIRAGE.far + ' -> near ' + MIRAGE.near + ')');
  let farS = 0, nearS = 0; for (let t = 0; t < 2; t += DT) { mirageStep(M, DT, { seats: [at(cx + 140)], time: t }); farS = Math.max(farS, Math.abs(get(M, 'p').shimmer)); }
  for (let t = 0; t < 2; t += DT) { mirageStep(M, DT, { seats: [at(cx + 70)], time: t }); nearS = Math.max(nearS, Math.abs(get(M, 'p').shimmer)); }
  let veryFar = 0; for (let t = 0; t < 2; t += DT) { mirageStep(M, DT, { seats: [at(cx + 900)], time: t }); veryFar = Math.max(veryFar, Math.abs(get(M, 'p').shimmer)); }
  ok(veryFar > 0.5 && nearS > farS, `it shimmers from afar (${veryFar.toFixed(2)} px) and harder as you come (${farS.toFixed(2)} -> ${nearS.toFixed(2)})`);
  ok(get(M, 'r').shimmer === 0 && get(M, 'r').alpha === 1, 'a real oasis never shimmers, never fades');
  ok(mirageSolid() === false, 'never footing'); }

/* 2. CO-OP + every hero: the nearest live seat fades it; walking away brings it back; the dead do not count */
{ for (const h of HEROES) for (let seats = 1; seats <= 4; seats++) {
    const M = mirageInit(L), o = get(M, 'oasis'), cx = 60 * 16, ps = [...Array(seats)].map((_, i) => ({ ...at(cx - 400 - i * 30), hero: i ? 'knight' : h }));
    mirageStep(M, DT, { seats: ps }); const a0 = o.alpha;
    ps[seats - 1].x = cx - 20; mirageStep(M, DT, { seats: ps }); const a1 = o.alpha;
    ps[seats - 1].x = cx - 600; mirageStep(M, DT, { seats: ps }); const a2 = o.alpha;
    ok(a0 === 1 && a1 === 0 && a2 === 1, `${h}, ${seats} seat(s): the nearest fades it, it comes back`); }
  const M = mirageInit(L), o = get(M, 'oasis'); mirageStep(M, DT, { seats: [at(60 * 16, true), at(10 * 16)] }); ok(o.alpha === 1, 'a dead seat beside it does not fade it'); }

/* 3. only in the sun; 'seen' said once */
{ const M = mirageInit(L), seats = [at(57 * 16)];
  for (const p of ['night', 'interior']) { mirageStep(M, DT, { seats: [at(10 * 16)], profile: p }); ok(get(M, 'oasis').alpha === 0 && get(M, 'well').alpha === 1, p + ': no mirage (the real well stays)'); }
  mirageStep(M, DT, { seats: [at(10 * 16)], gust: true }); ok(get(M, 'bridge').alpha === 0, 'a sandstorm gust blows it away');
  const ev1 = mirageStep(M, DT, { seats }), ev2 = mirageStep(M, DT, { seats });
  ok(ev1.some(e => e.id === 'door' && e.ev === 'seen') && !ev2.length, 'seen once: ' + ev1.map(e => e.id).join(',')); }

/* 4. THE SHADE STALKER's look */
{ const g = stalkerLook('hot'), s = stalkerLook('shade'), o = stalkerLook('sun'), c = stalkerLook('hot', MIRAGEKIT.stalker.commit);
  ok(g.alpha <= 0.1 && s.alpha === 1 && o.alpha > g.alpha && o.alpha < 1, `glare ${g.alpha}, sun ${o.alpha}, shade ${s.alpha}`);
  ok(c.telling && c.shimmer > 0 && c.alpha >= 0.5, 'committing: it shimmers and shows (' + c.alpha + ') - the told windup');
  ok(MIRAGEKIT.stalker.commit >= 0.4, 'the commit tell is >= 0.4 s'); }

/* 5. LINT: a trick, never a trap */
{ const t = L.tileAt; ok(lintMirages(L, t).length === 0, 'the lab lints clean: ' + lintMirages(L, t).join('; '));
  const br = (f, g) => { const M = labLevel(); f(M.mirages, M); if (g) g(M); return lintMirages(M, M.tileAt).length; };
  ok(br(m => { m[0].kind = 'castle'; }) > 0, 'bad kind caught');
  ok(br(() => {}, M => { for (let y = 22; y < 26; y++) for (let x = 54; x <= 56; x++) M.grid[y * M.W + x] = 0; }) > 0, 'a bottomless fall under the bridge caught');
  ok(br(() => {}, M => { M.grid[24 * M.W + 55] = 3; }) > 0, 'spikes under it caught');
  ok(br(m => { m[0].box = [54, 17, 56, 17]; }) > 0, 'a fall too deep to climb out caught');
  ok(br(m => { m[1].box = [61, 2, 61, 4]; }) > 0, 'a mirage door set in rock caught');
  ok(br(m => { m[3].far = 200; }) > 0, 'shimmer numbers on a real thing caught'); ok(br(m => { m[2].near = 300; }) > 0, 'near >= far caught');
  ok(br(m => { m.push({ ...m[0] }); }) > 0, 'duplicate id caught'); ok(br(m => { m[0].box = [70, 22, 80, 22]; }) > 0, 'off the map caught');
  let lv = 0; const { LEVELS } = await import('../src/level.js'); for (const l of Object.values(LEVELS)) if (l && l.mirages) { lv++; ok(lintMirages(l).length === 0, (l.id || '?') + ' lints clean'); }
  console.log('  levels with mirages: ' + lv); }

console.log('mirage-kit: ' + n + ' checks ok');
