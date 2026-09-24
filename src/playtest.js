// src/playtest.js — THE BOT THAT PLAYS THE WHOLE GAME AND WRITES DOWN WHAT IS WRONG WITH IT.
//
// The node tools read the levels as data. They cannot see a sprite, a string that runs off the edge of the
// screen, a frame that comes back black, or a crash three thousand frames into the Hurricane. This one runs
// inside the page, on the real loop, with the real art, and looks at what actually comes out of it.
//
//   in the browser:   bracken-nine.vercel.app/?playtest=1      (runs, prints, and leaves the report on screen)
//   from the console: await BK.playtest()                       -> the report object
//                     await BK.playtest({ levels: ['reef'], heroes: ['reaper'], mode: 'play' })
//
// It runs in two passes over every level:
//
//   THE SWEEP (default) walks the camera the whole length of the level along the footing the reach model says
//   you can stand on, twenty frames at a stop, rendering every one. That is the pass that sees art: a prop in
//   the air, a creature spawned inside rock, a black frame, a caption off the edge of the panel, a sprite
//   drawn at NaN, a level that costs 40ms a frame to draw.
//
//   THE PLAY pass puts a greedy bot on the ground with no god mode and lets it fight its way right. That is
//   the pass that sees balance: how much it loses per hundred columns, how often it dies, how long it takes.
//
// Everything it finds is a FINDING: a kind, a severity, where it happened and what it was. Nothing here
// changes the game; the bot restores the save, the hero and the settings it borrowed when it is done.
import { LEVELS, T, TS } from './level.js';
import { THREAT, RAMP_DROP, RAMP_WALL, spanOf, indexOf, worstGap } from './threat.js';
import { floodReach } from './reachcore.js';
import { checkDrawables } from './floatlab.js';

const SEV = { bug: 3, odd: 2, note: 1 };
const solidT = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
const standT = t => solidT(t) || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.BOUNCER || t === T.REED || t === T.CRYST || t === T.NET;

// what each creature is worth as a threat - the same table tools/curve.mjs uses, so the two agree
// props that hang on purpose: a banner is meant to be in the air
// the furniture, the scenery and the machinery: none of it is a creature and none of it weighs anything
const NOT_A_FOE = /^(coin|sign|deco|npc|guest|folk|torch|silver|stray|relic|gate|mover|check|spawn|prop|shrine|key|door|plate|exit|bell|cage|capstan|seabell|lockgate|felltree|vent|doorway|cart|plank|cannon|crate|squire|fisher|bale|dummy|stormcloud|lamp|lever|hive|nest|rune|shard|brazier|well|seed|pad|raft|tide|wind|buoy|glow|glowbud|puffball|roller|lantern|wisp|throne|treehouse|sluice|sceptre|chandelier|barrel|spike|rock|weight|support|rod|crank|winch|flagpost|stormkite|hag|fox|squirrel|bird|acorn|tonic|shop|sign2|banner|anvil|forge|pump|bellows|gong|drum|pile|web|egg|urn|statue|pillar|grave|sack|keg|rope|hook|chain|ladder|bridge|post|sluicegate|wheel|mill|tank|pipe|valve|hearth|stove|table|chair|bed|chest|shelf|rack|crate2|barricade|window|well|crystal|mirror|receiver|resonance|bulkhead|stal|chimpot|scaffold|cascade|boiler|carpet|chainpost|sheet|sail|balloon|deadfall|font|runearch|glyph|gplate|vatspit|rune)$/;
const HANGS = new Set(['banner', 'axle', 'timber', 'pillar', 'strut', 'sailRag', 'rigging', 'pennant', 'gunport',
  'hallWindow', 'hammock', 'washing', 'boardingNet', 'sternWindows', 'crowNest', 'mastTall', 'buoy',
  'lanternBuoy', 'airBell', 'hangCage', 'cobweb', 'bough', 'drip', 'hiveBg', 'eyrie', 'spire', 'rootDecor']);
const GROUNDED = new Set(['sign', 'npc', 'shrine', 'check', 'brazier', 'well', 'door', 'folk', 'squire', 'stray',
  'crate', 'plate', 'exit', 'relic', 'bell', 'cage', 'deco', 'capstan', 'seabell', 'gate']);
// (a SILVER is a collectable and is meant to hang in the air, like a coin: it is not furniture)
// things that are SET INTO a wall on purpose - a gunport is a hole in a hull, a window is a hole in a house
const INROCK_OK = new Set(['gunport', 'sternWindows', 'hallWindow', 'grating', 'rigging', 'cobweb', 'banner',
  'wheel', 'coiledCable', 'bellows', 'tollPost', 'magistrate', 'figurehead', 'spire']);
// and creatures that live IN something: the sea bed, the rock, the web
const INROCK_FOE = new Set(['urchin', 'eel', 'angler', 'reefmaw', 'grub', 'miner', 'mother', 'gill', 'heart', 'spider', 'weaver']);

// ---------------------------------------------------------------- instrumentation
// Everything the bot can see that a node script cannot: a thrown frame, a draw at NaN, a caption that leaves
// the screen, a frame with nothing on it. Installed once, drained per level.
function instrument(BK) {
  const box = { errs: [], nans: [], cut: [], seenCut: new Set(), seenNan: new Set() };
  const onErr = ev => box.errs.push(String(ev.message || ev.reason || ev) + (ev.filename ? ' @' + String(ev.filename).split('/').pop() + ':' + ev.lineno : ''));
  addEventListener('error', onErr); addEventListener('unhandledrejection', onErr);

  const g = BK.g;
  const rawDraw = g.drawImage.bind(g), rawText = g.fillText.bind(g), rawMeasure = g.measureText.bind(g);
  g.drawImage = function (img, ...a) {
    for (const v of a) if (typeof v === 'number' && !Number.isFinite(v)) {
      const k = (new Error().stack || '').split('\n').slice(2, 4).join('|');
      if (!box.seenNan.has(k)) { box.seenNan.add(k); box.nans.push('drawImage(' + a.join(',') + ') ' + k.slice(0, 160)); }
      return;                                                  // and do not let it poison the frame
    }
    return rawDraw(img, ...a);
  };
  g.fillText = function (s, x, y, ...rest) {
    if (typeof s === 'string' && s.length) {
      const w = rawMeasure(s).width, al = g.textAlign;
      const l = al === 'center' ? x - w / 2 : al === 'right' || al === 'end' ? x - w : x;
      // EVERY UI STRING ON THIS FRAME, AND WHERE IT SAT. Two strings on top of each other is the commonest
      // menu bug there is - a row label and its right-hand badge meeting in the middle, a list grown by two
      // rows walking into its own footer - and it never shows up as an overflow, because both halves are
      // inside the frame. It only shows up as a mess. So: write them all down and compare them.
      if (!g.__world && box.texts) { const h = parseInt(g.font, 10) || 8;
        box.texts.push({ s, l, r: l + w, t: y, b: y + h }); }
      // a world-space string is ALLOWED to be off screen: a damage number over a creature at the edge of the
      // view is not a bug. Only the plates count - a menu, or the HUD and banner bands of a level.
      const VW = BK.view.VW;
      if (!g.__world && (l < -1.5 || l + w > VW + 1.5) && w < VW * 2.5) {
        const k = s.slice(0, 40);
        if (!box.seenCut.has(k)) { box.seenCut.add(k); box.cut.push('"' + s.slice(0, 52) + '" at x=' + Math.round(x) + ' w=' + Math.round(w) + ' (view ' + BK.view.VW + ')'); }
      }
    }
    return rawText(s, x, y, ...rest);
  };
  box.texts = [];
  box.clearTexts = () => { box.texts.length = 0; };
  // what is lying on top of what. A string is drawn twice (its shadow, then itself), so identical text never
  // counts; and a little touching is normal where a glyph box is wider than its ink, so it takes a real overlap.
  box.overlaps = () => {
    const out = [], T = box.texts;
    for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
      const a = T[i], b = T[j];
      if (a.s === b.s) continue;
      const ow = Math.min(a.r, b.r) - Math.max(a.l, b.l), oh = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      if (ow <= 2 || oh <= 2) continue;
      const area = ow * oh, small = Math.min((a.r - a.l) * (a.b - a.t), (b.r - b.l) * (b.b - b.t));
      if (area < small * 0.3) continue;
      out.push('"' + a.s.slice(0, 26) + '" and "' + b.s.slice(0, 26) + '" are drawn on top of each other (' + Math.round(ow) + 'x' + Math.round(oh) + 'px of overlap)');
    }
    return out.slice(0, 6);
  };
  box.drain = () => { const out = { errs: box.errs.slice(), nans: box.nans.slice(), cut: box.cut.slice() }; box.errs.length = 0; box.nans.length = 0; box.cut.length = 0; return out; };
  box.off = () => { removeEventListener('error', onErr); removeEventListener('unhandledrejection', onErr); g.drawImage = rawDraw; g.fillText = rawText; };
  return box;
}

