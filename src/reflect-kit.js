// src/reflect-kit.js - THE SKY FIGHT'S REFLECT RULE, PER KIT, AS DATA (lane S2 DEMONKING, claude/demonking, 11-04).
// Design: scratch/lane-reports/heartplan.md section 3 "The reflect rule" + "Per-kit reflect table"; Daniel 11-04 (overrides the older table):
//   ANY attack that meets a HELLBOLT returns it (one pip). A PARRY / GUARD ON THE BEAT returns it bigger and faster (a POWER RETURN, two pips,
//   never batted back). A held guard off the beat BLOCKS it (no damage, no pip). For ALL 12 heroes - the 9 live ones, the Rimebinder, the
//   Demon Hunter and the DESERT PRIEST (the 12th hero, kit src/sun-priest.js, a light caster of the Pyromancer's family).
// HOW main.js KNOWS (src/demon-king-hands.js):
//   a BLOW or a SHOT meets a bolt   every hellbolt is a tiny entity in main.js's `enemies`, so every blow box and every hero projectile that can hit
//                                   a foe can hit a bolt - no per-kit code. hurtEnemy's TAG names the verb ('light', 'heavy', 'shot', 'throw', ...).
//   ON THE BEAT                     the bolt reaching a hero goes through damagePlayer, whose per-hero branches already ask src/riposte.js onBeat()
//                                   and call RP.parried() for EVERY hero's own guard on the beat (PARRY_LOOK). A parried bolt = a power return.
//   A HELD GUARD OFF THE BEAT       damagePlayer says 'blocked' and nothing was parried = the bolt pops, no pip.
// This file is pure data + one classifier, so lane S3 (REFLECTKIT, per-hero probes) and the tune lane read one table.

/* the verbs any hero hand can carry (main.js hurtAs tags + src/riposte.js VERB_OF): ALL of them return a bolt they meet */
export const RETURN_TAGS = new Set(['light', 'heavy', 'sweep', 'rise', 'plunge', 'dash', 'shot', 'throw', 'riposte', 'cut', 'skill', null, undefined]);
/* what is NOT the hero's attack meeting the bolt: a burn or bleed TICK (a status, not a blow), and the room's own props. The bolt ignores them. */
export const NOT_A_RETURN = new Set(['burn', 'bleed', 'poison', 'tick', 'hazard', 'room', 'reflect']);

/* THE TABLE. id = main.js hero id (PROG.hero). normal = the verbs that return a bolt (data for the moves list / S3's probes; every one of them goes
   through the same hurtEnemy path). power = the hero's ON-THE-BEAT answer (src/riposte.js PARRY_LOOK where the hero has one) - what makes a POWER
   return. block = what a held guard off the beat does. powerAlso = a second power verb some kits carry by the plan (a tag + a hero-state test the
   hands can fill; until lane S3 wires the field it reads, it falls back to a NORMAL return - never a free power return). notes = the kit's quirks. */
