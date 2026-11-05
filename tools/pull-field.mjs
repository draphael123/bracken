/* tools/pull-field.mjs — THE PULL FIELD does what the water plan asks (scratch/plan-water-1105.md 3b; src/pull-field.js; docs/waterkit.md).
   NODE ONLY (no page, no browser): the four kinds push the right way (a current along its flow, toward/away at its eye, a whirl round and in),
   strength curves, the classes against SWIM (drift / strong / rip), the answers (swim against a drift or a strong field and make headway; a held
   post anchors; a dash slips it; block braces; a pulsed field's release window lets you out), the tell is drawn and felt only as a nudge, heroes /
   foes / heavy foes / shots each by their weight, water-only fields leave the dry alone, a tide-driven current turns with the tide, co-op (four seats
   each with their own carry; one seat's post anchors only him; the dead are left), a stilled field stays still through a reload, and lintPulls. */
import assert from 'node:assert/strict';
import { PULL, TS, pullInit, pullStep, pullBodies, pullShots, flowAt, flowParts, classOf, curveOf, pullStill, pullKey, postNear, lintPulls } from '../src/pull-field.js';
import { tideInit, tideStep, gauge } from '../src/tide-kit.js';
import { WATERKIT_LAB } from '../src/waterkit-lab.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';

const DT = 1 / 60, lab = () => JSON.parse(JSON.stringify(WATERKIT_LAB)), field = (L, id) => L.pulls.find(f => f.id === id);
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const only = (...ids) => { const L = lab(); L.pulls = L.pulls.filter(f => ids.includes(f.id)); return L; };
const onAll = F => { for (const S of F.fields) { S.ph = 'on'; S.t = 1e9; S.s = 1; } return F; };
/* a swimmer: his own stroke (vx px/s) and the field, for s seconds; returns him */
function swim(F, b, vx, s, io = {}, vy = 0) { for (let i = 0; i < s / DT; i++) { b.x += vx * DT; b.y += vy * DT; pullStep(F, DT, io.tide || {}); pullBodies(F, [b], DT, { inWater: () => true, ...io }); } return b; }

/* 1. CLASSES against SWIM 96 */
{ const L = lab(); ok(classOf(field(L, 'drift')) === 'drift', 'a 40 px/s current is a drift'); ok(classOf(field(L, 'channel')) === 'strong', 'a 70 is strong (beatable)');
  ok(classOf(field(L, 'eddy')) === 'rip', 'a 150 whirl (120 grip) is a rip'); ok(classOf({ kind: 'whirl', strength: 100, swirl: 0.6 }) === 'strong', 'a 100 whirl grips only 80: strong'); ok(PULL.swim === 96, 'SWIM is main.js\'s 96');
  ok(curveOf('flat')(0.1) === 1 && curveOf('linear')(0.5) === 0.5 && curveOf('edge')(0) === 0.35 && curveOf('core')(0.3) === 0.25 && curveOf('ease')(1) === 1, 'the curves'); }

/* 2. A CURRENT carries a drifting swimmer downstream; SWIM AGAINST a drift and a strong field and you still make headway (every hero swims at 96) */
{ const F = onAll(pullInit(only('drift'))), f = field(lab(), 'drift'); const b = { x: 14 * TS, y: 38 * TS };
  swim(F, b, 0, 1); ok(b.x > 14 * TS + 30, 'a drift carries you along (' + (b.x - 14 * TS).toFixed(0) + ' px in 1 s)');
  ok(Math.abs(b.y - 38 * TS) < 1e-9, 'and only along its flow');
  for (const h of HERO_MOVE_IDS) { const c = { x: 19 * TS, y: 38 * TS, hero: h }; swim(F, c, -PULL.swim, 1); ok(c.x < 19 * TS - 40, h + ' swims up a drift'); }
  const L = only('channel'); L.pulls[0].tide = undefined; const G = onAll(pullInit(L)); const d = { x: 37 * TS, y: 37 * TS }; swim(G, d, -PULL.swim, 1.5);
  ok(d.x < 37 * TS - 15, 'and up a strong current, slowly (' + (37 * TS - d.x).toFixed(0) + ' px in 1.5 s)'); }

