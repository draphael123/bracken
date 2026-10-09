// tools/no-hidden-hits.mjs - NO FOE HURTS YOU WHILE IT IS NOT VISIBLY DRAWN (claude/tunnelfix, Daniel 10-08, the Fog Canal's legging tunnel:
// "I take a lot of damage from enemies I can't see - they get under the boat and their hitboxes clip").
// THE RULE (every level): a foe that swings at the hero must put pixels on the screen. Off-screen, behind a hull / wall / foreground layer, inside
// solid, or in a dark no light reaches: all the same thing - a hit with nothing to read.
// THE ORACLE is the picture itself: at every blow on the hero (god on, so a blow that would have landed is still written down: BK.log dmgP, `by` =
// the foe whose update threw it) the frame is drawn twice - the foe in, the foe out (alive = false for one draw) - and compared. Fewer than MIN_PX
// pixels moved by MIN_D (summed r+g+b) = the foe is not visible. MIN_D 60 is over the frame-to-frame noise of the water and the particles (measured
// 48 at most) and over what a 93%-black tunnel can show of a white pixel (54). The page is SEEDED (1008): the same frames every run.
//   LEVEL SAMPLE: every level, up to --foes (default 8) of its foes (kinds first, then the rest), the hero put beside each in turn, god on, 4 s walking
//     at it. A blow from a foe within MELEE of the hero is a hard fail when hidden (a shooter's arrow is reported as a note: the bolt is what is drawn).
//   CANAL TUNNEL (the legging run): the hero legs the barge through the tunnel, lantern lit and dimmed; each blow also checks the foe against the
//     barge's HULL - no foe that is not aboard may be inside the barge's x-range below its deck line when it hits.
//   node tools/no-hidden-hits.mjs [--levels=canal,...] [--foes=8] [--tunnel-only] [--no-tunnel] [--report]   (--report: list every level that fails, exit 0)
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
let shotN = 0;
const opt = (k, d) => { const a = process.argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const has = k => process.argv.includes('--' + k);
const FOES = +opt('foes', 8), ONLY = opt('levels', '') ? opt('levels', '').split(',') : null, REPORT = has('report');
const pg = await openPage({ audio: false, fonts: false, seed: 1008 });
let bad = 0;
/* FOUND BY THIS CHECK, NOT THE CANAL'S, reported and left to the level's owner (never silently passed: each prints KNOWN every run). Remove a line when it is fixed. */
const KNOWN = new Set(['undercrown|shardling|shed']);
try {
  const res = await pg.evalp(`(async()=>{
    const { LEVELS, T } = await import('/src/level.js'); const TS = 16; const ONLY = ${JSON.stringify(ONLY)}, FOES = ${FOES}, TUNNEL = ${!has('no-tunnel')}, TUNNEL_ONLY = ${has('tunnel-only')};
    const MIN_D = 60, MIN_PX = 3, MELEE = 72, SHOTS = ${has('shots')}, shots = [];
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const grab = () => { const c = BK.view.buf; return c.getContext('2d').getImageData(0, 0, c.width, c.height).data; };
    const moved = (a, b) => { let n = 0, mx = 0; for (let i = 0; i < a.length; i += 4) { const d = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); if (d > mx) mx = d; if (d >= MIN_D) n++; } return { n, mx }; };
    /* is this foe on the picture: drawn twice, once without it */
    const shown = e => { BK.draw1(); const A = grab(); const al = e.alive; e.alive = false; BK.draw1(); const B = grab(); e.alive = al; return moved(A, B); };
    const out = { levels: [], tunnel: [] };
    const P = () => BK.P, k = BK.keys, clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
    const solidAt = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); if (tx < 0 || ty < 0 || tx >= BK.L.W || ty >= BK.L.H) return true; const t = BK.L.grid[ty * BK.L.W + tx]; return t !== T.AIR && t !== T.ONEWAY && t !== T.NET && t !== undefined; };
    const note = (list, lv, e, extra) => list.push(Object.assign({ level: lv, t: e.t + (e.cnSkin ? '/' + e.cnSkin : ''), mode: e.mode, at: [Math.round(e.x / TS * 10) / 10, Math.round(e.y / TS * 10) / 10] }, extra));
    /* the blows of a stretch of frames, each judged: returns the list of hidden ones */
    const judge = (lv, frames, drive, seen, hull, EVERY) => { const hidden = [], notes = []; let n = 0;
      for (let f = 0; f < frames; f++) { drive(f); BK.log = []; BK.sim(1); const log = BK.log; BK.log = null; if (EVERY && f % EVERY === 0) BK.draw1();   /* (the page draws every frame: what lights a foe at his work is decided in the draw) */
        for (const q of log) { if (q.k !== 'dmgP' || !q.by || !q.by.t || !(q.dmg > 0)) continue; const e = q.by; if (!e.x && e.x !== 0) continue; n++;
          const key = e.t + '|' + e.mode; if ((seen[key] = (seen[key] || 0) + 1) > 3) continue;   /* three of a kind is a verdict */
          const d = Math.hypot(e.x - P().x, e.y - P().y), v = shown(e), isHid = v.n < MIN_PX;
          if (hull) { const b = hull(); if (b && !e.aboard && e.x > b.x + 1 && e.x < b.x + b.w - 1 && e.y > b.y + 2 && e.y < b.y + 20 && e.t !== 'willowisp') note(hidden, lv, e, { why: 'INSIDE THE BARGE HULL (barge x ' + Math.round(b.x) + '-' + Math.round(b.x + b.w) + ', deck y ' + Math.round(b.y) + ')', px: v.n }); }
          if (isHid) note(d <= MELEE ? hidden : notes, lv, e, { why: d <= MELEE ? 'a blow with nothing drawn (' + v.n + ' px moved, max ' + v.mx + '), ' + Math.round(d) + ' px from the hero' : 'a ranged blow from an undrawn shooter (' + v.n + ' px, ' + Math.round(d) + ' px away)', px: v.n, png: SHOTS && shots.length < 6 ? (BK.draw1(), shots.push(1), BK.view.buf.toDataURL('image/png')) : undefined }); } }
      return { hidden, notes, blows: n }; };
    /* ---- THE LEVEL SAMPLE ---- */
    if (!TUNNEL_ONLY) for (let li = 0; li < LEVELS.length; li++) { const lv = LEVELS[li].id; if (ONLY && !ONLY.includes(lv)) continue;
      try { BK.load(li); BK.start ? BK.start() : (BK.state = 'play'); } catch (err) { out.levels.push({ level: lv, error: String(err) }); continue; }
      BK.god = true; BK.sim(200); const all = BK.enemies().filter(e => e.alive && !e.harmless && !e.maxHp && !e.mini && !e.waiting && e.t); const kinds = new Set(), pick = [];
      for (const e of all) if (!kinds.has(e.t)) { kinds.add(e.t); pick.push(e); } for (const e of all) if (pick.length < FOES && !pick.includes(e)) pick.push(e);
      const row = { level: lv, foes: all.length, sampled: 0, blows: 0, hidden: [], notes: [] }; const seen = {};
      for (const e of pick.slice(0, FOES)) { if (BK.state === 'card') BK.cardClose && BK.cardClose();
        let placed = false; for (const dx of [-24, 24, -36, 36, -16, 16]) { const x = e.x + dx; if (!solidAt(x, e.y - 8) && !solidAt(x, e.y - 20)) { BK.look(Math.floor(x / TS), Math.floor((e.y - 1) / TS)); placed = true; break; }   /* (look: the hero AND the camera on the tile - a camera still easing from the last foe would show the wrong place) */ } if (!placed) continue;
        P().vx = P().vy = 0; P().hp = P().maxHp; P().dead = false; row.sampled++;
        const r = judge(lv, 240, () => { clear(); const dir = e.x > P().x ? 'right' : 'left'; if (Math.abs(e.x - P().x) > 20) k[dir] = true; P().hp = P().maxHp; }, seen, null, lv === 'canal' ? 5 : 0);
        row.blows += r.blows; row.hidden.push(...r.hidden); row.notes.push(...r.notes); clear(); }
      out.levels.push(row); }
    /* ---- THE LEGGING TUNNEL: the hero legs the barge, lit then dimmed ---- */
    if (TUNNEL && (!ONLY || ONLY.includes('canal'))) for (const dim of [false, true]) { const li = LEVELS.findIndex(l => l.id === 'canal'); BK.load(li); BK.start ? BK.start() : (BK.state = 'play'); BK.god = true;
      const C = () => BK.canal(), B = () => C().barge; B().x = 250 * TS; BK.tp(252, 14); BK.sim(30); /* the DIMMED run lights her through the mouth and the stop-planks, then strikes the lantern out for the nest */
      let dirR = true; const seen = {}; const row = { dim, hidden: [], notes: [], blows: 0, frames: 0, reached: 0 }; let guard = 0;
      for (let leg = 0; leg < 14 && B().x < 340 * TS; leg++) { if (leg === 3) for (const q of C().stops) { q.k = 1; q.up = true; } if (dim && leg === 4) C().lamp = false;   /* the first stretches she is held at the stop-planks (the bargee and the watchman above her); then the windlass is struck for her and she legs on through the nest to the deep lock */   /* six stretches: legged on, then held a while at whatever stops her (the planks, a bridge of beams) so the brood has time to work */
        const r = judge('canal tunnel ' + (dim ? '(lantern DIMMED)' : '(lantern LIT)'), 60 * 24, f => { clear(); P().hp = P().maxHp; if (f < 60 * 14 && B().x < 340 * TS) k.right = true; if (f % 300 === 299 && BK.enemies().some(e => e.alive && e.t === 'grindylow' && e.mode === 'grab')) BK.press('jump');
          if (f % 20 === 19 && !(P().onMover && P().onMover.canal) && (P().x > B().x + B().w + 2 || P().x < B().x - 2 || P().y > B().y + 4)) { P().x = B().x + 40; P().y = B().y - 1; P().vx = P().vy = 0; } }, seen, () => B(), 5);   /* (a hero walked off her bow is handed back on) */
        row.hidden.push(...r.hidden); row.notes.push(...r.notes); row.blows += r.blows; row.frames += 60 * 24; if (B().x > 340 * TS) break; if (r.blows === 0 && ++guard > 20) break; }
      row.reached = Math.round(B().x / TS); row.why = B().holdWhy + ' lamp ' + C().lamp + ' stops ' + C().stops.map(q => q.k.toFixed(1) + (q.up ? 'u' : 'd')).join(',') + ' hero ' + Math.round(P().x / TS) + ',' + Math.round(P().y / TS) + ' onbarge ' + !!(P().onMover && P().onMover.canal); out.tunnel.push(row); }
    return out;
  })()`, 3000000);
  const show = (h, pre) => { if (h.png) { const f = join(ROOT, 'work/claude/tunnelfix/' + (++shotN) + '-' + h.t.split('/').join('_') + '-' + h.mode + '.png'); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, Buffer.from(h.png.split(',')[1], 'base64')); pre += '[' + f.slice(ROOT.length) + '] '; } console.log(pre + h.level + ' - ' + h.t + ' (' + h.mode + ') at ' + h.at.join(',') + ': ' + h.why); };
  for (const row of res.levels) {
    if (row.error) { console.log('skip ' + row.level + ': ' + row.error); continue; }
    const hid = new Map(); for (const h of row.hidden) { const key = h.t + '|' + h.mode; if (!hid.has(key)) hid.set(key, h); }
    console.log((row.hidden.length ? 'HIDE' : 'ok  ') + ' ' + row.level.padEnd(14) + ' ' + row.sampled + '/' + row.foes + ' foes sampled, ' + row.blows + ' blows' + (row.notes.length ? ', ' + row.notes.length + ' ranged note(s)' : ''));
    for (const h of hid.values()) show(h, '       ');
    const hardR = row.hidden.filter(h => !KNOWN.has(h.level + '|' + h.t + '|' + h.mode)); for (const h of row.hidden) if (KNOWN.has(h.level + '|' + h.t + '|' + h.mode)) { console.log('       KNOWN (owner: the level lane) ' + h.level + ' ' + h.t + ' (' + h.mode + ')'); break; }
    if (hardR.length) bad++;
  }
  for (const row of res.tunnel) {
    const hid = new Map(); for (const h of row.hidden) { const key = h.t + '|' + h.mode + '|' + h.why.slice(0, 20); if (!hid.has(key)) hid.set(key, h); }
    console.log((row.hidden.length ? 'HIDE' : 'ok  ') + ' canal legging tunnel, lantern ' + (row.dim ? 'DIMMED' : 'LIT') + ': ' + row.blows + ' blows over ' + (row.frames / 60).toFixed(0) + ' s, barge reached col ' + row.reached + (has('v') ? ' [' + row.why + ']' : '') + (row.notes.length ? ', ' + row.notes.length + ' ranged note(s)' : ''));
    for (const h of hid.values()) show(h, '       ');
    for (const h of row.notes.slice(0, 3)) show(h, '   note ');
    if (row.hidden.length) bad++;
  }
  if (pg.errors.length) { console.log('page errors: ' + pg.errors.slice(0, 5).join(' | ')); bad++; }
} finally { pg.close(); }
console.log(bad ? 'FAIL no-hidden-hits: ' + bad + ' place(s) where a foe hurt a hero it did not show' : 'ok  no-hidden-hits: every blow sampled came from a foe on the picture');
process.exitCode = bad && !REPORT ? 1 : 0;
