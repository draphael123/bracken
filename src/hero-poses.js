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
  /* THE GEOMANCER (every spell of hers begins with the butt of the stave struck into the ground) */
  gMend: [0.26, 0.34],          /* THE MEND: the stave raised, the butt struck into the ground (the thud), and the weight on it while the stone knits */
  gStep: [0.08],               /* STONE STEP: the stave jabbed down under her boots, then up off the stone that met it */
  gHeave: [0.08, 0.2],         /* BOULDER: down on the lever, heaved through, arms flung after it */
  gSpikes: [0.12],             /* SPIKE ROW: on one knee, the stave raised, then driven in on the slant */
  gArch: [0.14],               /* ARCHWAY: the stave lifted flat, then held up over her like the arch itself */
  gLode: [0.12],               /* LODESTONE: levelled at them, then the rune pulling */
  gTomb: [0.1],                /* ENTOMB: raised, and shut down on them like a lid */
  gFault: [0.12],              /* FAULT LINE: the butt set in the ground, then dragged along the line of the crack */
  gGolem: [0.18],              /* GOLEM: the stave raised to call it, then the other hand beckoning it up */
  gAval: [0.3],                /* AVALANCHE: arms up at the sky, then the butt hammered in */
};
export const POSE_CYCLE = { whirl: 30 };   /* WHIRLWIND: the blade out ahead, behind, and across, round and round (frames a second) */
/* THE JUMP ARC. Every hero keeps his old air frames (jump 0/1 by the climb, apex near the top, fall 0/1 by the drop); a hero with a
   TAKE-OFF frame shows it for the first beat off the ground, while the push is still in him. */
export function airPose(P, frames) {
  if (P.vy < -250 && frames.takeoff && P.airArt > 0) return ['takeoff', 0];
  if (Math.abs(P.vy) < 55 && frames.apex) return ['apex', 0];
  return P.vy < 0 ? ['jump', P.vy < -150 ? 0 : 1] : ['fall', P.vy > 220 ? 1 : 0];
}
/* THE LANDING. A set with three landing frames plays impact, settle, stand over P.landArt (art time only, set with the gameplay
   landT and outlasting it: the landing lag is not lengthened); a two-frame set keeps the old split of landT. */
export function landPose(P, frames) {
  const n = frames.land.length;
  if (n < 3) return P.landT > 0 ? ['land', P.landT > 0.05 ? 0 : 1] : null;
  if (!(P.landArt > 0) && !(P.landT > 0)) return null;
  const el = (P.landArtMax || 0.2) - (P.landArt || 0);
  return ['land', el < 0.06 ? 0 : el < 0.13 ? 1 : 2];
}
export function kitPose(P, key, t) { P.kPoseK = key; P.kPoseT = t; P.kPoseMax = t; }
/* the frame of the pose now playing, or null when there is none */
export function kitPoseFrame(P, frames) {
  if (!(P.kPoseT > 0) || !frames[P.kPoseK]) return null;
  const el = P.kPoseMax - P.kPoseT, n = frames[P.kPoseK].length;
  if (POSE_CYCLE[P.kPoseK]) return [P.kPoseK, Math.floor(el * POSE_CYCLE[P.kPoseK]) % n];
  const f = (POSE_BEATS[P.kPoseK] || []).filter(b => el >= b).length;
  return [P.kPoseK, Math.min(n - 1, f)];
}
