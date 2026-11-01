// src/skill-k.js - THE ONE SKILL DAMAGE RULE (claude/lategamea, Daniel-approved 10-31, scratch/brief-lategame-1101.md Q4A + scratch/ability-balance-1101.md):
//   every damaging skill hits for  Math.round( swordDmg() x K[skill] x amul(skill) )  (+ the skill's own per-talent / per-tick / per-foe multipliers),
// so a skill grows with MIGHT picks, smith edges, the level and MASTERY exactly like the sword does. Before this, the Pyromancer, Freebooter, Paladin and the legacy
// Blood Knight tree used hard-coded FLAT numbers that only grew by amul (x1.2 level, x1.15 MASTERY, x1.5 rank 3) and fell ~25% behind the foes by L35, while the
// linear heroes AoE actives (whirlwind, rain of spears, axe storm, volley, sword of the realm) out-scaled them ~2.7x by L50 and one-cast a whole pack.
//   K_FLAT   - the converted flat skills: k = the old flat number / the hero L16 sword hit (the brief k where the brief names one), so a rank-1 L16 cast is within
//              ~10% of the number it had; it rises with the sword from there (the flat family catches up) instead of standing still.
//   K_LINEAR - the linear AoE skills that were trimmed (cap: one L35 cast takes <= ~60% of a brute hp): the old multiplier is kept in WAS.
//   PYRO_TODO - the Pyromancer skills are EXCLUDED here: the PYRO KIT lane (claude/pyrokit) is rewriting them; convert them to swordDmg x k AFTER it merges.
export const K_FLAT = {
  hammerLeap: 0.7,        // paladin  was FLAT 24
  lightLance: 1.0,        // paladin  was FLAT 34 (HG.lance.dmg)
  holyCharge: 0.4,        // paladin  was FLAT 12
  dawnburst: 0.4,         // paladin  was FLAT 12
  broadside: 0.75,        // freebooter was FLAT 22
  keelhaul: 0.45,         // freebooter was FLAT 12
  boardingBase: 0.45, boardingTal: 0.2,      // freebooter was FLAT 12 + 5 per talent rank
  grapeshotBase: 0.4, grapeshotTal: 0.15,    // freebooter was FLAT 10 + 4 per talent rank
  powderKeg: 0.65,       // freebooter was FLAT 17
  heavySeas: 0.45,       // freebooter was FLAT 12
  harvestMoon: 0.5,      // blood knight legacy was FLAT 17 a tick
  graveTideBase: 0.3, graveTideTal: 0.12,    // blood knight legacy was FLAT 10 + 4 per rank
  scytheBase: 0.5, scytheTal: 0.12,          // blood knight legacy was FLAT 17 + 4 per rank
  soulReap: 0.45,        // blood knight legacy was FLAT 14
  boneMin: 0.15, boneSpan: 0.2,              // blood knight legacy skeleton: was FLAT 5 + 0..5
  shieldThrowFar: 0.45, shieldThrowNear: 0.3, shieldThrowBack: 0.18,   // knight was FLAT 13 (ranged foe) / 9 / 5 on the return
};
export const K_LINEAR = {
  whirlwind: 0.5,        // knight   was 1.1 per cut (x2 cuts); cd 4 -> 5 (CD_MAX). Brief k 0.7 measured 89% of an L35 brute in ONE cast (both cuts); 0.5 = ~64% (10-31 browser run)
  rainOfSpears: 0.9,     // warden   was 1.3 per spear
  bzStorm: 0.85,         // berserker was 1.2 per hatchet
  rgVolley: 0.7,         // ranger   was 1.0 per arrow (x3)
  swordOfRealmSmall: 0.4, swordOfRealmBig: 0.8,   // knight   was 0.6 / 1.2 per wave swing (the pierce stays)
};
export const WAS = { whirlwind: 1.1, rainOfSpears: 1.3, bzStorm: 1.2, rgVolley: 1.0, swordOfRealmSmall: 0.6, swordOfRealmBig: 1.2 };
export const PYRO_TODO = {   // flat today; convert to swordDmg x k when claude/pyrokit has merged (brief Q4A suggests meteor 0.9, flashover 1.1 on burning)
  meteor: 'FLAT 20 + 0.15 heat', flameRing: 'FLAT 12', vent: 'FLAT 10 + 0.5 heat', wisp: 'FLAT 8 (4 on a boss)', fireWall: 'FLAT 10 per tick',
  flashover: 'FLAT 34 burning / 8 else', firestorm: 'FLAT 6 + ignite', ember: 'heatDmg(3)', jet: 'heatDmg(1) per tick', burn: '2 per 0.3 s', PYRE: 'FLAT 42 + 16 splash',
  heldFireball: 'pyrokit lane (must be swordDmg x k)', conflagration: 'pyrokit lane (must be swordDmg x k)',
};
export const K_PYRO = {   // (claude/pyrokit2, Daniel 11-01 11:17) LIVING BOMB and METEOR FALL: swordDmg x k x amul x heat, nothing flat
  livingBomb: 1.2,       // a foe's third pip: it bursts for this (the brief's ~1.2x sword)
  livingBombBig: 0.7,    // ...a boss or a mini takes this instead, and never more than the cap in main.js PYRO_KIT.lb.capPct of him (the stacks come every ~3 hits: a full 1.2 would be a +40% boss damage rider)
  meteorFall: 3.0,       // the meter spender: one big hit on everything in the blast (a full bar x1.4 heat = 4.2 sword per foe, then the chain of bursts ~1.7 each), in line with the knight's LAST CHARGE (2.5 sword through a pack, 3 on a boss) and the old CONFLAGRATION (4.0 x 1.4 a marked foe); a boss or mini is capped (PYRO_KIT.mf.capPct)
};
export const K = { ...K_FLAT, ...K_LINEAR, ...K_PYRO };
