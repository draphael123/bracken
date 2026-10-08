// tools/stuck.mjs - THE STUCK-POINT GUIDE's own check (claude/stuckfix; src/stuck-guide.js, src/stuck-spots.js).
//   STATIC (Node, no page): every listed spot, step by step, RESOLVES a glint target and a nudge line from a stall point in its zone:
//     - the zone holds a place to stand (or swim) that is not inside rock; from it the guide returns THIS step (earlier steps marked done), with
//       at least one target, a target inside the level and not buried in rock, and a nudge line of 62 characters or fewer
//     - every `done` / `when` names a prop that the level really has (so it can never be silently false)
//     - a mover target matches a mover the level really builds
//     - every sign the lane adds stands on something, and fits two lines (tools/signs.mjs counts the rest)
//   RUNTIME (the real page): put a hero at the stall point of each spot, run 11 s with no headway: the nudge is said (the hint box shows the line),
//     the glint target is read back, and the way arrow (Settings: Way-on arrow = STUCK, the default) is handed that target. The canal's own glint
//     and nudge still run on the shared clock (src/canal-hands.js)
//     node tools/stuck.mjs            both        node tools/stuck.mjs --static   Node only
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { STUCK, STUCK_SIGNS } from '../src/stuck-spots.js';
import { resolve, NUDGE, NUDGE_MAX } from '../src/stuck-guide.js';

const TS = 16, fails = [], okc = [];
const ok = (c, m) => { if (!c) fails.push(m); else okc.push(m); };
const SOLIDS = new Set([T.SOLID, T.SPIKE, T.CRATE, T.PALISADE, T.PLANK, T.PORT, T.SOFT, T.ICE, T.CRYST, T.SHELF, T.BOUNCER, T.RAIL]);
const levels = new Map(LEVELS.map(l => [l.id, l]));

/* a level's props and movers the way main.js has them, as far as the guide reads them: type, pixel position, the state fields false */
const envOf = (L, flags = new Set()) => {
  const props = (L.ents || []).map(e => ({ t: e.t, x: e.x * TS + 8, y: e.y * TS + 16, kind: e.kind, ent: e })).map(p => { for (const f of flags) if (f.t === p.t && Math.abs(p.x / TS - f.c - 0.5) <= 1.5 && Math.abs(p.y / TS - f.r) <= 2.5) p[f.f] = true; return p; });
  const movers = (L.moversExtra || []).map(m => ({ ...m, x: m.x ?? 0, y: m.y ?? 0 }))
    .concat((L.ents || []).filter(e => e.t === 'pushblock').map(e => ({ kind: 'pushblock', mantlet: e.mantlet, x: e.x * TS, y: e.y * TS, w: 16, h: 16 })));   /* (claude/unburied4) a pushblock ent is a mover too (main.js spawnEnt: newPushBlock), at its placed tile */
  return { TS, props, movers, hero: null };
};
const solidAt = (L, x, y) => x < 0 || y < 0 || x >= L.W || y >= L.H || SOLIDS.has(L.grid[y * L.W + x]);
const waterAt = (L, x, y) => (L.pools || []).some(p => x * TS >= p.x0 - 4 && x * TS <= p.x1 + 4 && y * TS >= p.y - 2);
/* a place in the zone for a hero to be: standing (air over a floor) or, failing that, in water; the one nearest the zone's target */
function standPoint(L, zone, targets) {
  const [c0, r0, c1, r1] = zone; let best = null, bd = 1e9; const tx = targets.length ? targets[0].x / TS : (c0 + c1) / 2, ty = targets.length ? targets[0].y / TS : (r0 + r1) / 2;
  for (const water of [false, true]) { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    if (solidAt(L, c, r) || solidAt(L, c, r - 1) && !water || (!water && waterAt(L, c, r))) continue;
    const floor = solidAt(L, c, r + 1) || L.grid[(r + 1) * L.W + c] === T.ONEWAY || L.grid[(r + 1) * L.W + c] === T.NET || L.grid[r * L.W + c] === T.NET; if (!floor && !(water && waterAt(L, c, r))) continue;
    const far = Math.hypot(c - tx, r - ty), d = far < 3 ? 1e8 - far : far; if (d < bd) { bd = d; best = [c, r]; } }   /* (not on the thing itself: a key is picked up by standing on it) */ if (best) break; }
  return best;
}
const stepsOf = sp => sp.steps || [sp];

