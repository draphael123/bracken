// src/ksar3.js - THE BANDIT KSAR 3: "THE FORT ANSWERS ITS GONGS" (claude/ksar3, the OPUS GREYBOX, 11-06). Behind its flag; the live Ksar is unchanged with it off.
// Sources: scratch/plan-desert-1105.md s1.7 / s2 / s3c / s4 / s6 (Daniel APPROVED all its recs 11-05 14:07); briefs ksar3-1016 (zips between tall buildings, the boss
// atop a tall building, the Gong-Master), hawkmistress2-1014 (plan overrides: RAZOR MOULT, TALON SNATCH strike-answerable, HER HAWK BURNS + oil fire-lines),
// newminis-1015 (!! 10-15 the Gong-Master's approved kit), ksarfix-1014 (shade within reach; sun never kills). Daniel 11-06: fewer checkpoints.
//
// THE FLAG: KSAR3_SHIPS = false. OFF, src/level.js builds master's Ksar exactly (tools/ksar3.mjs holds its grid+ents hash). ON (?ksar3=1 on the page,
// globalThis.BRACKEN_KSAR3, or KSAR3=1 in a Node tool's env) the SAME ROAD SLOT ('ksar', needs 'glasssea' - no index, no save moves) builds KSAR 3:
// master's Ksar 0-795 (the road, the walls, the gate winch, the souq, the powder store, the hawk tower roofs, the powder quarter, the keg alley and its tower) with
// SIX checkpoints where it had seven (over a level 28% longer; three of master's + three of its own), then THE NEW TAIL (this file) where master had the line to the courtyard + the courtyard:
//   796-904  THE LINES OVER THE SOUQ  TEACH/TEST  rooftop to rooftop on ZIP LINES (src/zipline.js, nothing rebuilt): tower -> roof -> minaret -> roof -> tower, then
//                                                 THE HOP (jump or drop off one rope onto the one under it). The street under is FOOTING here: a miss costs the walk
//                                                 back up a stair, never a life (taught safe). THE SUN-SHADE STALKER taught under an awning (plain), then in the glare.
//   905-923  THE GONG YARD'S DOOR      CHECKPOINT on the roof over the yard; drop to the street, in through the door
//   924-963  THE GONG YARD             MINI       THE GONG-MASTER (src/gong-master.js) under three hung gongs: CUT A ROPE = SILENCED + OPEN 3.5 s
//   964-1030 THE HIGH LINES            EXAM       up a tower; its LOOKOUT runs for his gong - and a rung gong sends RAIDERS down a line onto the roof you ride to (cut
//                                                 the gong first, or the raiders' post when they come); the HOP over a FATAL drop; two stalkers in the glare, a MIRAGE
//                                                 shade (it does not cool, he stays unseen under it) and a MIRAGE roof (a trick, never a trap: 3 rows to a real roof)
//   1031-1036 THE TALLEST TOWER        the climb; CHECKPOINT on its crown; THE LAST LINE drops you through her door
//   1052-1101 HER ROOF                 BOSS       HAWK-MISTRESS 2 (src/hawk-mistress.js with the arena's hm.v2: oil fire-lines, TALON SNATCH, RAZOR MOULT, HER HAWK BURNS)
//                                                 on the tallest tower's top: open sky, the town below (art owed), the three-roof + two-shaft stage kept (the shafts = the
//                                                 tower's stairwells, their hot updraft throws you out: never a death)
// Desert theme: mud-brick / pisé red, minarets, striped awnings, brass gongs (greybox colours). No wood, no logs, no goblins.

export const KSAR3_SHIPS = false;
export function ksar3On() {
  if (KSAR3_SHIPS) return true;
  try { if (globalThis.BRACKEN_KSAR3 === true || globalThis.BRACKEN_KSAR3 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]ksar3=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.KSAR3 === '1') return true; } catch { /* no node */ }
  return false;
}
import { stageGongMaster, GM_STAGE } from './gong-master.js';
import { stageHawkMistress, HM_STAGE } from './hawk-mistress.js';

/* W: the level; KEEP: master's checkpoint columns Ksar 3 keeps (168 tower three, 392 the store's door, 581 the courtyard door; 276, 489, 702, 808 go) + CHECKS, its own (the alley
   tower's crown before the lines, the Gong yard's door, the tallest tower's crown): SIX shrines over 1045 route tiles where master stood seven over 817, every gap inside the
   A10b band (140-260 route tiles, tools/checkpoint-rule.mjs, the survival2 shape; doors exempt) - over the older hard MAX 200 twice (227, 210): Q1 in the lane report; GM / HM: the arenas */
