/* hero-poses.js — EVERY ABILITY HAS A BODY. A bought active that set no pose was drawn as whatever the hero was already doing,
   so its effect played beside a hero who did not move (tools/ability-poses.mjs is the rule). An ability now names a pose when
   it fires - kitPose(P, key, seconds) - and the draw plays that key's frames over those seconds (main.js, the player draw,
   after the swing: a blow in progress still wins). This chooses ART ONLY: no timer here touches a box, a cost or a cooldown.
   BEATS are the elapsed seconds at which each next frame starts; CYCLE poses loop at a rate instead. */
export const POSE_BEATS = {
  /* THE KNIGHT */
  lunge: [0.05, 0.2],          /* the drive off the back foot, the full stretch behind the point, and the pull-up */
  toss: [0.06, 0.16],          /* SHIELD THROW: the off arm cocked back, flung through, and following after it */
  slam: [0.07, 0.15],          /* GROUND SLAM: sword and shield up over the helm, brought down, the crouch on the impact */
  cry: [0.12, 0.3],            /* WAR CRY: the breath in, chest out; then head back and arms flung wide, bellowing */
  hook: [0.06, 0.12, 0.19],    /* DISARM: the point low under the guard, the catch, the haul up, the shield going with it */
  iron: [0.1, 0.22],           /* IRONCLAD: braced, set, and the steel coming over him */
  realm: [0.14, 0.36],         /* SWORD OF THE REALM: raised high, the light on it, then the cut that sends the first wave */
  /* THE WARDEN */
  skewer: [0.05, 0.2],         /* the drive, the point through, the haul back */
  javThrow: [0.07, 0.15],      /* JAVELIN: the arm back and the shaft laid along it, the release, the follow-through */
  plant: [0.1, 0.2],           /* SET THE SPEARS: down on one knee, the spear raised in both hands, driven into the turf */
  hurl: [0.1, 0.22],           /* RAIN OF SPEARS: both arms back and down, heaving up, and the spear gone at the sky */
  stretch: [0.12, 0.26],       /* FULL STRETCH: the hands slide back down the shaft to the butt, and she settles long on it */
};
export const POSE_CYCLE = { whirl: 30 };   /* WHIRLWIND: the blade out ahead, behind, and across, round and round (frames a second) */
export function kitPose(P, key, t) { P.kPoseK = key; P.kPoseT = t; P.kPoseMax = t; }
/* the frame of the pose now playing, or null when there is none */
export function kitPoseFrame(P, frames) {
  if (!(P.kPoseT > 0) || !frames[P.kPoseK]) return null;
  const el = P.kPoseMax - P.kPoseT, n = frames[P.kPoseK].length;
  if (POSE_CYCLE[P.kPoseK]) return [P.kPoseK, Math.floor(el * POSE_CYCLE[P.kPoseK]) % n];
  const f = (POSE_BEATS[P.kPoseK] || []).filter(b => el >= b).length;
  return [P.kPoseK, Math.min(n - 1, f)];
}
