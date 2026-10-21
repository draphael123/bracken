/* hero-poses.js — EVERY ABILITY HAS A BODY. A bought active that set no pose was drawn as whatever the hero was already doing,
   so its effect played beside a hero who did not move (tools/ability-poses.mjs is the rule). An ability now names a pose when
   it fires - kitPose(P, key, seconds) - and the draw plays that key's frames over those seconds (main.js, the player draw,
   after the swing: a blow in progress still wins). This chooses ART ONLY: no timer here touches a box, a cost or a cooldown.
   BEATS are the elapsed seconds at which each next frame starts; CYCLE poses loop at a rate instead. */
export const POSE_BEATS = {
  /* (claude/heropassa) HERO PASS A: each new move's beats (greybox frames via POSE_ALIAS below until the art pass) */
  rgSnatch: [0.1], kStep: [0.08, 0.16], kBash: [0.08, 0.16], wHop: [0.06, 0.12], wPlant: [0.1], eBlink: [0.13], powder: [0.08, 0.18], shadowStep: [0.07, 0.14], gShrug: [0.12], bzBarge: [0.08, 0.18],
  /* THE FOUR NEW PLUNGES' RELEASES (claude/plunges, B16: each has its own windup - the plunge frames - and its own release/leap, played as kit poses) */
  hammerHit: [0.08],           /* HAMMER OF DAWN: the head of the maul in the ground and a gold star off it; then him coming up off it */
  boardLeap: [0.1],            /* BOARDING: the heel off its back and a hand pushing down; then both arms flung up - the second jump */
  earthHit: [0.09],            /* EARTHFALL: the butt of the stave in the ground, the grit flung off it; then her coming up off it */
  bzSpinEnd: [0.1],            /* AXE SPIN: thrown wide off the shredded foe, up */
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
  /* THE LATE ACTIVES' OWN POSES (claude/heroposes): the eight casts that were drawn in the nearest older pose */
  flash: [0.1, 0.18],          /* FLASHOVER: the palm cupped round a spark, both sleeves snapped out ahead with the big flare, and the recoil */
  storm: [0.12, 0.3],          /* FIRESTORM: the staff swung up flat overhead, held crosswise with a flare on each end, and brought down to the turf */
  dawn: [0.1, 0.24],           /* DAWNBURST: the maul brought in to his chest, thrown up high and forward with the rays going off level, and the glow dying */
  wrath: [0.1, 0.24],          /* HOLY WRATH: the maul cocked back over the shoulder, brought round level, and held out with the light up off both shoulders */
  keg: [0.1, 0.22],            /* POWDER KEG: the lit cask held low on his heels, the underhand lob, and the follow-through */
  seas: [0.1, 0.24],           /* HEAVY SEAS: the cutlass taken back to brace, swept low with the sea standing up off the point, the wave rolling on */
  bone: [0.12, 0.3],           /* BLOOD MAIL: both arms crossed on the flat of the blade, plates of clotted blood closing over him, the last plate seated */
  reap: [0.1, 0.22],           /* BLOODLETTING: the blade drawn back, the great scything cut with a crimson crescent, the off hand drawing the blood in */
  /* THE PALADIN (lane P, 2026-09-24) */
  charge: [0.08, 0.22],        /* HOLY CHARGE: the maul levelled like a ram, the full stretch behind the lit head, the pull-up */
  halo: [0.1, 0.22],           /* DIVINE SHIELD: the maul lifted to his chest, raised overhead across both hands, and the light closing round him */
  leapLand: [0.07],            /* HAMMER LEAP's landing: the head of the maul in the ground, and him coming up off it */
  hallow: [0.12],              /* CONSECRATE: the maul lifted, then down on one knee with the head set in the turf */
  hallowQ: [0.07],             /* CONSECRATE again, with one already standing (claude/palart): the same two frames on a 0.25 s beat so it reads as planting when tapped often */
  sanctify: [0.16],            /* EMPOWER (claude/palart): up on his toes, the maul straight up over the helm, the head lit; then driven down into his circle with a column of light going up either side */
  smiteQ: [0.07],              /* SMITE (1 pip, claude/paladin3art): the war hammer drawn back low at the hip, then snapped forward and up with the head lit */
  radiance: [0.12, 0.28],      /* RADIANCE (3 pips): the hammer stood upright and the light gathering; the helm thrown back and the ring of spokes going off; the settle */
  sunfall: [0.14, 0.3],        /* SUNFALL (5 pips): up on his toes under a sun of spokes; lifted on the light of it; the hammer driven into the turf, the columns going up either side */
  vRel: [0.14],                /* VERDICT's release: the head of the hammer brought level and pointed at them like a gavel, light leaving it in lines; then lowered */
  smiteB: [0.07],              /* TWIN SMITE's second blow (claude/paladin4art): the hammer back across the other shoulder, then the backhand through and up */
  radiancePlus: [0.12, 0.3],   /* RADIANCE+ (4 pips): the hammer high over a bowed helm in a second ring; the helm thrown back, the double ring and the halo; the settle with the mend rising */
  vRelJ: [0.14],               /* JUDGED (5 pips): the gavel with a crown over it and the scales hung above; the long recover with them ringing */
  lanceDraw: [0.25],           /* SPEAR OF LIGHT's wind-up: the spear forming in the hand over the shoulder; the full spear drawn back level */
  lanceThrow: [0.1],           /* SPEAR OF LIGHT's throw: the arm flung out with the weight behind it; the follow-through */
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
  boil: [0.1, 0.25],           /* BLOOD WELL: hunched over the blade, then flung open with the blood coming up round him */
  call: [0.12, 0.28],          /* THE RED CALL: the blade stood in the ground, the off hand raised, and the green coming up */
  coil: [0.1],                 /* BLOOD LEECH: the off hand drawn back, then flung out with the coil leaving it */
  tide: [0.12],                /* CRIMSON TIDE: down on the haunches with the fist in the ground, and the green running off along it */
  unholy: [0.1],               /* RED GROUND: the blade low behind him, then swept flat along the floor */
  bkFlick: [0.07, 0.22],       /* (claude/bkpolish) THE FLICK (tap C): the blade snapped up off the low guard, and left quivering */
  grip: [0.12],                /* BLOOD CHAIN: the off hand out clawed, then the fist hauled back to his chest */
  /* THE GEOMANCER (every spell of hers begins with the butt of the stave struck into the ground) */
  gStep: [0.08],               /* STONE STEP: the stave jabbed down under her boots, then up off the stone that met it */
  gHeave: [0.08, 0.2],         /* BOULDER: down on the lever, heaved through, arms flung after it */
  gSpikes: [0.12],             /* SPIKE ROW: on one knee, the stave raised, then driven in on the slant */
  gArch: [0.14],               /* ARCHWAY: the stave lifted flat, then held up over her like the arch itself */
  gWall: [0.1, 0.22],          /* STONE WALL: the stave up, the butt driven in, and her weight on it while the wall comes up */
  gTomb: [0.1],                /* ENTOMB: raised, and shut down on them like a lid */
  gFault: [0.12],              /* FAULT LINE: the butt set in the ground, then dragged along the line of the crack */
  gGolem: [0.18],              /* GOLEM: the stave raised to call it, then the other hand beckoning it up */
  gAval: [0.3],                /* AVALANCHE: arms up at the sky, then the butt hammered in */
  /* THE BERSERKER (claude/berserker: told by what the axes do, and the mane goes up when he roars) */
  bzThrow: [0.1],              /* THE AXE THROW: the off axe cocked back over his shoulder, then hurled */
  bzRoar: [0.14],              /* BATTLE ROAR: the breath in, axes down, then fists at the sky */
  bzHarden: [0.14],            /* HARDEN: the axes dropped, then every muscle set */
  bzCleave: [0.1],             /* GREAT CLEAVE: up behind him in both hands, then the long cut */
  bzShrug: [0.14],             /* SHRUG IT OFF: the shoulders rolled, the head shaken */
  bzStand: [0.18],             /* LAST STAND: down on a knee, an axe planted, the other raised */
  bzUnch: [0.16],              /* UNCHAINED: fists to his chest, then flung out */
  bzStorm: [0.12],             /* AXE STORM: one hatchet underhand, then the fan overhand */
  /* THE RANGER (claude/ranger): her shots and her kit, each the bow doing something */
  rgShot: [0.07], rgAirShot: [0.07], rgLoose: [0.1], rgRise: [0.08], rgDown: [0.08], rgBash: [0.06], rgSnare: [0.12], rgMark: [0.12], rgHawkPose: [0.14], rgLeapPose: [0.16],
  ripo: [0.06, 0.14],          /* (claude/ranger) THE RIPOSTE STRIKE when it is an ARROW (hers): the step-in, the loose, the follow-through - played off the pose clock, not the swing */
  rgVolleyPose: [0.12], rgTrapPose: [0.12], rgRainPose: [0.14], rgSmokePose: [0.12], rgRefillPose: [0.16], rgHeartPose: [0.18], rgHuntPose: [0.16],
};
/* A POSE THAT FOLLOWS THE BODY, not a clock: the frame is chosen from the hero's own state, and null ends it early (HAMMER LEAP
   plays his arc - maul up on the rise, over at the top, down on the drop - for as long as he is off the ground, and no longer) */
