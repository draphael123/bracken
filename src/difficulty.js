// src/difficulty.js - THE DIFFICULTY MODES: VERY EASY ('story'), NORMAL, MASTER (claude/difficulty, Daniel's 10-14 interview; scratch/brief-difficulty.md).
//
// ONE TABLE. Every system that changes with the mode reads its number here, through df(key). NORMAL IS THE IDENTITY: every multiplier 1, every
// adder 0, every rule the one the game had before this file - so every existing tune, row and check holds on Normal (tools/difficulty.mjs asserts it).
// These sit ON TOP of the older per-wood dial (main.js DIFF: easy/normal/hard/expert's take/ehp/bhp) and the act's boss pressure dial
// (src/boss-pressure.js): the mode is the save's, the per-wood dial is the wood's (Question for Daniel: retire the per-wood dial once the save picker lands).
//
// THE HOOKS (each in src/main.js unless named; tools/difficulty.mjs greps that every key below is read somewhere in src/):
//   take      damagePlayer0: x on every blow that lands on the hero (after the boss tables and the act dial; hazards' % shares too)
//   stagger   hurtEnemy0: x on the hitstun a hero's blow puts on a creature (Story: they stay rocked longer; Master: they shrug it off sooner)
//   poise     addPoise / the break bar: x on what a blow adds to a foe's or a boss's bar (Master: POISE UP, it builds slower)
//   flinch    false = a creature mid-swing is not flinched out of it by a LIGHT blow (Master: no flinch mid-swing from light hits)
//   parry     perfectWindow() and the tap parry's beat (src/riposte.js PARRY.tap via main.js): x on the parry's timing window
//   open      updateEnemies: a boss's or mini's own clock runs at 1/open while he is OPEN, so every told opening lasts x open (his gold timer bar is
//             drawn off his own clock, so it shows the longer / shorter time). Never touches a windup (B10/B16 stay as authored).
//   gap       updateEnemies: x on the act dial's gap factor (src/boss-pressure.js gapFactor) - his idle clock between attacks (Master: tighter gaps)
//   flaskAdd  src/survival.js flaskMax: + flasks to the max (never under FLASK_MIN)
//   shrine    shrineFill: 'one' (today), 'all' (Story: a shrine refills every flask), 'none' (Master: a shrine refills none; a death still restores all)
//   death     deathCost: 0 = no death cost at all (Story: you keep your silver); 1 = today; >1 = the bank's stake bites harder (Master)
//   punish    PUNISH GREED (Master): a boss or mini in reach answers a flask drink or a WHIFFED heavy with his told reprisal (src/boss-greed.js punish)
//   stale     the stale-blow table (src/anti-mash.js STALE.pay) for this mode - null keeps the shared one (Master tightens it)
// NOT YET IN v1 (built as TODOs for the Master tune lane - see work/claude/lane-done/claude-difficulty.md): COMBO TAILS (one extra told follow-up
// on some boss attacks - per-boss code) and EARLIER PHASES (each boss reads his own hp thresholds; `phase` is here for the lane that wires them).
export const MODES = {
  story:  { label: 'VERY EASY', col: '#8fd160', take: 0.5,  stagger: 1.35, poise: 1,    flinch: true,  parry: 1.4, open: 1.35, gap: 1,    flaskAdd: 1,  shrine: 'all',  death: 0,   punish: false, phase: 0,    stale: null },
  normal: { label: 'NORMAL',    col: '#ffd36b', take: 1,    stagger: 1,    poise: 1,    flinch: true,  parry: 1,   open: 1,    gap: 1,    flaskAdd: 0,  shrine: 'one',  death: 1,   punish: false, phase: 0,    stale: null },
  master: { label: 'MASTER',    col: '#ff6b6b', take: 1.35, stagger: 0.8,  poise: 0.75, flinch: false, parry: 0.8, open: 0.8,  gap: 1.15, flaskAdd: -1, shrine: 'none', death: 1.5, punish: true,  phase: 0.1,  stale: [1, 0.8, 0.65, 0.5] },
};
export const MODE_IDS = ['story', 'normal', 'master'];
export const FLASK_MIN = 1;
/* the names a tool or a URL may use: ?difficulty=easy|story|veryeasy|normal|master */
const ALIAS = { easy: 'story', veryeasy: 'story', 'very-easy': 'story', story: 'story', normal: 'normal', master: 'master', hard: 'master' };
export const modeId = s => ALIAS[String(s || '').toLowerCase()] || null;

/* THE MODE IN FORCE: a dev/test override (?difficulty=..., or setOverride from a tool) wins; else the save's (setSaveMode, main.js boot and
   loadSlot hand it PROG.mode); else normal. Nothing here touches storage - the save owns it. */
let saveMode = 'normal', override = null;
try { if (typeof location !== 'undefined' && location.search) { const q = new URLSearchParams(location.search).get('difficulty'); if (modeId(q)) override = modeId(q); } } catch {}
export const setSaveMode = m => { saveMode = modeId(m) || 'normal'; return saveMode; };
export const setOverride = m => { override = m == null ? null : (modeId(m) || null); return override; };
export const mode = () => override || saveMode;
export const row = () => MODES[mode()] || MODES.normal;
export const df = k => { const r = row(); return k in r ? r[k] : MODES.normal[k]; };
export const isMaster = () => mode() === 'master';

/* THE PICKER'S RULES (Daniel's recs, built; the picker UI + save storage is the Sonnet lane's):
   - Very Easy <-> Normal any time, no lock.
   - MASTER UNLOCKS AFTER A NORMAL CLEAR: device-wide (localStorage 'bracken.masterUnlocked') once any save beats the current final main-road boss on
     Normal; it stays unlocked as acts are added. ?difficulty=master always works (tests, tune lanes).
   - A Master save can drop to Normal but never come back to Master. */
export const UNLOCK_KEY = 'bracken.masterUnlocked';
export function masterUnlocked() { try { return localStorage.getItem(UNLOCK_KEY) === '1'; } catch { return false; } }
export function unlockMaster() { try { localStorage.setItem(UNLOCK_KEY, '1'); } catch {} }
/* may a save go from `from` to `to`? prog.masterDropped: this save once left Master */
export function canSwitch(from, to, prog = {}, unlocked = masterUnlocked()) {
  from = modeId(from) || 'normal'; to = modeId(to) || 'normal'; if (from === to) return true;
  if (to === 'master') return from !== 'master' && !prog.masterDropped && !prog.modeChosen ? unlocked : false;   /* Master is chosen at a save's creation only */
  if (from === 'master') return to === 'normal';                                                              /* down to Normal, never back */
  return true;                                                                                                 /* story <-> normal, any time */
}
