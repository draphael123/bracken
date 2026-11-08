// tools/foe-ctx-fake.mjs - a FAKE main.js ctx for the new foes' HANDS (claude/foes: src/beasts-hands.js, src/bones-hands.js), so tools/beasts.mjs and tools/bones.mjs can drive the real
// hands in node: a flat floor at y = 0, hero seats that are plain objects, a damagePlayer that logs and answers what the test says, no DOM. It proves the BINDING (spawn, the brain each
// frame, a blow once per hero per attack, a parry reaching the foe, projectiles in flight) - the page half (the real damagePlayer, the real sprites) is a browser lane's.
const overlap = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
export function fakeCtx(seats = [{ x: 40 }]) {
  const heroes = seats.map((s, i) => ({ x: 0, y: 0, w: 10, h: 14, face: -1, vx: 0, vy: 0, parryT: 0, dead: false, down: 0, ducking: false, snare: 0, id: i, ...s }));
  const enemies = [], log = [], st = { res: null, attack: null, now: 0, tell: new Set() };
  const box = b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - b.h, b: b.y }), duckBox = b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - (b.ducking ? 8 : b.h), b: b.y });
  let P = heroes[0];
  const ctx = { L: {}, TS: 16, DMG: {}, EHP: {}, sfx: new Proxy({}, { get: (o, k) => () => log.push(['sfx', k]) }), hero: () => P, enemies: () => enemies,
    eachSeat: fn => { for (const p of heroes) { if (p.dead) continue; P = p; try { fn(p, p); } finally { P = heroes[0]; } } },
    number: (x, y, t) => log.push(['num', t]), burst() {}, sparks() {}, dust() {}, shake() {}, ring() {},
    damagePlayer: (x, d, o) => { log.push(['hit', d, o && o.name, o && o.unblockable]); return typeof st.res === 'function' ? st.res(x, d, o) : (st.res ?? d); },
    parried: () => P.parryT > 0, box, duckBox, overlap, attackBox: () => st.attack,
    moveBody: (b, dx, dy) => { b.x += dx; b.y += dy; if (b.y > 0) { b.y = 0; return { ground: true }; } return { ground: false }; },
    fairStep: (e, dir) => (st.canStep ? st.canStep(e, dir) : true), isSolid: (tx, ty) => ty >= 0, beastSeen() {}, heavyBlow: () => !!st.heavy, plungeBlow: () => !!st.plunge, chill: (p, s) => log.push(['chill', s]), once: () => true, hint() {} };
  const base = (x, face = -1) => ({ x, y: 0, vx: 0, vy: 0, face, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0 });
  return { ctx, heroes, enemies, log, st, base, hits: () => log.filter(l => l[0] === 'hit') };
}
