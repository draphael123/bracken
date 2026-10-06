// src/elite-kit.js - ELITES2: THE ELITE'S AFFIX, ITS GUARD, ITS OPENING AND ITS ESCALATION (claude/elites2, Daniel 2026-10-03).
//
// "Make them MORE UNIQUE and MORE CHALLENGING" - and the challenge from DEFENCE, not health (the ELITES2 brief, items 1-3). The moves of
// each kind live in src/main.js (updateElite<Kind>, one dispatch line a kind, where tools/tells.mjs audits every mark); this module is
// the rest of what makes an elite a fight, on the hooks COMBAT PART 2 left (src/foe-react.js act(): the act's mashAt):
//
//   THE AFFIX       one HAND-PICKED affix per placed elite (AFFIX_AT below: level|kind, #n for the nth of a kind by column, #amb for an
//                   ambush room's captain; a level ent's own `affix` wins). Named under the plate ("THE FIRST KNIFE - BURNING") with a
//                   pip of its colour by the crown. Never stacked: one each.
//                     BURNING      a fire trail where he walks (still fire: it burns you, not his own); walk him through water and he
//                                  is DOUSED for a while
//                     VENOMOUS     a blow of his that lands poisons you (the venom bar, P.venomT)
//                     SHIELDED     his front turns every light cut (a clank and GO ROUND) - go round, or a heavy blow goes through
//                     SWIFT        quicker on his feet, and his tells shorter (never under 0.35 s)
//                     SUMMONER     he calls two of the level's own at 70% health (a told windup with no mark: they strike on their own)
//                     UNSTOPPABLE  no blow throws him until his poise breaks
//                     THORNED      mash him and his spines come out: a told red !! burst round him (step out of it)
//                     WARDING      every foe near him takes half a blow from the front (the grey pip): kill him first
//   THE GUARD       BY ANGLE (design-standard B11): on his feet and not committed (standing about, or telling a move) his front is guarded -
//                   drawn (the steel edge), and a light cut off it CLANKS and says GUARDED. A heavy blow goes through at half and fills his
//                   poise; a sweep goes under; behind him, and in the blow and the recovery of his own moves, he takes it whole. A SHIELDED
//                   one is guarded through his moves too (GO ROUND). A MASH (the act's mashAt cuts in 2 s) is answered with a told RIPOSTE
//                   (a yellow !) - or a THORNED one's spines (a red !!).
//   THE OPENING     his poise fills from blows with weight in them only (main.js addPoise: the heavies-only tier, as a boss outside his
//                   opening); full, it BREAKS: he stands open OPEN_T s - a gold ring round him and a gold timer bar under his plate (the
//                   one shared read, design-standard B10) - and the first blow into it is a RIPOSTE (half as hard again on top of the
//                   broken x1.5).
//   THE ESCALATION  once, at half health, ROUSED: told (a red ring, a roar, the word over his plate); his moves come round sooner and
//                   his affix intensifies (the fire faster, the venom longer, the second call, the ward wider, the spines sooner, the
//                   swift tells shorter still).
import { actOf } from './foe-react.js';

export const AFFIX = {
  BURNING: { col: '#ff9a5c', what: 'a fire trail where he walks; water douses him' },
  VENOMOUS: { col: '#a6e04a', what: 'his blows that land poison you' },
  SHIELDED: { col: '#c9d1dc', what: 'his front turns light cuts: go round, or a heavy goes through' },
  SWIFT: { col: '#bfe6f5', what: 'quicker feet, shorter tells' },
  SUMMONER: { col: '#c8a0ff', what: 'calls two of the level\'s own at 70% health (and two more when roused)' },
  UNSTOPPABLE: { col: '#e0b040', what: 'no blow throws him until his poise breaks' },
  THORNED: { col: '#8fd160', what: 'a mash brings out his spines: a told red burst round him' },
  WARDING: { col: '#9ad0ff', what: 'the foes round him take half a blow from the front: kill him first' },
};
/* WHAT FITS WHERE: by act (src/foe-react.js ACTS), and a few levels whose own rule adds one (the burning village and the castle
   kitchen burn; the marsh and the sporewood poison). No fire at sea; the desert burns and stings. */