export const POSE_PICK = { leap: P => P.ground ? null : P.vy < -120 ? 0 : P.vy < 120 ? 1 : 2 };
/* ABILITIES THAT ARE A DODGE: they set the dodge timer (its invulnerability is the point), so the roll would draw over them; the
   draw lets these poses in ahead of the roll (main.js) */
export const POSE_DASH = { charge: true, cinder: true };
export const POSE_CYCLE = { whirl: 30, bzSpin: 18, bzRamp: 10 };   /* (THE BERSERKER's SPIN turns, and his RAMPAGE runs) */   /* WHIRLWIND: the blade out ahead, behind, and across, round and round (frames a second) */
/* THE JUMP ARC. Every hero keeps his old air frames (jump 0/1 by the climb, apex near the top, fall 0/1 by the drop); a hero with a
   TAKE-OFF frame shows it for the first beat off the ground, while the push is still in him. */
export function airPose(P, frames) {
  if (P.vy < -250 && frames.takeoff && P.airArt > 0) return ['takeoff', 0];
  if (Math.abs(P.vy) < 55 && frames.apex) return ['apex', 0];
  if (P.nearFloor && P.vy > 140 && frames.land && frames.land.length >= 3) return ['land', 2];   /* THE BRACE (claude/herokeys, art only): the knees give a beat BEFORE the ground, so the fall does not pop into the landing's impact */
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
/* (claude/heropassa) GREYBOX BODIES: a new move names ITS OWN pose key (B16) and, until the Sonnet art pass bakes frames under that key, borrows the
   first of these that the hero has. The art lane only has to add the key: nothing here changes. THE ART LIST: work/claude/lane-done/claude-heropassa.md */
export const POSE_ALIAS = {
  kStep: ['block', 'brace', 'roll'],          /* THE KNIGHT's SHIELD-STEP: a step with the shield square in front (wants: kStep - plant, slide, set) */
  kBash: ['toss', 'bash', 'block'],           /* THE SHIELD BASH: the shield cocked in, punched out, recovered (wants: kBash) */
  wHop: ['vault', 'roll'],                    /* THE WARDEN's LOW HOP: knees up, the point kept level (wants: wHop) */
  wPlant: ['plant', 'skewer', 'cast'],        /* THE WALL PLANT: the spear driven in sideways, then her stood on it (wants: wPlant, wPerch) */
  eBlink: ['cinder', 'roll'],                 /* THE EMBER BLINK: the flash out and the flare in (wants: eBlink - out, in) */
  powder: ['roll'],                           /* THE POWDER FLASH: the flask thrown down, the roll through the smoke (wants: powder) */
  shadowStep: ['run', 'roll'],                /* THE SHADOW-STEP: the shade sliding (wants: shadowStep) */
  gShrug: ['ward', 'block', 'cast', 'jump'],  /* THE STONE SHRUG: hunched in the air, stone over her shoulders (wants: gShrug) */
  bzBarge: ['bzRoll', 'rush', 'roll'],
  rgSnatch: ['rgBash', 'parry'],             /* THE RANGER's ARROW SNATCH: the hand out, the shaft caught (wants: rgSnatch) */        /* THE SHOULDER BARGE: the shoulder down and in (wants: bzBarge) */
};
const aliasOf = (frames, k) => { if (frames[k] || !POSE_ALIAS[k]) return k; const a = POSE_ALIAS[k].find(q => frames[q]); return a || k; };
/* the frame of the pose now playing, or null when there is none */
export function kitPoseFrame(P, frames) {
  if (!(P.kPoseT > 0)) return null; const K = aliasOf(frames, P.kPoseK); if (!frames[K]) return null;   /* (claude/heropassa: POSE_ALIAS) */
  const el = P.kPoseMax - P.kPoseT, n = frames[K].length;
  if (POSE_PICK[P.kPoseK]) { const f = POSE_PICK[P.kPoseK](P); return f == null ? null : [K, Math.min(n - 1, f)]; }
  if (POSE_CYCLE[P.kPoseK]) return [K, Math.floor(el * POSE_CYCLE[P.kPoseK]) % n];
  const f = (POSE_BEATS[P.kPoseK] || []).filter(b => el >= b).length;
  return [K, Math.min(n - 1, f)];
}
