// src/sea-gadget.js - THE ONE "A HERO STRUCK THIS" HOOK FOR THE SEA ACT (claude/seagadget, Daniel 11-12: every class must be able to do what a level asks).
// A sea gadget is anything a hero STRIKES to work it: a tide lever / sluice / bell, a grapple winch, a whale nerve, an egg sac, a singing stone, a trap rope, a mooring,
// a stuck barnacle - and any FUTURE one. Before this, each level wrote its own "the melee box overlaps X" loop, so a ranger / pyro / pirate / warden / berserker /
// paladin / reaper / geomancer could not work a lever their own shot was standing in front of. Now a level only DECLARES its gadgets (this file's shape) and the ONE water
// wiring (src/pirate-fleet-hands.js: PFH.strike for the melee box, PFH.update for the shots) strikes them: any hero's attack box AND any hero shot / spell / thrown weapon
// (src/hero-strikes.js shotStrikes: the ranger's arrow, the pyro's embers, the pirate's and warden's shot tracers, the berserker's hatchets and axe, the paladin's hammers,
// the reaper's scythe, the geomancer's stones). The pattern is the Goblin Queen's / Buried City's (src/hero-strikes.js: "ONE RULE FOR A HERO STRUCK THIS"), not a second one.
//
// A gadget: {
//   id        unique + stable (a key for cooldown and for "struck once")
//   box()     the strikable box { l, r, t, b } in world px NOW, or null (spent / broken / cooling: nothing to strike - a shot flies on through it)
//   strike(how, hb)   the level's own answer. how = 'blow' | 'arrow' | 'ember' | 'shot' | 'axe' | 'hammer' | 'scythe' | 'stone'; hb = the box that struck (a blow's real box;
//                     a shot's gadget-box shrunk by 1 px, so the level's own overlap test is true). Return false to say "I took nothing" (the shot is not consumed by the field's
//                     cooldown; see cool)
//   melee     false opts out of the attack box (default true)
//   ranged    false opts out of hero shots (default true)
//   cool      seconds before THIS gadget can be struck again (default 0: the gadget keeps its own cooldown, as the kit's verbs do)
//   group     at most one gadget of a group takes a given blow (the kit's verbs: one blow = one verb, as tideStrike always did)
// }
// A shot that strikes a gadget is CONSUMED (the arrow drops, the ember dies) unless that hero's weapon goes on by design (the thrown hatchets, the hammers, the scythe, the
// stones: src/hero-strikes.js marks them with the gadget's key so they strike a given gadget once and fly on).
export const overlaps = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
export const inset = (b, d = 1) => ({ l: b.l + d, r: b.r - d, t: b.t + d, b: b.b - d });
export const HOW = ['blow', 'arrow', 'ember', 'shot', 'axe', 'hammer', 'scythe', 'stone'];

/* the field: one per wiring (PFH keeps one). shot(box, key) -> { how } | null is src/hero-strikes.js shotStrikes, bound by main.js (a node tool binds its own fake world). */
export function makeGadgetField({ shot } = {}) {
  const cd = new Map();   /* id -> seconds left (only gadgets that declare cool) */
  const ready = g => !(cd.get(g.id) > 0);
  const took = (g, how, hb) => { const r = g.strike(how, hb); if (r === false) return false; if (g.cool > 0) cd.set(g.id, g.cool); return true; };
  return {
    tick(dt) { for (const [k, v] of cd) { const n = v - dt; if (n > 0) cd.set(k, n); else cd.delete(k); } },
    clear() { cd.clear(); },
    /* the melee box: every overlapped gadget answers (one per group). Returns the ids struck. */
    blow(list, hb) {
      const out = [], groups = new Set(); if (!hb) return out;
      for (const g of list) { if (!g || g.melee === false || !ready(g) || (g.group && groups.has(g.group))) continue;
        const b = g.box(); if (!b || !overlaps(hb, b)) continue;
        if (took(g, 'blow', hb)) { out.push(g.id); if (g.group) groups.add(g.group); } }
      return out;
    },
    /* every hero shot in flight: a shot on a gadget's box strikes it (and is consumed by hero-strikes.js unless it goes on by design). Returns [{ id, how }]. */
    shots(list) {
      const out = []; if (!shot) return out;
      const groups = new Set();
      for (const g of list) { if (!g || g.ranged === false || !ready(g) || (g.group && groups.has(g.group))) continue;
        const b = g.box(); if (!b) continue;
        const hs = shot(b, 'sg:' + g.id); if (!hs) continue;
        if (took(g, hs.how, inset(b, 1))) { out.push({ id: g.id, how: hs.how }); if (g.group) groups.add(g.group); } }
      return out;
    },
  };
}

/* the tide kit's verbs as gadgets (a lever, a sluice wheel, a bell). One blow = one verb (group 'kit'); a cooling verb is not there to strike (tideStrike skipped it too);
   the kit's off-map hidden verbs (the whale's: only a nerve's flare strikes them) are melee-and-shot proof. `kit` = the tide kit (src/tide-kit.js), `TS` = 16. */
export function kitGadgets(kit, TS, strike) {
  const out = [];
  for (const S of kit.tides) for (const v of S.verbs) {
    const x = v.x * TS + 8, y = (v.y + 1) * TS;
    out.push({ id: 'kit:' + S.id + ':' + v.t + ':' + v.x + ',' + v.y, group: 'kit', ranged: !v.hidden, melee: true,
      box: () => (v.cool > 0 ? null : { l: x - 11, r: x + 11, t: y - 30, b: y - 4 }), strike });
  }
  return out;
}