export const AFFIX_FIT = {
  1: ['WARDING', 'SHIELDED', 'SUMMONER', 'THORNED', 'SWIFT', 'UNSTOPPABLE'],
  2: ['UNSTOPPABLE', 'SWIFT', 'WARDING', 'SUMMONER', 'SHIELDED', 'THORNED'],
  3: ['SWIFT', 'SHIELDED', 'SUMMONER', 'WARDING', 'UNSTOPPABLE', 'VENOMOUS'],
  4: ['WARDING', 'SUMMONER', 'UNSTOPPABLE', 'THORNED', 'SHIELDED', 'VENOMOUS', 'SWIFT'],
  5: ['BURNING', 'VENOMOUS', 'SWIFT', 'SUMMONER', 'UNSTOPPABLE', 'SHIELDED'],
};
export const LEVEL_FIT = { burning: ['BURNING'], crown: ['BURNING'], marsh: ['VENOMOUS'], spore: ['VENOMOUS'] };
export const affixFits = (id, affix, ambush) => !!AFFIX[affix] && !(ambush && affix === 'SUMMONER') && ((AFFIX_FIT[actOf(id).act] || []).includes(affix) || (LEVEL_FIT[id] || []).includes(affix));
/* THE HAND-PICKED TABLE. One row a placed elite (and one an ambush room's captain, #amb: a room has waves of its own, so no SUMMONER there).
   The key is level|kind, or level|kind#n for the nth of that kind in the level by column. Edit only your own rows. */
export const AFFIX_AT = {
  'wood|shield': 'WARDING', 'wood|shield#amb': 'SHIELDED',
  'marsh|thorn': 'THORNED', 'marsh|thorn#amb': 'VENOMOUS',
  'stockade|brute': 'SUMMONER', 'stockade|archer#amb': 'SWIFT',
  'spore|shield': 'VENOMOUS', 'spore|shield#amb': 'THORNED',
  'kings|brute': 'UNSTOPPABLE', 'kings|archer#amb': 'WARDING',
  'burning|shield': 'BURNING', 'burning|brute#amb': 'BURNING',
  'scree|troll': 'UNSTOPPABLE', 'scree|troll#amb': 'THORNED',
  'hanging|shield': 'SWIFT', 'hanging|brute#amb': 'UNSTOPPABLE',
  'spire|troll': 'WARDING', 'spire|goat': 'SUMMONER', 'spire|troll#amb': 'SWIFT',
  'moor|goat': 'SWIFT', 'moor|troll': 'UNSTOPPABLE', 'moor|goat#amb': 'WARDING',
  'storm|pike': 'SHIELDED', 'storm|pike#amb': 'UNSTOPPABLE',
  'crown|heavy': 'UNSTOPPABLE', 'crown|hearthgob': 'BURNING', 'crown|brute#amb': 'WARDING',
  'longwater|tideguard': 'SHIELDED', 'longwater|tideguard#amb': 'SWIFT',
  'reef|tideguard': 'VENOMOUS',
  'flotilla|boarder': 'SWIFT', 'flotilla|boarder#amb': 'SHIELDED',
  'hurricane|boarder': 'SUMMONER', 'hurricane|cutlass': 'SWIFT', 'hurricane|cutlass#amb': 'WARDING',
  'lamplit|watch': 'WARDING', 'lamplit|watch#amb': 'SHIELDED',
  'deep|watch': 'UNSTOPPABLE',
  'keep|drownedcaptain': 'SHIELDED', 'keep|tideguard': 'SHIELDED',
  'causeway|tideguard': 'SUMMONER', 'causeway|tideguard#amb': 'UNSTOPPABLE',
  'waymeet|hedgeknight': 'SHIELDED', 'waymeet|heavy': 'WARDING', 'waymeet|hedgeknight#amb': 'UNSTOPPABLE',
  'fields|scarecrow': 'SUMMONER', 'fields|scarecrow#amb': 'THORNED',
  'burial|husk#1': 'VENOMOUS', 'burial|husk#2': 'SUMMONER', 'burial|husk#amb': 'WARDING',
  'mage|armour': 'WARDING', 'mage|armour#amb': 'SHIELDED',
  'fallingtower|husk': 'VENOMOUS', 'fallingtower|apprentice#amb': 'WARDING',
  'witchlight|husk': 'SUMMONER', 'witchlight|armour': 'THORNED',
  'oreroad|heavy': 'UNSTOPPABLE', 'oreroad|gaffer#amb': 'SWIFT',
  'unburied|husk#amb': 'VENOMOUS',
  'fair|barker#1': 'WARDING', 'fair|barker#2': 'SUMMONER', 'fair|hobbyhorse': 'SWIFT',
  'canal|gaffer': 'UNSTOPPABLE',
  'caravan|cutthroat': 'SWIFT', 'caravan|scorpion#amb': 'BURNING',
  'welltown|scorpion': 'VENOMOUS', 'redgorge|scorpion': 'BURNING', 'underwell|scorpion': 'UNSTOPPABLE',
};
/* ELITETUNE (claude/elitetune): per-kind health and elite-damage multipliers, measured with tools/elite-lab.mjs toward the human bot's 75-85%
   (docs/elite-lab.json). hp scales the ELITE table's own hp in main.js; dmg scales every blow of his that lands (damagePlayer0). tell = windup length, every = the gap between his moves: both below 1 = sooner; a tell shortened by it never goes under 0.5 s, nor longer than as built. 1 = as built. */