export const K3 = { W: 1104, keep: [168, 392, 581], gmX: 924, hmX: 1052, hmR: 24, tail: 796,
  oil: [[3, 8], [17, 26], [35, 40]],   /* HM2's oil channels (local roof columns): one on each roof, clear of the shafts */
  sections: [['THE LINES OVER THE SOUQ', 796], ['THE GONG YARD', 905], ['THE HIGH LINES', 964], ['THE TALLEST TOWER', 1023], ["HER ROOF", 1052]],
  checks: [[794, 15], [912, 23], [1033, 7]] };
export const K3_RULE = 'THE FORT ANSWERS ITS GONGS: A RUNG GONG CALLS EVERY BANDIT IN EARSHOT, AND A CUT ROPE SILENCES IT.';

/* THE TAIL: called by buildKsar (src/ksar.js) with its own painters when k3 is set. Returns { stage (HM2's), shafts, fix(out) } */
export function ksar3Tail(api) {
  const { set, block, ent, air, boards, ground, sign, blade, lookout, slinger, smoke, plated, gong, stack, torches, lineRope, raid, shadeBox, awning, drop, gongs, stacks, decor, shade, zipLines, T, TS, W, H, B } = api;
  const X0 = K3.tail;
  /* clear master's last pieces past the alley's tower (its line to the courtyard, the landing's awning): Ksar 3 lays its own */
  for (let i = decor.length - 1; i >= 0; i--) { const d = decor[i], x = d.x0 ?? d.x; if (x >= X0) decor.splice(i, 1); }
  for (let i = shade.length - 1; i >= 0; i--) if (shade[i][0] >= X0 * TS) shade.splice(i, 1);
  air(X0, W - 1, 0, H - 1); ground(X0, W - 1, B);
  const zipPx = (x0, y0, x1, y1, o) => { const z = Object.assign({ x0, y0, x1, y1 }, o || {}); zipLines.push(z); return z; };   /* a rope by its pixels (the hops: one rope laid under another) */
  const stalker = (x, y, x0, x1, squad) => ent('sunstalker', x, y, { face: -1, squad, x0, x1 });
  const stair = (xa, xb, top, bottom, step = 2) => { let i = 0; for (let r = bottom; r >= top; r -= step, i++) boards(i % 2 ? xa + 3 : xa, i % 2 ? xb : xb - 3, r); };   /* side to side, two-row steps */
  const mirages = [], k3 = { stalkers: [], hops: [], roofs: [] };

  // ================= 11. THE LINES OVER THE SOUQ (796-904): TEACH -> TEST - the rope is the fort's road; a miss is the street =================
  sign(792, 15, 'THE LINES OVER THE SOUQ: UP TAKES A ROPE. A MISS IS ONLY THE STREET.');
  ent('check', K3.checks[0][0], K3.checks[0][1]);                                 /* KSAR 3's fourth shrine: the alley tower's crown, before the lines */
  /* R1: the first roof; Z1 from the alley tower's lip down to it */
  block(810, 826, 20, B - 1); k3.roofs.push([810, 826, 20]);
  lineRope(795.5, 15, 810, 19);
  stair(803, 809, 20, 32);                                                       /* the street's stair back up to R1 (a miss costs the walk) */
  /* THE STALKER TAUGHT (A4, safe): under the awning he is a plain man - read him, fight him in the shade */
  awning(812, 818, 15, 20);
  sign(811, 19, 'A SHIMMER IN THE GLARE IS A MAN. UNDER CLOTH YOU SEE HIM.');
  stalker(815, 19, 811, 819, 'k3sk1'); k3.stalkers.push('k3sk1');
  /* M1: the minaret off R1 (its stair on the roof), Z2 from its crown to R2 */
  stair(818, 826, 12, 18);
  block(827, 831, 12, B - 1); decor.push({ kind: 'minaret', x0: 827, x1: 831, y: 12 });
  lineRope(831.5, 11, 846, 18);
  stair(839, 845, 20, 32);                                                       /* the street's stair up to R2 */
  /* the street under the first lines: a souq stall's men - only a fall meets them */
  blade(836, B - 1, 'k3street', { face: -1 }); smoke(842, B - 1, 'k3street', { face: -1 });
  for (const [x0, x1] of [[800, 803], [833, 836]]) { boards(x0, x1, 30); decor.push({ kind: 'stall', x0, x1, y: 30 }); shadeBox(x0, x1, 31, B - 1); }
  /* R2: THE STALKER IN THE GLARE (the test): his shimmer is the only read; the awning by the stair is where you can see him */
  block(846, 862, 19, B - 1); k3.roofs.push([846, 862, 19]);
  stalker(851, 18, 847, 856, 'k3sk2'); k3.stalkers.push('k3sk2');
  awning(846, 849, 13, 19);                                                      /* the landing in shade: his beat runs out of it into the glare */
  stair(854, 862, 13, 17);                                                       /* up to T2's crown (row 13) */
  /* T2 and THE HOP: Z3 off its crown runs out over the street and ENDS IN THE AIR; Z4 hangs under its last stretch - JUMP or DROP off Z3 onto Z4 (src/zipline.js: a kick
     or a drop shuts only the rope just left - the hop to the next line). Ride Z3 to its end and its end lets you fall: the street (here, a walk back up) */
  block(863, 867, 13, B - 1); decor.push({ kind: 'tower', x0: 863, x1: 867, y: 13 });
  stair(868, 874, 14, 32);                                                       /* the street's stair back up to T2 (its east face) */
  sign(864, 12, 'THE HOP: JUMP - OR DOWN - OFF ONE ROPE ONTO THE ONE UNDER IT.');
  const z3 = zipPx(867.5 * TS + 8, 13 * TS - 22, 892 * TS + 8, 21 * TS - 12), z4 = zipPx(880 * TS + 8, 300, 908 * TS + 8, 24 * TS - 12);
  k3.hops.push({ id: 'souq', a: z3, b: z4, fatal: false });
  ent('silver', 886, B - 1);                                                     /* the street under the hop keeps a silver: a miss pays once */
  awning(884, 888, 28, B);
  /* R3: the roof over THE GONG YARD's door - CHECKPOINT (Ksar 3's fifth) */
  block(905, 920, 24, B - 1); k3.roofs.push([905, 920, 24]);
  awning(904, 911, 18, 24);
  ent('check', K3.checks[1][0], K3.checks[1][1]);
  sign(916, 23, 'THE GONG YARD: THE FORT\'S BELL-KEEPER. CUT HIS ROPES.');

  // ================= 12. THE GONG YARD (924-963): THE GONG-MASTER (mini) =================
  const gm = stageGongMaster({ set, block, ent, air }, T, TS, K3.gmX, B);
  gongs.push(...gm.gongs);
  shadeBox(K3.gmX, K3.gmX + GM_STAGE.W - 1, B - 14, B - 1);                      /* the yard is walled and roofed by its wall walk: shade (the fight is not a sun fight) */

  // ================= 13. THE HIGH LINES (964-1030): THE EXAM - a lookout's gong sends raiders onto the roof you ride to; the hop over a FATAL drop; the glare =================
  const ex = K3.gmX + GM_STAGE.W;                                                 /* the yard's east gate column (964) */
  stair(966, 971, 14, 32);
  block(972, 976, 12, B - 1); decor.push({ kind: 'tower', x0: 972, x1: 976, y: 12 });
  gong('k3exam', 975, 11, { ear: 22, earY: 14 }); lookout(973, 11, 'k3examLook', 'k3exam', { face: -1 });
  awning(972, 976, 6, 12);
  sign(966, B - 1, 'THE HIGH LINES: NOTHING UNDER THEM BUT THE WADI.');
  drop(977, 1009);                                                               /* THE DROP: the wadi under the fort (a fall is the end - the exam's death, A10) */
  const z5 = zipPx(976.5 * TS + 8, 12 * TS - 22, 1000 * TS + 8, 21 * TS - 12), z6 = zipPx(988 * TS + 8, 290, 1011 * TS + 8, 23 * TS - 12);
  k3.hops.push({ id: 'high', a: z5, b: z6, fatal: true });
  /* R5: the exam roof - two stalkers in the glare, a MIRAGE SHADE (canvas painted on the haze: it does not cool, he stays unseen under it), a real awning; THE RAIDERS' LINE
     from the tallest tower's flank onto it (the exam gong calls two riders; a blade on its post - on R5 - cuts it) */
  block(1010, 1022, 23, B - 1); k3.roofs.push([1010, 1022, 23]);
  awning(1010, 1013, 17, 23);
  stalker(1016, 22, 1011, 1021, 'k3sk3'); stalker(1020, 22, 1014, 1022, 'k3sk4'); k3.stalkers.push('k3sk3', 'k3sk4');
  mirages.push({ id: 'k3shade', kind: 'shade', box: [1017, 18, 1021, 22] });
  raid('k3raid', 1031, 7, 1018, 22, 'k3exam', 2);
  /* R6 a step below R5 and THE MIRAGE ROOF: R5 seems to run on east - it is haze; walk onto it and you drop 3 rows to R6 (a trick, never a trap: lintMirages) */
  block(1023, 1030, 26, B - 1); k3.roofs.push([1023, 1030, 26]);
  mirages.push({ id: 'k3roof', kind: 'ledge', box: [1023, 23, 1028, 23] });
  plated(1026, 25, 'k3plate', { face: -1 }); stack('k3kegs', 1023, 25, 'keg', 2);   /* a plated man at the tower's foot and the kegs that strip him (the Ksar's own teach, re-tested) */

  // ================= THE TALLEST TOWER (1031-1036): the climb, the crown's CHECKPOINT (Ksar 3's sixth), THE LAST LINE through her door =================
  stair(1023, 1030, 8, 24);
  block(1031, 1036, 8, B - 1); decor.push({ kind: 'minaret', x0: 1031, x1: 1036, y: 8 });
  awning(1032, 1036, 2, 8);
  ent('check', K3.checks[2][0], K3.checks[2][1]);
  sign(1032, 7, 'THE LAST LINE: HER ROOF. HER HAWK BURNS IF FIRE FINDS IT.');
  drop(1037, K3.hmX - 2);                                                        /* the tower's height: open air to the wadi between the crown and her roof */
  lineRope(1036.5, 7, K3.hmX + 3, K3.hmR - 1, { speed: 200 });

  // ================= HER ROOF (1052-1101): HAWK-MISTRESS 2 =================
  const AX = K3.hmX, R = K3.hmR;
  block(AX - 1, W - 1, R, H - 1);                                                 /* the tallest tower's body under her roof */
  block(AX + HM_STAGE.W, W - 1, 0, H - 1);
  const stage = stageHawkMistress({ set, block, ent, air }, T, TS, AX, R, { v2: { oil: K3.oil } });
  stage.carve(); gongs.push(...stage.gongs); stacks.push(...stage.racks);
  stage.arena.name = 'HAWK-MISTRESS 2'; stage.arena.high = true;                 /* (the art lane's sky + the town below: arena.high) */
  ent('gate', stage.exit.gate, R - 1);

  // ================= THE SHADE (ksarfix 10-14: shade within running-pace reach on every outdoor stretch - tools/ksar-sun.mjs: none over the drain's 2 s) =================
  /* the roofs' own: a minaret's / a tower's afternoon SHADOW across a stair, cloth strung over a rope's run (CLOTH LINES: a striped sheet between two poles - art owed),
     awnings on the crowns. The stalkers' spots stay in the glare: the shade is where you READ him */
  const cloth = (x0, x1, r0, r1) => { shadeBox(x0, x1, r0, r1); decor.push({ kind: 'clothline', x0, x1, y: r0 }); };
  cloth(802, 805, 12, 19);                                                       /* over Z1 */
  shadeBox(819, 826, 10, 18); decor.push({ kind: 'shadow', x0: 819, x1: 826, y: 10 });   /* the minaret's shadow over R1's stair */
  awning(827, 831, 6, 12);                                                       /* M1's crown */
  cloth(837, 840, 11, 18);                                                       /* over Z2 */
  shadeBox(855, 862, 12, 18); decor.push({ kind: 'shadow', x0: 855, x1: 862, y: 12 });   /* T2's shadow over R2's stair */
  awning(863, 867, 7, 13);                                                       /* T2's crown */
  cloth(876, 880, 12, 20); cloth(890, 895, 17, 24);                              /* over THE HOP (Z3, then Z4) */
  cloth(983, 989, 10, 24);                                                       /* over Z5 / Z6 */
  shadeBox(995, 1001, 14, 23); decor.push({ kind: 'shadow', x0: 995, x1: 1001, y: 14 });   /* THE TALLEST TOWER's shadow across the high lines */
  shadeBox(1023, 1030, 8, 25); decor.push({ kind: 'shadow', x0: 1023, x1: 1030, y: 8 });   /* ...and over R6's stair */
  cloth(1040, 1044, 4, 16);                                                      /* over the last line */

  const fix = out => {
    out.ksar3 = true; out.mini = gm.mini; out.mirages = mirages; out.k3 = k3;
    out.zipTransfer = true;   /* the reach fill rides rope to rope (src/reachcore.js: the hops) */
    out.sections = Object.fromEntries([...Object.entries(out.sections).filter(([, x]) => x < X0), ...K3.sections]);
    out.sun = [{ x0: 0, x1: 584 }, { x0: X0, x1: AX - 1 }];
    out.squadBands = [...(out.squadBands || []).filter(b => b.lo < 800), { lo: 800, hi: W - 1, spots: 0,
      why: 'KSAR 3: THE LINES OVER THE SOUQ and THE HIGH LINES are rope rides between roofs (each roof holds one SHADE stalker or the street a stall), 924-963 THE GONG YARD (a mini arena: no squad), 1031-1101 the tallest tower and HER ROOF (a boss arena)' }];
    out.unlocks = [...(out.unlocks || []), { kind: 'ksgong', opens: 'THE GONG-MASTER silenced: a cut rope in his yard opens him (he re-hangs it, told)', hud: 'THE ROPE IS CUT: HE IS SILENCED' }];
    out.checkRun = 300;   /* (Daniel 11-06: fewer checkpoints) the filler adds none between Ksar 3's five */
  };
  return { stage, shafts: stage.shafts, fix };
}

