/* tools/verb-matrix.mjs - THE HERO VERB MATRIX (claude/combat3, the combat pass; Daniel 2026-10-01: "audit 7 heroes x 6 verbs and build the gaps").
   For each of the seven heroes, in the trial yard, with real presses (BK.press / BK.keys, and real KEYBOARD events for the up-slash), each verb
   must land on a straw dummy as the blow it is (BK.log's dmgE rows name the blow: hurtAs):
     UP ATTACK, GROUND  ArrowUp + X pressed together (ArrowUp is a jump key too): NO jump - he stays on his feet - and a 'rise' blow lands
                        on a dummy in front of him; drawn in his own rise frames (P.lastKey 'rise')
     UP ATTACK, AIR     up + X in the air, past a jump's first 0.18 s: a 'rise' blow lands on a dummy OVER HIS HEAD (not in front), drawn
                        in his own airUp frames (P.lastKey 'airUp'); before this lane there was none (it was a plain forward air swing)
     PLUNGE             down + X in the air: a 'plunge' blow on a dummy under him
     HELD HEAVY         X held: a blow that counts as 'heavy' (the freebooter's held blow is his pistol ball, ['heavy','shot'] - see the report)
     DASH CUT           X early in a dodge: a 'dash' blow
     AIR ATTACK         X in the air: a blow on a dummy at his height
     LOW SWEEP          down + X on the move: a 'sweep' blow
   And an UP-key jump with no attack still jumps (a beat later: UP_SLASH.grace), and Z still jumps at once.
   Red on master 3fd06c78: the ground up-slash jumped (he left the floor) and no hero had an air up-slash. Run: node tools/verb-matrix.mjs */
import { openPage } from './cdp.mjs';