/* 3. A WHIRL drags toward its eye in a spiral; a body at the eye is not flung */
{ const F = onAll(pullInit(only('eddy'))), e = { x: 48 * TS + 8, y: 36 * TS + 8 }; const q = flowAt(F, e.x + 40, e.y);
  ok(q.vx < 0, 'it pulls in'); ok(Math.abs(q.vy) > 5, 'and round (' + q.vy.toFixed(1) + ')'); ok(flowAt(F, e.x + 1, e.y + 1).k === 0 || Math.hypot(flowAt(F, e.x + 1, e.y + 1).vx, flowAt(F, e.x + 1, e.y + 1).vy) === 0, 'still at the eye');
  ok(flowAt(F, e.x + 4 * TS + 2, e.y).k === 0, 'nothing past its rim'); ok(flowAt(F, e.x + 50, e.y).k < flowAt(F, e.x + 20, e.y).k, 'harder toward the eye (edge curve)');
  const b = { x: e.x + 48, y: e.y + 8 }; const d0 = Math.hypot(b.x - e.x, b.y - 8 - e.y); swim(F, b, 0, 0.6); ok(Math.hypot(b.x - e.x, b.y - 8 - e.y) < d0 - 20, 'a still swimmer is drawn in');
  const away = { x: e.x + 10, y: e.y + 8 }; swim(F, away, PULL.swim, 1.5); ok(away.x - e.x < 40, 'a rip is not beaten by swimming (' + (away.x - e.x).toFixed(0) + ')'); }

/* 4. THE ANSWERS on the rip: hold the post, dash, brace, wait for the release window */
{ const L = lab(), f = field(L, 'eddy'), F = onAll(pullInit(only('eddy'))), post = { x: f.posts[0][0] * TS + 8, y: f.posts[0][1] * TS + 8 };
  const b = { x: post.x, y: post.y + 8 + 6, hold: true }, ev = []; for (let i = 0; i < 120; i++) { pullStep(F, DT); ev.push(...pullBodies(F, [b], DT, { inWater: () => true })); }
  ok(b.x === post.x && b.y === post.y + 14, 'a held post anchors you through two seconds of it'); ok(ev.filter(v => v.t === 'grab').length === 1, 'the grab is one event (the clunk)'); ok(postNear(F, post.x, post.y), 'postNear finds it');
  const far = { x: post.x + 40, y: post.y + 8, hold: true }; swim(F, far, 0, 0.2); ok(far.x !== post.x + 40 || far.y !== post.y + 8, 'holding nothing in reach is not a hold');
  const e = { x: 48 * TS + 8, y: 36 * TS + 8 }, flow = Math.hypot(flowAt(F, e.x + 40, e.y).vx, flowAt(F, e.x + 40, e.y).vy);
  const dash = { x: e.x + 40, y: e.y + 8, dashT: 0.3 }, plain = { x: e.x + 40, y: e.y + 8 }; swim(F, dash, 0, 0.2); swim(F, plain, 0, 0.2);
  const md = Math.hypot(dash.x - e.x - 40, dash.y - e.y - 8), mp = Math.hypot(plain.x - e.x - 40, plain.y - e.y - 8);
  ok(md < mp * 0.3, 'a dash slips most of it (' + md.toFixed(1) + ' vs ' + mp.toFixed(1) + ')'); ok(flow * PULL.dash < PULL.swim * PULL.strong, 'inside a dash a rip is weaker than a strong current');
  const br = { x: e.x + 40, y: e.y + 8, block: true }; swim(F, br, 0, 0.2); ok(Math.hypot(br.x - e.x - 40, br.y - e.y - 8) < mp * 0.65, 'a brace halves it');
  /* the release window: the told cycle, then out by swimming in the off */
  const G = pullInit(only('eddy')), S = G.fields[0], c = f.cycle, evs = []; for (let i = 0; i < (c.off + c.tell + c.on + c.off) / DT; i++) evs.push(...pullStep(G, DT));
  ok(evs.map(v => v.t).slice(0, 3).join() === 'tell,on,off', 'it runs off -> tell -> on -> off: ' + evs.map(v => v.t).slice(0, 3));
  const H = pullInit(only('eddy')); for (let i = 0; i < (c.off + 0.5) / DT; i++) pullStep(H, DT); ok(H.fields[0].ph === 'tell' && H.fields[0].s <= 0.16, 'in its tell it stirs, it does not grab (' + H.fields[0].s.toFixed(2) + ')');
  for (const hero of HERO_MOVE_IDS) { const I = pullInit(only('eddy')); for (let i = 0; i < (c.off + c.tell + c.on) / DT; i++) pullStep(I, DT);   /* the off begins */
    const s = { x: e.x + 10, y: e.y + 8, hero }; swim(I, s, PULL.swim, c.off - 0.3); ok(s.x - e.x > 4 * TS, hero + ' swims out of the eye in its release window (' + (s.x - e.x).toFixed(0) + ' px)'); } }

