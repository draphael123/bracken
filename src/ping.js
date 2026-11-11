// PINGS / MARKERS (claude/cooppr, Daniel 11-04): one button marks a foe or a spot in the seat's colour. Pure and DOM-free (tools/ping.mjs tests it);
// main.js owns the key, the sound and the drawing. One ping per seat (a new one replaces the old), a short life, a foe's ping follows the foe and
// goes when it dies. A DOWNED hero's ping is a HELP mark on himself. The AI partner reads the freshest ping a person made (aiRead): a foe is
// fought first, a spot is walked to.

export const PING = { ttl: 4, reachX: 96, reachY: 48, ahead: 56, aiHold: 6 };

const live = e => !!e && e.alive !== false && !e.harmless && !(e.dying > 0);

/* WHAT THE PING MARKS. me: { x, y, face, down }. foes: the board's foes that are fair to mark. floorAt(x, y) -> the standing y under x (optional).
   -> { kind: 'help' | 'foe' | 'spot', x, y, foe? } */
export function pickTarget(me, foes, floorAt) {
  if (me.down > 0) return { kind: 'help', x: me.x, y: me.y };
  const f = me.face < 0 ? -1 : 1; let best = null, bd = 1e9;
  for (const e of foes || []) {
    if (!live(e)) continue;
    const dx = e.x - me.x, dy = e.y - me.y;
    if (Math.abs(dy) > PING.reachY || Math.abs(dx) > PING.reachX || dx * f < -12) continue;   /* ahead of him (a step behind still counts), not across the wood */
    const d = Math.hypot(dx, dy * 1.5) - (e.maxHp ? 30 : 0);                                   /* a boss or a mini is the likelier thing he means */
    if (d < bd) { bd = d; best = e; }
  }
  if (best) return { kind: 'foe', foe: best, x: best.x, y: best.y };
  const x = me.x + f * PING.ahead;
  return { kind: 'spot', x, y: floorAt ? floorAt(x, me.y) : me.y };
}

export function makePings() {
  const m = new Map(); let id = 0;
  return {
    put(n, target, ai) { const p = { ...target, n, ai: !!ai, t: PING.ttl, id: ++id }; m.set(n, p); return p; },
    tick(dt) {
      for (const [n, p] of m) {
        p.t -= dt;
        if (p.t <= 0 || (p.kind === 'foe' && !live(p.foe))) { m.delete(n); continue; }
        if (p.kind === 'foe') { p.x = p.foe.x; p.y = p.foe.y; }
      }
    },
    list() { return [...m.values()]; },
    of(n) { return m.get(n) || null; },
    drop(n) { m.delete(n); },
    clear() { m.clear(); },
    /* the freshest ping a PERSON made (never an AI's own): what a partner AI reads */
    aiRead() { let best = null; for (const p of m.values()) if (!p.ai && p.kind !== 'help' && (!best || p.id > best.id)) best = p; return best; },
    /* a downed person's HELP mark, if any (the AI's revive already has priority; this is for the draw and the tests) */
    helpOf() { for (const p of m.values()) if (p.kind === 'help') return p; return null; },
  };
}

/* the AI takes a spot ping as a goal held for PING.aiHold seconds: pass the body's current { id, until } and the clock; returns the new hold or null */
export function holdSpot(cur, ping, now) {
  if (ping && ping.kind === 'spot' && (!cur || cur.id !== ping.id)) return { id: ping.id, x: ping.x, y: ping.y, until: now + PING.aiHold };
  if (cur && now >= cur.until) return null;
  return cur || null;
}
