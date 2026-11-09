// THE MAKER'S PALETTE (claude/maker, Daniel 2026-11-09: the level maker comes back as its own mode, with the real
// combat, slopes, the full cast and mechanisms). What you can place, what it is called, and the paged palette screen.
// main.js keeps only thin hooks (ED_TILES / ED_FOES / ED_THINGS come from here; drawEdPalette / edPalClick call here),
// so this lane rarely touches main.js and merges cleanly past the other lanes.
//
// WHAT IS IN THE PALETTE IS MEASURED, NOT HOPED: tools/maker-sweep.mjs places every candidate alone in a plain
// made-by-hand wood, plays it, and lists what breaks. A kind goes in FOES only when it passes there. Kinds that need a
// level's own machinery (water to swim in, an arena, a ship) stay out until the maker can build that machinery.

import { T } from './level.js';
import { SLOPE } from './slopes.js';

export const TILES = [
  ['ERASE', T.AIR], ['STONE', T.SOLID], ['LEDGE', T.ONEWAY], ['SPIKES', T.SPIKE], ['CRATE', T.CRATE],
  ['SLOPE UP', SLOPE.R1], ['SLOPE DOWN', SLOPE.L1],
  ['GENTLE UP 1', SLOPE.R2A], ['GENTLE UP 2', SLOPE.R2B], ['GENTLE DOWN 1', SLOPE.L2B], ['GENTLE DOWN 2', SLOPE.L2A],
  ['PLANK', T.PLANK], ['ROPE LADDER', T.NET], ['SPRING', T.BOUNCER], ['SHELF', T.SHELF], ['DOOR', T.PORT],
  ['ROCK FACE', T.CLIMB], ['RAIL', T.RAIL], ['SOFT ROCK', T.SOFT], ['ICE', T.ICE], ['WEB', T.WEB], ['CRYSTAL', T.CRYST],
  ['REEDS', T.REED], ['PALISADE', T.PALISADE],
];

// Every foe kind the game's spawner knows (src/main.js spawnEnt, the cases that push an enemy and are not a boss) that
// spawns, survives and FIGHTS alone in a plain made-by-hand wood. tools/maker-sweep.mjs re-tests every one of them.
// LEFT OUT, and why (2026-11-09 sweep, re-run with tools/maker-sweep.mjs):
//  - need WATER the maker cannot pour yet: urchin angler puffer jelly lamprey gar
//  - need their level's machinery: imp turret (a workshop's shot list), gravewarden (his grave arena), marionette (the theatre)
//  - are another kind's skin (spawn as that kind): squirrel (thief), bonearcher (archer)
//  - MINIS asleep until their arena wakes them (the BOSSES group's job): homunculus ploughman lampreeve gangleader deacon
//    barrowrider magechase sexton hedgewarden greathound familiar courtier attendant scalder seawitch stormshaman
//  - wait on a trigger a plain wood does not have: lookout siren grindylow tippler horn holdfast crossbow corpse clinger
//    sweep spitcap dummy, weaver (hangs from a ceiling: on open ground it never comes down)
export const FOES = [
  'sprig', 'shield', 'spit', 'wasp', 'thorn', 'archer', 'hopper', 'sapper', 'brute', 'cutlass', 'boarder',
  'marine', 'bosun', 'topiary', 'armour', 'piece', 'broom', 'mimic', 'tome', 'scarecrow', 'rook', 'farmhand',
  'pumpkin', 'marshlight', 'haunt', 'boo', 'feeler', 'grapnel', 'powdermonkey', 'watch', 'sailor', 'netter',
  'merrowspear', 'merrowcaller', 'merrowbrute', 'whelp', 'oathblade', 'drownedknight', 'manta', 'petrel',
  'turtle', 'heronfoe', 'crab', 'scout', 'tideguard', 'soldier', 'javelin', 'heavy', 'hound', 'wickling',
  'scorpion', 'sandgob', 'cutthroat', 'slinger', 'stagehand', 'mummer', 'leech', 'honeyhornet', 'swarm',
  'stiltwalker', 'construct', 'hawkscout', 'orderpaladin', 'deadpriest', 'fogwraith', 'skitter', 'waterthief',
  'raptor', 'kiterider', 'trophyhunter', 'willowisp', 'hobbyhorse', 'wickerman', 'stringjack', 'hornsman',
  'barker', 'ambusher', 'vulture', 'folk', 'thief', 'pike', 'miner', 'sheargob', 'gaffer', 'grub', 'rockgoblin',
  'kite', 'crow', 'bale', 'badger', 'hare', 'wight', 'prise', 'swornsword', 'hedgeknight', 'runner', 'acolyte',
  'lancer', 'drunk', 'bannerbearer', 'zombie', 'husk', 'apprentice', 'lanternshade', 'bellguard', 'propman',
  'spider', 'shardling', 'fledgling', 'gobpriest', 'gobmage', 'sentry', 'bellman', 'assassin', 'berserker',
  'drummer', 'butcher', 'hearthgob', 'temperer', 'burngob', 'emberwisp', 'bonegob', 'cutter', 'snuffer',
  'sailer', 'harpy', 'galeharpy', 'shrieker', 'goat', 'royalboar', 'sporeling', 'lurker', 'drone',
  'shaman', 'gill'
];

