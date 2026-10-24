// src/hornets-nest-hands.js - THE HORNET'S NEST's HANDS (claude/hornetsnest). src/hornets-nest.js lays the level; this runs its rule - WAX AND SMOKE - and draws it.
//   COMB      L.combs: a HANGING COMB is cut loose by ANY BLOW on it (a hero's blow box: strike(hb); a ranger's arrow too). It DROPS down its plumb line (drawn, gold,
//             with a ghost of where it lands) and lands on the first footing under it - the ground, a ledge, or a comb that landed before it (two combs STACK into a
//             stair) - as ONE-WAY footing (cellSet). A falling comb knocks a hanging comb under it loose too. What stands where it lands is struck: a foe takes
//             COMB.crush; a hero is shoved up onto it (COMB.heroCrush 0: the comb he cut is his step, never his death - the walker died under its own cuts at 8). A respawn hangs them all again (B4).
//   WAX       L.wax: [x0, x1, row] - the footing row whose top is FRESH COMB: a hero standing on it is held (P.syrupT: main.js's shared slow, the run's cap 40).
//   HONEY     (claude/hornetsnest2) the same hold, laid at run time: addHoney(x0, x1, row, t, kind) - THE HONEY HALL's flood (src/hornet-queen-hands.js tearHall, for the
//             fight) and a FAT HONEY HORNET's glob where it splashes (src/honey-hornet.js, a few seconds). honey() lists them; a respawn takes them up.
//   HALL COMBS (claude/hornetsnest2) addCombs([...]): THE HORNET QUEEN's torn combs and THE LAST COMB hang from the torn vault as combs like the level's (cut, drop, land as footing);
//             they carry hq: true (her hands read them: a comb that falls on her pins her). A respawn takes them up.
//   SMOKE     L.smokers: the honey-hunters' SMOKE STANDS (they never run out). E takes a SMOKE POT: carried (P.carry, THROW_KIND.smokepot: slower, no swing - you can
//             still jump); its smoke QUIETS every swarm and hornet within SMOKE.aura of you. E sets it down (it smoulders where it stands SMOKE.rest s, quieting
//             round it). ATTACK THROWS IT (src/carry-throw.js's told arc: UP lobs, DOWN tosses short): it BREAKS where it lands and leaves a CLOUD (SMOKE.cloudR,
//             SMOKE.cloudT s) - a quiet patch. A blow on you makes you drop it (it smoulders where it falls). calm(x, y) answers "is this spot smoked".
//   BROOD     L.broodCells: a cell PULSES (told: it swells and glows red, a rising buzz, !!) when a hero comes near - one at a time - for BROOD.pulse s; a blow on a
//             cell (pulsing or not) SMASHES it; a pulse that runs out HATCHES it: BROOD.n hornets. Smashed / hatched cells stay so (a respawn makes them whole).
// PURE but for ctx (main.js builds it): L(), players(), P(), keys(), enemies(), solidPx(x, y, falling), footAt(tx, ty) (a tile a comb lands on), cellSet(x, y, t),
//   T, number, text, burst, dust, sfx, hint(msg), told(k) / tell(k), hurtFoe(e, d, x), shoveHero(pp, y, d), spawnHornet(x, y), onQueen(x, y) -> bool, queen(),
//   arrows() -> [{ x, y, state }] (the ranger's arrows in flight)
import * as CT from './carry-throw.js';
import { drawSwarm } from './hornet-swarm.js';
import * as HNP from './redraw/hornets_nest_props.js';
import * as HNHY from './redraw/hornets_nest_honey.js';
import * as HNHL from './redraw/hornets_nest_hall.js';
import * as HNE from './redraw/hornets_nest_edge.js';   /* (claude/hornets2art) the old pines and the marsh edge */   /* (claude/hornets2art) the honey: the sticky patch, the hall's flood and combs */   /* (claude/hornetsnestart) the props, drawn */
export const SMOKE = { reachX: 15, reachY: 18, aura: 58, rest: 7, cloudR: 46, cloudT: 6, dmg: 3, stagger: 0.7, keep: 3, col: '#c8d0d8' };
export const COMB = { g: 900, maxV: 520, crush: 24, heroCrush: 0, sticky: 0.12 };
export const BROOD = { near: 120, pulse: 3.2, n: 2 };
export const NEST_SAY = { take: 'A SMOKE POT: CARRY IT, OR ATTACK TO THROW IT', down: 'YOU SET THE POT DOWN: IT SMOULDERS', dropped: 'A BLOW: YOU DROP THE POT', broke: 'THE POT BREAKS: SMOKE',
  cut: 'CUT LOOSE', crushed: 'THE COMB COMES DOWN ON IT', stacked: 'IT LANDS ON THE COMB BELOW', pulse: '!!', smash: 'SMASHED', hatch: 'IT HATCHES', sticky: 'FRESH COMB: IT HOLDS YOUR FEET' };