/* 5. WHO IT MOVES: heroes 1, foes 0.6 (heavy half that, anchored none), shots bend; water-only fields leave the dry alone; the gust takes the dry */
{ const F = onAll(pullInit(only('drift'))), y = 38 * TS; const hero = { x: 14 * TS, y }, foe = { x: 14 * TS, y, foe: true }, heavy = { x: 14 * TS, y, foe: true, heavy: true }, anch = { x: 14 * TS, y, foe: true, anchored: true };
  for (let i = 0; i < 60; i++) { pullStep(F, DT); pullBodies(F, [hero, foe, heavy, anch], DT, { inWater: () => true }); }
  const dh = hero.x - 14 * TS, df = foe.x - 14 * TS, dv = heavy.x - 14 * TS; ok(Math.abs(df / dh - 0.6) < 0.06, 'a foe goes 0.6 as far (' + (df / dh).toFixed(2) + ')');
  ok(Math.abs(dv / df - 0.5) < 0.08, 'a heavy foe half that'); ok(anch.x === 14 * TS, 'an anchored foe not at all');
  const dry = { x: 14 * TS, y }; for (let i = 0; i < 60; i++) { pullStep(F, DT); pullBodies(F, [dry], DT, { inWater: () => false }); } ok(dry.x === 14 * TS, 'a water field leaves the dry alone');
  const G = onAll(pullInit(only('gust'))), g = { x: 10 * TS, y: 28 * TS }; for (let i = 0; i < 60; i++) { pullStep(G, DT); pullBodies(G, [g], DT, { inWater: () => false }); } ok(g.x > 10 * TS + 20, 'a gust (water: false) takes you on dry stone, away from its source');
  const shot = { x: 14 * TS, y: 37 * TS, vx: 0, vy: -100 }, ball = { x: 14 * TS, y: 37 * TS, vx: 0, vy: -100, heavy: true }, bolt = { x: 14 * TS, y: 37 * TS, vx: 0, vy: -100, noPull: true };
  for (let i = 0; i < 10; i++) { pullStep(F, DT); pullShots(F, [shot, ball, bolt], DT); }
  ok(shot.vx > 0 && shot.pulled, 'a shot bends with the flow (' + shot.vx.toFixed(1) + ')'); ok(Math.abs(ball.vx / shot.vx - 0.5) < 0.01, 'a heavy one half as much'); ok(bolt.vx === 0, 'noPull flies true'); }

/* 6. CO-OP: four seats, each its own carry; one seat on the post anchors only him; the dead are left alone; enter/leave per seat */
{ const F = onAll(pullInit(only('eddy'))), f = field(lab(), 'eddy'), post = { x: f.posts[0][0] * TS + 8, y: f.posts[0][1] * TS + 8 };
  const p1 = { x: post.x, y: post.y + 14, hold: true }, p2 = { x: post.x, y: post.y + 14 }, p3 = { x: 50 * TS, y: 38 * TS }, p4 = { x: 50 * TS, y: 38 * TS, dead: true }, twin = { x: 50 * TS, y: 38 * TS };
  const ev = []; for (let i = 0; i < 60; i++) { pullStep(F, DT); ev.push(...pullBodies(F, [p1, p2, p3, p4, twin], DT, { inWater: () => true })); }
  ok(p1.x === post.x, 'the seat on the post holds'); ok(p2.x !== post.x || p2.y !== post.y + 14, 'the seat beside him without a grip is taken');
  ok(p4.x === 50 * TS && p4.y === 38 * TS, 'the dead are not dragged'); ok(p3.x === twin.x && p3.y === twin.y, 'two seats in the same place go the same way (no shared remainder)');
  ok(ev.filter(v => v.t === 'enter').length === 4, 'enter is per seat (4 live bodies)'); }