export const THINGS = ['coin', 'silver', 'check', 'gate', 'sign', 'torch', 'brazier', 'barrel', 'glow', 'puffball',
  'lantern', 'firepit', 'rockfall', 'vent', 'npc'];

// names: the bestiary's, where it has one (main.js BEASTS), else the id in capitals
let NAMES = {};
export function setNames(beasts) { NAMES = {}; for (const b of beasts || []) if (b && b.t && b.name) NAMES[b.t] = b.name.replace(/^THE /, ''); }
export const nameOf = t => NAMES[t] || String(t).toUpperCase();

// ---------------- the palette screen, paged ----------------
const BW = 96, BH = 11, X0 = 8, Y0 = 26, ROWS = 12;
const page = {};   // category -> page shown
const perPage = VW => Math.max(1, Math.floor((VW - X0 * 2 + 4) / (BW + 4))) * ROWS;
export function pageOf(cat) { return page[cat] || 0; }
export function showSelected(cat, sel, VW) { page[cat] = Math.floor(sel / perPage(VW)); }

// ctx: { g, text, drawSet, SPR, UI, TYPE, VW, VH, cats, cat, items, ids, sel }
export function drawPalette(c) {
  const { g, text, VW, VH, UI } = c;
  g.fillStyle = 'rgba(10,8,16,0.94)'; g.fillRect(0, 0, VW, VH);
  text('THE PALETTE', VW / 2, 3, UI.title, 'center', c.TYPE.head);
  c.cats.forEach((name, i) => { const tx = X0 + i * 54, sel = i === c.cat;
    g.fillStyle = sel ? 'rgba(60,90,60,0.9)' : 'rgba(40,36,50,0.8)'; g.fillRect(tx, 12, 52, 11);
    if (sel) { g.strokeStyle = UI.sel; g.strokeRect(tx + 0.5, 12.5, 51, 10); }
    text(name, tx + 26, 15, sel ? UI.sel : UI.dim, 'center', 6); });
  const per = perPage(VW), pages = Math.max(1, Math.ceil(c.items.length / per));
  const p = Math.min(pageOf(c.cat), pages - 1); page[c.cat] = p;
  for (let k = 0; k < per; k++) {
    const i = p * per + k; if (i >= c.items.length) break;
    const col = Math.floor(k / ROWS), row = k % ROWS, bx = X0 + col * (BW + 4), by = Y0 + row * BH, sel = i === c.sel;
    g.fillStyle = sel ? 'rgba(60,90,60,0.7)' : 'rgba(30,26,40,0.7)'; g.fillRect(bx, by, BW, BH - 1);
    if (sel) { g.strokeStyle = UI.sel; g.strokeRect(bx + 0.5, by + 0.5, BW - 1, BH - 2); }
    const sp = c.ids && c.ids[i] ? c.SPR[c.ids[i]] : null;
    if (sp && (sp.R || sp.width)) { g.globalAlpha = 0.9; try { c.drawSet(sp, null, 0, bx + 9, by + BH - 2, 1, false, 0.55, 0.55); } catch (e) {} g.globalAlpha = 1; }
    text(String(c.items[i]).slice(0, 15), bx + 18, by + 2, sel ? UI.title : UI.text, 'left', 6);
  }
  const by = Y0 + ROWS * BH + 4;
  if (pages > 1) {
    text('<  PAGE ' + (p + 1) + ' / ' + pages + '  >', VW / 2, by, UI.sel, 'center', 6);
    text('CLICK one   < > or PGUP/PGDN pages   ESC close', VW / 2, VH - 10, UI.dim, 'center', 6);
  } else text('CLICK one   ESC close', VW / 2, VH - 10, UI.dim, 'center', 6);
}
// returns { cat } to switch group, { pick: i } to choose, { close: true }, or null
export function paletteClick(c, mx, my) {
  for (let i = 0; i < c.cats.length; i++) { const tx = X0 + i * 54; if (mx >= tx && mx < tx + 52 && my >= 12 && my < 23) return { cat: i }; }
  const per = perPage(c.VW), pages = Math.max(1, Math.ceil(c.items.length / per)), p = pageOf(c.cat);
  const by = Y0 + ROWS * BH + 4;
  if (pages > 1 && my >= by - 2 && my < by + 9) { turnPage(c.cat, mx < c.VW / 2 ? -1 : 1, c.items.length, c.VW); return { page: true }; }
  for (let k = 0; k < per; k++) { const i = p * per + k; if (i >= c.items.length) break;
    const col = Math.floor(k / ROWS), row = k % ROWS, bx = X0 + col * (BW + 4), bY = Y0 + row * BH;
    if (mx >= bx && mx < bx + BW && my >= bY && my < bY + BH) return { pick: i }; }
  if (my > by + 10) return { close: true };
  return null;
}
export function turnPage(cat, d, n, VW) { const pages = Math.max(1, Math.ceil(n / perPage(VW))); page[cat] = ((pageOf(cat) + d) % pages + pages) % pages; }
