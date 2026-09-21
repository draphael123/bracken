// src/draft/glass-sea.js — THE GLASS SEA (desert arc level 4) as a GREYBOX DRAFT: the structure, not the level (not in LEVELS).
// Measured by `node tools/draft-level.mjs glass-sea`. Brief: docs/desert-arc-brief.md.
//
// THE RULE: DAY AND NIGHT FLIP THE RULES. The crossing starts in the day: SUNSTROKE, and shade is life (src/sunstroke.js). The sun
// sets at THE FORK OBELISK; past it is the night: the COLD, and scorpion SWARMS pouring out of the cracks in the glass - a CAMPFIRE's
// light holds them off and its warmth is what shade was by day. The glass itself: lightning-fused dunes whose slopes are SLICK (the
// slide is faster, stopping is harder). Said three ways: the sky's colour; the sun meter turning to a frost meter at dusk; shade
// violet by day, firelight gold by night.
// SEVEN SECTIONS: THE GLASS EDGE (sand turns to glass) · THE FULGURITE FIELD (lightning spires: overhangs to rest under) · THE BONE
// CROSSING (the mini, THE GLASS STALKER, at a third) · THE FORK OBELISK (the sun sets; the way off to THE SUN TEMPLE) · THE SUNKEN HEAD
// (a giant's stone head in the glass, climbed) · THE COLD FLATS (the night: fires, cracks, swarms) · THE COLOSSUS STEPS (the approach)
// · then THE GLASS COLOSSUS (the arena).
import { pieces, ground, garrison, TS } from './_kit.js';
export const PIECES = pieces(`
  #edge Fx8 R2 Fx4 L2 Fx6 @wreck1 Fx4 R1 R1 Fx3 L1 L1 Fx6 R2 R2 Fx3 L2 L2 Fx6 @ledge1 Fx6 R1 Fx3 L1 Fx6
  #field Fx4 @spire1 Fx3 R2 Fx1 L2 Fx1 R1 R1 R1 Fx3 L1 L1 L1 Fx4 @spire2 Fx8 R2 R2 Fx2 L2 L2 Fx4 @spire3 Fx8 R1 Fx2 L1 Fx8
  #crossing Fx6 R2 Fx3 L2 Fx4 @mini Fx30 Fx4 R2 Fx2 L2 Fx6 @wreck2 Fx6
  #obelisk Fx6 R1 R1 Fx2 @obelisk Fx8 L1 L1 Fx6 @fork Fx6 @fire0 Fx4 R2 Fx4 L2 Fx8 R1 Fx2 L1 Fx2 R2 Fx2 L2 Fx2
  #head Fx6 R2 R2 Fx2 @head Fx12 L2 L2 Fx6 @fire1 Fx4 R1 R1 Fx3 L1 L1 Fx2 R2 Fx2 L2 Fx2 R2 Fx2 L2 Fx6
  #flats Fx6 @fire2 Fx6 R2 Fx3 L2 Fx8 @ledge2 Fx6 R1 R1 Fx2 L1 L1 Fx4 @fire3 Fx6 R2 Fx2 L2 Fx2 R2 Fx2 L2 Fx2 R1 Fx2 L1 Fx4
  #steps Fx6 @fire4 Fx4 U Fx4 U Fx4 U Fx6 D Fx3 D Fx3 D Fx6 @fire5 Fx4 R2 Fx2 L2 Fx10 #arena Fx40`);