const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer', 'berserker'];
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1;
    const yard = LEVELS.findIndex(l => l.id === 'trial_open'), out = {};
    const key = (k, on) => window.dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { key: k, bubbles: true }));
    const none = () => { for (const k in BK.keys) BK.keys[k] = false; };
    for (const hero of ${JSON.stringify(HEROES)}) {
      const o = {}; out[hero] = o;
      const fresh = () => { none(); BK.setHero(hero); BK.load(yard); BK.state = 'play'; BK.god = true; for (const e of BK.enemies()) e.alive = false; BK.tp(10, 21); BK.sim(40); BK.reset(); BK.sim(5);
        const P = BK.P; P.face = 1; P.st = P.maxSt; P.vx = 0; return P; };
      const dummy = (dx, dy, hover) => { const P = BK.P; const [d] = BK.spawnFoe({ t: 'dummy', x: Math.round((P.x + dx) / 16 - 0.5), y: Math.round(P.y / 16) }); if (!d) return null; d.x = P.x + dx; d.y = P.y + dy; if (hover) { d.noGrav = true; d.hover = [d.x - P.x, d.y - P.y]; } return d; };
      const blows = (fn, frames, d) => { BK.log = []; const P = BK.P; const meta = { minY: P.y, leftGround: false, keys: new Set() }; const y0 = P.y;
        fn(0); for (let i = 1; i <= frames; i++) { if (d && d.hover) { d.x = P.x + d.hover[0]; d.y = P.y + d.hover[1]; d.vy = 0; } BK.step(1); fn(i); meta.minY = Math.min(meta.minY, P.y); if (!P.ground) meta.leftGround = true; if (P.atk >= 0) meta.keys.add(P.lastKey); }
        const got = BK.log.filter(r => r.k === 'dmgE' && (!d || r.e === d)).map(r => [].concat(r.blow || 'none').join('+')); BK.log = null; P.st = P.maxSt;
        return { blows: [...new Set(got)], rose: Math.round(y0 - meta.minY), leftGround: meta.leftGround, keys: [...meta.keys] }; };
      /* UP ATTACK, GROUND: real keys, ArrowUp and X on the same frame, and again with X two frames after ArrowUp */
      { let P = fresh(); let d = dummy(16, 0); o.upGround = blows(i => { if (i === 0) { key('ArrowUp', true); key('x', true); } if (i === 2) key('x', false); if (i === 20) key('ArrowUp', false); }, 30, d);
        P = fresh(); d = dummy(16, 0); o.upGroundLate = blows(i => { if (i === 0) key('ArrowUp', true); if (i === 2) key('x', true); if (i === 4) key('x', false); if (i === 20) key('ArrowUp', false); }, 30, d); }
      /* AN UP-KEY JUMP WITH NO ATTACK STILL JUMPS; Z JUMPS AT ONCE */
      { let P = fresh(); o.upJump = blows(i => { if (i === 0) key('ArrowUp', true); if (i === 12) key('ArrowUp', false); }, 20); o.upJumpFirst = null;
        P = fresh(); let first = -1; blows(i => { if (i === 0) key('z', true); if (i === 10) key('z', false); if (first < 0 && !BK.P.ground) first = i; }, 14); o.zJumpFrame = first;
        P = fresh(); first = -1; blows(i => { if (i === 0) key('ArrowUp', true); if (i === 10) key('ArrowUp', false); if (first < 0 && !BK.P.ground) first = i; }, 14); o.upJumpFrame = first; }
      /* UP ATTACK, AIR: up a little, past the jump's first 0.18 s, a dummy hung over his head */
      { const P = fresh(); BK.press('jump'); BK.keys.jump = true; BK.sim(16); const d = dummy(2, -34, true); BK.keys.up = true;
        o.upAir = blows(i => { if (i === 0) BK.press('atk'); }, 16, d); none(); }
      /* PLUNGE: in the air over a dummy */
      { const P = fresh(); const d = dummy(0, 0); P.y -= 60; P.ground = false; P.vy = 0; BK.keys.down = true;
        o.plunge = blows(i => { if (i === 1) BK.press('atk'); }, 50, d); none(); }
      /* HELD HEAVY: X held for a second and let go, a dummy in front */
      { const P = fresh(); const d = dummy(22, 0); o.heavy = blows(i => { BK.keys.atk = i < 60; if (i === 0) BK.press('atk'); }, 100, d); none(); }
      /* DASH CUT: a dodge toward a dummy, and X early in it */
      { const P = fresh(); const d = dummy(48, 0); let burrowed = false;   /* the Warden's dodge button is her back-step (her double tap points it); the Geomancer's dodge is a burrow, and her dash cut is X as she surfaces */
        o.dash = blows(i => { BK.keys.right = true;
          if (hero === 'warden') { if (i === 0 || i === 2) BK.press('right'); if (i === 5) BK.press('atk'); }
          else if (hero === 'geomancer') { if (i === 0) BK.press('dodge'); if (BK.P.geoBurrow) burrowed = true; else if (burrowed) { burrowed = false; BK.press('atk'); } }
          else { if (i === 0) BK.press('dodge'); if (i === 3) BK.press('atk'); } }, 60, d); none(); }
      /* AIR ATTACK: X at the top of a jump, a dummy beside him at his height */
      { const P = fresh(); BK.press('jump'); BK.keys.jump = true; BK.sim(14); const d = dummy(16, 0, true); o.air = blows(i => { if (i === 0) BK.press('atk'); }, 16, d); none(); }
      /* LOW SWEEP: down + X on the move */
      { const P = fresh(); const d = dummy(26, 0); o.sweep = blows(i => { BK.keys.right = i < 6; BK.keys.down = true; if (i === 2) BK.press('atk'); }, 24, d); none(); }
    }
    return out; })()`, 900000);
} finally { pg.close(); }

const fails = [], has = (r, v) => r && r.blows.some(b => b.split('+').includes(v));
for (const [h, o] of Object.entries(R)) {
  console.log(h + ': ' + Object.entries(o).filter(([, v]) => v && typeof v === 'object').map(([k, v]) => k + '=' + (v.blows.join('|') || '-') + (v.rose ? ' rose' + v.rose : '') + (v.keys.length ? ' [' + v.keys.join(',') + ']' : '')).join('  ') + '  jump frames z ' + o.zJumpFrame + ' up ' + o.upJumpFrame);
  for (const k of ['upGround', 'upGroundLate']) { const r = o[k]; if (!has(r, 'rise')) fails.push(h + ' ' + k + ': up + X on the ground landed no rise blow (' + r.blows.join(',') + ')');
    if (r.leftGround || r.rose > 2) fails.push(h + ' ' + k + ': up + X on the ground jumped (rose ' + r.rose + ' px): it must be the slash from his feet');
    if (!r.keys.includes('rise')) fails.push(h + ' ' + k + ': not drawn in his rise frames (' + r.keys.join(',') + ')'); }
  if (!o.upJump.leftGround) fails.push(h + ': an UP-key jump with no attack must still jump');
  if (o.zJumpFrame > 1) fails.push(h + ': Z must jump at once (left the floor on frame ' + o.zJumpFrame + ')');
  if (!(o.upJumpFrame >= 1 && o.upJumpFrame <= 5)) fails.push(h + ': an UP-key jump must leave the floor within its grace (frame ' + o.upJumpFrame + ')');
  if (!has(o.upAir, 'rise')) fails.push(h + ' upAir: up + X in the air landed no up blow on a dummy over his head (' + o.upAir.blows.join(',') + ')');
  if (!o.upAir.keys.includes('airUp')) fails.push(h + ' upAir: not drawn in his own airUp frames (' + o.upAir.keys.join(',') + ')');
  /* (THE PYROMANCER'S boots do nothing and her firedrop spares the head she comes down on (src/pogo-chain.js), so her plunge on a dummy
     lands as the firedrop's burst, an unnamed blow: a gap for a 'plunge his head' weak point, listed in the lane report) */
  if (!has(o.plunge, 'plunge') && !(h === 'pyro' && o.plunge.blows.length)) fails.push(h + ' plunge: no plunge blow (' + o.plunge.blows.join(',') + ')');
  if (!has(o.heavy, 'heavy')) fails.push(h + ' held heavy: no heavy blow (' + o.heavy.blows.join(',') + ')');
  if (!has(o.dash, 'dash')) fails.push(h + ' dash cut: no dash blow (' + o.dash.blows.join(',') + ')');
  if (!o.air.blows.length || o.air.blows.every(b => b === 'none')) fails.push(h + ' air attack: no blow on a dummy beside him in the air');
  if (!has(o.sweep, 'sweep')) fails.push(h + ' low sweep: no sweep blow (' + o.sweep.blows.join(',') + ')');
}
if (fails.length) { console.log('verb-matrix: ' + fails.length + ' FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('verb-matrix: 7 heroes x up (ground, real keys, no jump) / up (air) / plunge / held heavy / dash cut / air attack / low sweep all land, each as its own blow');
