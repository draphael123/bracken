// src/line-prompts.js - THE LINE PROMPTS (claude/hlfix, Daniel 11-12: "not sure what I am supposed to do here"). Pure data, no DOM: which in-world prompts a level's lines carry.
//   promptsOf(kit) -> [{ key, kind: 'grab' | 'points' | 'hit' | 'post', line, x, y, jump }]       x, y in PX; the hands draw them (src/redraw/high_lines_art.js drawPrompt) while they are not yet USED
//     grab    at the START of every line a rider can take (the low end of a winch, the top of a glide): a chevron and the UP key; `jump` = the rope is out of a standing reach (+JUMP)
//     points  at each points board: hold UP as you pass
//     hit     on the GRIP of a grip-winch while you hang on it (an attack key): shown until you have cranked ONCE on that line (the hands place it at the rider)
//     post    on a strike-post / the hopper (a blow works it): shown until it has been struck once
//   A prompt is told once and then gone: the hands keep a `used` set keyed by `key` ('grab:W3', 'hit:W3', 'points:W3', 'post:hopper:5,3').
//   DATA-DRIVEN ON PURPOSE (HLSWITCH will replace "hit repeatedly to haul" with "one hit on a post runs the line" + lever switches): a different winch rule changes which kinds a line gets
//   here (a post-driven winch gets a 'post' prompt and no 'hit' one - already so), nothing else; the drawing only knows the four kinds and the key labels.
import { lineY, LK, TS } from './line-kit.js';
const startX = z => (z.dir > 0 ? z.xa : z.xb);
export function promptsOf(kit) {
  const out = [], D = (kit.L && kit.L.lineKit) || {}, lands = (kit.L && kit.L.landings) || [], ontoCab = new Set((D.lines || []).filter(d => d.cab).map(d => d.cab.onto));
  for (const z of kit.list) {
    if (z.cabLine || z.npc || z.d.secret || z.d.noPrompt || ontoCab.has(z.id)) continue;
    const x = startX(z), y = lineY(z, x), tx = x / TS;
    const deck = lands.filter(b => tx >= b[0] - 1 && tx <= b[2] + 2 && b[1] * TS >= y - 2).sort((p, q) => p[1] - q[1])[0];   /* the deck he stands on at the start */
    const jump = !!deck && !(y >= deck[1] * TS - LK.UP_LO && y <= deck[1] * TS - LK.UP_HI);   /* the rope is not within a standing reach (24 up .. 4 up): jump, then UP */
    if (deck) out.push({ key: 'grab:' + z.id, kind: 'grab', line: z.id, x, y, jump });   /* a start with no deck under it (F2, a kick from F1) is told by its sign, not a plate in the air */
    for (const p of z.points) out.push({ key: 'points:' + z.id, kind: 'points', line: z.id, x: p.at, y: lineY(z, p.at) });
    if (z.kind === 'winch' && z.d.drive !== 'post') out.push({ key: 'hit:' + z.id, kind: 'hit', line: z.id, x: 0, y: 0 });   /* placed on the rider's grip by the hands */
  }
  for (const p of kit.posts) out.push({ key: 'post:' + p.kind + ':' + Math.round(p.x) + ',' + Math.round(p.y), kind: 'post', line: p.line || p.weight, x: p.x, y: p.y - 14 });
  return out;
}
/* the words on a prompt's key plate, from the input the player is using now: lab = { kind: 'kb' | 'pad' | 'touch', up, jump, atk } (the key / button names; touch has none) */
export function promptWords(p, lab) {
  lab = lab || {}; const L = s => String(s || '').toUpperCase().slice(0, 5);
  if (p.kind === 'hit' || p.kind === 'post') return lab.kind === 'touch' ? '' : L(lab.atk) || 'HIT';
  if (lab.kind === 'touch') return p.jump ? 'JUMP' : '';
  return p.jump ? (L(lab.jump) || 'JUMP') + '+' + (L(lab.up) || 'UP') : (L(lab.up) || 'UP');
}