export const REFLECT_KIT = {
  knight: { name: 'THE KNIGHT', normal: ['sword cut', 'heavy cut', 'shield bash', 'pogo / plunge off it'], power: { look: 'PERFECT GUARD', input: 'raise C (hold) as the bolt lands', via: 'parry' },
    block: 'held shield: the bolt pops, no pip', notes: 'his riposte window after a power return is his usual heavy riposte' },
  warden: { name: 'THE WARDEN', normal: ['any thrust (tip or haft)', 'UP+X overhead (high bolts)', 'javelin throw'], power: { look: 'SPEAR DEFLECT', input: 'tap C as the bolt lands', via: 'parry' },
    block: 'braced spear: pops', notes: 'one flat return value for every hero: her tip rule (x1.3) does NOT apply to returns (fairness, heartplan)' },
  pyro: { name: 'THE PYROMANCER', normal: ['staff cut', 'fireball (any step)', 'fire stomp ring'], power: { look: 'FLAME-CATCH', input: 'tap C as the bolt lands (the flame ward\'s first 0.15 s)', via: 'parry' },
    block: 'flame ward held: pops', notes: 'a step-3+ fireball meeting a bolt explodes AND returns it - ONE return (a returned bolt ignores the blast)' },
  pirate: { name: 'THE FREEBOOTER', normal: ['cutlass', 'pistol ball'], power: { look: 'HOOK CATCH', input: 'tap C as the bolt lands', via: 'parry' },
    block: 'a late hook: pops', notes: 'the hook catch seats the pistol as usual' },
  paladin: { name: 'THE PALADIN', normal: ['maul', 'hammer throw', 'verdict strike (if it meets)'], power: { look: 'LIGHT-WARD', input: 'raise the aegis (hold C) as the bolt lands', via: 'parry' },
    block: 'held light-ward: pops', notes: '' },
  geomancer: { name: 'THE GEOMANCER', normal: ['stave', 'stone shard', 'fault-line spike'], power: { look: 'STONE-SKIN (rune-ward)', input: 'raise the rune-ward (hold C) as the bolt lands', via: 'parry' },
    block: 'held rune-ward: pops', notes: 'her stones plant FLAT on the back (no pillar step) - heartplan Q5 rec; lane S3 routes her floor verbs through SKH.plant' },
  reaper: { name: 'THE BLOOD KNIGHT', normal: ['red rhythm cuts', 'blood lash', 'crimson crescent wave', 'heavy (any tier)'], power: { look: 'BLADE BIND', input: 'let go of the blood ward (C) as the bolt lands', via: 'parry' },
    powerAlso: { tag: 'heavy', minTier: 2, look: 'FIVE-TIER HEAVY (tier 2+)' },
    block: 'blood ward held: pops', notes: 'the universal parry gave him a beat answer (BLADE BIND); the plan\'s tier-2+ heavy stays as a SECOND power verb' },
  berserker: { name: 'THE BERSERKER', normal: ['flurry', 'chops', 'whirl', 'hatchet throw'], power: { look: 'TAKE IT', input: 'raise the crossed axes (hold C) as the bolt lands', via: 'parry' },
    block: 'crossed axes held: pops', notes: '' },
  ranger: { name: 'THE RANGER', normal: ['any arrow (tapped or drawn)', 'knife', 'DOWN+X shot'], power: { look: 'BOW-BASH', input: 'tap C as the bolt lands', via: 'parry' },
    powerAlso: { tag: 'shot', steady: true, look: 'STEADY SHOT through the bolt' },
    block: 'none: the bash is a parry only (a bash off the beat is a hit - she has no held guard; she rolls or ducks)', notes: 'arrows that fall on the back stay on the drake (lane S3: ranger.js isSolid through SKH.solidAt, wired in main.js)' },
  rimebinder: { name: 'THE RIMEBINDER', normal: ['staff', 'frost bolt', 'rime lance'], power: { look: 'ICE WALL', input: 'tap C as the bolt lands (her parry)', via: 'parry' },
    block: 'ice wall held: pops', notes: 'her THRALLS do not return bolts (no free pips) - the thrall is not her hand', exclude: ['thrall'] },
  demonhunter: { name: 'THE DEMON HUNTER', normal: ['blades', 'dash-through cut'], power: { look: 'THE DASH ON THE BEAT', input: 'dash through the bolt as it lands (i-frame pass)', via: 'parry' },
    block: '-', notes: 'only if he exists before this fight is replayed; his parry hook must call RP.parried like the others (S3)' },
  sunpriest: { name: 'THE DESERT PRIEST', normal: ['staff blows', 'THE BEAM (hold X) through the bolt', 'SUNFALL ring (the plunge)'], power: { look: 'THE FLARE', input: 'hold C so the flare goes off as the bolt lands', via: 'parry' },
    block: '-', notes: 'kit src/sun-priest.js (light caster, Pyromancer family). His tap C is CONSECRATE (a patch, not a guard), so his beat answer is THE FLARE (it already "stops every wind-up within 3 tiles"); lane S3 adds the RP.parried call to the flare when his kit is wired. Radiance fills on the back (S1: back.lit)' },
};
/* the default a NEW hero inherits (heartplan): any blow or shot returns; its tap-C guard on the beat (or, with none, its charged release) = power */
export const DEFAULT_KIT = { name: 'ANY NEW HERO', normal: ['any blow', 'any shot'], power: { look: 'ITS GUARD ON THE BEAT', input: 'its tap-C guard on the beat; with none, its charged release', via: 'parry' }, block: 'its held guard: pops', notes: 'inherited rule' };
export const KIT_IDS = Object.keys(REFLECT_KIT);
export const kitOf = id => REFLECT_KIT[id] || DEFAULT_KIT;

/* ONE CLASSIFIER, every hero. meet:
     { via: 'blow' | 'shot', tag (string or array), who? ('thrall'...), tier?, steady? }   a hero hand met a bolt in flight
     { via: 'body', result: 'blocked' | 'hit' | false, parried: bool }   the bolt reached the hero's body (damagePlayer's answer)
   -> 'power' | 'normal' | 'block' | 'hit' | 'miss' | null (null: it does not touch the bolt) */
export function classify(heroId, meet) {
  const K = kitOf(heroId);
  if (!meet) return null;
  if (meet.via === 'body') {
    if (meet.parried) return 'power';
    if (meet.result === 'blocked') return 'block';
    if (meet.result === 'hit') return 'hit';
    return 'miss';   /* i-frames, a roll, a duck: it flies on */
  }
  if (meet.who && K.exclude && K.exclude.includes(meet.who)) return null;
  const tags = [].concat(meet.tag ?? []);   /* main.js tags a blow with a string OR an array (an arrow: ['heavy', 'shot']) */
  if (tags.some(t => NOT_A_RETURN.has(t))) return null;
  const pa = K.powerAlso;
  if (pa && tags.includes(pa.tag) && (pa.minTier === undefined || (meet.tier ?? -1) >= pa.minTier) && (!pa.steady || meet.steady === true)) return 'power';
  return 'normal';
}
