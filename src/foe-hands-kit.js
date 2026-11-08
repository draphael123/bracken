// src/foe-hands-kit.js - the pieces the hands of the NEW FOE FAMILIES share (claude/foes: src/beasts-hands.js, src/bones-hands.js). Each family's rules are PURE (src/beasts.js, src/bones.js);
// a family's hands bind them to the game through a ctx main.js hands over (damage, marks, SFX, the heroes' seats). This is the common part of that binding:
//   sfx        a sound by name, falling back to the stand-ins the game already has (no new audio files in this lane)
//   seats      fn(P, pp) for every hero on his feet, with main.js's P switched to that seat (asPlayer): the one rule of co-op here
//   strike     a told blow's box against every seat ONCE per attack: HIGH blows use the ducked box (a ducking hero lets them over), the blow goes through damagePlayer with `who` = the
//              foe (so its mark / HEIGHT row is read: src/duck.js blowHigh), and the verdict comes back as { hit, blocked, parried, dodged } per seat
//   grav       the foe's own gravity (a ground foe: it stands on the floor, the host moves it)
//   gate       the world a pure step reads: heroes, canStep, rand, and the pack's one-at-a-time rule
// No DOM here and nothing that touches the grid except through ctx.
const sgn = v => (v < 0 ? -1 : 1);

export function makeKit(ctx) {
  const K = {};
  const STAND_IN = { tell: 'strikeTell', strike: 'foeSlash', yelp: 'yelp', clank: 'clank', snort: 'snort', thud: 'thud', roar: 'roar', bark: 'bark', rattle: 'rattle', puff: 'puff', hiss: 'hiss', zap: 'zap',
    leap: 'leap', crumble: 'crumble', clatter: 'clatter', haft: 'haftKnock', hornDraw: 'hornDraw' };
  K.sfx = k => { const S = ctx.sfx; if (!S) return; const f = S[k] || S[STAND_IN[k]] || S[STAND_IN.tell]; if (typeof f === 'function') { try { f(); } catch (e) { /* a missing sound never stops a fight */ } } };
  K.seats = fn => { if (ctx.eachSeat) ctx.eachSeat(fn); else { const p = ctx.hero(); if (p && !p.dead) fn(p, p); } };
  K.heroes = () => { const out = []; K.seats((P, pp) => out.push({ x: P.x, y: P.y, face: P.face || 1, alive: true, p: pp })); return out; };
  K.grav = (e, dt) => { e.vy = Math.min(360, (e.vy || 0) + 1000 * dt); const r = ctx.moveBody(e, 0, e.vy * dt, false); if (r && (r.ground || r.hitY)) e.vy = 0; };
  /* the blow is struck at most once per hero per attack (an attack id, s.atk) */
  const hitRec = (e, atk) => { if (!e.hitRec || e.hitRec.atk !== atk) e.hitRec = { atk, seats: new Set() }; return e.hitRec; };
  K.strike = (e, v, o = {}) => {
    const rec = hitRec(e, v.atk), out = [];
    K.seats((P, pp) => {
      if (rec.seats.has(pp)) return;
      const [l, r, t, b] = v.box, hb = v.high ? ctx.duckBox(P) : ctx.box(P);
      if (!ctx.overlap({ l, r, t, b }, hb)) return;
      rec.seats.add(pp);
      const res = ctx.damagePlayer(e.x, v.dmg, { who: e, name: v.blow, unblockable: !!v.unblock, ...(o.dmgOpts || {}) });
      const parried = !v.unblock && res === 'blocked' && ctx.parried(), hit = !!res && res !== 'blocked';
      out.push({ P, pp, res, hit, blocked: res === 'blocked', parried, dodged: res === false });
      const dir = sgn(P.x - e.x);
      if (hit) { if (v.knock) { P.vx = dir * v.knock; P.vy = Math.min(P.vy || 0, -110); P.ground = false; } if (v.shove) { P.vx = v.shove; }
        if (v.pin) { P.snare = Math.max(P.snare || 0, v.pin); P.vx = 0; } if (v.chill && ctx.chill) ctx.chill(P, v.chill); }
      else if (res === 'blocked' && v.push) { P.vx = dir * v.push * 6; }   /* a heavy blow into the shield shoves the hero back */
    });
    return out;
  };
  /* THE PACK: the other live members of a family near e (its one-at-a-time rule reads busy; a leader reads alive) */
  K.pack = (e, isMine, near = 520) => ctx.enemies().filter(q => q !== e && q.alive && isMine(q) && Math.abs(q.x - e.x) < near && Math.abs(q.y - e.y) < 200);
  /* a hero's blow on a small body (a wisp, an arrow): his attack box meets it */
  K.struckBy = (x, y, r) => { let hit = false; K.seats((P) => { const ab = ctx.attackBox && ctx.attackBox(); if (ab && ctx.overlap(ab, { l: x - r, r: x + r, t: y - r, b: y + r })) hit = true; }); return hit; };
  return K;
}