export const NEST_HINT = { pot: 'E TAKES A SMOKE POT. CARRIED, THE SWARMS NEAR YOU GO QUIET - YOU CANNOT SWING, BUT YOU CAN JUMP. ATTACK THROWS IT: WHERE IT BREAKS, THE SMOKE STAYS.',
  comb: 'ANY BLOW CUTS A HANGING COMB LOOSE. IT DROPS DOWN ITS GOLD LINE AND LANDS AS A STEP.', brood: 'A PULSING BROOD CELL IS ABOUT TO HATCH: ONE BLOW SMASHES IT.' };
/* THE HERO'S POSE HOOKS (the art lane draws them for every hero, like the Fen Road's plank: main.js reads none yet): P.potPose = 'carry' (the pot held out on its
   bail, smoke trailing), 'throw' (the pot swung up and let go: SMOKE_POSES throwT) */
export const SMOKE_POSES = ['carry', 'throw'];
CT.addKind('smokepot', { aims: { low: { vx: 100, vy: -110 }, mid: { vx: 165, vy: -190 }, high: { vx: 105, vy: -325 } }, g: 620, r: 3, ring: 12, dots: 14 });

export function makeNestHands(ctx) {
  let combs = [], stands = [], pots = [], clouds = [], cells = [], honey = [], splashes = [], arc = null, near = null, inited = null;
  const W = { n: { cut: 0, landed: 0, crushed: 0, taken: 0, thrown: 0, broke: 0, setDown: 0, dropped: 0, smashed: 0, hatched: 0, stuck: 0 } };
  const TS = 16, R = Math.round;
  const held = P => (P && P.carry && P.carry.t === 'smokepot' ? P.carry : null);
  const handAt = P => ({ x: P.x + (P.face || 1) * 6, y: P.y - 16 });
  const L = () => ctx.L();
  W.on = () => !!(L() && L().hornetsNest);
  /* ---------- RESET (every spawnEntities: a load and a respawn) - the combs hang again, the cells are whole, no pot in the air ---------- */
  W.reset = () => {
    const Lv = L(); if (!Lv || !Lv.hornetsNest) { combs = []; stands = []; pots = []; clouds = []; cells = []; honey = []; splashes = []; return; }
    for (const c of combs) if (c.st === 'down' || c.cells) for (const [x, y] of c.cells || []) ctx.cellSet(x, y, ctx.T.AIR);   /* (what a landed comb laid is taken up: the grid under it was air) */
    combs = (Lv.combs || []).map(c => ({ ...c, st: 'hang', y: c.row * TS, vy: 0, cells: null })); honey = []; splashes = [];
    stands = (Lv.smokers || []).map(([x, row]) => ({ x: x * TS + 8, y: (row + 1) * TS }));
    cells = (Lv.broodCells || []).map(c => ({ x: c.x * TS + 8, y: (c.y + 1) * TS, st: 'idle', t: 0 }));
    pots = []; clouds = []; arc = null; near = null; inited = Lv;
  };
  W.combs = () => combs;
  /* (claude/hornetsnest2) THE HALL'S COMBS hang (THE HORNET QUEEN's tear): [{ id, x0, x1, row, rows, last, hq }] - combs like the level's */
  W.addCombs = list => { for (const c of list) if (!combs.some(o => o.id === c.id)) combs.push({ ...c, st: 'hang', y: c.row * TS, vy: 0, cells: null }); };
  /* (claude/hornetsnest2) HONEY: sticky footing laid at run time, px x0..x1 on the footing row `row`, for t s (Infinity: the hall's flood) */
  W.addHoney = (x0, x1, row, t = 6, kind = 'glob') => { honey.push({ x0, x1, row, t, t0: t, kind }); if (honey.length > 24) honey.splice(honey.findIndex(h => h.kind !== 'flood'), 1); };
  W.honey = () => honey;
  W.stickyAt = (x, y) => { const ty = Math.floor((y + 2) / TS), Lv = L(); for (const [x0, x1, row] of Lv.wax || []) if (row === ty && x > x0 * TS - 2 && x < (x1 + 1) * TS + 2) return true; for (const h of honey) if (h.row === ty && x > h.x0 - 2 && x < h.x1 + 2) return true; return false; };
  W.cells = () => cells;
  W.clouds = () => clouds;
  W.stands = () => stands.map(s => ({ x: s.x, y: s.y }));
  W.held = () => !!held(ctx.P());
  /* ---------- SMOKE: is (x, y) quiet? (a carried pot's smoke round its holder, a set-down pot's, a cloud) ---------- */
  W.calm = (x, y) => {
    for (const q of pots) { if (q.state === 'held' && q.holder && !q.holder.dead) { if (Math.hypot(q.holder.x - x, q.holder.y - 14 - y) < SMOKE.aura) return true; }
      else if (q.state === 'rest' && q.smoulder > 0 && Math.hypot(q.x - x, q.y - 8 - y) < SMOKE.aura) return true; }
    for (const c of clouds) if (Math.hypot(c.x - x, c.y - y) < c.r) return true;
    return false; };
  /* how much smoke is UNDER a point (the Hornet Queen's daze: a cloud or a held / set pot below her, within r across and h below): the source, or null */
  W.smokeUnder = (x, y, r = 30, h = 90) => {
    for (const c of clouds) if (Math.abs(c.x - x) < r + c.r * 0.5 && c.y > y - 10 && c.y - y < h + c.r * 0.5) return { kind: 'cloud', x: c.x, y: c.y };
    for (const q of pots) { const px = q.state === 'held' ? (q.holder ? q.holder.x : q.x) : q.x, py = q.state === 'held' ? (q.holder ? q.holder.y - 14 : q.y) : q.y - 6;
      if ((q.state === 'held' || (q.state === 'rest' && q.smoulder > 0)) && Math.abs(px - x) < r && py > y - 10 && py - y < h) return { kind: q.state, x: px, y: py }; }
    return null; };
  W.calmFoe = e => W.on() && W.calm(e.x, e.y - (e.h || 8) / 2);
  /* ---------- E: take a pot off a stand (or a resting one back up), set the one you hold down ---------- */
  const reachable = P => { if (!P || P.dead || P.carry || !P.ground) return null;
    const s = stands.find(c => Math.abs(P.x - c.x) < SMOKE.reachX && Math.abs(P.y - c.y) < SMOKE.reachY); if (s) return s;
    return pots.find(q => q.state === 'rest' && q.smoulder > 0 && Math.abs(P.x - q.x) < SMOKE.reachX + 4 && Math.abs(P.y - q.y) < SMOKE.reachY) || null; };
  W.canTake = () => !!reachable(ctx.P());
  W.interact = P => {
    if (!W.on() || !P || P.dead) return false;
    const h = held(P);
    if (h) { if (!P.ground) return false; P.carry = null; h.state = 'rest'; h.x = P.x + (P.face || 1) * 10; h.y = P.y; h.smoulder = SMOKE.rest; h.vx = 0; h.vy = 0; W.n.setDown++; P.potPose = null;
      ctx.number(P.x, P.y - 34, NEST_SAY.down, SMOKE.col); ctx.dust(h.x, h.y, 3); return true; }
    const c = reachable(P); if (!c) return false;
    if (c.state === 'rest') c.state = 'gone';
    W.n.taken++;
    const q = { t: 'smokepot', thrKind: 'smokepot', state: 'held', holder: P, x: P.x, y: P.y - 16, vx: 0, vy: 0, smoulder: SMOKE.rest, hurtWas: P.hurt > 0, launch: PP => CT.launchOf('smokepot', PP, ctx.keys ? ctx.keys() : {}) };
    pots.push(q); P.carry = q; P.potPose = 'carry'; ctx.sfx.clank && ctx.sfx.clank();
    ctx.number(P.x, P.y - 34, NEST_SAY.take, SMOKE.col);
    if (!ctx.told('pot')) { ctx.tell('pot'); ctx.hint(NEST_HINT.pot); }
    return true; };
  const breakAt = (q, x, y) => { q.state = 'gone'; W.n.broke++; clouds.push({ x, y: y - 10, r: SMOKE.cloudR, t: SMOKE.cloudT, t0: SMOKE.cloudT }); ctx.burst(x, y - 6, 14, ['#c8d0d8', '#9aa0a8', '#e8ecf0', '#8a5a32'], 70, 0.8);
    ctx.sfx.crack && ctx.sfx.crack(); ctx.sfx.puff && ctx.sfx.puff(); ctx.number(x, y - 30, NEST_SAY.broke, SMOKE.col); };
  const foeAt = (x, y) => { for (const e of ctx.enemies()) { if (!e.alive || e.harmless || e.boss) continue; const w = (e.w || 14) / 2 + 3, h = (e.h || 20) + 3; if (x > e.x - w && x < e.x + w && y > e.y - h && y < e.y + 3) return e; } return null; };
  /* ---------- COMB: cut, fall, land ---------- */
  const combBox = c => ({ l: c.x0 * TS, r: (c.x1 + 1) * TS, t: c.y, b: c.y + c.rows * TS + 16 });   /* (its stalk and drips hang a tile under it: a blow there cuts it too - a rising cut from the footing three rows under) */
  /* where a comb falling from its current y lands (its top row): the first footing row under any of its columns, read off the LIVE grid (another comb laid there counts) */
  const landRow = c => { const H = L().H; for (let y = Math.floor((c.y + c.rows * TS) / TS); y < H; y++) for (let x = c.x0; x <= c.x1; x++) if (ctx.footAt(x, y)) return y - c.rows; return H - c.rows; };
  W.landRow = c => landRow(c);
  const cut = (c, why) => { if (c.st !== 'hang') return false; c.st = 'fall'; c.vy = 0; W.n.cut++; ctx.sfx.crack && ctx.sfx.crack(); ctx.burst((c.x0 + c.x1 + 1) * TS / 2, c.y, 8, ['#e0b040', '#fff1a0', '#8a5a32'], 60, 0.5);
    if (!ctx.told('comb')) { ctx.tell('comb'); ctx.hint(NEST_HINT.comb); }
    if (why !== 'knock') ctx.number((c.x0 + c.x1 + 1) * TS / 2, c.y - 6, NEST_SAY.cut, '#ffd36b'); return true; };
  W.cut = id => { const c = combs.find(q => q.id === id); return c ? cut(c) : false; };
  const land = c => {
    const top = landRow(c); c.y = top * TS; c.vy = 0; c.st = 'down'; c.cells = [];
    const stacked = (() => { for (let x = c.x0; x <= c.x1; x++) if (combs.some(o => o !== c && o.st === 'down' && o.cells && o.cells.some(([cx, cy]) => cx === x && cy === top + c.rows))) return true; return false; })();
    for (let y = top; y < top + c.rows; y++) for (let x = c.x0; x <= c.x1; x++) { ctx.cellSet(x, y, ctx.T.ONEWAY); c.cells.push([x, y]); }
    if (c.hq && honey.some(h => h.kind === 'flood')) { splashes.push({ x: (c.x0 + c.x1 + 1) * TS / 2, y: (top + c.rows) * TS, w: (c.x1 - c.x0 + 1) * TS, t: 0 }); ctx.burst((c.x0 + c.x1 + 1) * TS / 2, (top + c.rows) * TS - 6, c.last ? 22 : 12, ['#ffd36b', '#fff4b0', '#c47a14', '#e0a020'], 110, 0.7); ctx.sfx.squelch && ctx.sfx.squelch(); }   /* (claude/hornets2art) a comb dropped into the honey: it splashes */
    W.n.landed++; ctx.sfx.thud && ctx.sfx.thud(); ctx.dust((c.x0 + c.x1 + 1) * TS / 2, (top + c.rows) * TS, 10);
    if (stacked) ctx.number((c.x0 + c.x1 + 1) * TS / 2, top * TS - 10, NEST_SAY.stacked, '#ffd36b');
    const box = { l: c.x0 * TS, r: (c.x1 + 1) * TS, t: top * TS, b: (top + c.rows) * TS };
    for (const e of ctx.enemies()) { if (!e.alive || e.boss) continue; const w = (e.w || 12) / 2; if (e.x + w > box.l && e.x - w < box.r && e.y > box.t && e.y - (e.h || 10) < box.b + 4) { W.n.crushed++; ctx.hurtFoe(e, COMB.crush, e.x); ctx.number(e.x, e.y - 24, NEST_SAY.crushed, '#ffd36b'); } }
    for (const pp of ctx.players()) { if (pp.dead) continue; if (pp.x + 5 > box.l && pp.x - 5 < box.r && pp.y > box.t + 1 && pp.y - 24 < box.b) ctx.shoveHero(pp, box.t, COMB.heroCrush); }
    if (ctx.onLand) ctx.onLand(c, box);
  };
  /* A HERO'S BLOW (main.js attackBox): a hanging comb is cut loose; a brood cell is smashed */
  W.strike = hb => { if (!W.on() || !hb) return;
    for (const c of combs) { if (c.st !== 'hang') continue; const b = combBox(c); if (hb.l < b.r && hb.r > b.l && hb.t < b.b && hb.b > b.t) cut(c); }
    for (const k of cells) { if (k.st !== 'idle' && k.st !== 'pulse') continue; if (hb.l < k.x + 8 && hb.r > k.x - 8 && hb.t < k.y && hb.b > k.y - 14) smash(k); } };
  const smash = k => { k.st = 'broken'; W.n.smashed++; ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(k.x, k.y - 6, 12, ['#e0b040', '#fff1a0', '#c06040', '#f0e0c0'], 70, 0.6); ctx.number(k.x, k.y - 22, NEST_SAY.smash, '#8fd160'); };
  W.smash = smash;
  /* ---------- ONE FRAME ---------- */
  W.update = dt => {
    if (!W.on()) return; if (inited !== L()) W.reset();
    const P = ctx.P(), Lv = L();
    /* WAX: fresh comb under your feet holds them (the shared slow: main.js caps the run at FT2.syrup.cap while P.syrupT > 0 on the ground) */
    for (const pp of ctx.players()) { if (!pp || pp.dead) continue; let on = false;
      if (pp.ground) on = W.stickyAt(pp.x, pp.y);   /* (fresh comb, and honey: the hall's flood, a fat hornet's glob) */
      pp.syrupT = on ? COMB.sticky : Math.max(0, (pp.syrupT || 0) - dt);
      if (on && pp === P && !ctx.told('sticky')) { ctx.tell('sticky'); ctx.number(pp.x, pp.y - 30, NEST_SAY.sticky, '#e0b040'); } }
    for (const h of honey) h.t -= dt; honey = honey.filter(h => h.t > 0);
    for (const s of splashes) s.t += dt; splashes = splashes.filter(s => s.t < 0.9);
    /* COMBS falling */
    for (const c of combs) { if (c.st !== 'fall') continue;
      c.vy = Math.min(COMB.maxV, c.vy + COMB.g * dt); const top = landRow(c), ny = c.y + c.vy * dt;
      /* a hanging comb in its way is knocked loose and falls with it */
      for (const o of combs) if (o !== c && o.st === 'hang' && o.x0 <= c.x1 && o.x1 >= c.x0 && o.y >= c.y + c.rows * TS - 2 && o.y <= ny + c.rows * TS + 2) cut(o, 'knock');
      if (ny >= top * TS) land(c); else c.y = ny; }
    /* THE RANGER's arrow cuts a hanging comb (every hero cuts one with a blade; hers reaches) */
    for (const a of (ctx.arrows ? ctx.arrows() : [])) { if (a.state !== 'fly') continue; for (const c of combs) { if (c.st !== 'hang') continue; const b = combBox(c); if (a.x > b.l && a.x < b.r && a.y > b.t && a.y < b.b) { cut(c); a.state = 'drop'; a.vy = -40; a.vx *= -0.1; } } }
    /* SMOKE POTS */
    for (const q of pots) {
      if (q.state === 'held') { const H = q.holder;
        if (!H || H.dead || H.carry !== q) { if (H && H.potPose === 'carry') H.potPose = null; if (q.state === 'held') q.state = 'gone'; continue; }
        const h = handAt(H); q.x = h.x; q.y = h.y; if (Math.random() < dt * 14) ctx.burst(q.x, q.y - 6, 1, ['#c8d0d8', '#9aa0a8'], 14, 0.9, -40);
        if ((H.hurt > 0 && !q.hurtWas) || H.swim) { H.carry = null; H.potPose = null; W.n.dropped++; q.state = 'rest'; q.x = H.x - (H.face || 1) * 8; q.y = H.y; q.smoulder = SMOKE.rest * 0.6; ctx.number(H.x, H.y - 34, NEST_SAY.dropped, '#ff9a5c'); continue; }
        q.hurtWas = H.hurt > 0; continue; }
      if (q.state === 'fly') { if (!q.counted) { q.counted = true; W.n.thrown++; if (q.holder) { q.holder.potPose = 'throw'; q.holder.potPoseT = 0.25; } } q.holder = null;
        const k = CT.KINDS.smokepot, px = q.x, py = q.y; CT.stepArc(q, dt, k.g);
        if (ctx.onQueen && ctx.onQueen(q.x, q.y, q)) { breakAt(q, q.x, q.y + 8); continue; }   /* (the Hornet Queen's hands: a pot that meets her breaks on her) */
        { const hc = combs.find(c => c.st === 'hang' && (() => { const b = combBox(c); return q.x > b.l && q.x < b.r && q.y > b.t && q.y < b.b - 16; })()); if (hc) { cut(hc); breakAt(q, q.x, q.y + 6); continue; } }   /* (claude/hornetsnest2) a THROWN POT that meets a hanging comb cuts it loose (and breaks: smoke) - every hero's reach to a high comb */
        const e = foeAt(q.x, q.y); if (e) { ctx.hurtFoe(e, SMOKE.dmg, q.x); breakAt(q, q.x, q.y + 6); continue; }
        if (ctx.solidPx(q.x + Math.sign(q.vx) * k.r, py, false) && !ctx.solidPx(px, py, false)) { breakAt(q, px, py); continue; }
        if (q.vy < 0 && ctx.solidPx(q.x, q.y - k.r, false)) { breakAt(q, q.x, q.y + 4); continue; }
        if (q.vy >= 0 && ctx.solidPx(q.x, q.y + k.r, true)) { breakAt(q, q.x, Math.floor((q.y + k.r) / TS) * TS); continue; }
        if (q.y > Lv.H * TS) q.state = 'gone';
        continue; }
      if (q.state === 'rest') { q.smoulder -= dt; if (q.smoulder <= 0) { q.state = 'gone'; continue; }
        if (!ctx.solidPx(q.x, q.y + 2, true)) { q.vy = Math.min(300, (q.vy || 0) + 640 * dt); q.y += q.vy * dt; if (q.y > Lv.H * TS) q.state = 'gone'; } else q.vy = 0;
        if (Math.random() < dt * 8) ctx.burst(q.x, q.y - 8, 1, ['#c8d0d8', '#9aa0a8'], 12, 1.0, -40); }
    }
    for (const pp of ctx.players()) if (pp && pp.potPoseT > 0) { pp.potPoseT -= dt; if (pp.potPoseT <= 0) pp.potPose = held(pp) ? 'carry' : null; }
    pots = pots.filter(q => q.state !== 'gone');
    { const rest = pots.filter(q => q.state === 'rest'); if (rest.length > SMOKE.keep) { rest[0].state = 'gone'; pots = pots.filter(q => q.state !== 'gone'); } }
    for (const c of clouds) { c.t -= dt; if (Math.random() < dt * 10) ctx.burst(c.x + (Math.random() - 0.5) * c.r, c.y + (Math.random() - 0.5) * c.r * 0.6, 1, ['#c8d0d8', '#e8ecf0'], 10, 1.2, -20); }
    clouds = clouds.filter(c => c.t > 0);
    /* BROOD CELLS: one pulses at a time, when a hero comes near; a pulse that runs out hatches it */
    { const pulsing = cells.find(k => k.st === 'pulse');
      if (pulsing) { pulsing.t -= dt; if (Math.random() < dt * 6) ctx.burst(pulsing.x, pulsing.y - 8, 1, ['#ff6b4a', '#ffd36b'], 20, 0.5);
        if (pulsing.t <= 0) { pulsing.st = 'hatched'; W.n.hatched++; ctx.sfx.buzz && ctx.sfx.buzz(); ctx.number(pulsing.x, pulsing.y - 24, NEST_SAY.hatch, '#ff6b6b'); for (let i = 0; i < BROOD.n; i++) ctx.spawnHornet(pulsing.x + (i ? 10 : -10), pulsing.y - 20 - i * 6); } }
      else for (const k of cells) { if (k.st !== 'idle') continue; if (ctx.players().some(pp => !pp.dead && Math.abs(pp.x - k.x) < BROOD.near && Math.abs(pp.y - k.y) < 60)) { k.st = 'pulse'; k.t = BROOD.pulse; ctx.number(k.x, k.y - 22, NEST_SAY.pulse, '#ff6b6b'); ctx.sfx.buzz && ctx.sfx.buzz(); if (!ctx.told('brood')) { ctx.tell('brood'); ctx.hint(NEST_HINT.brood); } break; } } }
    near = reachable(P);
    arc = held(P) && !P.dead ? (() => { const h = handAt(P), a = CT.aimOf('smokepot', P.face || 1, ctx.keys ? ctx.keys() : {}), v = { vx: a.vx, vy: a.vy };
      return CT.predictArc('smokepot', h.x, h.y, v, ctx.solidPx, { stopAt: (x, y) => foeAt(x, y) || (ctx.onQueen && ctx.onQueen(x, y, null)) }); })() : null;
  };
  W.props = () => combs.map(c => ({ t: 'comb', id: c.id, x: ((c.x0 + c.x1) >> 1) * TS + 8, y: (c.row + c.rows) * TS, on: c.st !== 'hang' }));   /* the shared guide (src/stuck-guide.js): a comb is done once it is cut */
  W.read = () => ({ combs: combs.map(c => ({ id: c.id, st: c.st, x0: c.x0, x1: c.x1, row: c.row, rows: c.rows, y: c.y, land: c.st === 'down' ? Math.round(c.y / TS) : landRow(c) })),
    stands: W.stands(), held: W.held(), pots: pots.map(q => ({ state: q.state, x: q.x, y: q.y })), clouds: clouds.map(c => ({ x: c.x, y: c.y, r: c.r, t: c.t })),
    cells: cells.map(k => ({ x: k.x, y: k.y, st: k.st })), n: { ...W.n } });
  /* ---------- DRAWING (GREYBOX: the art lane draws the comb, the wax, the stands, the pot, the smoke and the cells - these are the shapes and the reads) ---------- */
  const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  W.draw = (g, cx, cy, time) => {
    if (!W.on()) return; const Lv = L(), VW = ctx.VW ? ctx.VW() : 640;
    /* WAX: the tiles are the glossy footing (src/redraw/hornets_nest_tiles.js); here only its glints, that sparkle and creep */
    for (const [x0, x1, row] of Lv.wax || []) { const x = x0 * TS - cx, y = row * TS - cy, w = (x1 - x0 + 1) * TS; if (x > VW + 20 || x + w < -20) continue;
      for (let k = 7; k < w - 4; k += 13) { const ph = (time * 0.6 + k * 0.173) % 1; if (ph < 0.3) rc(g, x + k, y + 1, 1 + (ph < 0.15 ? 1 : 0), 1, '#fff6c8'); } }
    /* THE COMBS: hanging (with the stalk up and the gold plumb line down to a ghost of where it lands), falling, landed */
    for (const c of combs) { const x = c.x0 * TS - cx, w = (c.x1 - c.x0 + 1) * TS, h = c.rows * TS; if (x > VW + 40 || x + w < -40) continue;
      if (c.st === 'hang') { const y = c.y - cy, mid = x + w / 2;
        if (c.hq) HNHL.tornStalks(g, c, x, y, w, cx, cy, time);   /* (claude/hornets2art) the hall's combs hang from the tear on ropes of ragged paper */
        else { let sy = c.row - 1; while (sy > 0 && sy > c.row - 6 && !ctx.solidPx(c.x0 * TS + w / 2, sy * TS + 8, false)) sy--; HNP.stalk(g, mid, y, Math.max(4, y - ((sy + 1) * TS - cy))); }   /* its paper stalk up to what it hangs from */
        const lr = landRow(c), ly = lr * TS - cy; g.fillStyle = Math.floor(time * 3) % 2 ? '#ffd36b' : '#d8a840'; for (let q = y + h + 3; q < ly; q += 6) { g.fillRect(R(x + 2), R(q), 2, 2); g.fillRect(R(x + w - 4), R(q), 2, 2); }   /* the plumb line (its two edges) */
        g.globalAlpha = 0.28 + 0.12 * Math.sin(time * 4); g.strokeStyle = '#ffd36b'; g.strokeRect(R(x) + 0.5, R(ly) + 0.5, w - 1, h - 1); g.globalAlpha = 1;   /* the ghost where it lands */
        (c.last ? HNHL.royal : HNP.slab)(g, x, y, w, h, false, time); }
      else (c.last ? HNHL.royal : HNP.slab)(g, x, c.y - cy, w, h, c.st === 'down', time); }
    for (const s of splashes) HNHL.splash(g, s.x - cx, s.y - cy, s.w, s.t / 0.9, time);   /* (claude/hornets2art) a comb into the honey: the crown of drops */
    /* HONEY: a glossy amber skin on the footing (the hall's flood is drawn by her hands; here the globs' splashes, fading) */
    for (const h of honey) { if (h.kind === 'flood') continue; const x = h.x0 - cx, w = h.x1 - h.x0, y = h.row * TS - cy; if (x > VW + 20 || x + w < -20) continue; HNHY.patch(g, x, y, w, h.t, h.t0, time); }
    /* THE SMOKE STANDS: a clay pot on a tripod of sticks, smouldering */
    for (const s of stands) { const x = R(s.x - cx), y = R(s.y - cy); if (x < -30 || x > VW + 30) continue; HNP.stand(g, x, y, time); }
    /* THE BROOD CELLS: a capped wax pocket; pulsing, it swells, reddens and cracks */
    for (const k of cells) { const x = R(k.x - cx), y = R(k.y - cy); if (x < -30 || x > VW + 30) continue; HNP.cell(g, x, y, k.st, k.st === 'pulse' ? 1 - k.t / BROOD.pulse : 0, time); }
    dress(g, cx, cy, time, VW);
  };
  /* (claude/hornetsnest2) THE JOURNEY'S TWO ENDS, drawn (no tile, no ent: the level's hash keeps): THE OLD PINES at the foot - scraps of the nest's grey paper blown down on
     the needles and snagged on the roots, the first sign of it; and THE MARSH EDGE past the great pine - cattails and reed clumps along the banks and in the shallows, lily pads
     on the first water, a low mist over it: MARSH WOOD begins here */
  const SCRAPS = [[5, 66, 0], [11, 66, 1], [14, 63, 2], [22, 64, 0], [26, 66, 1], [33, 66, 2], [44, 62, 0], [49, 60, 1], [57, 56, 2], [63, 60, 0]];
  const REEDS = [[355, 66, 3], [357, 66, 2], [365, 66, 4], [366, 67, 3], [368, 67, 2], [373, 67, 3], [375, 66, 4], [376, 66, 2], [386, 66, 3], [388, 67, 4], [390, 67, 2], [393, 67, 3], [395, 67, 4], [397, 67, 2], [399, 66, 3], [402, 66, 2], [407, 66, 3], [411, 66, 4], [414, 66, 2]];
  function dressOver(g, cx, cy, time, VW) {
    for (const [c, r, k] of PADS) { const x = R(c * TS - cx), y = R(r * TS + 4 - cy); if (x < -20 || x > VW + 20) continue; HNE.pad(g, x, y, k, time); }   /* (claude/hornets2art) a lily pad (the marsh's own, not yet sinking) */
    { const x0 = R(354 * TS - cx), x1 = R(419 * TS - cx); if (x1 > -20 && x0 < VW + 20) HNE.mist(g, x0, x1, R(66 * TS - cy) + 2, time, 0.26); }   /* a low marsh mist */
  }
  const PADS = [[369.5, 66, 0], [372, 66, 1], [391, 66, 2], [396.5, 66, 4], [367.5, 66, 3]];
  /* (claude/hornets2art) the old pines' first sightings: a little abandoned paper nest hung from a bough, [col, row of the bough] */
  const PINENESTS = [[13, 59], [27, 58.6], [49, 52], [67, 48]];   /* (the camera shows ~11 rows over the floor: these hang in view over the road) */
  function dress(g, cx, cy, time, VW) {
    for (const [c, r, k] of PINENESTS) { const x = R(c * TS - cx); if (x < -40 || x > VW + 40) continue; HNE.pineNest(g, x, R(r * TS - cy), time); }
    for (const [c, r, k] of SCRAPS) { const x = R(c * TS + (k * 5) % 11 - cx), y = R(r * TS - cy); if (x < -20 || x > VW + 20) continue; HNE.scrap(g, x, y, k + (c & 1), time); }   /* a scrap of nest paper, curled */
    for (const [c, r, h] of REEDS) { const x = R(c * TS + 8 - cx), y = R(r * TS - cy); if (x < -20 || x > VW + 20) continue; if (c % 3 === 0) HNE.cattail(g, x, y, h, time); else HNE.reed(g, x, y, h, c, time); }
  }
  W.drawOver = (g, cx, cy, time) => {
    if (!W.on()) return; const P = ctx.P();
    /* THE POTS: in the hand, set down, in flight - and the smoke a carried one throws round you (its reach drawn: the rule's state) */
    for (const q of pots) { const x = R(q.x - cx), y = R(q.y - cy); HNP.pot(g, x, y + 3, time, true);
      if (q.state === 'held' && q.holder) { g.globalAlpha = 0.16 + 0.06 * Math.sin(time * 3); g.strokeStyle = '#c8d0d8'; g.beginPath(); g.arc(R(q.holder.x - cx), R(q.holder.y - 14 - cy), SMOKE.aura, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (q.state === 'rest') { g.globalAlpha = 0.12; g.fillStyle = '#c8d0d8'; g.beginPath(); g.arc(x, y - 8, SMOKE.aura * Math.min(1, q.smoulder / 2), 0, 7); g.fill(); g.globalAlpha = 1; } }
    for (const c of clouds) { HNP.cloud(g, c.x - cx, c.y - cy, c.r, Math.min(1, c.t / 1.2), time); }
    if (near && ctx.text) ctx.text('E: A SMOKE POT', R(near.x - cx), R(near.y - cy) - 30, SMOKE.col, 'center');
    if (arc) CT.drawArc(g, arc, cx, cy, time, arc.land && arc.land.hit ? '#8fd160' : '#c8ccd4');
    dressOver(g, cx, cy, time, ctx.VW ? ctx.VW() : 640);   /* (claude/hornetsnest2) the marsh's lily pads and its mist, over the water */
    void P;
  };
  W.drawSwarm = (g, e, cx, cy, time) => drawSwarm(g, e, cx, cy, time);
  return W;
}
