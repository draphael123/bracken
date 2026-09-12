// tools/newlevel.mjs — the things a new level keeps forgetting.
// Every item here is something that went wrong in a real playtest and had to be pointed out. The six other tools
// check the SHAPE of a level (can you reach it, can you get out, is it dressed). This one checks that a level has
// been PLUGGED IN: the difficulty slope, its own music, voices for its creatures, a road on the world map, a
// checkpoint before its boss, water that sits in the land rather than on it, and a boss with more than one idea.
// usage: node tools/newlevel.mjs [levelId]
import fs from 'fs';
import { LEVELS, T } from '../src/level.js';

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const audio = fs.readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
const want = process.argv[2] || null;
const TS = 16;
let problems = 0;
const say = (id, msg) => { console.log('  ' + id.padEnd(10) + msg); problems++; };

// what main.js knows
const tierTable = (main.match(/const TIER = \{([^}]*)\}/) || [, ''])[1];
const tiers = new Set([...tierTable.matchAll(/(\w+):/g)].map(m => m[1]));
const tracks = new Set([...(audio.match(/const TRACKS = \{([^}]*)\}/) || [, ''])[1].matchAll(/(\w+):/g)].map(m => m[1]));
const voices = new Set([...audio.matchAll(/^  (\w+)\(\) \{/gm)].map(m => m[1]));
const hurtBlock = audio.slice(audio.indexOf('const HURT = {'));
const hasVoice = t => new RegExp('^  ' + t + '\(\)', 'm').test(hurtBlock);
const mapNodes = [...main.matchAll(/id: '(\w+)', kind: 'level'/g)].map(m => m[1]);
const foeTypes = new Set([...(main.match(/const EHP = \{([\s\S]*?)\};/) || [, ''])[1].matchAll(/(\w+):/g)].map(m => m[1]));

const musicUsed = new Map();
for (const lv of LEVELS) { if (lv.hidden) continue; const m = lv.build().music; if (m) musicUsed.set(m, (musicUsed.get(m) || []).concat(lv.id)); }

for (const lv of LEVELS) {
  if (lv.hidden || (want && lv.id !== want)) continue;
  const L = lv.build(), id = lv.id;
  const before = problems;

  // 1. THE SLOPE: without this its foes fight at first-wood strength
  if (!tiers.has(id)) say(id, 'is not in the TIER table in main.js: its foes and their blows never scale');

  // 2. ITS OWN THEME
  if (!L.music) say(id, 'has no music set');
  else if (!tracks.has(L.music)) say(id, `music '${L.music}' is not in TRACKS in audio.js`);
  else { const sharers = (musicUsed.get(L.music) || []).filter(x => x !== id); if (sharers.length) say(id, `shares its theme '${L.music}' with ${sharers.join(', ')}`); }

  // 3. A VOICE FOR EVERY CREATURE IT PLACES
  const placed = [...new Set(L.ents.filter(e => foeTypes.has(e.t)).map(e => e.t))];
  const mute = placed.filter(t => !hasVoice(t));
  if (mute.length) say(id, 'creatures with no hurt voice (they fall back to the generic hit): ' + mute.join(', '));

  // 4. A ROAD ON THE WORLD MAP
  if (!mapNodes.includes(id)) say(id, 'has no node in any NODES list in main.js: there is no way to it on the map');

  // 5. A CHECKPOINT BEFORE THE BOSS, OUTSIDE THE ARENA
  if (L.arena && L.arena.boss) {
    const trig = L.arena.trigger !== undefined ? L.arena.trigger : L.arena.x0;
    const checks = L.ents.filter(e => e.t === 'check').map(e => e.x * TS);
    const before2 = checks.filter(x => x < trig);
    if (!before2.length) say(id, 'has no checkpoint before the boss trigger');
    else { const d = (trig - Math.max(...before2)) / TS;
      if (d > 40) say(id, `the last checkpoint is ${Math.round(d)} tiles before the boss: a death costs that walk every time`); }
  }

  // 6. WATER THAT SITS IN THE LAND, NOT ON IT
  for (const p of (L.pools || [])) {
    if (p.streetTide || p.arenaTide || p.tide || p.draining || p.sea) continue;
    const x0 = Math.floor(p.x0 / TS), x1 = Math.floor((p.x1 - 1) / TS);
    let floating = 0, n = 0;
    for (let x = x0; x <= x1; x += Math.max(1, Math.floor((x1 - x0) / 12))) {
      const surf = Math.floor(p.y / TS); n++;
      let ground = -1;
      for (let y = surf; y < L.H; y++) { const t = L.grid[y * L.W + x]; if (t === T.SOLID || t === T.CRATE) { ground = y; break; } }
      if (ground === surf) floating++; // solid begins at the very row the surface is in: the water is laid on top of the land
    }
    if (n && floating / n > 0.6) say(id, `a pool at x ${x0}-${x1} has its surface on top of the ground (it will read as a slab of water flying over the land)`);
  }

  // 7. A BOSS WITH MORE THAN ONE IDEA
  if (L.arena && L.arena.boss) {
    const b = L.arena.boss, line = main.split('\n').find(l => l.includes(`e.t === '${b}'`) && l.includes('frame ='));
    if (line) { const tells = [...new Set([...line.matchAll(/(\w+Tell)\s*:/g)].map(m => m[1]))];
      if (tells.length < 2) say(id, `boss '${b}' shows ${tells.length} wind-up${tells.length === 1 ? '' : 's'} in its frame table: it probably needs another attack`); }
  }

  if (problems === before) console.log('  ' + id.padEnd(10) + 'plugged in.');
}
console.log(problems ? `\n${problems} thing${problems === 1 ? '' : 's'} to plug in.` : '\nevery level is plugged in.');