/* 7. TIDE-DRIVEN: the channel runs landward (-x) on the rise, seaward on the fall, and is still at slack water */
{ const L = lab(), kit = tideInit(L), F = pullInit(only('channel')), at = [34 * TS + 8, 36 * TS + 8], seen = {};
  for (let i = 0; i < 40 / DT; i++) { tideStep(kit, DT); const ph = gauge(kit, 'basin').ph; pullStep(F, DT, { tidePh: ph }); const v = flowAt(F, ...at).vx; seen[ph] = seen[ph] || []; seen[ph].push(v); }
  const mid = a => a[Math.floor(a.length * 0.8)]; ok(mid(seen.rise) < -20, 'in on the rise (' + mid(seen.rise).toFixed(0) + ')'); ok(mid(seen.fall) > 20, 'out on the fall (' + mid(seen.fall).toFixed(0) + ')');
  ok(Math.abs(mid(seen.high)) < 1 && Math.abs(mid(seen.low)) < 1, 'slack at high and low'); }

/* 8. THE FLOW LINES (placeholder): drawn along the flow inside the view, nothing for a field out of view, fainter and fewer in a tell */
{ const F = onAll(pullInit(only('drift'))); let r = 0.37; const rand = () => (r = (r * 9301 + 49297) % 233280 / 233280);
  let parts = []; for (let i = 0; i < 60; i++) parts.push(...flowParts(F, DT, { x0: 0, y0: 0, x1: 2000, y1: 2000 }, rand));
  ok(parts.length > 10 && parts.every(p => p.vx > 0 && p.x >= 12 * TS && p.x <= 21 * TS), 'specks run with the current inside it (' + parts.length + '/s)');
  ok(flowParts(F, 1, { x0: 5000, y0: 0, x1: 6000, y1: 100 }, rand).length === 0, 'none off screen');
  const G = pullInit(only('eddy')); G.fields[0].ph = 'tell'; G.fields[0].s = 0.15; let tp = []; for (let i = 0; i < 60; i++) tp.push(...flowParts(G, DT, null, rand));
  const H = onAll(pullInit(only('eddy'))); let hp = []; for (let i = 0; i < 60; i++) hp.push(...flowParts(H, DT, null, rand));
  ok(tp.length > 0 && tp.length < hp.length, 'a tell is drawn, fainter than the bite (' + tp.length + ' vs ' + hp.length + ')'); ok(tp.every(p => p.col === '#9fb8c0'), 'in the tell colour'); }

/* 9. STILLED FOR GOOD: a lever / a broken singing stone winds it down; the mark keeps it still through a reload */
{ const F = onAll(pullInit(only('eddy'))), key = pullStill(F, 'eddy'); ok(key === 'pull:eddy', 'its mark key'); for (let i = 0; i < 90; i++) pullStep(F, DT);
  ok(F.fields[0].s === 0, 'it winds down to nothing'); const b = { x: 50 * TS, y: 38 * TS }; swim(F, b, 0, 1); ok(b.x === 50 * TS, 'and takes no one');
  const G = pullInit(only('eddy'), { off: new Set([key]) }); ok(G.fields[0].still && G.fields[0].s === 0, 'a reload with the mark comes back still'); }

/* 10. LINT: the lab is clean; each rule bites when broken */
{ ok(lintPulls(lab()).length === 0, 'the lab lints clean: ' + lintPulls(lab()).join('; '));
  const bad = (mut, re) => { const L = lab(); mut(L); const p = lintPulls(L); ok(p.some(s => re.test(s)), 'lint catches ' + re + ' (' + p.join('; ') + ')'); };
  bad(L => { const f = field(L, 'eddy'); f.posts = []; f.cycle = undefined; f.ring = [48, 36, 9]; }, /no answer/);
  bad(L => { field(L, 'eddy').cycle.tell = 0.4; }, /tell .* shorter/); bad(L => { field(L, 'eddy').cycle.off = 0.5; }, /release window/);
  bad(L => { field(L, 'drift').kind = 'suck'; }, /not current/); bad(L => { field(L, 'eddy').strength = 700; }, /even a dash/);
  bad(L => { field(L, 'drift').id = 'eddy'; }, /used twice/); bad(L => { field(L, 'eddy').posts = [[10, 10]]; }, /outside its field/); bad(L => { field(L, 'drift').curve = 'wobble'; }, /curve/); }

/* 11. EVERY LEVEL THAT DECLARES PULL FIELDS lints clean (none yet on master) */
{ const { LEVELS } = await import('../src/level.js'); const users = LEVELS.filter(L => L && L.pulls);
  for (const L of users) { const p = lintPulls(L); ok(!p.length, L.id + ': ' + p.join('; ')); } console.log('  levels using pull fields: ' + (users.map(L => L.id).join(', ') || 'none yet')); }

console.log('pull-field: ' + n + ' checks ok');