export const TUNE = {
  gaffer: { hp: 1.4, dmg: 1.6, tell: 0.85, every: 0.6 },
  tideguard: { hp: 1.5, dmg: 2.6, tell: 0.85, every: 0.5 },
  hearthgob: { hp: 1.2, dmg: 1.5, tell: 0.85, every: 0.5 },
  watch: { hp: 1.2, dmg: 2.6, tell: 0.85, every: 0.5 },
  boarder: { hp: 1.3, dmg: 1.8, tell: 0.85, every: 0.55 },
  apprentice: { hp: 0.9, dmg: 1.0, tell: 0.85, every: 0.8 },
  brute: { dmg: 1.5, tell: 0.85, every: 0.7 },
  troll: { hp: 1.0, dmg: 1.3, tell: 0.85, every: 0.6 },
  hedgeknight: { dmg: 1.8, tell: 0.85, every: 0.55 },
  cutthroat: { dmg: 3.2, tell: 0.85, every: 0.55 },
  heavy: { dmg: 2.2, tell: 0.85, every: 0.5 },
  shield: { dmg: 1.25, tell: 0.85, every: 0.85 },
  thorn: { dmg: 0.7, hp: 0.85 },
  goat: { dmg: 0.4, hp: 1.0, every: 1.6 },
  cutlass: { hp: 0.8, dmg: 0.7, every: 1.5 },
  archer: { dmg: 0.6, hp: 0.5 },
  scarecrow: { dmg: 0.85, every: 1.1 },
  scorpion: { hp: 1.1, dmg: 0.85 },
  pike: { dmg: 0.85 },
  husk: { dmg: 1.2 },
  hobbyhorse: { dmg: 1.15 },
};
const ONE = { hp: 1, dmg: 1, tell: 1, every: 1 };
export const tuneOf = t => { const r = TUNE[t]; return r ? { hp: r.hp ?? 1, dmg: r.dmg ?? 1, tell: r.tell ?? 1, every: r.every ?? 1 } : ONE; };
export const K = {
  mashWindow: 2.0, guardCd: 1.6, turnT: 0.35,                                              // THE GUARD (by angle) and its answer to a mash
  openT: 3.0, ripMul: 1.35,                                                   // THE OPENING (broken x1.5 in main.js, the riposte on top)
  rouseAt: 0.5, rouseEvery: 0.7, sayT: 1.4,                                   // THE ESCALATION
  swiftTell: 0.85, swiftRoused: 0.72, tellFloor: 0.35, swiftSpeed: 1.3,       // SWIFT
  fireEvery: 0.9, fireRoused: 0.5, fireLife: 2.2, fireDmg: 8, doused: 4,      // BURNING
  venomT: 2.4, venomRoused: 4.0,                                              // VENOMOUS
  wardR: 120, wardRoused: 180,                                                // WARDING
  thornAt: 3, thornRoused: 2, thornTell: 0.5, thornR: 38, thornDmg: 14,       // THORNED
  callAt: 0.7,                                                                // SUMMONER
  ripTell: 0.4, ripReach: 34, ripDmg: 14, ripOpen: 0.5, ripStep: 110,          // THE GUARD'S RIPOSTE
};

