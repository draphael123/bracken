// tools/paladin-hammer.mjs - NODE ONLY (no browser): the HOLY HAMMER's laws (claude/palrework, paladinplan.md s5/s10). node tools/paladin-hammer.mjs
import { hammerPath, hammerDmg, upCTier, tapTier, hammerBand } from '../src/holy-hammer.js';
import { HG, PAL_MACE, pipsOf } from '../src/holy-ground.js';
import { K } from '../src/skill-k.js';
let f = 0; const ok = (c, m) => { if (!c) { f++; console.log('FAIL', m); } else console.log('ok  ', m); };
const T = HG.hammer;
ok(PAL_MACE === true, 'PAL_MACE on');
ok(K.holyHammer === T.k, 'skill-k holyHammer == HG.hammer.k (' + T.k + ')');
ok(T.cost === 60 && T.need === 60 && T.cost / HG.conv.pip === 3, 'costs 3 pips');
for (const [p, want] of [[0, 'none'], [1, 'none'], [2, 'none'], [3, 'hammer'], [4, 'hammer'], [5, 'sunfall']]) ok(upCTier(p, T) === want, 'UP+C at ' + p + ' pips -> ' + want);
for (const [p, want] of [[0, 'none'], [1, 'smite'], [2, 'twin'], [3, 'radiance'], [4, 'radiancePlus'], [5, 'radiancePlus']]) ok(tapTier(p, true) === want, 'tap C at ' + p + ' pips -> ' + want);
ok(tapTier(5, false) === 'sunfall', 'PAL_MACE off: tap at 5 is still SUNFALL');
ok(pipsOf({ light: 60 }) === 3 && pipsOf({ light: 59 }) === 2, 'pip law: 60 Light = 3 pips');
// path: corkscrew moves forward ~165 px over its life, never returns, loop stays in the band, both facings
for (const face of [1, -1]) { const o = { x: 100, y: 200 }; let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, last = -1e9, mono = true;
  for (let t = 0; t <= T.life + 1e-9; t += 1 / 60) { const p = hammerPath('corkscrew', t, o, face, T); minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); const c = p.cx * face; if (c < last - 1e-9) mono = false; last = c; }
  const end = hammerPath('corkscrew', T.life, o, face, T);
  ok(Math.abs((end.cx - o.x) * face - T.speed * T.life) < 1e-6, 'face ' + face + ': centre advances ' + (T.speed * T.life) + ' px');
  ok(mono, 'face ' + face + ': never returns'); ok(maxY - minY <= 2 * T.loopR + 1e-6 && Math.abs(minY - (o.y - T.loopR)) < 1 && Math.abs(maxY - (o.y + T.loopR)) < 1, 'face ' + face + ': ankle-to-head band +-' + T.loopR);
  ok((maxX - minX) > T.loopR, 'face ' + face + ': spans ' + Math.round(maxX - minX) + ' px'); }
ok(hammerBand(T) >= 22, 'sweep band >= 22 px either side of the centre');
// damage law: swordDmg 14 x 0.6 -> 8; pinned swordDmg 14, never lowered
ok(hammerDmg(14, { k: T.k }) === 8, 'dmg at swordDmg 14 = 8 (' + hammerDmg(14, { k: T.k }) + ')');
ok(hammerDmg(1, { k: T.k }) >= 1, 'dmg never under 1');
const hits = Math.floor(0.6 / T.rehit) + 1; ok(hits >= 2 && hits <= 3, 'rehit ' + T.rehit + ' s: ' + hits + ' hits on a foe standing in the loop');
ok(HG.mace.mul === 0.8 && HG.mace.rate === 0.72, 'mace: x0.8 a blow, clock 0.72; swordDmg stays 14 (main.js swordDmg paladin base)');
ok(HG.conv.parryMace < HG.conv.parry && HG.conv.hit < 5 && HG.conv.block === 20 && HG.conv.red === 30, 'fill: perfect guard 40 -> 20, hit 5 -> 3, absorb 20, red 30 (no timing bonus)');
console.log(f ? 'FAILED ' + f : 'PASS'); process.exit(f ? 1 : 0);
