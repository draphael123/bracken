// THE POSE KEEPS THE BLOW'S TIME. This chooses art only; stamina, movement and live boxes remain in combat.
const LIGHT = {
  knight: [.04, .10, .16, .24], warden: [.04, .10, .18, .24],
  pyro: [.04, .10, .18, .24], paladin: [.06, .10, .18, .25],
  pirate: [.03, .07, .15, .24], reaper: [.12, .15, .24, .28],
  geomancer: [.05, .10, .18, .25],   /* the stave: a beat longer to lift than a sword, the stone lands on the same frame as the spear */
};
export function attackPose(hero, p, frames) {
  const directional = p.swingKind === 'rise' || p.swingKind === 'sweep';
  const combo = (p.combo || 1) % 3;
  const desired = directional ? p.swingKind : !p.ground && frames.air ? 'air' : combo === 2 ? 'atkB' : combo === 0 ? 'atkC' : 'atk';
  const key = frames[desired] ? desired : 'atk';
  const beats = directional ? [.02, .08, p.swingKind === 'rise' ? .17 : .15, .24] : LIGHT[hero] || LIGHT.knight;
  const frame = beats.findIndex(t => p.atk < t);
  return { key, frame: frame < 0 ? 4 : frame };
}