/* THE LEVEL CHECK (tools/ksar3.mjs): ropes land on footing, the hops overlap long enough (never frame-perfect), stalkers on their roofs, both arenas whole */
export function lintKsar3(L, tileAt, T) {
  const bad = [], TS = 16, standable = t => t === T.SOLID || t === T.ONEWAY;
  if (!L.ksar3) return ['not a Ksar 3 build'];
  for (const h of L.k3.hops) {
    const a = h.a, b = h.b, lo = Math.max(Math.min(a.x0, a.x1), Math.min(b.x0, b.x1)), hi = Math.min(Math.max(a.x0, a.x1), Math.max(b.x0, b.x1));
    const ya = x => a.y0 + (a.y1 - a.y0) * (x - a.x0) / (a.x1 - a.x0), yb = x => b.y0 + (b.y1 - b.y0) * (x - b.x0) / (b.x1 - b.x0);
    let win = 0; for (let x = lo; x <= hi; x += 2) { const d = yb(x) - ya(x); if (d >= 14 && d <= 60) win += 2; }   /* the lower rope 14-60 px under the upper: a drop or a kick finds it */
    if (win < 5 * TS) bad.push('hop ' + h.id + ': the window is ' + (win / TS).toFixed(1) + ' tiles (>= 5: never frame-perfect)');
    if (ya(Math.max(a.x0, a.x1)) <= yb(Math.max(a.x0, a.x1)) - 4 && Math.max(a.x0, a.x1) < Math.max(b.x0, b.x1)) { /* the upper rope ends over the lower: fine */ }
    const endX = Math.max(b.x0, b.x1), endR = Math.floor((Math.max(b.y0, b.y1) + 12) / TS);
    if (!standable(tileAt(Math.floor(endX / TS), endR + 1)) && !standable(tileAt(Math.floor(endX / TS), endR))) bad.push('hop ' + h.id + ': the lower rope does not set you down on a roof');
  }
  for (const z of L.zipLines.filter(q => q.x0 >= K3.tail * TS - 8 && !q.raid)) {
    const lowX = z.y1 >= z.y0 ? z.x1 : z.x0, lowY = Math.max(z.y0, z.y1), r = Math.floor((lowY + 12) / TS), c = Math.floor(lowX / TS);
    if (L.k3.hops.some(h => h.a === z)) continue;   /* a hop's upper rope ends in the air on purpose */
    let ok = false; for (let y = r; y <= r + 2; y++) if (standable(tileAt(c, y))) ok = true;
    if (!ok) bad.push('rope ending ' + c + ',' + r + ' sets you down on nothing');
  }
  for (const e of L.ents.filter(q => q.t === 'sunstalker')) { if (!standable(tileAt(e.x, e.y + 1))) bad.push('stalker ' + e.squad + ' is not on a roof'); for (const x of [e.x0, e.x1]) if (!standable(tileAt(x, e.y + 1))) bad.push('stalker ' + e.squad + ': his beat ' + x + ' runs off the roof'); }
  if (!L.mini || L.mini.boss !== 'gongmaster') bad.push('no Gong-Master mini');
  if (!L.arena || !L.arena.hm || !L.arena.hm.v2) bad.push('no HM2 arena');
  const checks = L.ents.filter(e => e.t === 'check');
  if (checks.length !== K3.keep.length + K3.checks.length) bad.push('checkpoints: ' + checks.length + ' (want ' + (K3.keep.length + K3.checks.length) + ')');
  return bad;
}

/* THE BUILD (src/level.js calls it for the 'ksar' row when ksar3On()): master's Ksar with KSAR 3's hook */
import { buildKsar } from './ksar.js';
export const buildKsar3 = o => buildKsar({ ...o, k3: { W: K3.W, keep: K3.keep, tail: ksar3Tail } });
