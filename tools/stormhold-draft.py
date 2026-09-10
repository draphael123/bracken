import io
p = r"C:/Users/danie/OneDrive/Desktop/Claude Cowork/bracken/src/level.js"
s = io.open(p, encoding='utf8').read()

LEVEL = r'''
// ============================================================================================
// LEVEL 10 - STORMHOLD, the last hold.
// What is left of the goblins after Kingswood, the Stockade and the crags has fallen back up
// the mountain to the town they came from, and the Queen's castle stands over it in the snow.
// The village is the lock and the castle is the door: three tiers, three houses, three keys,
// three gates. You go indoors for the keys. You cross bridges to get anywhere. Then the last
// gate opens on a bridge a quarter of a mile long, and the Queen's Lance is standing on it.
// ============================================================================================
function stormhold() {
  const L = painter(430, 46); // rows 0-17 are the indoors, off where the street cannot reach
  const { block, floor, plat, ent, coins, set, spikes } = L;
  const movers = [], interiors = [], bridges = [];
  const gateCol = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.PORT); };
  const room = (x0, x1, y0, y1, st = 'stone') => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, 0); interiors.push([x0, x1, y0, y1, st]); };
  const roof = (x0, x1, y) => block(x0, x1, y - 2, y); // a goblin roof: two courses of slate
  // A span of rope and plank between two piers. `give` planks snap under a standing weight.
  const span = (x0, x1, y, o) => { const opt = o || {};
    for (let x = x0; x <= x1; x++) set(x, y, opt.give ? T.SHELF : T.PLANK);
    bridges.push({ x: x0, x1, y, sway: opt.sway || 0, cut: !!opt.cut });
    ent('deco', x0, y - 1, { kind: 'bridgepost' }); ent('deco', x1, y - 1, { kind: 'bridgepost' }); };

  // ---- 1. THE UNDER STREET: the market gone to a war camp. Snow, stalls, and the castle above it all. ----
  floor(0, 60, 34);
  ent('npc', 8, 33, { kind: 'squire' });
  ent('sign', 4, 33, { text: 'STORMHOLD. WHAT IS LEFT OF THEM LIVES HERE, AND THE QUEEN IS IN THE CASTLE ABOVE IT. THE GATES ARE LOCKED AND THE KEYS ARE INDOORS. STAND IN A DOORWAY AND PRESS UP.' });
  ent('deco', 16, 33, { kind: 'cairn' }); ent('torch', 12, 33); ent('deco', 24, 33, { kind: 'barrels' });
  ent('sprig', 30, 33, { face: -1 }); ent('shield', 40, 33, { face: -1 }); ent('torch', 34, 33);
  coins([14, 32], [22, 31], [36, 32], [48, 32]);
  ent('check', 20, 33);
  // the first house: it is already open, so the doorway teaches itself
  roof(44, 54, 30);
  ent('doorway', 48, 33, { id: 'hearth-out', to: 'hearth-in', kind: 'goblin' });
  ent('sign', 44, 33, { text: 'THE FIRST DOOR IS ON THE LATCH. WHAT IS INSIDE IS ASLEEP, AND WHAT IS ON THE NAIL IS THE BRASS KEY.' });
  room(6, 30, 6, 13, 'hall');
  ent('doorway', 9, 13, { id: 'hearth-in', to: 'hearth-out', lock: [6, 30], label: 'THE HEARTH HOUSE' });
  ent('torch', 12, 13); ent('brazier', 20, 13); ent('deco', 26, 13, { kind: 'barrels' });
  ent('hearthgob', 18, 13, { face: -1 }); ent('key', 28, 13, { kind: 'brass' });
  coins([14, 12], [22, 12]);
  ent('sign', 7, 13, { text: 'HEARTH GOBLINS SLEEP BY THE FIRE UNTIL YOU ARE CLOSE, AND THEN THEY FIGHT WITH WHATEVER IS TO HAND.' });
  // the first span: short, low, and the planks give
  block(61, 62, 34, 45); block(75, 76, 34, 45);
  span(63, 74, 33, { give: true });
  for (let x = 63; x <= 74; x++) set(x, 40, 0);
  ent('sign', 58, 33, { text: 'THE PLANKS GIVE UNDER A STANDING WEIGHT. KEEP MOVING.' });
  ent('deco', 66, 32, { kind: 'lantern' });
  floor(77, 96, 34); ent('archer', 86, 33, { face: -1 }); coins([80, 33], [90, 33]);
  ent('lockgate', 96, 33, { needs: 'brass', h: 6 }); gateCol(96, 28, 33);
  ent('check', 92, 33);

  // ---- 2. SMOKE ROW: forges and tanneries, and the spans start being watched. ----
  floor(97, 150, 32);
  ent('sign', 99, 31, { text: 'SMOKE ROW. THEY WORK IRON FOR THE CASTLE HERE. THE TOWERS COVER EVERY SPAN: PICK YOUR MOMENT.' });
  ent('deco', 104, 31, { kind: 'forge' }); ent('brazier', 108, 31); ent('brazier', 120, 31);
  ent('hearthgob', 114, 31, { face: -1 }); ent('brute', 130, 31, { face: -1 }); ent('sprig', 140, 31, { face: -1 });
  roof(110, 124, 28); roof(132, 146, 28);
  plat(126, 26, 4); ent('archer', 127, 25, { face: -1 }); coins([102, 30], [118, 30], [127, 25], [136, 30], [146, 30]);
  ent('silver', 128, 25);
  // the smithy: the iron key, and the smith
  ent('doorway', 118, 31, { id: 'smithy-out', to: 'smithy-in', kind: 'goblin' });
  room(38, 66, 6, 14, 'stone');
  ent('doorway', 41, 14, { id: 'smithy-in', to: 'smithy-out', lock: [38, 66], label: 'THE SMITHY' });
  ent('brazier', 46, 14); ent('deco', 52, 14, { kind: 'anvil' }); ent('torch', 60, 14);
  ent('hearthgob', 50, 14, { face: -1 }); ent('hearthgob', 58, 14, { face: -1 }); ent('miner', 62, 14, { face: -1 });
  plat(54, 10, 4); ent('key', 64, 14, { kind: 'iron' }); coins([48, 13], [56, 9], [60, 13]);
  ent('stray', 56, 9, { kind: 'folk' });
  ent('sign', 39, 14, { text: 'THE SMITHY. THEY ARE MAKING SOMETHING LONG AND SHARP FOR SOMEONE LARGE.' });
  // the second span: long, watched from both ends, and a cutter on the far post
  block(151, 152, 32, 45); block(178, 179, 32, 45);
  span(153, 177, 31, { sway: 1 });
  for (let x = 153; x <= 177; x++) set(x, 40, 0);
  ent('cutter', 177, 30, { face: -1, bridge: 153 });
  ent('archer', 151, 30, { face: 1, fire: true }); ent('rockgoblin', 179, 30, { face: -1 });
  ent('sign', 148, 31, { text: 'A GOBLIN WITH AN AXE IS WORTH MORE THAN A GOBLIN WITH A SWORD, IF HE IS STANDING ON THE ROPE. THE SHIELD CARRIES.' });
  ent('deco', 160, 30, { kind: 'lantern' }); ent('deco', 170, 30, { kind: 'lantern' });
  floor(180, 208, 32); ent('sprig', 190, 31, { face: -1 }); ent('shield', 200, 31, { face: -1 });
  coins([184, 31], [194, 30], [204, 31]);
  // the tannery: a house you go through, not into, and the second captive
  roof(186, 198, 28); ent('doorway', 190, 31, { id: 'tan-out', to: 'tan-in', kind: 'goblin' });
  room(74, 98, 6, 13, 'earth');
  ent('doorway', 77, 13, { id: 'tan-in', to: 'tan-out', lock: [74, 98], label: 'THE TANNERY' });
  ent('torch', 82, 13); ent('hearthgob', 88, 13, { face: -1 }); ent('spider', 92, 7, { drop: 90 });
  ent('stray', 95, 13, { kind: 'folk' }); ent('silver', 96, 13); coins([84, 12], [90, 12]);
  ent('lockgate', 208, 31, { needs: 'iron', h: 6 }); gateCol(208, 26, 31);
  ent('check', 204, 31);

  // ---- 3. THE HALLS: the officers' houses under the crag, and every span at once. ----
  floor(209, 250, 30);
  ent('sign', 211, 29, { text: 'THE HALLS. THE QUEEN\'S OFFICERS KEEP HOUSE UNDER THE CRAG. THE LAST KEY IS IN THE LONGHOUSE AND THE LONGHOUSE IS FULL.' });
  ent('deco', 218, 29, { kind: 'banner', v: 0 }); ent('deco', 240, 29, { kind: 'banner', v: 1 });
  ent('brute', 224, 29, { face: -1 }); ent('pike', 234, 29, { face: -1 }); ent('archer', 246, 29, { face: -1, fire: true });
  roof(214, 232, 26); roof(236, 248, 26); ent('torch', 216, 29); ent('torch', 244, 29);
  coins([214, 28], [228, 28], [238, 28], [248, 28]);
  // the longhouse: the deepest room, the bone key at the back of it
  ent('doorway', 228, 29, { id: 'long-out', to: 'long-in', kind: 'cottage' });
  room(106, 160, 4, 15, 'hall');
  ent('doorway', 109, 15, { id: 'long-in', to: 'long-out', lock: [106, 160], label: 'THE LONGHOUSE' });
  ent('torch', 114, 15); ent('brazier', 124, 15); ent('brazier', 142, 15); ent('torch', 154, 15);
  ent('hearthgob', 120, 15, { face: -1 }); ent('hearthgob', 134, 15, { face: 1 }); ent('brute', 146, 15, { face: -1 });
  plat(118, 11, 4); plat(128, 8, 5); plat(140, 11, 4); ent('archer', 129, 7, { face: -1 });
  ent('stray', 130, 7, { kind: 'folk' }); ent('key', 158, 15, { kind: 'bone' });
  coins([120, 10], [130, 7], [142, 10], [150, 14]);
  ent('sign', 107, 15, { text: 'THE LONGHOUSE. THE THIRD OF THE HILL FOLK IS UP IN THE RAFTERS AND THE BONE KEY IS AT THE FAR END.' });
  // a swaying span with a cutter, over the drop, to the last gate
  block(251, 252, 30, 45); block(274, 275, 30, 45);
  span(253, 273, 29, { sway: 2, give: true });
  for (let x = 253; x <= 273; x++) set(x, 40, 0);
  ent('cutter', 273, 28, { face: -1, bridge: 253 }); ent('harpy', 262, 20);
  ent('archer', 251, 28, { face: 1, fire: true });
  floor(276, 300, 30); ent('sprig', 284, 29, { face: -1 }); ent('shield', 294, 29, { face: -1 });
  ent('silver', 288, 25); plat(286, 26, 4); coins([280, 29], [288, 25], [296, 29]);
  ent('lockgate', 300, 29, { needs: 'bone', h: 7 }); gateCol(300, 23, 29);
  ent('check', 296, 29);

  // ---- 4. THE LONG BRIDGE: seven spans, six piers, and the Queen's Lance. ----
  // one height the whole way, so his charge has one line to run and the piers are the rhythm
  const BY = 29, P0 = 302;
  ent('sign', 302, BY, { text: 'THE CASTLE BRIDGE. IT IS LONGER THAN THE VILLAGE. HE CANNOT TURN WHILE HE IS CHARGING: STEP OFF HIS LINE AND HE PUTS THE LANCE IN A POST. THE PIERS ARE THE ONLY GOOD GROUND AND THEY ARE WATCHED.' });
  const piers = [];
  for (let k = 0; k < 7; k++) { const px0 = P0 + k * 18, px1 = px0 + 4;
    block(px0, px1, BY + 1, 45); piers.push([px0, px1]);
    if (k > 0) { const s0 = px0 - 13, s1 = px0 - 1; span(s0, s1, BY, { sway: k >= 3 ? 2 : 1, give: k >= 2 }); }
    if (k >= 1 && k <= 5) { ent('deco', px0 + 2, BY, { kind: 'bridgetower' }); }
  }
  // the towers loose at you on the open spans
  ent('archer', 322, BY, { face: 1, fire: true }); ent('archer', 358, BY, { face: -1, fire: true });
  ent('rockgoblin', 394, BY, { face: -1 }); ent('archer', 412, BY, { face: -1, fire: true });
  ent('cutter', 340, BY, { face: -1, bridge: 325 });
  for (const x of [310, 328, 346, 364, 382, 400]) { ent('deco', x, BY, { kind: 'lantern' }); coins([x + 4, BY - 1]); }
  ent('silver', 373, BY - 1);
  // the far gatehouse, and the way out
  block(428, 429, 20, 45); floor(424, 429, 30);
  ent('deco', 426, 29, { kind: 'gatehouse' });
  ent('gate', 427, 29);
  ent('lance', 320, BY);

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 33 }, pools: [], falls: [], moversExtra: movers, interiors, bridges,
    duskStart: -1, duskLen: 1, music: 'theme4', night: true, glowNight: true, nightA: 0.26,
    quest: { n: 3, item: 'folk', name: 'HILL FOLK', npc: 'squire', done: 'THEY ARE OUT OF THEIR CELLARS', reward: 'relic', relic: 'shoes' },
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(150,160,200,0.16)',
      grass: '#cfd8e2', grassL: '#eef4ff', grassD: '#9aa8bc', dirt: '#4a4a58', dirtL: '#62626e', dirtD: '#32323c',
      canopy: ['#3a3a48', '#4a4a5a', '#5a5a6c', '#6a6a80'] },
    weather: [{ x0: 0, x1: 99999, kind: 'snow' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    castle: true, // the castle grows over the whole level: drawn behind everything
    arena: { x0: 302 * TS, x1: 430 * TS, floor: 29 * TS, trigger: 306 * TS, wallL: 301, wallR: 430, boss: 'lance', music: 'boss2', tint: '#6a7a9a', tintA: 0.10, fx: 'dust' },
  };
}
'''

anchor = "function theShopCrag() {"
assert s.count(anchor) == 1
s = s.replace(anchor, LEVEL.strip() + "\n\n// THE HIGH STORE: the same trade in a stone cellar under the crags, with the shepherd and the old knight for company.\nfunction theShopCrag() {", 1)
# and drop the duplicated comment line that used to sit above theShopCrag
s = s.replace("// THE HIGH STORE: the same trade in a stone cellar under the crags, with the shepherd and the old knight for company.\n// THE HIGH STORE: the same trade in a stone cellar under the crags, with the shepherd and the old knight for company.\nfunction theShopCrag() {",
              "// THE HIGH STORE: the same trade in a stone cellar under the crags, with the shepherd and the old knight for company.\nfunction theShopCrag() {")

# register the level
a2 = "  { id: 'moor', name: 'GALE MOOR', sub: 'the high moor', build: galeMoor, needs: 'mineworks' },"
assert s.count(a2) == 1
s = s.replace(a2, a2 + "\n  { id: 'storm', name: 'STORMHOLD', sub: 'the last hold', build: stormhold, needs: 'moor' },")

io.open(p, 'w', encoding='utf8', newline='\n').write(s)
print('stormhold written')