// how much is actually on this frame: a blank or near-blank frame is a bug you can only see by looking
function frameStats(BK) {
  const b = BK.buf, c = b.getContext('2d');
  const w = Math.min(b.width, 320), h = Math.min(b.height, 180);
  let d; try { d = c.getImageData(0, 0, w, h).data; } catch { return null; }
  const seen = new Map(); let lum = 0, n = 0;
  for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) {
    const i = (y * w + x) * 4, k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4);
    seen.set(k, (seen.get(k) || 0) + 1); lum += d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; n++;
  }
  let top = 0; for (const v of seen.values()) top = Math.max(top, v);
  return { colours: seen.size, flat: top / n, lum: lum / n };
}

// ---------------------------------------------------------------- the walker
// A greedy bot. It is not a good player: it holds the way to the goal, jumps a wall or a hole two tiles before
// it arrives, holds the jump so it gets its full height, takes a rope when the goal is above it, drops through
// a ledge when the goal is below, and swings at anything within arm's reach. When it stops making ground it
// tries the other things it knows - a dash, a back-up-and-run, a drop - before it gives up and says where.
//
// AND IT CAN NOW DO THE THREE THINGS THE GAME IS MADE OF. Until this, the bot could only WALK, which is why
// it reported sixteen per cent of Bracken Wood and seven of the Marsh and called half the campaign BRUTAL:
// it was drowning in the first pool, standing on a raft fighting it, and walking into the side of every
// house in the game. Those were not findings about the levels. They were the shape of the bot.
//   IT SWIMS. Water is not a floor. Under water it strokes for the surface when its breath is going, rises
//     toward standable ground ahead of it, and jumps out when its head is near the top.
//   IT RIDES. Standing on a mover it stops walking off the front of it, and only steps off where there is
//     something to step onto.
//   IT GOES THROUGH DOORS. This is the one that matters: half the keys in this game are indoors, so a bot
//     that cannot open a door cannot open a gate either, and every key-gated level ended at its first gate.
//     Inside a room it goes for the KEY first and the far door second, which is the route the room was built
//     to teach.
export function makeBot(BK) {
  let hold = 0, tapT = 0, tap = 0, still = 0, best = -1e9, tries = 0;
  let lastDoor = null, doorCd = 0, swimUp = 0;
  return function tick(goalX) {
    const P = BK.P, L = BK.L, keys = BK.keys, W = L.W;
    const at = (tx, ty) => (tx < 0 || ty < 0 || tx >= W || ty >= L.H) ? T.SOLID : L.grid[ty * W + tx];
    // A MOVER IS FOOTING. The whole marsh crossing is six lily pads three tiles apart, and the bot read
    // every one of them as a hole because the only thing it ever asked was the tile grid - so it jumped on
    // every frame of the crossing, never cleared three tiles off a sinking pad, and drowned. Rafts, pads,
    // lifts, carts, sails and the Undercrown's beam are all the same case: they are the floor. Just not tiles.
    const foot = (tx, ty) => { if (standT(at(tx, ty))) return true;
      const px = tx * TS + 8, py = ty * TS;
      for (const m of BK.movers()) { if (m.gone || m.sink > 0.55) continue;
        const top = m.y + (m.kind === 'pad' ? 2 : 0);
        if (px >= m.x - 4 && px <= m.x + (m.w || 16) + 4 && top >= py - 10 && top <= py + TS + 8) return true; }
      return false; };
    let fx = Math.floor(P.x / TS), fy = Math.floor(P.y / TS);
    doorCd = Math.max(0, doorCd - 1);

    // ---- THE DOORS. Where am I, and what is this room for? ----
    const props = BK.props();
    const room = (L.interiors || []).find(([x0, x1, y0, y1]) => fx >= x0 && fx <= x1 && fy >= y0 - 1 && fy <= y1 + 2);
    const doorAt = p => Math.abs(p.x - P.x) < 11 && Math.abs(p.y - P.y) < 18;
    if (room) {
      // INSIDE: the key first - it is why the room exists - and then the door that is not the one I came in by
      const mine = p => p.x >= room[0] * TS && p.x <= (room[1] + 1) * TS;
      const key = props.find(p => p.t === 'key' && !p.got && mine(p));
      const outs = props.filter(p => p.t === 'doorway' && mine(p));
      const out = outs.find(p => p.id !== lastDoor) || outs[0];
      if (key) goalX = key.x;
      else if (out) { goalX = out.x;
        if (doorAt(out) && doorCd <= 0) { doorCd = 40; lastDoor = out.to || null; tick.seek = null; BK.press('talk'); keys.up = true; BK.doorNow(); still = 0; best = -1e9; } }
    } else {
      // OUTSIDE AND STUCK. A locked gate in front of you means a key behind you, and in this game the key
      // is indoors - so the answer is a DOOR, and the door is usually a long way back. The first version
      // of this only looked a hundred and fifty pixels around itself, which is nine tiles, so it never
      // found one: Stormhold's hearth house is forty-eight tiles behind the gate it opens. It picks the
      // nearest door it has not already been through and WALKS BACK TO IT.
      // A SHUT GATE IN FRONT OF YOU IS NOT "STUCK", it is an INSTRUCTION, and waiting sixty frames to
      // notice wastes the run: go and find the door the moment you can see the gate.
      /* (a gate it holds the key to is not an instruction to go and find one: it walks on and the gate turns) */
      const shut = props.find(p => p.t === 'lockgate' && !p.open && Math.abs(p.x - P.x) < 90 && !props.some(q => q.t === 'key' && q.got && q.kind === p.needs));
      /* THE KEY UP A TOWER (Stormhold, docs/briefs/stormhold-town.md): a key that is NOT indoors hangs on a watchtower's top
         deck, and the way to it is the tower's own ladders. So a shut gate whose key is outdoors sends the bot to the KEY -
         to the nearest ladder that rises from where it stands, up it, and along the deck - and not to a door. */
      const ahead = shut || props.find(p => p.t === 'lockgate' && !p.open && p.x > P.x - 40 && p.x - P.x < 400 && !props.some(q => q.t === 'key' && q.got && q.kind === p.needs));   /* a tower key is worth walking back for from further off than a door */
      if (ahead && !tick.climbKey) { const k = props.find(p => p.t === 'key' && !p.got && p.kind === ahead.needs && !(L.interiors || []).some(([x0, x1, y0, y1]) => p.x >= x0 * TS && p.x <= (x1 + 1) * TS && p.y >= (y0 - 1) * TS && p.y <= (y1 + 2) * TS));
        if (k) tick.climbKey = k; }
      if (tick.climbKey) tick.climbKey = props.find(p => p.t === 'key' && p.kind === tick.climbKey.kind) || null;   /* a death rebuilds the props: hold the key by its kind, not by an object that is gone */
      if (tick.climbKey && tick.climbKey.got) { tick.climbKey = null; tick.ladderX = undefined; }
      if (tick.climbKey) { const k = tick.climbKey, kx = Math.floor(k.x / TS);
        if (Math.abs(k.y + 6 - P.y) < 20) { goalX = k.x; tick.ladderX = undefined; }
        else if (!P.climb) { let lx, bd = 1e9; for (let x = kx - 10; x <= kx + 10; x++) if (at(x, fy - 1) === T.NET && at(x, fy - 2) === T.NET) { const q = Math.abs(x * TS + 8 - P.x); if (q < bd) { bd = q; lx = x; } }
          tick.ladderX = lx; goalX = lx !== undefined ? lx * TS + 8 : k.x; } }
      if (!tick.seek && !tick.climbKey && (shut || still > 60) && doorCd <= 0) {
        let d = null, bd = 1e9;
        for (const p of props) { if (p.t !== 'doorway' || p.lock || (tick.used && tick.used.has(p.id))) continue;
          const q = Math.abs(p.x - P.x); if (q < bd) { bd = q; d = p; } }
        if (d) { tick.seek = d; tick.seekT = 1400; }
      }
      if (tick.seek) { goalX = tick.seek.x; tick.seekT--;
        if (doorAt(tick.seek)) { doorCd = 40; lastDoor = tick.seek.to || null;
          tick.used = tick.used || new Set(); tick.used.add(tick.seek.id);
          BK.press('talk'); keys.up = true; BK.doorNow(); tick.seek = null; still = 0; best = -1e9; }
        else if (tick.seekT <= 0) { tick.used = tick.used || new Set(); tick.used.add(tick.seek.id); tick.seek = null; } }
    }

    // A SHUT PORTCULLIS AND NO DOOR TO GO AND FIND: the way on is UP. Kingswood's first hall ends in a gate that
    // never opens and the way out is the ledges back up the shaft, which a bot that only ever holds right never
    // turns round for. It walks back under the nearest ledge, climbs while there is a ledge over it, and lets go
    // at the top. (fy is the row it stands ON: its body is fy-1 and a ledge two rows up is fy-2.)
    { const portNear = !tick.seek && [1, 2, 3].some(d => at(fx + d, fy - 1) === T.PORT || at(fx - d, fy - 1) === T.PORT);
      const ledgeOver = x => { for (let y = fy - 2; y >= fy - 4; y--) { const t = at(x, y); if (t === T.ONEWAY || t === T.PLANK) return true; if (t === T.SOLID) return false; } return false; };
      if (tick.climbX === undefined && portNear) for (let d = 0; d <= 12 && tick.climbX === undefined; d++) for (const sd of [-1, 1]) if (ledgeOver(fx + sd * d)) { tick.climbX = fx + sd * d; break; }
      if (tick.climbX !== undefined) {
        if (P.ground && ![-1, 0, 1].some(d => ledgeOver(tick.climbX + d))) tick.climbX = undefined;
        else { goalX = tick.climbX * TS + 8; if (P.ground && Math.abs(P.x - goalX) < 12) { hold = Math.max(hold, 14); still = 0; }   /* a held jump, pressed where the bot presses all its jumps */ } } }
    const dir = P.x < goalX - 10 ? 1 : P.x > goalX + 10 ? -1 : 0;
    fx = Math.floor(P.x / TS); fy = Math.floor(P.y / TS);
    keys.left = dir < 0; keys.right = dir > 0; keys.down = false;

    // ---- THE WATER. It strokes for air, and it climbs out where there is something to climb out onto. ----
    if (P.swim) {
      const breath = P.breath === undefined ? 6 : P.breath;
      const landAhead = dir && (foot(fx + dir, fy) || foot(fx + dir, fy + 1) || foot(fx + dir * 2, fy));
      keys.up = breath < 4 || landAhead || at(fx, fy - 2) === T.AIR;
      keys.down = !keys.up && !!dir && foot(fx + dir, fy + 3);   /* the way on is under: duck for it */
      if (still % 20 === 0) BK.press('jump');                          /* and try the surface now and then */
      if (still > 200) { keys.up = true; BK.press('jump'); }
      return still > 340 ? (still = 0, ++tries > 7 ? 'stuck' : null) : null;
    }
    keys.up = false;

    // ---- THE MOVERS. There are two things to do on one and they are opposites. If it is CARRYING you
    // the right way, stand still and let it. If it is not, the edge of it is a gap and the answer is to
    // JUMP - which is the whole marsh crossing, six lily pads three tiles apart, each one sinking under
    // you. The first version of this rule only knew how to stop, so the bot stood politely on a sinking
    // pad until it went under.
    let leap = false;
    if (P.onMover) {
      const m = P.onMover, edge = dir && !foot(fx + dir, fy + 1) && !foot(fx + dir, fy + 2);
      const carrying = dir && Math.sign(m.vx || m.dx || 0) === dir && !edge;
      const sinking = (m.sink || 0) > 0.15 || m.kind === 'pad';
      if (carrying) { keys.left = keys.right = false; still = Math.max(0, still - 1); }   /* ride it */
      else if (edge) leap = true;                                                        /* the deck ends: go */
      if (sinking && !carrying) leap = true;                                             /* and never linger on one that is going down */
    }

    // is it getting anywhere? (a respawn throws it back to a checkpoint: that is not being stuck)
    if (P.dead > 0 || Math.abs(P.x - (tick.lastX || P.x)) > 90) { best = -1e9; still = 0; }
    tick.lastX = P.x;
    if (P.x * dir > best) { best = P.x * dir; still = 0; tries = 0; } else still++;

    // A ROPE AT HIM, and the way on is up - or DOWN, which it could never do. Half of the Undercrown is a
    // shaft with a ladder in it and the only direction that helps is the one the bot did not have.
    const rope = at(fx, fy - 1) === T.NET || at(fx, fy - 2) === T.NET || at(fx, fy) === T.NET;
    if (rope && still > 30) {
      const below = at(fx, fy + 2) === T.NET || at(fx, fy + 3) === T.NET;
      if (below && !foot(fx, fy + 1)) keys.down = true; else keys.up = true;
      keys.left = keys.right = false;
    } else keys.up = false;
    /* up the tower's ladder to the key: line up on the rungs, then hold UP until they end */
    if (tick.climbKey && tick.ladderX !== undefined) { const cxl = tick.ladderX * TS + 8;
      if (P.climb) { keys.up = true; keys.left = keys.right = false; hold = 0; still = 0; }
      else if (Math.abs(P.x - cxl) < 16) { keys.left = P.x > cxl + 3; keys.right = P.x < cxl - 3; if (Math.abs(P.x - cxl) <= 5) keys.up = true; hold = 0; } }

    // look two tiles on: a wall to clear, a hole to cross, or thorns to hop. A jump has to START two tiles
    // before the hole and be HELD past the apex, or it lands a third of a tile short - which is exactly what
    // it did at the first gap in Bracken Wood until the hold went from eleven frames to twenty-six.
    let need = false;
    if (dir) {
      // a WALL is jumped two tiles out, so the rise starts before you are against it
      for (let k = 1; k <= 2; k++) if (solidT(at(fx + dir * k, fy - 1))) need = true;
      // a HOLE is jumped at the LAST tile: a jump two tiles early lands a third of a tile short of the far
      // side, which is precisely how the bot spent forty deaths on the first gap in Bracken Wood
      const nx = fx + dir;
      if (!foot(nx, fy) && !foot(nx, fy + 1)) need = true;
      if (at(nx, fy - 1) === T.SPIKE || at(nx, fy) === T.SPIKE) need = true;
    }
    // HOW LONG TO HOLD IT. Twenty-six frames is a full-height jump and it clears six tiles; for a
    // two-tile hop it is a way of landing somewhere else. The marsh crossing is six lily pads three
    // tiles apart and the bot was sailing clean over the one it was aiming at and into the water past
    // it. So: find the next thing worth landing on and hold for as long as THAT needs, not always the
    // most it has. (Anything higher than where it stands still gets the full jump.)
    if (P.ground && (need || leap || (still > 40 && still % 24 < 2))) {
      let want = 26;
      if (dir) for (let k = 1; k <= 7; k++) { const tx = fx + dir * k;
        let ty = null; for (let q = -2; q <= 3; q++) if (foot(tx, fy + q) && !foot(tx, fy + q - 1)) { ty = fy + q; break; }
        /* a creature standing over the gap is a step, and it is the only one there is */
        if (ty === null) for (const e of BK.enemies()) { if (!e.alive || e.harmless) continue;
          if (Math.floor(e.x / TS) === tx && e.y > (fy - 4) * TS && e.y < (fy + 5) * TS) { ty = Math.floor(e.y / TS); break; } }
        if (ty === null) continue;
        want = ty < fy ? 26 : Math.max(9, Math.min(26, 6 + k * 4));   /* up is always the full jump */
        break; }
      hold = want;
    }
    if (hold > 0) { if (!tick.jumping) { BK.press('jump'); tick.jumping = 1; } keys.jump = true; hold--; } else { keys.jump = false; tick.jumping = 0; }

    // a dash when a jump plainly is not enough: tap the way twice
    if (still > 110 && still % 40 === 0) { tap = 3; tapT = 0; }
    if (tap > 0) { tapT++; if (tapT === 1) { keys.left = keys.right = false; } if (tapT === 3) { keys.left = dir < 0; keys.right = dir > 0; tap = 0; } }

    // drop through a ledge if the goal is a long way below
    if (P.ground && still > 70 && at(fx, fy) === T.ONEWAY) keys.down = true;

    // A CREATURE UNDER YOU WHILE YOU ARE FALLING IS A STEP. Plunge on it and you bounce, and four wasps
    // over a pit is a bridge - which is the whole middle of Bracken Wood and every pogo chain after it.
    tick.pogoCd = Math.max(0, (tick.pogoCd || 0) - 1);
    if (!P.ground && P.vy > 45 && !P.swim && tick.pogoCd <= 0) {
      for (const e of BK.enemies()) { if (!e.alive || e.harmless || e.t === 'folk' || e.t === 'fisher') continue;
        const dy = (e.y - (e.h || 10) / 2) - P.y;
        /* clearly BELOW and clearly under: after a bounce the one you just hit is still beside you, and
           plunging on it again from a standstill is a plunge into the pit with extra steps */
        if (Math.abs(e.x - P.x) < 15 && dy > 8 && dy < 50) { keys.down = true; tick.pogoCd = 18; break; } }
    }

    // ================================ THE FIGHT ================================
    // It could only do one thing: swing at whatever happened to be in arm's reach, so it walked into a
    // spear and kept walking, and every combat-dense level came back BRUTAL - which was never a finding
    // about the level. What it needs is not to win fights; it is to GET THROUGH them, which is four rules:
    //   1. PICK ONE, and only one that is actually in the way - the nearest live thing at your own height,
    //      in front of you, close enough to matter. A creature behind you is somebody else's problem.
    //   2. A WIND-UP IS AN INSTRUCTION. `BK.telling` is the same predicate the yellow ! is drawn from, so
    //      the bot reads exactly what a player is shown: stand and guard at range, roll THROUGH it up close
    //      (a blow you are already inside of is the one a shield does not help with).
    //   3. OTHERWISE KEEP COMING. The first version stepped back after every swing to be tidy about
    //      spacing and halved how far it got in the level: it spent the run oscillating at arm's length.
    //      Walk in, swing, walk in. Never hold the shield up while travelling - a guard is half speed.
    //   4. GIVE UP. Some things cannot be killed from the ground, and some respawn. After four seconds on
    //      one creature it is written off and the bot goes back to walking.
    tick.rollCd = Math.max(0, (tick.rollCd || 0) - 1);
    tick.frame = (tick.frame || 0) + 1;
    tick.skip = tick.skip || new Map();
    let foe = null, fd = 1e9;
    if (!P.swim && !(P.dead > 0)) for (const e of BK.enemies()) {
      if (!e.alive || e.harmless || e.dying > 0) continue;
      if (e.t === 'folk' || e.t === 'fisher' || e.t === 'bale' || e.t === 'dummy' || e.t === 'sheep') continue;
      if ((tick.skip.get(e) || 0) > tick.frame) continue;
      if (Math.abs(e.y - P.y) > 30) continue;
      const dx = e.x - P.x, d = Math.abs(dx);
      /* AND ONLY WHAT IS ACTUALLY STOPPING YOU. Fighting everything it could see cost it a third of the
         level: most creatures in this game can simply be walked past, and a bot that stops for all of
         them proves nothing except that it can stop. Something on top of you is a fight; something in
         front of you is only a fight once you have stopped getting anywhere. */
      if (d > 28 && !(dir && Math.sign(dx) === dir && d < 74 && still > 18)) continue;
      if (d < fd) { fd = d; foe = e; }
    }
    let fighting = false;
    if (foe) {
      const fdir = Math.sign(foe.x - P.x) || 1;
      const face = () => { keys.left = fdir < 0; keys.right = fdir > 0; };
      const telling = BK.telling ? BK.telling(foe) : false;
      const reach = ((foe.h || 12) > 22 || foe.big) ? 32 : 24;
      if (foe !== tick.foe) { tick.foe = foe; tick.foeT = 0; } else tick.foeT = (tick.foeT || 0) + 1;
      if (tick.foeT > 240) { tick.skip.set(foe, tick.frame + 600); tick.foe = null; }   /* four seconds is enough */
      else if (telling && fd < reach + 8 && tick.rollCd <= 0) {
        fighting = true; tick.rollCd = 40;                       /* inside its reach: roll out the back of it */
        keys.left = fdir > 0; keys.right = fdir < 0; BK.press('dodge');
      } else if (telling && fd < 70) {
        fighting = true; face(); keys.left = keys.right = false; keys.block = true;   /* stand and take it on the shield */
      } else {
        fighting = true; face(); keys.block = false;
        if (fd < reach + 4 && (P.st === undefined ? 100 : P.st) > 12 && P.atk < 0) BK.press('atk');
      }
    }
    if (!fighting) { keys.block = false; tick.foe = null; }
    if (fighting) still = Math.min(still, 150);   /* a fight is not being stuck, but it is not forever either */

    if (still > 260) { still = 0; tries++; if (tries > 7) return 'stuck'; BK.press('dodge'); }
    return null;
  };
}