for (const [id, spots] of Object.entries(STUCK)) {
  const lv = levels.get(id); ok(!!lv, id + ': a level in LEVELS'); if (!lv) continue; const L = lv.build();
  const seen = new Set();
  for (const sp of spots) {
    ok(!seen.has(sp.id), sp.id + ': a unique id'); seen.add(sp.id); const steps = stepsOf(sp), flags = new Set();
    for (let i = 0; i < steps.length; i++) { const s = steps[i], tag = sp.id + (sp.steps ? '#' + i : '');
      const zone = s.zone || sp.zone, line = s.line || sp.line;
      ok(typeof line === 'string' && line.length > 0 && line.length <= NUDGE_MAX, tag + ': a nudge line of 1-' + NUDGE_MAX + ' characters (' + (line || '').length + ')');
      ok(line === line.toUpperCase(), tag + ': the nudge is written in capitals like every hint');
      for (const key of ['done', 'when']) if (s[key]) { const [t, c, r] = s[key]; ok((L.ents || []).some(e => e.t === t && Math.abs(e.x - c) <= 1.5 && Math.abs(e.y - r) <= 2.5), tag + ': ' + key + ' names a ' + t + ' the level really has near ' + c + ',' + r); }
      /* the steps before this one are done: mark their `done` props set, and (for a `when` of ours) ours set too */
      if (s.when) { const [t, c, r, f] = s.when; flags.add({ t, c, r, f }); }
      const env = envOf(L, flags), env0 = envOf(L, new Set(s.when ? [{ t: s.when[0], c: s.when[1], r: s.when[2], f: s.when[3] }] : [])), probe = (c, r) => { const a = resolve(id, c, r, env, { [id]: [sp] }); return a && a.key === tag ? a : resolve(id, c, r, env0, { [id]: [sp] }); };   /* (earlier steps done, or none: a step that stands on the same prop as an earlier one is reached by the zone) */
      const ats = s.ats || (s.at ? [s.at] : []);
      if (s.mover) ok(env.movers.some(m => Object.keys(s.mover).every(k => m[k] === s.mover[k])), tag + ': the mover { ' + Object.entries(s.mover).map(([k, v]) => k + ': ' + v).join(', ') + ' } is one the level builds');
      for (const [c, r] of ats) { ok(c >= 0 && r >= 0 && c < L.W && r < L.H, tag + ': the target ' + c + ',' + r + ' is inside the level');
        const buried = solidAt(L, c, r) && solidAt(L, c - 1, r) && solidAt(L, c + 1, r) && solidAt(L, c, r - 1) && solidAt(L, c, r + 1); ok(!buried, tag + ': the target ' + c + ',' + r + ' is not buried in rock'); }
      const targets = ats.map(([c, r]) => ({ x: c * TS + 8, y: (r + 1) * TS })).concat(s.mover ? env.movers.filter(m => Object.keys(s.mover).every(k => m[k] === s.mover[k])).map(m => ({ x: m.x + (m.w || 16) / 2, y: m.y + 6 })) : []);
      const sp0 = standPoint(L, zone, targets); ok(!!sp0, tag + ': the zone ' + JSON.stringify(zone) + ' holds a place to stand or swim'); if (!sp0) continue;
      const res = probe(sp0[0], sp0[1]); ok(!!res && res.key === tag && res.targets.length > 0 && res.line === line, tag + ': from ' + sp0 + ' the guide resolves ' + (res ? res.targets.length : 0) + ' glint target(s) and the nudge');
      /* a hero standing ON the canal barge is not shown the boarding glint */
      if (s.off) { const e2 = envOf(L, flags); e2.hero = { onMover: e2.movers.find(m => Object.keys(s.off).every(k => m[k] === s.off[k])) }; ok(!resolve(id, sp0[0], sp0[1], e2, { [id]: [sp] }), tag + ': aboard, no boarding glint'); }
      if (s.done) { const [t, c, r, f] = s.done; flags.add({ t, c, r, f: f[0] === '!' ? f.slice(1) : f }); }
    }
  }
}
/* THE SIGNS this lane adds / fixes */
for (const [id, S] of Object.entries(STUCK_SIGNS)) { const lv = levels.get(id); if (!lv) { ok(false, id + ': a level in LEVELS'); continue; } const L = lv.build();
  const signs = (L.ents || []).filter(e => e.t === 'sign');
  for (const a of S.add || []) { const e = signs.find(q => q.x === a.x && q.y === a.y && q.text === a.text); ok(!!e, id + ' sign @' + a.x + ',' + a.y + ': is in the built level');
    const feet = L.grid[(a.y + 1) * L.W + a.x], here = L.grid[a.y * L.W + a.x]; ok(here === T.AIR && feet !== T.AIR && feet !== T.SPIKE, id + ' sign @' + a.x + ',' + a.y + ': stands on something (tile under it ' + feet + ', its own tile ' + here + ')'); }
  for (const f of S.fix || []) ok(signs.some(q => q.x === f.x && q.text === f.text), id + ' sign @' + f.x + ': the fixed text is in the built level');
  const words = new Map(); for (const e of signs) words.set(e.text, (words.get(e.text) || 0) + 1); for (const [t, n] of words) ok(n === 1, id + ': "' + t.slice(0, 40) + '" said once (' + n + ')'); }
