/* tools/ambient-landmarks.mjs - EVERY LEVEL HAS ITS OWN AIR, AND ONLY WAYMEET HAS WAYMEET'S FURNITURE (claude/identity0, Daniel 2026-10-03).
   From the identity audit (scratch/audit-identity.md): towns, fires and halls played the wood's birdsong because a level with no ambient zone
   (or a gap between zones) silently falls back to 'forest' (main.js), and six levels stood on the same dovecote / lychgate / stocks.
     1. every CAMPAIGN level (trial yards, the custom wood and the shops are not) lists ambient zones that cover it from x = 0 to its far edge with
        no gap, every kind of them a real bed (AMBIENT_NAMES), and 'forest' only where a wood is: BRACKEN WOOD and KINGSWOOD's open stretches.
     2. the three synth beds (fire, crowd, barn) exist in src/audio.js.
     3. the lychgate / dovecote / stocks set is WAYMEET'S alone: not auto-placed (src/landmarks.js) and not authored as a level deco, with two
        reasoned exemptions (EXEMPT below). Kingswood's flats carry no beehives or birdhouses. */
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs';
import { LEVELS, TS } from '../src/level.js';
import { villageLandmarks, woodLandmarks, WAYMEET_ID } from '../src/landmarks.js';
install();
const fails = [];
const audioSrc = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
const NAMES = (audioSrc.match(/export const AMBIENT_NAMES = \[([^\]]*)\]/) || [, ''])[1].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
for (const k of ['fire', 'crowd', 'barn']) {
  if (!NAMES.includes(k)) fails.push(`AMBIENT_NAMES lacks the '${k}' bed`);
  if (!audioSrc.includes('  ' + k + '() {')) fails.push(`src/audio.js SYNTH_BEDS has no ${k}() bed`);
}
const SKIP = id => /^(trial_|shop|custom)/.test(id);
const FOREST_OK = new Set(['wood', 'kings']);   /* a wood is a wood: no other level plays the birds */
const SET = ['dovecote', 'lychgate', 'stocks'];
/* reasoned exemptions, Daniel to overrule: the Monastery's churchyard (its graves, yew and lychgate) and its garden dovecote, and the Hanging Village's one
   dovecote, are authored set pieces of those levels; the Unburied Field's battlefield churchyard gate is its own landmark (src/main.js placeLandmarks 'battlefield') */
const EXEMPT = { spire: ['lychgate', 'dovecote'], hanging: ['dovecote'], unburied: ['lychgate'] };
const rows = [];
for (const lv of LEVELS) {
  if (SKIP(lv.id)) continue;
  let L; try { L = lv.build(); } catch (e) { fails.push(`${lv.id}: build threw ${e.message}`); continue; }
  const edge = (L.W || 0) * TS, zones = (L.ambient || []).slice().sort((a, b) => a.x0 - b.x0);
  if (!zones.length) fails.push(`${lv.id}: no ambient zones (silently plays the wood's birdsong)`);
  else {
    if (zones[0].x0 > 0) fails.push(`${lv.id}: ambient starts at x=${zones[0].x0}, not 0 (the first stretch plays forest)`);
    for (let i = 1; i < zones.length; i++) if (zones[i].x0 > zones[i - 1].x1 + 1) fails.push(`${lv.id}: ambient gap ${zones[i - 1].x1}..${zones[i].x0} (plays forest)`);
    if (zones[zones.length - 1].x1 < edge) fails.push(`${lv.id}: ambient ends at x=${zones[zones.length - 1].x1}, before the level's edge ${edge} (plays forest)`);
    for (const z of zones) {
      if (!NAMES.includes(z.kind) && !['water', 'hive', 'rain', 'crowd'].includes(z.kind)) fails.push(`${lv.id}: ambient kind '${z.kind}' is not a bed in AMBIENT_NAMES`);
      if (z.kind === 'forest' && !FOREST_OK.has(lv.id)) fails.push(`${lv.id}: plays forest birdsong (only the woods may)`);
    }
  }
  const dress = (L.palette && L.palette.dress) || 'wood';
  const auto = [...villageLandmarks(lv.id, dress), ...(dress === 'wood' ? woodLandmarks(lv.id) : [])].map(e => e[0]);
  const authored = (L.ents || []).filter(e => e.t === 'deco' && SET.includes(e.kind)).map(e => e.kind);
  for (const k of new Set([...auto, ...authored])) if (SET.includes(k) && lv.id !== WAYMEET_ID && !(EXEMPT[lv.id] || []).includes(k)) fails.push(`${lv.id}: has a ${k} - the lychgate/dovecote/stocks set is Waymeet's alone`);
  if (lv.id === 'kings') for (const k of ['beehive', 'birdhouse']) if (auto.includes(k)) fails.push(`kings: ${k} on the goblin court's flats`);
  rows.push(lv.id.padEnd(13) + zones.map(z => z.kind).join(' > '));
}
if (!villageLandmarks(WAYMEET_ID, 'village').length) fails.push('Waymeet lost its own landmark set');
const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
if (/put\(PROP\.(dovecote|stocks)\b/.test(mainSrc)) fails.push('src/main.js placeLandmarks puts a dovecote/stocks outside src/landmarks.js');
if (process.argv.includes('-v')) console.log(rows.join('\n'));
if (fails.length) { console.error('ambient-landmarks: FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log(`ambient-landmarks: ok (${rows.length} levels have a deliberate ambient; the Waymeet set is Waymeet's alone)`);