// ---------------------------------------------------------------- the screens
// EVERY SCREEN IN THE GAME, DRAWN AND MEASURED. The buffer is 320 wide on the close camera and every menu
// overflow this game has ever shipped came from somebody laying a plate out against 400. This walks the lot,
// renders each one, and the fillText instrument catches anything that leaves the frame. It also catches a
// screen that throws, which is worse and harder to notice.
const SCREENS = ['title', 'slots', 'heropick', 'map', 'store', 'equip', 'tree', 'bestiary', 'controls',
  'soundtest', 'practice', 'menu', 'win', 'gameover', 'rushover', 'rushwin', 'herocard'];
async function sweepScreens(BK, inst, F) {
  const was = BK.state;
  for (const st of SCREENS) {
    try {
      BK.state = st;
      // BK.step(n) is n updates and ONE draw, and a panel that slides in is animated against the number of
      // DRAWS it has had, not the clock. So: draw it fifteen times over a second and a half, and only judge
      // what is on the screen once everything has finished arriving.
      for (let i = 0; i < 15; i++) BK.step(6);
      inst.drain();
      for (let i = 0; i < 2; i++) BK.step(2);
      inst.clearTexts(); BK.step(1);                  /* one clean frame, and then look at what is lying on what */
      for (const m of inst.overlaps()) F('OVERLAP', SEV.odd, st + ': ' + m);
      const fs = frameStats(BK);
      if (fs && (fs.colours < 4 || fs.flat > 0.99)) F('BLANK', SEV.bug, 'the ' + st + ' screen came back empty');
    } catch (e) { F('CRASH', SEV.bug, 'the ' + st + ' screen threw: ' + (e && e.message)); }
    const d = inst.drain();
    for (const m of d.errs) F('CRASH', SEV.bug, st + ': ' + m);
    for (const m of d.nans) F('NAN', SEV.bug, st + ': ' + m);
    for (const m of d.cut) F('TEXTCUT', SEV.odd, st + ': ' + m);
    // AND EVERY TAB AND ROW OF IT. Most menu bugs live on the third tab of something: the equip board's
    // TALENTS row had its name and its cost lying across each other and no first-face sweep would ever see it.
    const U = BK.ui;
    if (U) {
      const faces = [];
      if (st === 'store' || st === 'equip') { U.storeMode = st === 'equip' ? 'equip' : 'store';
        for (let t = 0; t < U.tabs(); t++) for (const r of [0, 1, 99]) faces.push(() => { U.storeTab = t; U.storeI = Math.min(r, Math.max(0, U.items() - 1)); }); }
      else if (st === 'tree') { for (let i = 0; i < U.treeRows(); i += 3) faces.push(() => { U.treeI = i; }); }
      else if (st === 'bestiary') { for (const tb of [0, 1]) for (let i = 0; i < 40; i += 7) faces.push(() => { U.bestTab = tb; U.bestI = Math.min(i, Math.max(0, U.beasts() - 1)); }); }
      else if (st === 'practice') { for (let i = 0; i < 6; i++) faces.push(() => { U.practiceI = i; }); }
      else if (st === 'title') { for (let i = 0; i < 7; i++) faces.push(() => { U.titleI = i; }); }
      else if (st === 'menu') { for (let i = 0; i < 26; i += 4) faces.push(() => { U.menuI = Math.min(i, Math.max(0, U.menuCount() - 1)); }); }
      for (const set of faces) {
        try { set(); inst.clearTexts(); BK.step(1); }
        catch (e) { F('CRASH', SEV.bug, st + ' threw on one of its rows: ' + (e && e.message)); continue; }
        for (const m of inst.overlaps()) F('OVERLAP', SEV.odd, st + ': ' + m);
        const d2 = inst.drain();
        for (const m of d2.cut) F('TEXTCUT', SEV.odd, st + ': ' + m);
        for (const m of d2.errs) F('CRASH', SEV.bug, st + ': ' + m);
      }
      inst.drain();
    }
    await frame();
  }
  BK.state = was;
}

