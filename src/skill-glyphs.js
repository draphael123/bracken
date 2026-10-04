/* THE PASSIVE ICON TABLE. One row per hero, one entry per passive skill id: which glyph the skill wears in the store and on
 * the loadout bar. Data only (the drawing lives in main.js's talIcon), so tools/skill-icons.mjs can read it in Node.
 *
 * WHY IT IS KEYED BY HERO AND ID, NOT BY A REGEX ON THE ID. The old lookup (TAL_BY_NAME, then a regex on the id text,
 * then a sword) let the id `sunder` (five heroes, five different behaviours) share one glyph, gave every Geomancer
 * passive a sword, and turned RUMBLE into a coin ("rum") and SECOND BARREL into a skull ("second"). Now every catalog
 * passive has its own row here and tools/skill-icons.mjs fails on a passive with no row. The glyph is what the skill
 * DOES to you (a bolt is wind, a drop is blood, an eye is a mark, a hook is a line), so glyphs repeat across a hero's
 * list by design - except the Geomancer's ten, which are all different (docs/ability-audit.md, section 4, item 1).
 * ACTIVES are not here: each of the 52 has a drawn icon of its own in main.js (skillIcon).
 */
export const PASSIVE_GLYPH = {
  knight: { thirdCut: 'blade', riposte: 'shield', sunder: 'eye', bleed: 'drop', execute: 'blade', flurry: 'bolt', unbroken: 'blade', plated: 'shield', parry: 'shield', vengeance: 'reflect', bash: 'shield', bulwark: 'reflect', holdLine: 'shield', counterstroke: 'reflect', momentum: 'boot', bounding: 'boot', evasion: 'bolt', airRoll: 'boot', lightStep: 'boot', hangCut: 'boot', airDash: 'boot', endlessSky: 'boot' },
  pyro: { skip: 'boot', stoke: 'bolt', twin: 'twin', scatter: 'chev', brand: 'eye', conflagration: 'flame', sunder: 'flame', wildfire: 'flame', longFlame: 'flame', pilot: 'hourglass', updraft: 'boot', searing: 'eye', jetWalk: 'flame', blaze: 'hourglass', backdraft: 'flame', inferno: 'flame', emberSkin: 'reflect', kindle: 'cross', heatShield: 'shield', smoulder: 'flame', emberHeart: 'heart', phoenix: 'heart', phoenixTrail: 'flame' },
  paladin: { litany: 'cross', mercy: 'bolt', zeal: 'cross', smite: 'blade', beacon: 'light', martyr: 'cross', doubleJudge: 'light', warded: 'shield', reflect: 'reflect', unwavering: 'shield', retribution: 'reflect', crusade: 'chev', sanctuary: 'cross', fortress: 'reflect', shockwave: 'ring', sunder: 'ring', heavyTread: 'ring', concuss: 'ring', earthshaker: 'ring', wrath: 'heart', aftershock: 'ring' },
  pirate: { longBarrel: 'shot', powderBurn: 'shot', quickHands: 'shot', deadEye: 'shot', sunder: 'shot', secondBarrel: 'shot', hotBarrel: 'shot', deepPockets: 'coin', greased: 'coin', looter: 'coin', shareOut: 'coin', ransom: 'coin', pieces: 'chev', noQuarter: 'coin', paidInGold: 'coin', longLine: 'hook', cutthroat: 'blade', haulCut: 'hook', turncoat: 'reflect', swash: 'boot', runThrough: 'blade', rollCut: 'hook', parryCut: 'reflect' },
  reaper: { longHaft: 'blade', sunder: 'drop', bloodMark: 'eye', fullCircle: 'blade', rend: 'drop', coldComfort: 'blade', winnow: 'eye', gleaner: 'skull', press: 'twin', bidden: 'skull', ossuary: 'skull', dueRites: 'drop', secondDeath: 'skull', graveProvides: 'skull', drainWalk: 'boot', longPassing: 'skull', wardPull: 'hook', lastRites: 'drop', deepRed: 'heart', gripAll: 'blade', overflow: 'ring' },
  warden: { keenPoint: 'blade', throughAndThrough: 'blade', openPoint: 'eye', ringing: 'bolt', driveHome: 'chev', exact: 'eye', deepSet: 'blade', spearhead: 'blade', wideGuard: 'shield', standFast: 'shield', sendBack: 'reflect', counterpoise: 'eye', widerRow: 'ring', everReady: 'bolt', spitted: 'blade', holdTheLine: 'shield', vaulter: 'boot', giveGround: 'boot', longVault: 'boot', pinTwist: 'drop', freeHand: 'bolt', airPoint: 'boot', holdThem: 'hourglass', skirmisher: 'boot' },
  /* THE GEOMANCER: ten passives, ten glyphs. pillar, slab, fall, stones, shards, rune and wave are drawn in main.js's talIcon in her stone, moss and amber */
  /* THE BERSERKER (claude/berserker): his rage is a flame, his frenzy's heal a drop, the throw a chevron, the brace a shield */
  berserker: { bzCool: 'hourglass', bzLong: 'hourglass', bzHot: 'flame', bzPrice: 'drop', bzChain: 'twin', bzBurn: 'flame', bzMist: 'eye', bzBite: 'blade', bzReturn: 'reflect', bzStagger: 'chev', bzWide: 'ring', bzSpinChop: 'blade', bzHaft: 'chev', bzSplit: 'blade', bzBraceLong: 'shield', bzBraceBack: 'reflect', bzScar: 'drop', bzUnflinch: 'shield', bzIronBrace: 'shield', bzHide: 'boot', bzUnbowed: 'skull' },
  geomancer: { geoTall: 'pillar', geoLasting: 'slab', geoHardLand: 'fall', geoFourth: 'stones', geoReturn: 'reflect', geoShrapnel: 'shards', geoBulwark: 'shield', geoRumble: 'rune', geoAftershock: 'ring', geoWideQuake: 'wave' },
};