export const NIGHT = { maxWalk: 8, fireR: 10 };   // no walk in the night longer than this (s at RUN) between fires; a crack within this many tiles of a fire
export function build(T) {
  const G = ground(T, PIECES, { H: 40, base: 28 }), { W, H, grid, set, top, on, marks, sections } = G;
  const ents = [], ent = (t, x, y, e = {}) => ents.push({ t, x, y, ...e }), shade = [], fires = [], cracks = [];
  // the glass: every slope in the field and beyond is slick glass (the draft marks the zones; the build gives glass slopes their own tiles)
  const glass = [[sections.field, W - 2]];
  // THE FULGURITE FIELD: lightning spires, each a column of fused glass with an overhang - shade by day
  for (const k of ['spire1', 'spire2', 'spire3']) { const x = marks[k], g = top(x); for (let dx = 0; dx <= 5; dx++) set(x + dx, g - 4, T.SOLID); ent('deco', x, on(x), { kind: 'fulgurite', behind: true }); }   /* a glass overhang on a spire drawn BEHIND the road (a solid spire walled it: the arch lesson, again) */
  ent('silver', marks.spire2 + 7, top(marks.spire2 + 7) - 4);   /* beside the overhang, not over it (its own lintel shut the silver off) */
  // THE BONE CROSSING: a mini arena (walls go up when THE GLASS STALKER shows), a wreck for shade before it
  const mini = { x0: marks.mini * TS, x1: (marks.mini + 30) * TS, floor: top(marks.mini) * TS, boss: 'glassstalker' }; ent('wagon', marks.mini - 6, on(marks.mini - 6), { wreck: true }); ent('check', marks.mini - 3, on(marks.mini - 3));
  // THE FORK OBELISK: the sun sets here; its bulk is shade; beyond it the fork to THE SUN TEMPLE (an exit, optional)
  { const x = marks.obelisk, g = top(x); ent('deco', x + 1, on(x + 1), { kind: 'obelisk', behind: true }); shade.push([(x - 3) * TS, (x + 6) * TS, (g - 3) * TS, g * TS + 1]); ent('sign', x - 2, on(x - 2), { text: 'THE SUN GOES DOWN HERE. PAST THE STONE, THE NIGHT IS COLD: KEEP TO THE FIRES.' }); }
  ent('fork', marks.fork + 2, on(marks.fork + 2), { to: 'suntemple' }); ent('check', marks.fork, on(marks.fork));
  // THE SUNKEN HEAD: a giant's head in the glass: its brow an overhang, its crown a ledge with a stray, a relic in its mouth
  { const x0 = marks.head, g = top(x0); for (let dx = 0; dx < 12; dx++) for (let y = g - 6; y < g - 1; y++) if (!(dx >= 4 && dx <= 8 && y >= g - 3)) set(x0 + dx, y, T.SOLID);   // the head, its mouth open at the bottom
    for (let dx = 4; dx <= 8; dx++) set(x0 + dx, g - 1, T.AIR);   // the mouth is a room at road level
    for (let dx = -2; dx < 0; dx++) set(x0 + dx, g - 3, T.PLANK); ent('stray', x0 + 6, g - 7); ent('relic', x0 + 6, g - 1); shade.push([(x0 + 4) * TS, (x0 + 9) * TS, (g - 3) * TS, g * TS + 1]); }
  // THE COLD FLATS and THE COLOSSUS STEPS: the night - campfires, and the cracks the swarms come out of
  /* THE NIGHT'S FIRES, BY RULE: a campfire every 36 columns from the obelisk to the Colossus (8 s at a run is 46), each with a crack
     the swarms pour from a few tiles past it - you see them coming in its light. The build keeps the rule, not these columns. */
  for (let x = marks.fork + 4; x < sections.arena - 4; x += 36) { let fx = x; while (G.cols[fx] && G.cols[fx].t !== 'F') fx++; fires.push({ x: fx, y: on(fx) }); ent('campfire', fx, on(fx));
    let cx = fx + 7; while (G.cols[cx] && G.cols[cx].t !== 'F') cx++; if (cx < sections.arena - 3) { cracks.push({ x: cx, y: on(cx) }); ent('crack', cx, on(cx)); } }
  for (const k of ['ledge1', 'ledge2']) { const x = marks[k], g = top(x); for (let dx = 0; dx < 4; dx++) set(x + dx, g - 3, T.PLANK); }   // glass shelves: a stray on each
  ent('stray', marks.ledge1 + 1, top(marks.ledge1) - 4); ent('silver', marks.ledge2 + 2, top(marks.ledge2) - 4); ent('stray', sections.steps + 12, on(sections.steps + 12));
  for (const k of ['wreck1', 'wreck2']) ent('wagon', marks[k] + 2, on(marks[k] + 2), { wreck: true });
  { const x = marks.mini + 12, g = top(x); for (let dx = 0; dx < 6; dx++) set(x + dx, g - 4, T.SOLID); }   // a fused overhang in the Stalker's crossing: shade in the fight
  ent('silver', sections.steps + 10, on(sections.steps + 10) - 1);
  /* THE DAY'S SHADE, BY RULE: after the hand-placed shade, a dead glass-skiff (a wreck: its lee is shade) wherever the road to the
     obelisk would run more than 34 columns in the open */
  { const covered = x => ents.some(e => (e.t === 'wagon' || e.t === 'awning') && Math.abs(e.x - x) <= 2) || shade.some(([a, b]) => x * TS >= a && x * TS <= b) || [marks.spire1, marks.spire2, marks.spire3, marks.mini + 12].some(k => x >= k && x <= k + 5);
    let last = 0; for (let x = 0; x < marks.obelisk; x++) { if (covered(x)) { last = x; continue; } if (x - last >= 34) { let wx = x; while (G.cols[wx] && G.cols[wx].t !== 'F') wx--; ent('wagon', wx, on(wx), { wreck: true, skiff: true }); last = x; } } }
  /* GLASS SHELVES, BY RULE: any 24-column screen with fewer than three heights to stand on gets shelves of fused glass (a plank at 3
     rows, and one at 5 over its end) until it has three - the mini's fight floor too (a fight wants somewhere to go up) */
  for (let w0 = 0; w0 + 24 <= sections.arena; w0 += 24) {
    const heights = () => { const hs = new Set(); for (let x = w0; x < w0 + 24; x++) { hs.add(top(x)); for (let y = 0; y < H; y++) if (G.at(x, y) === T.PLANK) hs.add(y); } return hs.size; };
    for (let tries = 0; heights() < 3 && tries < 2; tries++) { let x = w0 + 6 + tries * 8; while (x < w0 + 18 && !(G.cols[x].t === 'F' && G.cols[x + 3] && G.cols[x + 3].t === 'F' && top(x) === top(x + 3))) x++;
      if (x >= w0 + 18) break; const g = top(x); for (let d = 0; d < 4; d++) if (G.at(x + d, g - 3 - tries * 2) === T.AIR) set(x + d, g - 3 - tries * 2, T.PLANK); } }
  // checkpoints (B6), the start
  ent('check', 3, on(3)); ent('check', sections.field + 2, on(sections.field + 2)); ent('check', sections.head, on(sections.head)); ent('check', sections.flats + 3, on(sections.flats + 3)); ent('check', sections.steps + 2, on(sections.steps + 2));
  const ax0 = sections.arena; ent('check', ax0 - 3, on(ax0 - 3));
  const arena = { x0: ax0 * TS, x1: (ax0 + 40) * TS, floor: top(ax0) * TS, trigger: (ax0 + 5) * TS, wallL: ax0 - 1, wallR: ax0 + 40, boss: 'glasscolossus', tint: '#9ad0e8', tintA: 0.08 };
  // the garrison: glass scorpions and vultures by day, night hunters and swarm scorpions by night
  garrison(G, T, ents, { edge: ['scorpion', 'vulture'], field: ['glassscorp', 'vulture', 'scorpion', 'glassscorp'], crossing: ['glassscorp', 'scorpion', 'vulture', 'glassscorp'],
    obelisk: ['glassscorp', 'vulture', 'nighthunter', 'scorpion'], head: ['nighthunter', 'glassscorp', 'nighthunter', 'scorpion'], flats: ['nighthunter', 'glassscorp', 'nighthunter', 'glassscorp'], steps: ['nighthunter', 'glassscorp', 'nighthunter', 'scorpion'] },
    { from: 0, to: ax0 - 1, flyers: ['vulture'], spot: x => { if (x >= marks.mini && x < marks.mini + 30) return null; const c = G.cols[x]; if (!c) return null; const y = on(x); for (let yy = y - 2; yy <= y; yy++) if (G.at(x, yy) !== T.AIR) return null; return y; } });
  return { W, H, grid, ents, START: { x: 5, y: on(5) }, pools: [], falls: [], moversExtra: [], interiors: [], sections, marks, arena, mini, shade, fires, cracks, glass,
    sunset: marks.obelisk, draft: true, palette: { set: 'glass' } };
}
export const meta = {
  name: 'THE GLASS SEA', orientation: 'h', landmarks: ['spire2', 'mini', 'obelisk', 'head', 'fire2'], sun: false, density: [3.5, 4.5], foes: ['scorpion', 'glassscorp', 'vulture', 'nighthunter'],
  async extra(L, { ok, R, at, T, TS }) {
    const { SUN, shadeZones, inShade, roofShade, sunStretches } = await import('../sunstroke.js');
    const { isSlope, heightAt } = await import('../slopes.js');
    const low = new Map(); for (const k of R.seen) { const [x, y] = k.split(',').map(Number); if (!low.has(x) || y > low.get(x)) low.set(x, y); }
    const road = (x0, x1) => { const r = []; for (let x = x0 * TS + 8; x < x1 * TS; x += 4) { const tx = Math.floor(x / TS), cy = low.get(tx); if (cy === undefined) continue; const t = at(tx, cy); r.push([x, isSlope(t) ? cy * TS + heightAt(t, x - tx * TS) : (cy + 1) * TS]); } return r; };
    // THE DAY: from the start to the obelisk, the sun rule
    const Z = shadeZones(L), shaded = (x, y) => inShade(Z, x, y - 1) || roofShade(at, x, y - 14, t => t === T.SOLID);
    const day = sunStretches(road(0, L.sunset + 3), shaded);
    ok(day[0].s <= SUN.maxWalk, `THE DAY (start to the obelisk): the longest walk in the sun is ${day[0].s.toFixed(1)} s, the rule ${SUN.maxWalk} s`);
    // THE NIGHT: from the obelisk to the arena, fire to fire
    const fx = L.fires.map(f => f.x * TS + 8).sort((a, b) => a - b), nightX = [(L.sunset + 3) * TS, ...fx, L.arena.x0];
    const gaps = nightX.slice(1).map((x, i) => (x - nightX[i]) / SUN.RUN);
    ok(Math.max(...gaps) <= NIGHT.maxWalk, `THE NIGHT (the obelisk to the Colossus): ${L.fires.length} campfires, the longest walk between warmth ${Math.max(...gaps).toFixed(1)} s, the rule ${NIGHT.maxWalk} s`);
    const far = L.cracks.filter(c => !L.fires.some(f => Math.abs(f.x - c.x) <= NIGHT.fireR));
    ok(far.length === 0, `every crack the swarms pour from is within ${NIGHT.fireR} tiles of a fire's light (${L.cracks.length} cracks): you see them coming`);
    const nGlass = (() => { let n = 0; for (let x = L.glass[0][0]; x < L.glass[0][1]; x++) for (let y = 0; y < L.H; y++) if (isSlope(at(x, y))) n++; return n; })();
    ok(nGlass >= 40, `the slope showcase: ${nGlass} glass slope tiles to slide on`);
    const fork = L.ents.find(e => e.t === 'fork'); let miniReached = false; for (let x = L.mini.x0 / TS; x < L.mini.x1 / TS; x++) if (R.seen.has(x + ',' + (L.mini.floor / TS - 1))) miniReached = true;
    ok(fork && R.near(fork.x, fork.y) && miniReached && L.mini.x0 / L.arena.x0 > 0.25 && L.mini.x0 / L.arena.x0 < 0.45, `the fork to THE SUN TEMPLE is on the road, and THE GLASS STALKER's mini arena stands ${Math.round(100 * L.mini.x0 / L.arena.x0)}% of the way in (F7: about a third)`);
  },
};