// ---------------------------------------------------------------- the art (and why there is no art check)
// THERE WAS A SPRITE-CLIPPING CHECK HERE AND IT DID NOT WORK. The idea was sound - the paladin's maul head
// was drawn off the side of every heavy frame for a week - but every sprite in this game is tight-cropped to
// its widest pose, so the widest pose TOUCHES THE BORDER BY DESIGN. Flagging "touches its own edge" gave 300
// findings and no signal; flagging "touches an edge where its brothers have margin" gave 140, and all of them
// were lunges and overheads reaching the full width of a canvas that was sized for exactly that. Once the
// pixels are baked, a frame that was cut and a frame that exactly fits are the same picture.
//
// If this needs solving, it has to be solved AT BAKE TIME: knightFrame() and friends would have to report the
// extent they drew to, and the bake asserts it fits. Do not put a pixel-reading version back here.

// ---------------------------------------------------------------- the run
export async function run(BK, opts = {}) {
  const t00 = performance.now();
  const want = opts.levels || null;
  const mode = opts.mode || 'both';                       // 'sweep' | 'play' | 'both'
  const sweepSteps = opts.sweepSteps || 18;               // frames held at each stop of the sweep
  const playSteps = opts.playSteps || 7000;               // frames the play bot gets per level
  const quiet = opts.quiet !== false;
  const log = opts.log === false ? () => {} : (...a) => console.log(...a);

  // borrow the game, and give it back
  const keep = { hero: BK.PROG.hero, god: BK.god, sfx: BK.SET.sfx, music: BK.SET.music, state: BK.state, level: null };
  BK.SET.sfx = quiet ? 0 : BK.SET.sfx; BK.SET.music = quiet ? false : BK.SET.music;
  const inst = instrument(BK);
  const report = { started: new Date().toISOString(), levels: [], findings: [], ms: 0 };
  const add = (lvl, kind, sev, msg, where) => { const f = { level: lvl, kind, sev, msg, where }; report.findings.push(f); return f; };

  const list = LEVELS.map((lv, i) => ({ lv, i })).filter(({ lv }) => (!lv.hidden || lv.secret) && (!want || want.includes(lv.id)));   /* a SECRET level is a real level: it is only hidden from the campaign's count */
  log('%cBRACKEN PLAYTEST — ' + list.length + ' levels, mode ' + mode, 'font-weight:bold');

  for (const { lv, i } of list) {
    const row = { id: lv.id, name: lv.name, secret: !!lv.secret, findings: [], stats: {} };
    report.levels.push(row);
    const F = (kind, sev, msg, where) => { const f = add(lv.id, kind, sev, msg, where); row.findings.push(f); };

    // ---- 1. the level as data: what is in the rock, what is in the air, what nobody can get to ----
    let built = null;
    try { built = lv.build(); } catch (e) { F('CRASH', SEV.bug, 'build() threw: ' + e.message); continue; }
    const W = built.W, H = built.H, grid = built.grid;
    const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : grid[y * W + x];
    row.stats.size = W + 'x' + H;

    for (const e of (built.ents || [])) {
      if (e.hang || e.ride) continue;
      const inRock = solidT(at(e.x, e.y)) && solidT(at(e.x, e.y - 1));
      if (inRock && THREAT[e.t] > 0 && !INROCK_FOE.has(e.t)) F('INSOLID', SEV.bug, e.t + ' spawned inside rock', e.x + ',' + e.y);
      else if (inRock && GROUNDED.has(e.t) && !INROCK_OK.has(e.kind)) F('INSOLID', SEV.bug, (e.t + (e.kind ? ':' + e.kind : '')) + ' inside rock', e.x + ',' + e.y);
      if (GROUNDED.has(e.t) && !HANGS.has(e.kind) && !standT(at(e.x, e.y + 1)))
        F('FLOAT', SEV.odd, (e.t + (e.kind ? ':' + e.kind : '')) + ' stands on nothing', e.x + ',' + e.y);
      // A TORCH CAN HANG ON A WALL, so the ground under it is not the test: the test is ground under it OR
      // rock beside it. (tools/audit.mjs exempts torches outright, which is how one spent months in the air
      // over a ledge in Kingswood.)
      if ((e.t === 'torch' || e.t === 'brazier') && !e.hang && !standT(at(e.x, e.y + 1))
        && !solidT(at(e.x - 1, e.y)) && !solidT(at(e.x + 1, e.y)))
        F('FLOAT', SEV.odd, 'a ' + e.t + ' with no ground under it and no wall beside it', e.x + ',' + e.y);
      if (e.t === 'sign' && !(e.text || '').trim()) F('EMPTY', SEV.odd, 'a sign with nothing on it', e.x + ',' + e.y);
      if (e.t === 'sign' && (e.text || '').length > 420) F('LONGSIGN', SEV.note, 'a sign of ' + e.text.length + ' characters', e.x + ',' + e.y);
    }
    // the same creature twice on the same tile is nearly always a copy-paste
    { const seen = new Map();
      for (const e of (built.ents || [])) { if (THREAT[e.t] === undefined) continue; const k = e.t + '@' + e.x + ',' + e.y;
        if (seen.has(k)) F('DOUBLE', SEV.odd, 'two ' + e.t + ' on the same tile', e.x + ',' + e.y); seen.set(k, 1); } }

    // can you get to the things you are asked to get to?
    try {
      const { near, jumpNear, assisted, seen, footing } = floodReach(built, T);
      row.stats.reached = Math.round(seen.size / Math.max(1, footing.size) * 100) + '%';
      const WANT = { gate: 'THE GATE', check: 'a checkpoint', silver: 'a silver', stray: 'a quest item', relic: 'the relic', key: 'a key' };
      for (const e of (built.ents || [])) { const w = WANT[e.t]; if (!w) continue;
        if (!near(e.x, e.y)) F(assisted ? 'ASSISTED' : 'UNREACHABLE', assisted ? SEV.note : SEV.bug, w + ' is outside the fill', e.x + ',' + e.y); }
      const lost = (built.ents || []).filter(e => e.t === 'coin' && !jumpNear(e.x, e.y));
      if (lost.length) F(assisted ? 'ASSISTED' : 'LOSTGOLD', assisted ? SEV.note : SEV.odd, lost.length + ' coins outside the fill');
    } catch (e) { F('CRASH', SEV.bug, 'reach model threw: ' + e.message); }

    // the shape of the fight, so balance is in the same report as everything else
    { let foes = 0, threat = 0, checks = 0; const kinds = new Set();
      for (const e of (built.ents || [])) { if (e.t === 'check') { checks++; continue; }
        const w = THREAT[e.t]; if (w === undefined) { if (!NOT_A_FOE.test(e.t)) F('UNWEIGHED', SEV.note, 'no threat weight for "' + e.t + '"'); continue; }
        if (w > 0) { foes++; threat += w * (e.mini ? 2 : e.elite ? 3 : 1); kinds.add(e.t); } }
      const span = spanOf(W, H);
      let hazTiles = 0;
      for (let i = 0; i < built.grid.length; i++) if (built.grid[i] === T.SPIKE) hazTiles++;
      for (const p of (built.pools || [])) { if (p.harm) hazTiles += Math.round((p.x1 - p.x0) / TS / 4);
        else if (p.swim) hazTiles += Math.round((p.x1 - p.x0) / TS / 8); }   /* breath is a hazard with nothing in it */
      const gap = worstGap(built.ents, W, H, built.arena);
      Object.assign(row.stats, { foes, threat: Math.round(threat), kinds: kinds.size, checks, worstGap: gap, haz: hazTiles, thr100: +(threat / (span / 100)).toFixed(1), index: indexOf({ threat, kinds: kinds.size, hazTiles, gap, span }) });
      if (gap > 150) F('LONGGAP', SEV.odd, gap + ' columns with no checkpoint in them');
      if (kinds.size < 3) F('THIN', SEV.odd, 'only ' + kinds.size + ' kind(s) of creature in the whole level');
    }

    // ---- 2. the sweep: look at every part of it, on the real loop, with the real art ----
    if (mode !== 'play') {
      inst.drain();
      let blanks = 0, dark = 0, frames = 0, stuckIn = 0; const ms = [];
      try {
        BK.load(i); BK.state = 'play'; BK.start(); BK.god = true; BK.reset();
        const L = BK.L;
        // stand on the footing, left to right, and look at what is there
        const stops = [];
        for (let x = 2; x < W - 2; x += 7) { let y = 1; let found = -1;
          for (y = 1; y < H - 1; y++) if (standT(at(x, y)) && !solidT(at(x, y - 1)) && !solidT(at(x, y - 2))) { found = y - 1; break; }
          if (found > 0) stops.push([x, found]); }
        row.stats.stops = stops.length;
        for (const [sx, sy] of stops) {
          BK.tp(sx, sy); BK.P.hp = BK.P.maxHp; BK.P.dead = 0;
          const t0 = performance.now();
          BK.step(sweepSteps);
          ms.push((performance.now() - t0) / sweepSteps);
          frames++;
          const fs = frameStats(BK);
          if (fs) { if (fs.colours < 4 || fs.flat > 0.985) blanks++; if (fs.lum < 6) dark++; }
          if (!Number.isFinite(BK.P.x) || !Number.isFinite(BK.P.y)) { F('NAN', SEV.bug, 'the player went to NaN', sx + ',' + sy); BK.tp(sx, sy); }
          if (solidT(at(Math.floor(BK.P.x / TS), Math.floor((BK.P.y - 8) / TS)))) stuckIn++;
          await frame();
        }
        // every creature in the level, once: does any of them end up inside the rock or at NaN?
        for (const e of BK.enemies()) {
          if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) F('NAN', SEV.bug, e.t + ' went to NaN');
        }
      } catch (e) { F('CRASH', SEV.bug, 'the sweep threw: ' + (e && e.message), (e && e.stack || '').split('\n')[1]); }
      if (blanks) F('BLANK', SEV.bug, blanks + ' of ' + frames + ' sweep frames had nothing on them');
      if (dark > frames * 0.5 && frames > 3) F('DARK', SEV.odd, dark + ' of ' + frames + ' sweep frames were nearly black');
      if (stuckIn > frames * 0.25) F('INROCK', SEV.odd, 'the bot stood inside rock at ' + stuckIn + ' of ' + frames + ' stops');
      // THE NINETIETH PERCENTILE, NOT THE WORST. Wall-clock on a shared machine picks up whatever else the
      // computer was doing, and one 400ms stall from somebody else's build is not a slow level.
      ms.sort((a, b) => a - b);
      const p90 = ms.length ? ms[Math.min(ms.length - 1, Math.floor(ms.length * 0.9))] : 0;
      const med = ms.length ? ms[Math.floor(ms.length / 2)] : 0;
      if (p90 > 16) F('SLOW', SEV.odd, 'nine frames in ten cost over ' + p90.toFixed(1) + 'ms (median ' + med.toFixed(1) + ')');
      row.stats.ms90 = +p90.toFixed(1);
      const d = inst.drain();
      for (const m of d.errs) F('CRASH', SEV.bug, m);
      for (const m of d.nans) F('NAN', SEV.bug, m);
      for (const m of d.cut) F('TEXTCUT', SEV.odd, 'drawn off the edge: ' + m);
    }

    // ---- 3. the play pass: no god mode, walk right, and see what it costs ----
    if (mode !== 'sweep') {
      inst.drain();
      try {
        BK.load(i); BK.state = 'play'; BK.start(); BK.god = false; BK.reset();
        const gateE = (built.ents || []).find(e => e.t === 'gate');
        const goal = gateE ? gateE.x * TS : (W - 3) * TS;
        let bot = makeBot(BK);
        // RUNTIME FLOATERS. tools/floaters.mjs and floatLab() only ever look at a level at rest, the instant it
        // loads: neither one is running, so a floor that crumbles under the bot, a raft that leaves a chest
        // behind, or a coin spilled onto a ledge and gone through it never shows up until something has actually
        // happened. Every half second while the bot is genuinely playing, ask the same question checkDrawables()
        // asks at load, plus the things drawables() does not carry at all: coins and drops, NPCs and quest
        // strays, and every grounded (non-flying, non-swimming) enemy. A single frame with nothing under it is
        // normal (a hop, a knock-back); two samples running (a full second) is not, so a finding is only raised
        // once a streak crosses that line, and its message is kept live for as long as the streak lasts.
        const FLYERS = BK.flyers ? BK.flyers() : new Set();
        const WATERKIN = BK.waterKin ? BK.waterKin() : new Set();   /* "what the sea does not drown" (main.js): scout, turtle, crab, heronfoe and the rest live IN or BY the water, not on a floor tile */
        const HOPPERS = new Set(['topiary']);   /* updateTopiary's 'lurch' mode is a real jump (vy -170): it is meant to be in the air partway through it */
        const nearMover = (px, py) => { for (const m of BK.movers()) { if (m.gone || m.sink > 0.55) continue;
          const top = m.y + (m.kind === 'pad' ? 2 : 0);
          if (px >= m.x - 4 && px <= m.x + (m.w || 16) + 4 && top >= py - 10 && top <= py + TS + 8) return true; }
          return false; };
        // A CREATURE IS WIDER THAN ONE TILE COLUMN, and a single column at its own x can land on a seam between
        // two tiles while the body it belongs to is squarely over the one beside it - the first pass of this
        // check flagged a plain walking swornsword and a shardling this way. Ask every column its own width
        // actually covers (the same thing checkDrawables() already does with a sprite's foot pixels), and give
        // the row a couple of pixels of slack for a walk-bob or a sub-pixel landing.
        const grounded = (x, y, w) => { const half = Math.max(3, (w || 12) / 2 - 2);
          for (let dx = -half; dx <= half; dx += TS / 2) { const fx = Math.floor((x + dx) / TS);
            for (let dy = -2; dy <= 3; dy++) if (standT(at(fx, Math.floor((y + dy) / TS)))) return true; }
          return nearMover(x, y); };
        const rfStreaks = new Map(); let rfShots = 0;
        const sampleRuntimeFloat = () => {
          const seenNow = new Set();
          const mark = (what, x, y, key) => {
            seenNow.add(key);
            const st = rfStreaks.get(key) || { count: 0 };
            st.count++; rfStreaks.set(key, st);
            if (st.count === 2) {
              st.f = F('RUNTIMEFLOAT', SEV.odd, what + ' floating', Math.round(x / TS) + ',' + Math.round(y / TS));
              if (rfShots < 2) { try { BK.step(0); st.f.shot = BK.buf.toDataURL('image/png'); rfShots++; } catch {} }   /* step(0): no sim, just a fresh draw of what is on screen right now, not a stale frame from up to 40 steps ago */
            } else if (st.count > 2 && st.f) st.f.msg = what + ' floating ' + (st.count * 0.5).toFixed(1) + 's';
          };
          for (const b of checkDrawables(BK, at)) mark(b.what, b.x, b.y, 'd:' + b.what + '@' + Math.round(b.x / TS / 3));
          // COINS ARE NOT CHECKED HERE. A placed coin (no `vy`) hangs in the air on purpose - a trail over a
          // pit, an arc along a jump - exactly like a silver, and checking it flooded the report with the
          // level's own coin trails. A SPILLED coin (thief loot, a broken crate, a cracked cargo hold) carries
          // `vy` and is physical, but the bug in it is that main.js only lands it on `isSolid`, never a ledge,
          // so it falls straight through a one-way platform instead of resting on it - which reads as the coin
          // SINKING out of sight, not floating, and is a different check for a different day.
          // NPCs ONLY, NOT STRAYS. A stray (the quest cup, the caged bird, the sheep) is a collectable like a
          // coin or a silver - the Underleaf's own cup sits "over the gallery's own boards" on purpose - so it
          // is exempt from a floor check for exactly the reason coins are, above.
          for (const pr of BK.props()) { if (pr.t !== 'npc') continue;
            if (!grounded(pr.x, pr.y, 12)) mark(pr.t + (pr.kind ? ':' + pr.kind : ''), pr.x, pr.y, pr.t + ':' + (pr.kind || '') + '@' + Math.round(pr.x / TS / 3)); }
          // GROUNDED ENEMIES ONLY. Besides the flyers (FLYERS, read off main.js so there is one list, not two),
          // `noGrav` is the game's own flag for anything that does not fall - a hovering gull, a drifting ghost,
          // a fixed turret - and INROCK_FOE (already read by the checks above in this file) is every creature
          // that lives IN the rock, the web or the water rather than on top of anything. `wallX` marks a wall
          // clinger the same way. HOPPERS is small on purpose: the topiary beast's own move is a real lurch
          // (updateTopiary's 'lurch' mode: vy -170, same shape as the player's own jump) and it is meant to be
          // in the air partway through it. What is left is genuinely supposed to be standing.
          for (const e of BK.enemies()) { if (!e.alive || e.dying > 0 || FLYERS.has(e.t) || WATERKIN.has(e.t) || HOPPERS.has(e.t) || e === BK.boss) continue;
            if (e.noGrav || e.perch || e.wallX !== undefined || INROCK_FOE.has(e.t)) continue;
            // HIT AND FLYING IS NOT FLOATING. The new down attacks (2026-09-17) land a real hit with real
            // knockback, and a creature mid-stagger is legitimately airborne on the way down, sometimes for
            // longer than a second against a hero swinging for it repeatedly. `stagger`/`hitT` are the fields
            // the creatures themselves already use to know they are in a hit reaction (shardling's own walk
            // gates on `stagger <= 0` above); skip them here for the same reason.
            if ((e.stagger || 0) > 0 || (e.hitT || 0) > 0) continue;
            // FALLING IS NOT FLOATING EITHER. A goblin that has just cut the very bridge it was standing on
            // (updateCutter/dropBridge) drops through the hole it made, and the Hanging Village is eight floors
            // tall - that is a long, genuine fall, not a bug. `floating` means resting with no support UNDER a
            // small vertical speed; a body actively picking up speed downward is doing exactly what gravity says.
            if (Math.abs(e.vy || 0) > 60) continue;
            if (!grounded(e.x, e.y, e.w)) mark(e.t, e.x, e.y, 'e:' + e.t + '@' + Math.floor(e.x / TS)); }
          for (const key of rfStreaks.keys()) if (!seenNow.has(key)) rfStreaks.delete(key);
        };
        let maxX = BK.P.x, deaths0 = BK.stats().deaths, k0 = BK.stats().kills, hurt0 = BK.hitsTaken;
        // WHERE A PLAIN PLAYER CANNOT GET THROUGH. One hard corner used to end the run and the rest of the
        // level went unwalked. It notes the corner, lifts itself over it, and carries on: the report ends up
        // with every place that stopped it instead of only the first.
        const lifts = [];
        const nextFooting = from => { for (let x = from; x < W - 2; x++) for (let y = 1; y < H - 1; y++)
          if (standT(at(x, y)) && !solidT(at(x, y - 1)) && !solidT(at(x, y - 2))) return [x, y - 1]; return null; };
        let dSeen = BK.stats().deaths, dieAt = [], falls = 0, blows = 0, wasHp = BK.P.hp;
        const lift = here => {
          lifts.push(here); dieAt = [];
          const nxt = nextFooting(Math.max(here + 5, Math.round(maxX / TS) + 4));
          if (!nxt) return false;
          BK.tp(nxt[0], nxt[1]); BK.P.hp = BK.P.maxHp; BK.P.dead = 0; bot = makeBot(BK);
          return lifts.length <= 14;
        };
        for (let s = 0; s < playSteps; s++) {
          if (BK.state !== 'play') break;
          const r = bot(goal);
          if (BK.P.hp < wasHp) { blows++; } wasHp = BK.P.hp;
          BK.sim(1);
          if (s % 40 === 0) BK.step(0);            /* look at it now and then, so the draw is exercised too */
          if (s % 30 === 0) sampleRuntimeFloat();   /* every half second: is anything that should stand still standing? */
          maxX = Math.max(maxX, BK.P.x);
          // THREE DEATHS IN THE SAME PLACE IS A PLACE, not bad luck. Note it, lift the bot over it, carry on:
          // the report should end with every corner a plain run cannot get past, not only the first one.
          const dn = BK.stats().deaths;
          if (dn > dSeen) { dSeen = dn; const hx = Math.round(BK.P.x / TS); dieAt.push(hx);
            if (BK.P.hp >= BK.P.maxHp - 1) falls++;
            if (dieAt.length >= 3 && Math.abs(dieAt[dieAt.length - 1] - dieAt[dieAt.length - 3]) < 9) { if (!lift(hx)) break; }
            if (dieAt.length > 6) dieAt.shift(); }
          if (r === 'stuck') { if (!lift(Math.round(BK.P.x / TS))) break; }
          if (s % 400 === 0) await frame();
        }
        row.stats.fell = falls;
        if (lifts.length) F('STUCK', SEV.odd, 'a plain run could not get past ' + lifts.length + ' place(s)', 'tiles ' + lifts.slice(0, 8).join(', '));
        BK.keys.left = BK.keys.right = BK.keys.jump = BK.keys.up = BK.keys.down = false;
        const st = BK.stats();
        const pct = Math.round(maxX / ((W - 2) * TS) * 100);
        Object.assign(row.stats, { walked: pct + '%', deaths: st.deaths - deaths0, kills: st.kills - k0, hp: Math.round(BK.P.hp) });
        Object.assign(row.stats, { hits: BK.hitsTaken - hurt0 });
        const dd = st.deaths - deaths0;
        // a bot that never died and still could not get past something has found GEOMETRY. A bot that died
        // twenty times has found a fight. They are different reports and they must not be the same line.
        // it is only GEOMETRY if the bot never died AND never had to be lifted: otherwise it is just a bot
        // that is bad at the game, which is not news
        // THE BOT CANNOT SWIM and it cannot ride. On a level whose way on is a current, a tide or a mover, a
        // short walk is the bot's limit, not the level's, so it is worth a look and never a bug.
        const wet = (built.pools || []).some(p => p.swim) || (built.moversExtra || []).length > 0
          || (built.ents || []).some(e => e.t === 'doorway' || e.t === 'lockgate');
        if (pct < 60 && dd <= 1 && !lifts.length && BK.state === 'play')
          F('STUCK', wet ? SEV.odd : SEV.bug, 'the bot reached ' + pct + '% and was neither killed nor lifted: ' + (wet ? 'it swims, rides and opens doors, but not well - look by hand' : 'something is in the way'));
        else if (pct < 60 && BK.state === 'play') F('BRUTAL', SEV.odd, 'the bot died ' + dd + ' times and still only got ' + pct + '% of the way');
        else if (dd > 8) F('BRUTAL', SEV.note, 'the bot died ' + dd + ' times crossing it');
      } catch (e) { F('CRASH', SEV.bug, 'the play pass threw: ' + (e && e.message), (e && e.stack || '').split('\n')[1]); }
      const d = inst.drain();
      for (const m of d.errs) F('CRASH', SEV.bug, m);
      for (const m of d.nans) F('NAN', SEV.bug, m);
      for (const m of d.cut) F('TEXTCUT', SEV.odd, 'drawn off the edge: ' + m);
    }

    log('  ' + pad(lv.id, 12) + pad(row.stats.size, 9) + (row.findings.length ? row.findings.length + ' finding(s)' : 'clean'));
    await frame();
  }

  // ---- 4. every screen in the game, and the art itself ----
  if (mode !== 'play') {
    const F = (kind, sev, msg, where) => { add('(screens)', kind, sev, msg, where); };
    inst.drain();
    await sweepScreens(BK, inst, F);
    log('  screens swept');
  }

  // ---- 5. is the ramp a ramp? ----
  // THE RAMP IS THE CAMPAIGN'S, and it is the same index tools/curve.mjs prints - the two have to agree or
  // one of them is lying. A SECRET level is a bonus hanging off the side of an act, not the next step on a
  // sixteen-step slope: counting it makes every reading after it wrong. (UNDERLEAF sits beside Kingswood and
  // UNDERCROWN beside Highcrown; neither is anybody's next level.)
  { const ix = report.levels.filter(r => r.stats.index !== undefined && !r.secret)
      .map(r => ({ id: r.id, v: r.stats.index }));
    for (let k = 1; k < ix.length; k++) { const d = ix[k].v - ix[k - 1].v;
      if (d < RAMP_DROP) add(ix[k].id, 'RAMP', SEV.odd, 'is ' + -d + ' EASIER than ' + ix[k - 1].id + ' before it');
      if (d > RAMP_WALL) add(ix[k].id, 'RAMP', SEV.odd, 'is ' + d + ' harder than ' + ix[k - 1].id + ' before it - a wall'); }
    report.ramp = ix; }

  // put the game back the way it was
  inst.off();
  BK.god = keep.god; BK.SET.sfx = keep.sfx; BK.SET.music = keep.music; BK.PROG.hero = keep.hero;
  BK.keys.left = BK.keys.right = BK.keys.jump = BK.keys.atk = false;
  report.ms = Math.round(performance.now() - t00);
  report.text = format(report);
  log(report.text);
  return report;
}