export function installEliteKit(api) {
  /* api: { levelId(), P(), time(), near(e, r), inWater(x, y), fire(f), poison(t), ring(x, y, r, col, t), shake(n), sfx(name), number(x, y, s, col), ents(), mod(e), turned(e), onGround(e) } */
  const say = (e, word, col, t) => { e.ekSay = word; e.ekSayCol = col || '#ffd36b'; e.ekSayT = t || K.sayT; };
  /* WHICH ONE HE IS: the level ent he was stood from (its own `affix` first), else the table */
  function key(e) {
    if (e.ekKeyed) return; e.ekKeyed = true; const id = api.levelId();
    if (e.affix === undefined) {
      let k = id + '|' + e.t;
      if (e.ambush) k += '#amb';
      else { const ents = (api.ents() || []).filter(q => q.elite && q.t === e.t).sort((a, b) => a.x - b.x);
        const at = ents.findIndex(q => 'elite:' + q.x + ',' + q.y === e.key); const ent = ents[at];
        if (ent && ent.affix) { e.affix = ent.affix; }
        else if (ents.length > 1 && at >= 0) k += '#' + (at + 1); }
      if (e.affix === undefined) e.affix = AFFIX_AT[k] || null;
    }
    if (e.affix === 'SWIFT' && e.speed) e.speed *= K.swiftSpeed;
  }
  const tell = (e, t0) => { const m = tuneOf(e.t).tell, t = m < 1 ? Math.min(t0, Math.max(0.5, t0 * m)) : t0 * m;   /* (ELITETUNE) the kind's own measured windup */
    return e.affix === 'SWIFT' ? Math.max(K.tellFloor, t * (e.ekRoused ? K.swiftRoused : K.swiftTell)) : t; };
  const every = (e, t) => (e.ekRoused ? t * K.rouseEvery : t) * tuneOf(e.t).every;
  /* ONCE A FRAME, for every elite standing: its timers, the guard coming down into the riposte, the escalation, the affix at work */
  function tick(e, dt) {
    key(e); const P = api.P();
    if (e.ekSayT > 0) e.ekSayT -= dt; if (e.ekClank > 0) e.ekClank -= dt; if (e.ekGuardCd > 0) e.ekGuardCd -= dt; if (e.ekDoused > 0) e.ekDoused -= dt;
    if (e.stagger >= 0.85 && !(e.ekStunT > 0)) e.ekStunT = e.stagger; else if (e.ekStunT > 0) e.ekStunT -= dt;   /* a long stagger (his charge turned, his lunge blocked) opens his guard; a heavy blow's short one does not */
    { const side = Math.sign(P.x - e.x) || e.face || 1; if (e.ekSide === undefined) e.ekSide = e.face || side;   /* HIS GUARD TURNS TO YOU after a beat (K.turnT), whichever way his feet are going: get round him quicker than that */
      if (side !== e.ekSide && Math.abs(P.x - e.x) < 220) { e.ekSideT = (e.ekSideT || 0) + dt; if (e.ekSideT >= K.turnT) { e.ekSide = side; e.ekSideT = 0; } } else e.ekSideT = 0; }
    e.ekGuarding = guarding(e);   /* (drawn: the steel edge across his front) */
    if (!(e.broken > 0)) e.ekOpenT = 0;
    /* THE ESCALATION: once, at half health */
    if (!e.ekRoused && e.hp0 && e.hp > 0 && e.hp <= e.hp0 * K.rouseAt) { e.ekRoused = true; api.ring(e.x, e.y - e.h / 2, 46, '#ff6b6b', 0.5); api.shake(3); api.sfx('roar');
      say(e, e.affix ? 'ROUSED - ' + e.affix : 'ROUSED', '#ff6b6b', 1.8); if (e.affix === 'SUMMONER' && !e.ekCalled2) { e.ekCalled2 = true; e.ekCallPend = true; } }
    const A = e.affix; if (!A) return;
    if (A === 'SUMMONER' && !e.ekCalled1 && e.hp0 && e.hp <= e.hp0 * K.callAt) { e.ekCalled1 = true; e.ekCallPend = true; }
    if (A === 'WARDING' && !(e.broken > 0)) for (const q of api.near(e, e.ekRoused ? K.wardRoused : K.wardR)) q.wallT = Math.max(q.wallT || 0, 0.3);   /* the grey pip over each, half a blow from the front */
    if (A === 'BURNING') {
      if (api.inWater(e.x, e.y - 4)) { if (!(e.ekDoused > 0)) { say(e, 'DOUSED', '#9ad0ff'); api.sfx('hiss'); } e.ekDoused = K.doused; }
      else if (!(e.ekDoused > 0) && !(e.broken > 0) && Math.abs(e.vx || 0) > 12 && api.onGround(e) && (e.ekFireCd = (e.ekFireCd || 0) - dt) <= 0) {
        e.ekFireCd = e.ekRoused ? K.fireRoused : K.fireEvery; api.fire({ x: e.x - (e.face || 1) * (e.w / 2), y: e.y, life: K.fireLife, delay: 0.2, still: true, dmg: K.fireDmg, ekFire: true }); } }
  }
  /* IS HE GUARDING: on his feet and not committed - standing about, walking, or in the WINDUP of a move (he holds his weapon up
     while he tells it). In the blow and its recovery he is open; thrown, broken or stunned by his own failed move he is open (a heavy blow's little stagger does not drop it). A SHIELDED one's front is up
     through his blows and recoveries too: only his back, a sweep, a plunge or his broken poise get past it. */
  const guarding = e => !!e.alive && !(e.broken > 0) && !(e.knock > 0) && !(e.frozen > 0) && !(e.ekStunT > 0) &&
    (e.affix === 'SHIELDED' || !e.elBack || /Tell$/.test(e.mode || ''));
  /* A BLOW ON HIM (main.js hurtEnemy0, before anything else reads it): false means it is TURNED.
     GUARD BY ANGLE (design-standard B11): a hero's light cut (a cut, a rising cut, a dash cut) off his guarded front is turned - the clank,
     the sparks, COVERED and GUARDED (GO ROUND for a SHIELDED one); a heavy blow goes through it at half (and fills his poise - the way to
     his opening); a sweep goes under it, a plunge comes over it; from behind, and in the blow and the recovery of his own moves, it lands
     whole. A MASH (the act's mashAt light cuts inside mashWindow, turned or not) is answered: a told riposte, or a THORNED one's spines.
     Then the riposte into his broken poise. (Fire, a throw, a hazard: no guard - the guard is for blades.) */
  const kindOf = b => Array.isArray(b) ? (b.includes('heavy') ? 'heavy' : b.includes('sweep') ? 'sweep' : b.includes('plunge') ? 'plunge' : b[0]) : b;
  function take(e, dmg, fromX, plunge, blow) {
    const k = kindOf(blow), blade = !plunge && (k === 'light' || k === 'rise' || k === 'dash' || k === 'heavy');
    if (dmg > 0 && blade && !(e.broken > 0)) {
      const now = api.time();
      if (k !== 'heavy') { if (!(now - (e.ekCutAt ?? -99) < K.mashWindow)) e.ekCuts = 0; e.ekCutAt = now; e.ekCuts = (e.ekCuts || 0) + 1;
        const at = e.affix === 'THORNED' ? (e.ekRoused ? K.thornRoused : K.thornAt) : (actOf(api.levelId()) || { mashAt: 3 }).mashAt;
        if (e.ekCuts >= at && !(e.ekGuardCd > 0)) { e.ekCuts = 0; e.ekGuardCd = K.guardCd; if (e.affix === 'THORNED') e.ekThornPend = true; else e.ekRipostePend = true; } }
      const dx = (fromX ?? e.x) - e.x;   /* (a hero stood in his body is in front of him: there is no getting round a man by walking into him) */
      if ((Math.abs(dx) < e.w / 2 + 2 || Math.sign(dx) === (e.ekSide || e.face || 1)) && guarding(e)) {
        e.ekClank = 0.12;
        if (k === 'heavy') dmg = Math.max(1, Math.round(dmg * 0.5));
        else { e.ekTurnedN = (e.ekTurnedN || 0) + 1; say(e, e.affix === 'SHIELDED' ? 'GO ROUND' : 'GUARDED', '#c9d1dc', 0.8); api.turned(e); return false; }
      }
    }
    if (dmg > 0 && e.broken > 0 && e.ekRip) { e.ekRip = false; dmg = Math.round(dmg * K.ripMul); api.number(e.x, e.y - e.h - 22, 'RIPOSTE', '#ffd36b'); api.ring(e.x, e.y - e.h / 2, 24, '#ffd36b', 0.3); }
    return dmg;
  }
  /* HIS POISE BROKE (main.js breakBeat): the opening */
  function broke(e) {
    e.broken = Math.max(e.broken || 0, K.openT); e.stagger = Math.max(e.stagger || 0, e.broken); e.poiseCd = e.broken + 3; e.ekOpenT = e.broken; e.ekRip = true; e.ekRipostePend = false; e.ekThornPend = false; e.vx = 0;
    say(e, 'OPEN', '#ffd36b', Math.min(K.openT, 1.6));
  }
  /* A BLOW OF HIS LANDED (main.js damagePlayer) */
  function landed(e) { if (e.affix === 'VENOMOUS') api.poison(e.ekRoused ? K.venomRoused : K.venomT); }
  /* NOTHING THROWS HIM (main.js knockFoe) */
  const unmoved = e => e.affix === 'UNSTOPPABLE' && !(e.broken > 0);
  return { K, AFFIX, key, tick, guarding, take, broke, landed, unmoved, tell, every, say };
}