/* THE VERBS: no capstan sign says TURN any more (the verb is a strike) */
{ const L = levels.get('reef').build(); ok(!L.ents.some(e => e.t === 'sign' && /\bTURN THE CAPSTAN/.test(e.text)), 'reef: no sign says TURN THE CAPSTAN (the verb is STRIKE)'); }

if (fails.length) { console.log('stuck (static): ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('stuck (static) OK: ' + okc.length + ' checks - ' + Object.values(STUCK).reduce((n, a) => n + a.reduce((m, s) => m + stepsOf(s).length, 0), 0) + ' steps in ' + Object.values(STUCK).reduce((n, a) => n + a.length, 0) + ' spots over ' + Object.keys(STUCK).length + ' levels resolve a glint target and a nudge from their stall point');
if (process.argv.includes('--static')) process.exit(0);

/* ---------------- RUNTIME ---------------- */
/* (claude/archmage3) a level chase (THE FALLING TOWER's rising dark) is held at its start while a hero is held at a spot: it would throw a stalled hero up off the
   orrery loft's pier at about 9 s, before the 10 s nudge - which is the chase working, not the guide failing (the guide is what this checks) */
const { openPage } = await import('./cdp.mjs');
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  const plan = []; for (const [id, spots] of Object.entries(STUCK)) { const L = levels.get(id).build(); for (const sp of spots) { const steps = stepsOf(sp), s = steps[0], zone = s.zone || sp.zone; const ats = s.ats || (s.at ? [s.at] : []);
    const env = envOf(L); const targets = ats.map(([c, r]) => ({ x: c * TS + 8, y: (r + 1) * TS })).concat(s.mover ? env.movers.filter(m => Object.keys(s.mover).every(k => m[k] === s.mover[k])).map(m => ({ x: m.x + (m.w || 16) / 2, y: m.y + 6 })) : []);
    const p = standPoint(L, zone, targets); plan.push({ id, spot: sp.id, step0: steps[0] === sp ? null : steps[0], p, line: s.line || sp.line, key: sp.id + (sp.steps ? '#0' : '') }); } }
  R = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});const out=[];const plan=${JSON.stringify(plan)};
    let cur=null; for(const q of plan){ const li=LEVELS.findIndex(l=>l.id===q.id); if(cur!==q.id){BK.load(li);BK.state='play';BK.god=true;BK.sim(30);cur=q.id;}
      BK.state='play';BK.god=true;BKT.guide.reset(q.id);BK.uiHud.hint('',0);BK.tp(q.p[0],q.p[1]);BK.P.vx=0;BK.P.vy=0;BK.sim(2);
      const g0=BKT.guide.read();let said=null;for(let i=0;i<1300&&said===null;i++){if(i%10===0){BK.tp(q.p[0],q.p[1]);BK.P.vx=0;BK.P.vy=0;if(BK.chase&&BK.chase.on())BK.chase.reset();}BK.sim(1);const t=BKT.hintNow;if(t&&t.msg===q.line)said=i;}
      const g=BKT.guide.read();const way=BKT.guide.target(false);out.push({p:q.p,at:[Math.round(BK.P.x/16),Math.round(BK.P.y/16)],spot:q.spot,key:g.key,want:q.key,said,line:g.lastNudge,nudges:g.nudges,targets:g.targets.length,way:!!way,g0:g0.key}); } return out;})()`, 900000);
} finally { pg.close(); }
for (const r of R) { if (r.key !== r.want || r.said === null || r.targets < 1 || !r.way) fails.push(r.spot + ': ' + JSON.stringify(r)); else okc.push(r.spot); }
if (fails.length) { console.log('stuck (runtime): ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('stuck (runtime) OK: ' + R.length + ' spots - a hero held at each one for 11 s is nudged (the hint box shows the line), the glint targets read back, and the way arrow is handed its target');