const pad = (s, n) => String(s).padEnd(n);
// yield the thread so the page stays alive. NOT requestAnimationFrame: a hidden tab never fires one, and a
// bot that only runs when somebody is watching is no use at all.
const frame = () => new Promise(r => setTimeout(r, 0));

// ---------------------------------------------------------------- the written report
function format(r) {
  // ONE LINE PER FINDING. Walking every row of every tab of every screen finds the same collision forty
  // times over, and a report you have to scroll past is a report nobody reads.
  { const seen = new Set(); r.findings = r.findings.filter(f => { const k = f.level + '|' + f.kind + '|' + f.msg;
      if (seen.has(k)) return false; seen.add(k); return true; }); }
  const bug = r.findings.filter(f => f.sev === SEV.bug), odd = r.findings.filter(f => f.sev === SEV.odd), note = r.findings.filter(f => f.sev === SEV.note);
  const out = [];
  out.push('');
  out.push('BRACKEN PLAYTEST   ' + r.levels.length + ' levels   ' + (r.ms / 1000).toFixed(1) + 's');
  out.push('  ' + bug.length + ' bug   ' + odd.length + ' odd   ' + note.length + ' note');
  out.push('');
  out.push(pad('level', 12) + pad('size', 9) + pad('reach', 7) + pad('foes', 6) + pad('kinds', 7) + pad('thr/100', 9) + pad('gap', 6) + pad('walked', 8) + pad('deaths', 8) + 'ms p90');
  for (const l of r.levels) { const s = l.stats;
    out.push(pad(l.id, 12) + pad(s.size || '', 9) + pad(s.reached || '', 7) + pad(s.foes ?? '', 6) + pad(s.kinds ?? '', 7) + pad(s.thr100 ?? '', 9) + pad(s.worstGap ?? '', 6) + pad(s.walked || '', 8) + pad(s.deaths ?? '', 8) + (s.ms90 ?? '')); }
  for (const [name, list] of [['BUGS', bug], ['ODD', odd], ['NOTES', note]]) {
    if (!list.length) continue;
    out.push(''); out.push('== ' + name + ' ==');
    for (const f of list) out.push('  ' + pad(f.level, 12) + pad(f.kind, 12) + f.msg + (f.where ? '   @' + f.where : ''));
  }
  out.push('');
  return out.join('\n');
}
