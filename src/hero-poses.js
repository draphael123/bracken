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
  /* THE PALADIN (lane P, 2026-09-24) */
  charge: [0.08, 0.22],        /* HOLY CHARGE: the maul levelled like a ram, the full stretch behind the lit head, the pull-up */
  halo: [0.1, 0.22],           /* DIVINE SHIELD: the maul lifted to his chest, raised overhead across both hands, and the light closing round him */
  leapLand: [0.07],            /* HAMMER LEAP's landing: the head of the maul in the ground, and him coming up off it */
  hallow: [0.12],              /* CONSECRATE: the maul lifted, then down on one knee with the head set in the turf */
  beam: [0.1],                 /* SPEAR OF LIGHT: drawn back with the off hand out, then the maul driven straight out level */
  hurlH: [0.1],                /* BLESSED HAMMER: the off hand low behind him, then flung through with the light leaving it */
  /* THE PYROMANCER */
  vent: [0.08, 0.3],           /* VENT: hunched in round the heat, flung open with the fire leaving her, and the settle */
  wisp: [0.1, 0.25],           /* WISP: the flame cupped low in the palm, lifted up and let go, and watched */
  wall: [0.08, 0.2],           /* FIRE WALL: the staff up behind her, brought down along the ground ahead, and held there */
  cinder: [0.1, 0.22],         /* CINDER STEP: a low flat dash with the embers coming off the hem, and the pull-up */
  meteor: [0.12],              /* METEOR: the staff swung up, then held high with the fire at its head calling the sky */
  ring: [0.1],                 /* RING OF FIRE: the staff lifted in both hands, and driven butt-first into the ground */
  /* THE FREEBOOTER */
  spot: [0.1, 0.3],            /* THE BLACK SPOT: the cutlass point levelled at him, the spot on it, and the blade taken back */
  haul: [0.07, 0.16],          /* KEELHAUL: the hook flung out, the line hauled back hand over hand, and over the shoulder */
  grape: [0.1],                /* GRAPESHOT: the pistol fired from the hip, and the kick of it */
  broad: [0.12],               /* BROADSIDE: braced low in both hands and fired, then thrown back off his feet by it */
  rum: [0.12, 0.3],            /* RUM: the bottle up, his head back, and the back of the hand across his mouth */
  board: [0.1],                /* BOARDING PARTY: the hook flung high, then swung in on the line with his knees up */
  /* THE DEATH KNIGHT */
  boil: [0.1, 0.25],           /* BLOOD BOIL: hunched over the blade, then flung open with the blood coming up round him */
  call: [0.12, 0.28],          /* GRAVECALL: the blade stood in the ground, the off hand raised, and the green coming up */
  coil: [0.1],                 /* DEATH COIL: the off hand drawn back, then flung out with the coil leaving it */
  tide: [0.12],                /* GRAVE TIDE: down on the haunches with the fist in the ground, and the green running off along it */
  unholy: [0.1],               /* UNHOLY GROUND: the blade low behind him, then swept flat along the floor */
  grip: [0.12],                /* DEATH GRIP: the off hand out clawed, then the fist hauled back to his chest */
};
/* A POSE THAT FOLLOWS THE BODY, not a clock: the frame is chosen from the hero's own state, and null ends it early (HAMMER LEAP
   plays his arc - maul up on the rise, over at the top, down on the drop - for as long as he is off the ground, and no longer) */
export const POSE_PICK = { leap: P => P.ground ? null : P.vy < -120 ? 0 : P.vy < 120 ? 1 : 2 };
/* ABILITIES THAT ARE A DODGE: they set the dodge timer (its invulnerability is the point), so the roll would draw over them; the
   draw lets these poses in ahead of the roll (main.js) */
export const POSE_DASH = { charge: true, cinder: true };
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
  if (POSE_PICK[P.kPoseK]) { const f = POSE_PICK[P.kPoseK](P); return f == null ? null : [P.kPoseK, Math.min(n - 1, f)]; }
  if (POSE_CYCLE[P.kPoseK]) return [P.kPoseK, Math.floor(el * POSE_CYCLE[P.kPoseK]) % n];
  const f = (POSE_BEATS[P.kPoseK] || []).filter(b => el >= b).length;
  return [P.kPoseK, Math.min(n - 1, f)];
}
