// tools/beasts-mock.mjs - a MOCK GAME for the hands of THE BEASTS and THE BONES (claude/beastsbones): a flat floor at y = 0, players, enemies, and a ctx that records every call, so
// src/beasts-hands.js and src/bones-hands.js can be driven in Node (no page). Imported by tools/beasts.mjs and tools/bones.mjs.
export function mockGame(heroes = [{ x: 100 }]) {
  const players = heroes.map((h, i) => ({ x: h.x, y: h.y || 0, w: 10, h: 14, face: -1, hp: 100, maxHp: 100, dead: false, atk: -1, abuf: 0, id: i, ...h }));
  const g = { players, enemies: [], log: [], calls: {}, time: 0, hits: [], marks: [], numbers: [], callouts: [], pins: [], unpins: 0, parryNext: false, blockNext: false, swing: null };
  const rec = k => { g.calls[k] = (g.calls[k] || 0) + 1; };
  g.ctx = {
    hero: () => players[0], players: () => players, enemies: () => g.enemies, upright: p => !p.dead,
    heroes: () => players.map((p, i) => ({ x: p.x, y: p.y, face: p.face, alive: !p.dead, id: i, w: p.w, h: p.h })),
    move: (b, dx, dy) => { b.x += dx; const y0 = b.y; b.y += dy; let ground = false; if (b.y >= 0 && dy >= 0) { b.y = 0; ground = true; } return { ground, hitY: ground, hitX: false, y0 }; },
    canStep: () => true, wallAhead: () => false, floorAt: () => true, wallBetween: () => false, solidAt: (x, y) => y > 6, floorY: () => 0,
    time: () => g.time, seen: () => rec('seen'), callout: t => { g.callouts.push(t); }, number: (x, y, t, c) => { g.numbers.push(t); }, mark: (e, t) => { g.marks.push([e.t, t]); },
    burst: () => rec('burst'), shake: () => rec('shake'), sfx: k => rec('sfx:' + k),
    hurtBox: p => ({ l: p.x - p.w / 2, r: p.x + p.w / 2, t: p.y - p.h, b: p.y }), strikeBox: p => g.swing && g.swing.p === p ? g.swing.box : null,
    hit: (p, x, d, e, name, o = {}) => { const r = { landed: !g.parryNext && !g.blockNext, blocked: g.blockNext, parried: g.parryNext }; g.hits.push({ p, x, d, e, name, o, r }); if (r.landed) p.hp -= d; return r; },
    clank: () => rec('clank'), push: () => rec('push'), down: () => rec('down'), pin: (p, s) => { g.pins.push([p, s]); }, unpin: () => { g.unpins++; }, mashed: p => { if (p.abuf > 0) { p.abuf = 0; return true; } return false; }, chill: () => rec('chill'),
  };
  g.add = (e) => { const q = { alive: true, hp: 50, hp0: undefined, stagger: 0, vy: 0, vx: 0, face: -1, anim: 0, mode: 'stand', hurtT: 0, ...e }; g.enemies.push(q); return q; };
  g.frame = (H, dt = 1 / 60) => { g.time += dt; if (H.tick) H.tick(dt, g.time); for (const e of g.enemies) if (e.alive && H.owns(e)) H.step(e, dt); };
  return g;
}
