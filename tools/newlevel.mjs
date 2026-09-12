// tools/newlevel.mjs — the things a new level keeps forgetting.
// Every item here is something that went wrong in a real playtest and had to be pointed out. The six other tools
// check the SHAPE of a level (can you reach it, can you get out, is it dressed). This one checks that a level has
// been PLUGGED IN: the difficulty slope, its own music, voices for its creatures, a road on the world map, a
// checkpoint before its boss, water that sits in the land rather than on it, and a boss with more than one idea.
// usage: node tools/newlevel.mjs [levelId]
import fs from 'fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const audio = fs.readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
const want = process.argv[2] || null;
const TS = 16;
let problems = 0;
const say = (id, msg) => { console.log('  ' + id.padEnd(10) + msg); problems++; };
const note = (id, msg) => { notes.push('  ' + id.padEnd(10) + '- ' + msg); };
const notes = [];

// what main.js knows
const tierTable = (main.match(/const TIER = \{([^}]*)\}/) || [, ''])[1];
const tiers = new Set([...tierTable.matchAll(/(\w+):/g)].map(m => m[1]));
const tracks = new Set([...(audio.match(/const TRACKS = \{([^}]*)\}/) || [, ''])[1].matchAll(/(\w+):/g)].map(m => m[1]));
const voices = new Set([...audio.matchAll(/^  (\w+)\(\) \{/gm)].map(m => m[1]));
const hurtBlock = audio.slice(audio.indexOf('const HURT = {'));
const hasVoice = t => new RegExp('^  ' + t + '\(\)', 'm').test(hurtBlock);
const windUp = main.split(String.fromCharCode(10)).find(l => l.includes('const windingUp =')) || '';
const mapNodes = [...main.matchAll(/id: '(\w+)', kind: 'level'/g)].map(m => m[1]);
const foeTypes = new Set([...(main.match(/const EHP = \{([\s\S]*?)\};/) || [, ''])[1].matchAll(/(\w+):/g)].map(m => m[1]));
// a boss's update function, whatever it is called: updateDrowned, updateQuarter, updateReefmaw...
const updateOf = b => {
  const names = [...main.matchAll(/^function (update\w+)/gm)].map(m => m[1]);
  const hit = names.find(n => n.slice(6).toLowerCase() === b.toLowerCase())
    || names.find(n => b.toLowerCase().includes(n.slice(6).toLowerCase()) && n.length > 8)
    || names.find(n => n.slice(6).toLowerCase().includes(b.toLowerCase()));
  if (!hit) return null;
  const i = main.indexOf('function ' + hit); const j = main.indexOf('\nfunction ', i + 1);
  return main.slice(i, j < 0 ? undefined : j); };

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
    if (p.dry || p.depth === 0) continue; // a pool that starts dry is not water yet (the Tollmaster fills his square in his last phase)
    const x0 = Math.floor(p.x0 / TS), x1 = Math.floor((p.x1 - 1) / TS);
    let floating = 0, n = 0;
    for (let x = x0; x <= x1; x += Math.max(1, Math.floor((x1 - x0) / 12))) {
      const surf = Math.floor(p.y / TS); n++;
      let ground = -1;
      for (let y = surf; y < L.H; y++) { const t = L.grid[y * L.W + x]; if (t === T.SOLID || t === T.CRATE) { ground = y; break; } }
      // solid begins at the very row the surface is in. That is only wrong if there is nowhere for the water
      // to BE: a drowned city's street runs under six rows of masonry with its water line inside the stone,
      // and the water you see starts at the vault. So look for open space between the surface and the bottom.
      if (ground === surf) { const bot = p.bottom !== undefined ? Math.floor(p.bottom / TS) : L.H - 1;
        let room = false; for (let y = surf; y <= bot && !room; y++) { const t = L.grid[y * L.W + x]; if (t !== T.SOLID && t !== T.CRATE) room = true; }
        if (!room) floating++; }
    }
    if (n && floating / n > 0.6) say(id, `a pool at x ${x0}-${x1} has its surface on top of the ground (it will read as a slab of water flying over the land)`);
  }

  // 7. A BOSS WITH MORE THAN ONE IDEA, AND EVERY IDEA TOLD BEFORE IT LANDS
  if (L.arena && L.arena.boss) {
    const b = L.arena.boss, fn = updateOf(b);
    if (!fn) say(id, `boss '${b}' has no update function in main.js that the tool can find`);
    else { const tells = [...new Set([...fn.matchAll(/'(\w*[Tt]ell)'/g)].map(m => m[1]))];
      if (tells.length && !windUp.includes(`e.t === '${b}'`)) say(id, `boss '${b}' has tells (${tells.join(', ')}) but is not in windingUp() in main.js: it winds up in silence`);
      else if (tells.length === 1) say(id, `boss '${b}' has one told attack: one idea is not a fight`); }
  }

  // 8. THE BOSS IS ON THE DEATH LIST, OR THE WALLS NEVER OPEN AND THE LEVEL NEVER ENDS
  // (the comment on that line in main.js says so in as many words, and it has caught us twice)
  if (L.arena && L.arena.boss) {
    const b = L.arena.boss;
    const deathLines = main.split('\n').filter(l => l.includes('queenDies('));
    const routed = deathLines.some(l => l.includes(`'${b}'`)) || main.includes(`e.t === '${b}' && mother`) || (b === 'mother' && main.includes('queenDies(mother)'));
    if (deathLines.length && !routed) say(id, `boss '${b}' is not on the boss-death list in main.js: killing it leaves the arena walls shut and the level unfinished`);
  }

  // 9. THE BOSS HAS A NAME ON ITS OWN HEALTH BAR
  if (L.arena && L.arena.boss) {
    const b = L.arena.boss, iq = main.indexOf("'HORNET QUEEN'; text(boss.t");
    const bar = iq < 0 ? '' : main.slice(Math.max(0, iq - 6000), iq); // the chain runs over several lines now
    if (bar && b !== 'queen' && !bar.includes(`boss.t === '${b}'`)) say(id, `boss '${b}' has no branch on the boss bar in main.js: the bar will call it HORNET QUEEN`);
  }

  // 10. THE LEVEL STARTS SOMEWHERE YOU CAN LEAVE
  // (her forecastle was a sealed box for an hour: the start was inside four walls, and every other tool still
  // passed because everything INSIDE the box was reachable. This asks how much of the level the start can see.)
  {
    const R = floodReach(L, T);
    const share = R.footing.size ? R.seen.size / R.footing.size : 1;
    if (share < 0.05) say(id, `the start can only reach ${Math.round(share * 100)}% of the level's footing: it is probably walled in (her forecastle was, and every other tool passed)`);
  }

  // 11. AN ARENA WIDER THAN THE SCREEN PUTS THE BOSS OFF IT
  // (the Captain's first arena was 84 tiles and he froze 32 tiles away behind the range cull; the Quartermaster's
  // is 116 and she can still be off screen when she rides a deck)
  { const OWNS_ROOM = new Set(['roc', 'lance', 'owl', 'quarter', 'forgemaster', 'king', 'spider']); // these were built to range the whole of it
    for (const k of ['arena', 'mini']) { const A = L[k]; if (!A || !A.boss) continue;
      const w = Math.round((A.x1 - A.x0) / TS);
      if (w > 46 && !OWNS_ROOM.has(A.boss)) note(id, `${k} '${A.boss}' is ${w} tiles wide: over about 44 a boss can be off the screen, so clamp whatever carries it`);
    } }

  // 12. THE BOSS THE ARENA NAMES HAS TO BE IN THE LEVEL
  for (const k of ['arena', 'mini']) { const A = L[k]; if (!A || !A.boss) continue;
    if (!L.ents.some(e => e.t === A.boss || e.t === A.boss + 'lord')) say(id, `${k} names boss '${A.boss}' but the level places no such creature`);
  }

  // 13. WATER THAT HURTS MUST SAY SO IN COLOUR
  // (the Flotilla's harbour ate swimmers while being drawn as clean blue sea for a whole round)
  for (const p of (L.pools || [])) if (p.harm && !p.foulCol) say(id, 'a pool with harm has no foulCol: water that hurts has to look like it hurts');

  // 14. NOTHING STANDS IN THE AIR
  // (four hands on the Flotilla, two of them in the Quartermaster's arena, and the audit's whitelist hid them)
  { const solidish = t => t === T.SOLID || t === T.ONEWAY || t === T.CRATE || t === T.PALISADE || t === T.PLANK || t === T.NET
      || t === T.BOUNCER || t === T.SHELF || t === T.PORT || t === T.RAIL || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CRYST || t === T.REED || t === T.CLIMB;
    // what does not stand: swimmers, fliers, things that hang from a thread, and the traps that swing from a roof
    const swims = new Set(['eel', 'siren', 'urchin', 'angler', 'petrel', 'wasp', 'drone', 'spider', 'weaver', 'bat', 'crow', 'harpy', 'kite',
      'lookout', 'marine', 'spit', 'thorn', 'reefmaw', 'roc', 'owl', 'queen', 'gill', 'heart', 'mother', 'shardling', 'suncatcher', 'netter',
      'ram', 'sailer', 'turtle', 'crab', 'heronfoe', 'scout', 'siren']);
    const inWater = e => (L.pools || []).some(p => p.shallow && !p.dry && !p.harm && e.x * TS >= p.x0 - 8 && e.x * TS <= p.x1 + 8 && (e.y + 1) * TS >= p.y - 24 && (e.y + 1) * TS <= (p.bottom || p.y + 40) + 8); // WADING counts; floating over the deep does not
    const floaters = L.ents.filter(e => foeTypes.has(e.t) && !swims.has(e.t) && !solidish(L.grid[(e.y + 1) * L.W + e.x]) && !inWater(e));
    if (floaters.length) say(id, 'creatures standing on nothing: ' + floaters.slice(0, 6).map(e => e.t + '@' + e.x + ',' + e.y).join(' '));
  }

  // 15. A LEVEL WANTS A FIGHT IN THE MIDDLE OF IT, NOT ONLY AT THE END
  if (L.W > 420 && L.arena && L.arena.boss && !(L.mini && L.mini.boss) && !L.ents.some(e => e.big || e.mini)) {
    note(id, 'nothing is named in the middle of it: a level this long wants one fight before the last one');
  }

  if (problems === before) console.log('  ' + id.padEnd(10) + 'plugged in.');
}
console.log(problems ? `\n${problems} thing${problems === 1 ? '' : 's'} to plug in.` : '\nevery level is plugged in.');

if (notes.length) { console.log('-- advice, which is not a bug --'); for (const n of notes) console.log(n); }
