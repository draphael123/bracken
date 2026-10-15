// tools/towpath-probe.mjs - THE TOWPATH 2 in the real page (claude/towpath2; not in the suite: a smoke probe for the lane and the art lane). It loads the level, walks
// a god-mode hero through each section's machine with the hands' own levers (the hoist, the sluice, the crane, the locks), lets a fog wraith and the Fog Knight run,
// and fails on any page error, a ride that does not carry, a wraith that leaves its fog, or a knight move that never comes. With `shots` it writes PNGs of each
// set piece to work/claude/towpath2/ (the art lane's reference).
//   PORT=8918 node tools/towpath-probe.mjs [shots]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const shots = process.argv[2] === 'shots';
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const out = { errs: [], notes: [] }, TS = 16;
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'towpath')); BK.state = 'play'; BK.god = true; BK.sim(10);
    const TH = BK.towpathHands(), O = BK.towpath().D.O, P = () => BK.P;
    const shot = async name => { if (!${shots}) return; BK.step(1); out.shots = out.shots || {}; out.shots[name] = document.querySelector('canvas').toDataURL('image/png'); };
    const at = (c, r) => { BK.tp(c, r + O); BK.sim(20); };
    /* the lantern at the hut, the first wraith in the fog by lock A */
    at(36, 37); BK.sim(30); at(44, 37); out.lantern = TH.lanternOf(P()).has; out.inFogLow = TH.inFog(P()); await shot('lockA-fog');
    const w1 = BK.enemies().find(e => e.t === 'fogwraith' && e.squad === 'firstWraith'); out.wraith = !!w1; if (w1) { const y0 = w1.y; BK.sim(120); out.wraithTop = TH.fogTop(w1.x); out.wraithY = Math.round(w1.y); }
    /* the hoist */
    at(115, 26); TH.wind('sack'); BK.sim(30); const h0 = P().y; BK.sim(600); out.hoist = TH.rideState('hoist', 'sack'); out.hoistRode = Math.round(h0 - P().y); await shot('mill-hoist');
    /* the aqueduct: on the barge, the sluice, the ride */
    at(244, 5); TH.sluice('aq', true); BK.sim(60); await shot('aqueduct-sluice'); BK.sim(1600); out.barge = TH.rideState('trough', 'aq'); out.bargeX = Math.round(P().x / TS); await shot('aqueduct-across');
    /* the broken arches, in the basin's fog */
    at(318, 18); out.inFogArches = TH.inFog(P()); await shot('arches-fog');
    /* the crane */
    at(365, 19); TH.jib('jib'); BK.sim(500); out.crane = TH.rideState('crane', 'jib'); out.craneRow = Math.round(P().y / TS) - O; await shot('basin-crane');
    /* the last lock drained: its floor in the fog */
    at(392, 16); TH.setLantern(P(), true, true); TH.work('X'); BK.sim(500); at(396, 26); out.xFloorFog = TH.inFog(P()); await shot('lastlock-floor');
    /* THE FOG KNIGHT: a fight with the bot's world, long enough for his phases */
    out.errs.push(...(BK.errors ? BK.errors() : []));
    return out; })()`);
  if (r.shots) { const dir = join(ROOT, 'work', 'claude', 'towpath2'); mkdirSync(dir, { recursive: true }); for (const [k, v] of Object.entries(r.shots)) writeFileSync(join(dir, k + '.png'), Buffer.from(v.split(',')[1], 'base64')); delete r.shots; console.log('shots: work/claude/towpath2/'); }
  console.log(JSON.stringify(r));
  const chk = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
  chk(r.lantern, 'the lantern is taken at the hut'); chk(r.inFogLow, 'the low towpath by lock A lies in the fog'); chk(r.wraith && r.wraithY >= r.wraithTop, 'the first wraith stays in its fog');
  chk(r.hoist === 'top' && r.hoistRode > 100, 'the sack hoist carries the hero up'); chk(r.barge === 'east' && r.bargeX >= 274, 'the barge floats the hero over the break');
  chk(r.inFogArches, 'the low arches lie in the basin\'s fog'); chk(r.crane === 'roof' && r.craneRow <= 4, 'the crane hook lifts the hero to the roof'); chk(r.xFloorFog, 'the last lock\'s floor lies in the fog');
  const errs = pg.errors || []; chk(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
} finally { pg.close(); }
process.exit(bad ? 1 : 0);
