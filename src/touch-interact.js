// src/touch-interact.js - THE CONTEXTUAL ACTION BUTTON'S BRAIN (claude/mobile, 2026-10-02).
//
// On the keyboard every "use this" is the one INTERACT key (E / T, UP on a pad): talk to a sign or a hand, step through a door, take a
// torch, call a raft, work a shop counter, pay the ferryman, lift a bucket or a hoist load. A phone has no such key, so the screen shows ONE
// button, and only while there is something to use, labelled with its verb. This file answers "what would INTERACT do right now?" with the
// verb and the press to send, by asking the same questions main.js asks before it reacts to talkPress (updateProps, updateHoists,
// updateVillage): reach, ground, locks. If main.js grows a new use for talkPress, add its test here and the button shows it too.
//
// A LEVEL THAT HAS ITS OWN USES (the desert's waterskin: FILL at a well, POUR at a mud wall, DRINK) registers a hook and needs no edit in
// this file or in the touch module:
//     BK.touchVerbs.push(() => nearWell ? { verb: 'FILL', key: 'talk' } : null);
// A hook returns { verb, key } ('key' is the one-shot press name touch.js sends: talk, throw, skill2, atk...) or null. Hooks run first,
// so a level's own verb beats the generic ones when both are in reach.

export const VERB_HOOKS = [];

// THE SECOND CONTEXTUAL BUTTON (the 'ctx' slot of src/touch.js: above INTERACT in SIMPLE, beside it in FULL). It shows only while a hook returns something, like
// the action button does. A lane (THROW: pick up and throw a thing) registers one and needs no edit to touch.js:
//     BK.touchCtx.push(c => c.P && nearThrowable(c) ? { label: 'THROW', key: 'throw' } : null);
// A hook returns { label, key, dim? } ('key' is the one-shot press name: throw, skill2, atk...; 'dim' draws it half-faded and still tappable) or null.
// The context 'c' is the same one the verb hooks get (P, state, props, enemies, ...). The first hook that answers wins.
export const CTX_HOOKS = [];
export function ctxButton(c) {
  const P = c.P; if (!P || c.state !== 'play' || P.dead || P.hurt > 0 || P.asleep > 0) return null;
  for (const h of CTX_HOOKS) { let r = null; try { r = h(c); } catch { r = null; } if (r && r.label) return { label: String(r.label).toUpperCase(), key: r.key || 'throw', dim: !!r.dim }; }
  return null;
}

/* the context main.js hands over: everything the keyboard path reads, as accessors so this file holds no game state */
export function interactVerb(c) {
  const P = c.P; if (!P || c.state !== 'play' || P.dead || P.hurt > 0 || P.asleep > 0) return null;
  for (const h of VERB_HOOKS) { let r = null; try { r = h(c); } catch { r = null; } if (r && r.verb) return { verb: String(r.verb).toUpperCase(), key: r.key || 'talk' }; }
  const near = (pr, dx, dy) => Math.abs(pr.x - P.x) < dx && Math.abs(pr.y - P.y) < dy;
  /* what a talk can reach (main.js talkers()): a sign, a raft winch, a torch bracket, a hand to speak to */
  const t = c.talkers()[0];
  if (t) return { verb: t.raftCall ? 'CALL' : t.take ? 'TAKE' : t.who && t.who.t === 'npc' ? 'TALK' : 'READ', key: 'talk' };
  for (const pr of c.props) {
    if (pr.t === 'doorway' && !c.warping && !c.talking && (P.ground || P.coyote > 0) && near(pr, 13, 22) && c.doorOpen(pr)) return { verb: pr.needs && !c.hasKey(pr.needs) ? 'OPEN' : 'ENTER', key: 'talk' };
    if (pr.t === 'npc' && pr.kind === 'keeper' && c.shopRoom && near(pr, 24, 20)) return { verb: 'SHOP', key: 'talk' };
    if (pr.t === 'exit' && near(pr, 14, 1e9)) return { verb: 'LEAVE', key: 'talk' };
    if (pr.t === 'npc' && pr.kind === 'ferryman' && near(pr, 30, 24) && c.ferryOwes()) return { verb: 'PAY', key: 'talk' };
    if (pr.t === 'vbucket' && pr.state === 'rest' && !P.carry && P.ground && near(pr, 18, 14)) return { verb: 'TAKE', key: 'talk' };
    if (pr.t === 'load' && pr.state === 'free' && !P.ballast && !P.carry && P.ground && !(pr.cd > 0) && near(pr, 14, 14)) return { verb: 'LIFT', key: 'talk' };
  }
  return null;
}
