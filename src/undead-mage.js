// undead-mage.js — THE UNDEAD ARCHMAGE, fought in the sky over the Falling Tower from the magic carpet (batch 4,
// 2026-09-21). He FLOATS: e.y is the bottom of his trailing hem, and nothing about him ever stands. Every spell is told
// and every spell can be out-flown; `!` blockable, the red cross (marks.js '!!') unblockable, per the touch rule, and
// touching him never hurts (main.js's contact exclusion list).
//   FIREBOLT     (the first fight's bolt)  aimed; enraged, three          !
//   ICE LANCES   (the first fight's frost) a fan of five                  !
//   STORM        (the first fight's mark)  a column where you were        ✕  leave it
//   POISON CLOUD  slow green orbs that burst into a cloud that poisons you while you are in it (P.venomT): the sky denied
//   DEATH HAND    a black-green hand that homes slowly: out-fly it, or take it on the shield     !
//   DEATH MARK    a ring laid on you that goes off in two seconds         ✕  fly out of it
// THE OPENING IS YOURS (tools/boss-openings.mjs): a DEATH MARK that goes off on nobody comes back on him, and he hangs
// in the air re-gathering for 2.5 s, open, taking double. Left to land on you, the same mark opens nothing.
// ENRAGED (under 40%): he moves and casts 1.6x faster, blinks every ~3 s instead of ~8, casts his spells in pairs, and
// the storm walls close the sky in (carpetBox squeeze).
//
// HIS PORTALS (Falling Tower round 2, docs/briefs/falling-tower-round2.md §3; added, not replacing). His rings (e.rings) come in pairs,
// an ENTRY by him and an EXIT somewhere else, and every one of them has THE DESERT inside it (src/sanctum.js drawDesertOval), the same
// desert the level ends in.
//   THE PORTAL STEP  stepTell  the EXIT ring opens near you and FLARES; then he steps into his entry ring and comes out of the exit
//                    mid-cast - the next spell's tell already half gone. Get out of the flared ring's reach, or dodge through it
//   BENT BOLTS       bendTell  an entry ring by his hand and an exit above or behind you, both glowing the bolt's colour; he casts
//                    into the one and the bolts come out of the other at you, from a new angle                     !
//   THE OPENING IS CAUSED (A11): HIS RINGS WORK BOTH WAYS. Dodge through an open exit ring and you come out beside him: his spell is
//                    broken and he is BREACHED, open for MAGE.breachT at double damage. Left alone, a ring opens nothing.
//   THE STAGES (A10) 1 over 70%: one pair at a time. 2 (70-40%) "HIS RINGS STAY OPEN": rings live 1.6x longer, a spare exit stays
//                    open near you after a step or a bent bolt (three rings at once), and his fire comes out of it. 3 (his enrage)
//                    "HE FIGHTS RING TO RING": his blink is a ring pair, and his fire comes across the room out of a ring behind you.
// ROUND 3 (work/claude/lane-done/claude-ft3.md, Daniel 2026-09-27): two more told moves on the same kit. His difficulty was called
// fine, so they take the places of the SECOND step and the SECOND bent bolt in his order - the rotation is as long as it was, and the
// dodge-through opening, his health and every old tell are untouched.
//   DECOY RING       decoyTell TWO exit rings open either side of you and BOTH flare - but only the real one has THE DESERT in it;
//                    the decoy is hollow, his green fog and nothing through it. He steps out of the real one mid-cast. Read the
//                    desert: dodge through the real ring and he is breached as ever; the decoy opens nothing and costs you the dodge
//   RING TRAP        trapTell  a ring opens OVER YOU and glows the bolt's colour, his hand's ring with it; he casts in and the bolts
//                    DROP out of it on the spot it opened over - it does not follow you. Get out from under it, or guard      !
// ARCHMAGE2 (claude/archmage2b, Daniel 10-02 - he picked all three): THREE NEW TOLD MOVES, ONE PER STAGE (scratch/design-standard.md B5).
//   BONE STORM       boneTell  stage 1 on. A ring of his skulls is drawn round you, its GAPS drawn open; then the skulls close in on the
//                    spot, turning as they come. Nothing turns a skull (!!): fly out through a gap. Every cycle of his order the storm
//                    changes - one wide gap or two narrow ones, and it turns the other way
//   PHYLACTERY ECHO  (no tell of its own: it follows a told spell) stage 2 on. A ghost of him stays where he cast, and half a second later
//                    it casts the SAME spell again - his fire, frost, poison, hand or lightning - from there, at where you are then:
//                    dodge twice. The lightning's echo falls where you were when the first one did, told by its own pale column
//   GRAVE PULL       pullTell  stage 3 (he burns). A void opens at the edge of the sky behind you (told: it tears open, black and violet,
//                    and the air is seen streaming into it), then for a few seconds it DRAGS the carpet toward it while he goes on
//                    casting: fly against the pull and dodge as ever. Touched, the void hurts (!!) and spits you back out
// ARCHMAGE3 (claude/archmage3, Daniel 10-04): TWO MORE TOLD MOVES, not his ring kit or his spells again, and a ward that READS.
//   HIS ORRERY       orbitTell !! stage 1 on. The tower's brass orrery answers him: its worlds come out on ORBITS ROUND HIM (the rings drawn,
//                    dotted, through the tell; the worlds fade in on them), then for a few seconds they swing round him, each ring its own way.
//                    A world hurts and nothing turns it: keep BETWEEN two orbits, or out past the last. From his third stage, a fourth world
//   THE GRAVE SCRIPT scriptTell !! stage 1 on. He writes his runes in LINES ACROSS THE WHOLE SKY - every band of it but one, which stays dark
//                    (never the one you are in) - and they go off together: fly to the dark line. From his second stage he writes it twice,
//                    the dark line somewhere else the second time
//   HIS WARD         he is warded BY DEFAULT and it is DRAWN: a pale shell of his runes round him, turning; a blow it turns flares it white where
//                    it struck, rings, says WARDED and sounds his ward's note (main.js greedHit); when an opening takes it down the shell SHATTERS
//                    and he burns gold until it is back (src/archmage-acts.js drawActs)
//   DANIEL'S NOTES (10-05):
//   HIS WARD IS BROKEN BY YOU. His FIREBOLT - orange, a WHITE HEART and a turning GOLD RING round it - can be STRUCK BACK with any blow (the
//                    Wicker Queen's ball's rule): it flies home, and if it finds him warded it BREAKS HIS WARD - his opening (mode 'reflected',
//                    MAGE.openT). Struck back while his ward HOLDS (the told anti-spam ward, MAGE.reflect.hold s after every opening: the shell
//                    drawn doubled) it only rings off it. Nothing else of his can be struck back.
//   COLOUR, THE GAME'S CONVENTION: a YELLOW rim = it can be GUARDED (his fire, ice, the hand, bent and trapped bolts: every hero's guard - shield,
//                    deflect, ember ward - takes them); a RED rim = it CANNOT, DODGE (skulls, his orrery's worlds, the script's lines, the
//                    storm column, the death mark, the poison orbs, the grave's void).
//   LESS HECTIC LATE: one windup at a time to the end (no more spells in pairs when he burns, no echo in his last stage), and no new spell while
//                    the last one's skulls, worlds or lines are still out or three of his bolts are in the air - harder by quality, not volume.
//   THE STAFF: every bolt leaves the HEAD OF HIS STAFF (MAGE.staff), pointed at you in his cast pose (src/redraw/lich.js), not his fist.
//   HIS PHASES       each realm he tears is its own told set piece, a breather with nothing cast: THE SKY CRACKS (fire), HIS RINGS GATHER AND
//                    FREEZE (ice), HIS DARK SURGES UP THE SKY: THE POISON REALM (poison) - and the realm SHATTERS when you come out of it (src/archmage-acts.js)
import { canvas, flipX, whiten } from './px.js';
import { drawDesertOval } from './sanctum.js';
import { REALM, OPEN as REALM_OPEN, realmDue, enterRealm, updateRealm } from './mage-realms.js';   /* HIS SPELL REALMS at 75/50/25% (claude/undead3) */
export { bakeUndeadMage, UNDEADMAGE_F } from './redraw/lich.js';

export function smallerFamiliar(s) {
  const scale = c => { const [n, g] = canvas(Math.round(c.width * .7), Math.round(c.height * .7)); g.drawImage(c, 0, 0, n.width, n.height); return n; };
  return { ...s, R: s.R.map(scale), L: s.L.map(scale), white: { R: s.white.R.map(scale), L: s.white.L.map(scale) }, ax: Math.round(s.ax * .7), ay: Math.round(s.ay * .7), w: 39, h: 42 };
}
void flipX; void whiten;

export const MAGE = {
  enrageAt: 0.4, fast: 1.6, blinkEvery: 8, blinkEnraged: 3, afterOpen: 3, openT: 3.0, openMul: 2,   /* (claude/archmage4: 3.6 -> 3.0, the hall openings shorter - HERO KIT made every hero hit harder) */
  order: ['fire', 'ice', 'step', 'bone', 'poison', 'orbit', 'mark', 'bend', 'storm', 'pull', 'hand', 'script', 'decoy', 'fire', 'mark', 'trap'],   /* (archmage3: HIS ORRERY and THE GRAVE SCRIPT) */   /* (round 3: the second step is the DECOY, the second bend the TRAP; archmage2: the BONE STORM, and the GRAVE PULL - stage 3 only, skipped before it) */
  tell: { fire: 0.9, ice: 0.9, storm: 1.2, poison: 1.0, hand: 0.9, mark: 0.6, step: 1.0, bend: 1.0, decoy: 1.1, trap: 1.0, bone: 1.1, pull: 1.0, orbit: 1.2, script: 1.2 },
  dmg: { fire: 14, ice: 12, storm: 28, orb: 8, hand: 16, mark: 34, bent: 13, trap: 13, skull: 15, void: 18, world: 22, script: 24 },   /* (claude/sweep3: archmage4's red +15% taken back - storm 32, mark 38, skull 17, void 20, world 25, script 28 - the warden was 0/4 on the standard bot; his 2800 is Daniel's and stands) */   /* (archmage3: the red ones - nothing turns them - hit harder: harder by quality, not volume; archmage4: the red ones +15% again, the yellow ones a guard takes are unchanged) */
  /* ARCHMAGE2. THE BONE STORM: n skulls on a ring of radius r0 round you, its gap slots left open (one wide gap, or every other cycle two
     narrow ones), closing to r1 over secs while the ring turns `turn` of a circle. THE ECHO: its delay, and the spells it repeats. THE GRAVE
     PULL: how long it drags, how hard (px/s at its full), its void's reach, and how long between two hurts by it */
  bone: { n: 12, gap: 3, r0: 118, r1: 8, secs: 2.6, turn: 0.3, r: 5, cd: 0.6 },
  echo: { delay: 0.5, spells: ['fire', 'ice', 'poison', 'hand', 'storm'] },
  pull: { secs: 3.4, v: 64, ease: 0.5, r: 22, cd: 1.0 },
  /* ARCHMAGE3. HIS ORRERY: worlds on orbits of these radii round him (a fourth from his third stage), turning v rad/s (each ring the other way to the
     one inside it) for secs; a world's radius, and how long between two hurts by them. THE GRAVE SCRIPT: the sky in n bands, one dark; the lines go
     off flash s after the tell; from his second stage he writes it again after again s, the dark line moved at least two bands */
  orbit: { radii: [52, 92, 132, 172], v: 1.5, secs: 3.0, r: 9, cd: 0.6 },
  script: { n: 5, flash: 0.3, again: 1.0 },
  /* HIS PHASE CHANGES (archmage3): each realm's tear is its own told set piece - nothing is cast through it (a breather), every one different. secs: how
     long it plays before the realm takes you; say: its banner; sounds: what it sounds like, in order through it (src/archmage-acts.js draws it) */
  trans: { fire: { secs: 2.8, say: 'THE SKY CRACKS: THE FIRE REALM POURS THROUGH', sounds: ['crack', 'heavy', 'crack'] },
    ice: { secs: 2.8, say: 'HIS RINGS GATHER AND FREEZE: THE ICE REALM', sounds: ['mageBolt', 'hiss', 'golemChime'] },
    poison: { secs: 2.8, say: 'HIS DARK SURGES UP THE SKY: THE POISON REALM', sounds: ['heavy', 'hiss', 'heavy'] } },
  /* HIS WARD (archmage3): a turned blow flares it this long; an opening shatters it this long */
  ward: { hitT: 0.45, dropT: 0.8, shatterT: 1.0 },
  /* (Daniel 10-05) THE STAFF'S HEAD in his cast pose, from his anchor (px, facing right): every bolt leaves it. THE STRUCK-BACK BOLT: its speed home,
     how hard it turns after him, how near it must come; and the told ward that HOLDS this long after every opening (nothing breaks it again yet) */
  staff: { dx: 20, dy: 51 },
  reflect: { v: 260, turn: 4, r: 18, hold: 3.5 },   /* (archmage4: the told hold 3.0 -> 3.5 s) */
  late: { shots: 3 },   /* his last stage: no new spell while this many of his bolts are in the air */
  /* THE TRAP: how high over you the ring opens, and its drop - a column of bolts, three and then five, fanned so a side-step clears them */
  trapUp: 70, trapN: [3, 5, 5], trapFan: 0.16,
  markR: 36, markFuse: 2.0, cloudR: 26, cloudLife: 4, handSpeed: 72, hover: 1.0, boltV: 150,   /* the bolt is slower than the carpet: every spell can be out-flown */
  /* THE RINGS: stage 2 below 70%; a ring's size; how near you the step's exit opens; how long a used ring stays; the spare's life; the
     breach (the opening a dodge through a ring makes); how far through a ring you come out beside him */
  stage2: 0.7, ringW: 12, ringH: 17, stepNear: 56, ringStay: 0.5, spareLife: 3.2, stayMul: 1.6, breachT: 3.0, beside: 30,
};
const TELL = { fire: 'fireTell', ice: 'iceTell', storm: 'stormTell', poison: 'poisonTell', hand: 'handTell', mark: 'markTell', step: 'stepTell', bend: 'bendTell', decoy: 'decoyTell', trap: 'trapTell', bone: 'boneTell', pull: 'pullTell', orbit: 'orbitTell', script: 'scriptTell' };
const SAY = { fireTell: 'FIRE: GUARD OR FLY', iceTell: 'FROST: FLY ACROSS IT', stormTell: 'LIGHTNING: LEAVE THE MARK', poisonTell: 'POISON: KEEP OUT OF THE CLOUD', handTell: 'DEATH: OUT-FLY THE HAND', markTell: 'THE DEATH MARK: FLY OUT OF THE RING',
  stepTell: 'HE OPENS A RING BY YOU', bendTell: 'HIS BOLTS BEND THROUGH THE RINGS', decoyTell: 'TWO RINGS: ONLY ONE HOLDS THE DESERT', trapTell: 'A RING OVER YOU: GET OUT FROM UNDER',
  boneTell: 'BONE STORM: FLY OUT THROUGH A GAP', pullTell: 'THE GRAVE PULLS: FLY AGAINST IT', orbitTell: 'HIS ORRERY: KEEP BETWEEN ITS ORBITS', scriptTell: 'THE GRAVE SCRIPT: FLY TO THE DARK LINE' };
/* (claude/archmage3) THE LINES SAID IN THE HINT BOX, not dropped: his two new moves and his three phase changes are told in WORDS as well as marks and sound
   (main.js's say hands these to callout(); number() would drop them) */
export const CALLED = new Set(['HIS OWN FIRE BREAKS HIS WARD', SAY.orbitTell, SAY.scriptTell, ...Object.values(MAGE.trans).map(T => T.say)]);
/* the ring moves - the ones that open a ring, and so never come straight out of one (a step comes out casting a spell, not a ring) */
const RINGED = new Set(['step', 'bend', 'decoy', 'trap']);
export const RING_COL = { rim: '#6fe08a', rimL: '#c8ffd8', fire: '#ff9b49', flare: '#ffffff' };
export const mageOpen = e => e.mode === 'gather' || e.mode === 'breached' || e.mode === 'reflected' || REALM_OPEN.has(e.mode);   /* (Daniel 10-05: 'reflected' - his own bolt struck back broke his ward) */
/* HIS WARD CAN BE BROKEN NOW: not open, not holding after an opening, not in a realm, not between two places */
export const wardBreakable = e => !!(e && e.alive && !mageOpen(e) && !(e.wardHold > 0) && !e.realm && !['sleep', 'wake', 'blinkOut', 'blinkIn', 'realmTell'].includes(e.mode));
/* THE BOLT THAT CAN BE STRUCK BACK: his own firebolt (not his echo's, not one already struck) */
export const reflectable = q => q.kind === 'fire' && !q.echo && !q.reflected;
/* WHERE HIS BOLTS LEAVE: the head of his staff */
export const staffTip = e => [e.x + (e.face || 1) * MAGE.staff.dx, e.y - MAGE.staff.dy];   /* (and a realm's opening: scorched, shattered, vented) */
export const mageSpeed = e => e.enraged ? MAGE.fast : 1;
/* HIS STAGE: 1, 2 under 70%, 3 once he burns (his enrage, under 40%) */
export const mageStage = e => e.enraged ? 3 : e.hp <= (e.hp0 || e.maxHp || e.hp) * MAGE.stage2 ? 2 : 1;
/* where he wants to be: well off to one side of you, a little over you, and inside the sky */
function station(e, P, box) {
  let side = Math.sign(e.x - P.x) || 1; if (P.x + side * 120 > box.x1 - 20 || P.x + side * 120 < box.x0 + 20) side = -side;   /* he keeps his side of you, until the sky runs out on it */
  return [Math.max(box.x0 + 20, Math.min(box.x1 - 20, P.x + side * 120)), Math.max(box.y0 + 44, Math.min(box.y1 - 10, P.y - 24))];
}
function blinkTo(e, P, box, rnd) {
  for (let i = 0; i < 12; i++) { const x = box.x0 + 30 + rnd() * (box.x1 - box.x0 - 60), y = box.y0 + 50 + rnd() * Math.max(10, box.y1 - box.y0 - 70); if (Math.hypot(x - P.x, y - P.y) > 110) return [x, y]; }
  return [P.x < (box.x0 + box.x1) / 2 ? box.x1 - 40 : box.x0 + 40, box.y0 + 60];
}
// ---- the rings ----
const inBox = (box, x, y) => [Math.max(box.x0 + 20, Math.min(box.x1 - 20, x)), Math.max(box.y0 + 22, Math.min(box.y1 - 12, y))];
function ring(e, kind, x, y, life, o) { const r = { kind, x, y, t: 0, life, on: 0, glow: null, flare: false, used: false, ...(o || {}) }; e.rings.push(r); return r; }
/* the pair he opens: the entry by him (or by his hand) and the exit where it is wanted. At most THREE open at once (stage 2's spare) */
function pair(e, ex, ey, xx, xy, life) { e.rings = e.rings.filter(r => r.spare && r.t < r.life).slice(-1); const a = ring(e, 'entry', ex, ey, life), b = ring(e, 'exit', xx, xy, life); a.to = b; b.to = a; return [a, b]; }
const stayOf = e => MAGE.ringStay * (mageStage(e) >= 2 ? MAGE.stayMul : 1);
/* stage 2 on: the exit he leaves open is a spare - it stays by you, and his fire can come out of it */
function keepSpare(e, r) { if (mageStage(e) < 2 || !r) return; r.spare = true; r.flare = false; r.glow = null; r.t = 0; r.life = MAGE.spareLife * MAGE.stayMul; }
function begin(e, spell, c, half) {
  const k = mageSpeed(e), P = c.P, py = P.y - 8, box = c.box, st = mageStage(e);
  e.mode = TELL[spell]; e.modeT = MAGE.tell[spell] / k * (half ? 0.5 : 1); e.spell = spell; e.face = Math.sign(P.x - e.x) || 1;
  if (spell === 'storm') e.markX = P.x;                 /* the column is where you were when he raised his hands */
  if (spell === 'bone') { const cyc = Math.floor((e.turn - 1) / MAGE.order.length), B = MAGE.bone, two = cyc % 2 === 1, a0 = (c.rnd || Math.random)() * Math.PI * 2;
    const slots = new Set(two ? [0, 1, B.n / 2, B.n / 2 + 1] : [...Array(B.gap).keys()]);   /* EVERY CYCLE CHANGES: one wide gap, then two narrow ones */
    e.bones = { cx: P.x, cy: py, a0, spin: two ? -1 : 1, slots, t: 0, live: false, cd: 0, follow: true }; }   /* (the ring is drawn round you through the tell, and stays where you are when it goes) */
  if (spell === 'orbit') { const n = st >= 3 ? 4 : 3, a0 = (c.rnd || Math.random)() * Math.PI * 2;   /* HIS ORRERY: its worlds round him, set where he stands as he calls them */
    e.orbit = { cx: e.x, cy: e.y - 24, worlds: MAGE.orbit.radii.slice(0, n).map((R, i) => ({ R, a: a0 + i * 2.1, spin: i % 2 ? -1 : 1 })), t: 0, live: false, cd: 0 }; }
  if (spell === 'script') { const n = MAGE.script.n, h = (box.y1 - box.y0) / n, mine = Math.max(0, Math.min(n - 1, Math.floor((py - box.y0) / h)));
    e.script = { y0: box.y0, h, n, safe: scriptSafe(n, mine, c.rnd || Math.random), left: st >= 2 ? 1 : 0, flash: 0 }; }   /* THE GRAVE SCRIPT: never the line you are in that stays dark */
  if (spell === 'pull') { const side = Math.sign(P.x - e.x) || 1, vx = side > 0 ? box.x1 - 6 : box.x0 + 6;   /* THE VOID: at the edge of the sky behind you */
    e.void = { x: vx, y: Math.max(box.y0 + 30, Math.min(box.y1 - 20, py)), t: 0, live: false, cd: 0 }; }
  if (spell === 'step') { const toward = Math.sign(e.x - P.x) || 1, [xx, xy] = inBox(box, P.x + toward * MAGE.stepNear, py - 8);
    const [, b] = pair(e, e.x, e.y - 24, xx, xy, e.modeT + stayOf(e)); b.flare = true; }   /* THE EXIT FLARES FIRST: that is the tell */
  if (spell === 'decoy') { const side = (c.rnd || Math.random)() < 0.5 ? -1 : 1;   /* which side of you the real one is: a coin, so it is READ, not learned */
    const [rx, ry] = inBox(box, P.x + side * MAGE.stepNear, py - 8), [fx, fy] = inBox(box, P.x - side * MAGE.stepNear, py - 8);
    const [, b] = pair(e, e.x, e.y - 24, rx, ry, e.modeT + stayOf(e)); b.flare = true;
    ring(e, 'decoy', fx, fy, e.modeT + 0.2, { flare: true, hollow: true }); }   /* THE DECOY: it flares the same, and there is nothing through it */
  if (spell === 'trap') { const [xx, xy] = inBox(box, P.x, py - MAGE.trapUp);   /* OVER YOU, where you are now: it stays there */
    const [a, b] = pair(e, ...staffTip(e), xx, xy, e.modeT + stayOf(e)); a.glow = b.glow = RING_COL.fire; b.trap = true; }
  if (spell === 'bend') { const toward = Math.sign(e.x - P.x) || 1, above = ((e.bendN = (e.bendN || 0) + 1) % 2) === 1;
    const [xx, xy] = inBox(box, above ? P.x + ((c.rnd || Math.random)() - 0.5) * 40 : P.x - toward * 64, above ? py - 72 : py - 6);
    const [a, b] = pair(e, ...staffTip(e), xx, xy, e.modeT + stayOf(e)); a.glow = b.glow = RING_COL.fire; }   /* BOTH RINGS GLOW THE BOLT'S COLOUR */
  if (spell === 'fire' && st >= 2) { let r = e.rings.find(q => q.spare && q.kind === 'exit' && q.t < q.life);
    if (st >= 3) { const toward = Math.sign(e.x - P.x) || 1; let far = Math.max(box.x0 + 30, Math.min(box.x1 - 30, P.x - toward * 220)); if (Math.abs(far - P.x) < 100) far = P.x + toward * 220;   /* behind you if the room has it, else past him */
      r = ring(e, 'exit', ...inBox(box, far, py - 10), e.modeT + stayOf(e), { across: true }); }   /* ACROSS THE ROOM, out of a ring behind you */
    if (r) { r.glow = RING_COL.fire; e.fireRing = r; } else e.fireRing = null; }
  c.say(SAY[e.mode], spell === 'storm' || spell === 'mark');
}
/* HIS RINGS WORK BOTH WAYS: a dodge through an open exit ring comes out beside him - his spell broken, he is open */
function breach(e, r, c) {
  const side = Math.sign(c.P.x - e.x) || 1, [bx, by] = inBox(c.box, e.x + side * MAGE.beside, e.y - 26);
  r.used = true; if (c.carry) c.carry(bx, by);
  e.mode = 'breached'; e.modeT = MAGE.breachT; e.open = MAGE.breachT; e.chained = false; e.fireRing = null;
  for (const q of e.rings) { q.life = Math.min(q.life, q.t + 0.3); q.flare = false; }
  c.say('THROUGH HIS OWN RING: HE IS OPEN', true); c.sound('crack');
}
/* HIS NEXT SPELL in his order: the GRAVE PULL is his third stage's, and passed over before it (archmage2) */
function nextSpell(e) { let s = MAGE.order[e.turn++ % MAGE.order.length]; if (s === 'pull' && mageStage(e) < 3) s = MAGE.order[e.turn++ % MAGE.order.length]; return s; }
/* THE BONE STORM'S SKULLS at its moment k (0..1): [x, y] each, the gaps left out */
export function boneSkulls(B, k = 0) { const M = MAGE.bone, r = M.r0 + (M.r1 - M.r0) * Math.max(0, Math.min(1, k)), off = B.spin * M.turn * Math.PI * 2 * Math.max(0, k), out = [];
  for (let i = 0; i < M.n; i++) { if (B.slots.has(i)) continue; const a = B.a0 + off + (i / M.n) * Math.PI * 2; out.push([B.cx + Math.cos(a) * r, B.cy + Math.sin(a) * r]); }
  return out; }
/* THE MIDDLE OF A GAP at moment k: its angle (the bot flies out along it) */
export function boneGaps(B, k = 0) { const M = MAGE.bone, off = B.spin * M.turn * Math.PI * 2 * Math.max(0, k), runs = [];
  for (let i = 0; i < M.n; i++) if (B.slots.has(i) && !B.slots.has((i + M.n - 1) % M.n)) { let j = i; while (B.slots.has((j + 1) % M.n) && j - i < M.n) j++; runs.push(B.a0 + off + ((i + j) / 2 / M.n) * Math.PI * 2); }
  return runs; }
/* THE GRAVE SCRIPT'S DARK LINE: a band at least two from the one you are in (n bands) */
export function scriptSafe(n, mine, rnd) { const ok = [...Array(n).keys()].filter(k => Math.abs(k - mine) >= 2); return ok.length ? ok[Math.floor(rnd() * ok.length) % ok.length] : (mine + Math.floor(n / 2)) % n; }
/* the band a y is in, and whether a y is in a WRITTEN band (not the dark one) */
export const scriptBand = (S, y) => Math.floor((y - S.y0) / S.h);
export const scriptHits = (S, y) => { const k = scriptBand(S, y); return k >= 0 && k < S.n && k !== S.safe; };
/* HIS ORRERY'S WORLDS at its time t: [x, y] each */
export const orbitWorlds = (O, t = O.t) => O.worlds.map(w => [O.cx + Math.cos(w.a + w.spin * MAGE.orbit.v * t) * w.R, O.cy + Math.sin(w.a + w.spin * MAGE.orbit.v * t) * w.R]);
/* THE GRAVE PULL'S DRAG at its time t: px/s toward the void */
export const pullV = t => MAGE.pull.v * Math.min(1, t / MAGE.pull.ease);
/* ONE STEP OF THE NEW THINGS: the storm's skulls, his echoes, the void */
function stepNew(e, dt, c, py) {
  const { P } = c;
  if (e.bones) { const B = e.bones; B.cd = Math.max(0, B.cd - dt);
    if (B.follow) { B.cx = P.x; B.cy = py; }
    if (B.live) { B.t += dt; const k = B.t / MAGE.bone.secs;
      if (k >= 1) e.bones = null;
      else if (!P.dead && B.cd <= 0) for (const [x, y] of boneSkulls(B, k)) if (Math.hypot(P.x - x, py - y) < MAGE.bone.r + 8) { B.cd = MAGE.bone.cd; c.hit(x, y, MAGE.dmg.skull, true, 'skull'); break; } } }
  if (e.echoes && e.echoes.length) { for (const q of e.echoes) { q.t -= dt; if (q.t > 0) continue; q.gone = true; if (P.dead || !e.alive) continue;
      const hx = q.x + q.face * MAGE.staff.dx, hy = q.y - MAGE.staff.dy, aim = Math.atan2(py - hy, P.x - hx), shot = (a, sp, r, dmg, kind, col, life = 4) => e.shots.push({ x: hx, y: hy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, a, sp, r, dmg, kind, col, t: life, echo: true });
      if (q.spell === 'fire') for (const s of q.enraged ? [-0.24, 0, 0.24] : [0]) shot(aim + s, MAGE.boltV, 5, MAGE.dmg.fire, 'fire', '#b8ffcf');
      else if (q.spell === 'ice') for (let i = -2; i <= 2; i++) shot(aim + i * 0.3, 120, 4, MAGE.dmg.ice, 'ice', '#c8fff0');
      else if (q.spell === 'poison') for (const s of [-0.5, 0, 0.5]) shot(aim + s, 55, 5, MAGE.dmg.orb, 'orb', '#8fd160', 2.4);
      else if (q.spell === 'hand') shot(aim, MAGE.handSpeed * (q.enraged ? 1.3 : 1), 7, MAGE.dmg.hand, 'hand', '#2a4a2a', 4.5);
      else if (q.spell === 'storm') { if (Math.abs(P.x - q.markX) < 18) c.hit(q.markX, py, MAGE.dmg.storm, true, 'storm'); e.echoFlash = { x: q.markX, t: 0.3 }; }
      c.sound(q.spell === 'storm' ? 'heavy' : 'mageBolt'); }
    e.echoes = e.echoes.filter(q => !q.gone); }
  if (e.echoFlash) { e.echoFlash.t -= dt; if (e.echoFlash.t <= 0) e.echoFlash = null; }
  /* HIS ORRERY (archmage3): its worlds swing round him while it lasts, and a world that meets you hurts (nothing turns it) */
  if (e.orbit) { const O = e.orbit; O.cd = Math.max(0, O.cd - dt);
    if (O.live) { O.t += dt; if (O.t >= MAGE.orbit.secs) e.orbit = null;
      else if (!P.dead && O.cd <= 0) for (const [x, y] of orbitWorlds(O)) if (Math.hypot(P.x - x, py - y) < MAGE.orbit.r + 8) { O.cd = MAGE.orbit.cd; c.hit(x, y, MAGE.dmg.world, true, 'world'); break; } } }
  if (e.script && e.script.flash > 0) { e.script.flash -= dt; if (e.script.flash <= 0 && e.mode !== 'scriptTell') e.script = null; }
  if (e.void) { const V = e.void; V.cd = Math.max(0, V.cd - dt);
    if (V.live) { V.t += dt; if (V.t >= MAGE.pull.secs) { e.void = null; return; }
      if (!P.dead) { const dx = V.x - P.x, dy = V.y - py, d = Math.hypot(dx, dy) || 1, v = pullV(V.t); P.x += dx / d * v * dt; P.y += dy / d * v * dt * 0.6;
        if (d < MAGE.pull.r + 8 && V.cd <= 0) { V.cd = MAGE.pull.cd; c.hit(V.x, V.y, MAGE.dmg.void, true, 'void'); const out = d > 4 ? -dx / d : Math.sign(((c.box.x0 + c.box.x1) / 2) - V.x) || 1; P.x += out * 46; } } } }   /* SPAT BACK OUT, toward the middle of the sky */
}
export function updateUndeadMage(e, dt, c) {
  const { P, box, hit, say, sound } = c, rnd = c.rnd || Math.random;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.open = mageOpen(e) ? Math.max(0, e.modeT) : 0;
  e.shots ??= []; e.clouds ??= []; e.rings ??= []; e.turn ??= 0; e.blinkT ??= MAGE.blinkEvery; e.squeeze ??= 0; e.flashT = Math.max(0, (e.flashT || 0) - dt);
  const k = mageSpeed(e), py = P.y - 8;
  if (!e.enraged && e.hp <= e.hp0 * MAGE.enrageAt) { e.enraged = true; e.blinkT = Math.min(e.blinkT, 1); say('HE BURNS. THE SKY CLOSES. HE FIGHTS RING TO RING', true); sound('mageBolt'); }
  if (!e.enraged && !e.stage2 && mageStage(e) === 2) { e.stage2 = true; say('HIS RINGS STAY OPEN', true); sound('mageBolt'); }
  if (e.enraged) e.squeeze = Math.min(1, e.squeeze + dt / 3);
  /* HIS WARD AND HIS PHASES, DRAWN (archmage3, src/archmage-acts.js): the turned blow's flare, the ward shattering as an opening begins, the realm shattering as
     you come out of it, the phase change's own clock and its sounds */
  e.wardHitT = Math.max(0, (e.wardHitT || 0) - dt); e.wardDropT = Math.max(0, (e.wardDropT || 0) - dt);
  { const op = mageOpen(e); if (op && !e.wasOpen) e.wardDropT = MAGE.ward.dropT; if (!op && e.wasOpen && !e.realm) e.wardHold = MAGE.reflect.hold; e.wasOpen = op; }   /* (the told ward that HOLDS after an opening) */
  e.wardHold = Math.max(0, (e.wardHold || 0) - dt);
  if (e.inRealm && !e.realm) e.shatter = { kind: e.inRealm, t: 0 }; e.inRealm = e.realm ? e.realm.kind : null;
  if (e.shatter && (e.shatter.t += dt) >= MAGE.ward.shatterT) e.shatter = null;
  if (e.trans) { const T = MAGE.trans[e.trans.kind], t0 = e.trans.t; e.trans.t += dt; const n = T.sounds.length;
    for (let i = 1; i < n; i++) { const at = T.secs * i / n; if (t0 < at && e.trans.t >= at) sound(T.sounds[i]); }
    if (e.mode !== 'realmTell') e.trans = null; }
  // ---- his rings: they open, they close, and an open EXIT carries a dodge through it to him ----
  for (const r of e.rings) { r.t += dt; r.on = r.t < r.life ? Math.min(1, r.on + dt * 4) : Math.max(0, r.on - dt * 4); }
  e.rings = e.rings.filter(r => r.t < r.life || r.on > 0);
  if (!P.dead && c.dodging && c.dodging() && e.mode !== 'breached' && e.mode !== 'wake') {
    const r = e.rings.find(q => q.kind === 'exit' && !q.used && q.on >= 0.8 && q.t < q.life && Math.abs(P.x - q.x) < MAGE.ringW + 6 && Math.abs(py - q.y) < MAGE.ringH + 8);
    if (r && !(e.wardHold > 0)) breach(e, r, c); else if (r) { e.wardHitT = MAGE.ward.hitT; e.wardHitX = P.x; e.wardHitY = py; } }   /* (his ward HOLDS after an opening: told, nothing breaks it again yet) */
  // ---- what he has thrown ----
  for (const q of e.shots) {
    q.t -= dt;
    /* STRUCK BACK (Daniel 10-05): a blow that meets his firebolt sends it home; home, it breaks his ward - or rings off it while it holds */
    if (reflectable(q) && !e.realm && c.strike) { const b = c.strike(); if (b && q.x > b.l - q.r && q.x < b.r + q.r && q.y > b.t - q.r - 8 && q.y < b.b + q.r) {
      q.reflected = true; q.t = 3; q.hit = false; q.col = '#e8fff0'; const a = Math.atan2(e.y - 26 - q.y, e.x - q.x); q.a = a; q.vx = Math.cos(a) * MAGE.reflect.v; q.vy = Math.sin(a) * MAGE.reflect.v; say('STRUCK BACK', false); sound('crack'); } }
    if (q.reflected) { const want = Math.atan2(e.y - 26 - q.y, e.x - q.x); let d = want - q.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      q.a += Math.max(-MAGE.reflect.turn * dt, Math.min(MAGE.reflect.turn * dt, d)); q.vx = Math.cos(q.a) * MAGE.reflect.v; q.vy = Math.sin(q.a) * MAGE.reflect.v; q.x += q.vx * dt; q.y += q.vy * dt;
      if (Math.hypot(q.x - e.x, q.y - (e.y - 26)) < MAGE.reflect.r) { q.t = 0; q.gone = true;
        if (wardBreakable(e)) { e.mode = 'reflected'; e.modeT = MAGE.openT; e.open = MAGE.openT; e.deathMark = null; e.chained = false; e.fireRing = null; say('HIS OWN FIRE BREAKS HIS WARD', true); sound('crack'); sound('sting'); }
        else { e.wardHitT = MAGE.ward.hitT; e.wardHitX = q.x; e.wardHitY = q.y; sound('aegis'); } }
      continue; }
    if (q.kind === 'hand') {   /* it turns toward you at a limited rate: a hard turn on the carpet leaves it behind */
      const want = Math.atan2(py - q.y, P.x - q.x); let d = want - q.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      q.a += Math.max(-1.6 * dt, Math.min(1.6 * dt, d)); q.vx = Math.cos(q.a) * q.sp; q.vy = Math.sin(q.a) * q.sp; }
    q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.kind === 'feed') { if (q.t <= 0) q.gone = true; continue; }   /* a bolt going INTO his ring: it is in the other one now */
    if (q.kind === 'orb' && (q.t <= 0 || Math.hypot(P.x - q.x, py - q.y) < 22)) { e.clouds.push({ x: q.x, y: q.y, r: MAGE.cloudR, t: MAGE.cloudLife }); sound('hiss'); q.t = 0; q.gone = true; }
    if (!q.gone && !q.hit && !P.dead && Math.abs(P.x - q.x) < q.r + 6 && Math.abs(py - q.y) < q.r + 9) { hit(q.x, q.y, q.dmg, false, q.kind); q.hit = true; q.t = 0; }
  }
  e.shots = e.shots.filter(q => q.t > 0);
  for (const cl of e.clouds) { cl.t -= dt; if (!P.dead && Math.hypot(P.x - cl.x, py - cl.y) < cl.r) c.venom(); }
  e.clouds = e.clouds.filter(cl => cl.t > 0);
  stepNew(e, dt, c, py);
  /* IN ONE OF HIS REALMS (src/mage-realms.js): the realm runs the fight until its opening has been had, and then it tears */
  e.realmRest = Math.max(0, (e.realmRest || 0) - dt);
  if (e.realm) { updateRealm(e, dt, c); return; }
  // ---- the death mark on the air where you were ----
  /* e.deathMark, NOT e.mark: the Death Knight hero's markFoe() writes e.mark = 6 (a number) on whatever he strikes, and a
     number here crashed the fight on `.t` (tools/audit-bosslab, 2026-09-24). Two systems, one field name. */
  if (e.deathMark) { e.deathMark.t -= dt;
    if (e.deathMark.t <= 0) { const m = e.deathMark; e.deathMark = null; e.flashT = 0.3; e.flashX = m.x; e.flashY = m.y; sound('heavy');
      if (!P.dead && Math.hypot(P.x - m.x, py - m.y) < m.r) { hit(m.x, m.y, MAGE.dmg.mark, true, 'mark'); if (e.mode !== 'breached') { e.mode = 'hover'; e.modeT = 0.8 / k; } }
      else if (e.mode !== 'breached' && e.mode !== 'reflected' && !(e.wardHold > 0)) { e.mode = 'gather'; e.modeT = MAGE.openT; e.open = MAGE.openT; say('THE MARK FINDS NO ONE. IT COMES BACK ON HIM', true); sound('crack'); }
      else if (e.mode === 'markWait') { e.mode = 'hover'; e.modeT = 0.8 / k; e.wardHitT = MAGE.ward.hitT; e.wardHitX = e.x; e.wardHitY = e.y - 26; sound('aegis'); } } }   /* (claude/archmage4) a missed mark while his ward HOLDS rings off it - and he FIGHTS ON: it left him in markWait for good (the warden's bot sat 200 s at 37%) */
  // ---- the blink ----
  e.blinkT -= dt; e.noBlink = Math.max(0, (e.noBlink || 0) - dt);
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = MAGE.hover; } return; }
  if (e.mode === 'blinkOut') { if (e.modeT <= 0) { e.x = e.teleX; e.y = e.teleY; e.mode = 'blinkIn'; e.modeT = 0.25 / k; sound('mageBolt'); } return; }
  if (e.mode === 'blinkIn') { if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 0.35 / k; } return; }
  if (e.mode === 'gather' || e.mode === 'breached' || e.mode === 'reflected') { e.y += Math.sin(e.anim * 2) * 4 * dt; if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 0.4; e.blinkT = MAGE.afterOpen; e.noBlink = MAGE.afterOpen; } return; }   /* (claude/sweep3, B12: the window closed on a blink half a second later - now he hovers where you can follow him for afterOpen s first) */
  if (e.mode === 'markWait') { return; }
  /* HE TEARS A PORTAL at 75, 50 and 25%: the tear is told (realmTell - his ring of the realm, flaring), then it takes you */
  if (e.mode === 'hover' && e.modeT <= 0.2 && realmDue(e) >= 0) { const kind = REALM.kinds[e.realmN || 0], T = MAGE.trans[kind]; e.mode = 'realmTell'; e.modeT = T.secs; e.spell = 'realm'; e.face = Math.sign(P.x - e.x) || 1; e.deathMark = null;
    /* (archmage3) A PHASE CHANGE IS A SET PIECE AND A BREATHER: everything of his in the sky goes out, and its own picture plays (src/archmage-acts.js) */
    e.shots = []; e.clouds = []; e.rings = []; e.bones = null; e.void = null; e.echoes = []; e.orbit = null; e.script = null; e.fireRing = null; e.chained = false; e.trans = { kind, t: 0 };
    say(T.say, true); sound(T.sounds[0]); return; }
  if (e.mode === 'hover') {
    const [tx, ty] = station(e, P, box), sp = 70 * k;
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy); if (d > 2) { e.x += dx / d * Math.min(d, sp * dt); e.y += dy / d * Math.min(d, sp * dt); }
    e.y += Math.sin(e.anim * 2.3) * 6 * dt; e.face = Math.sign(P.x - e.x) || 1;
    const crowded = Math.hypot(P.x - e.x, py - (e.y - 20)) < 34 && e.blinkT < MAGE.blinkEvery - 3;
    if ((e.blinkT <= 0 || crowded) && e.modeT <= 0.2 && !(e.noBlink > 0)) { [e.teleX, e.teleY] = blinkTo(e, P, box, rnd); e.mode = 'blinkOut'; e.modeT = 0.55 / k; e.blinkT = e.enraged ? MAGE.blinkEnraged : MAGE.blinkEvery; say('TELEPORT', false);
      if (mageStage(e) >= 3) pair(e, e.x, e.y - 24, e.teleX, e.teleY - 24, e.modeT + 0.3)[1].flare = true;   /* RING TO RING: his blink is a pair of rings now, and its exit works both ways too */
      return; }
    if (e.modeT <= 0) { if (e.enraged && (e.bones || e.orbit || e.script || e.shots.filter(q => q.kind !== 'feed' && !q.reflected).length >= MAGE.late.shots)) { e.modeT = 0.2; return; }   /* (Daniel 10-05: less hectic late - the last spell's things clear first) */
      begin(e, nextSpell(e), c); }
    return;
  }
  if (e.mode === 'orbitWait') { e.y += Math.sin(e.anim * 2.3) * 4 * dt; if (!e.orbit || e.modeT <= 0) { e.orbit = null; e.mode = 'hover'; e.modeT = MAGE.hover / k; } return; }
  if (e.mode === 'boneWait') { e.y += Math.sin(e.anim * 2.3) * 6 * dt; if (!e.bones || e.modeT <= 0) { e.bones = null; e.mode = 'hover'; e.modeT = MAGE.hover / k; } return; }
  if (e.modeT > 0) { if (e.mode === 'stormTell') e.face = Math.sign(P.x - e.x) || 1; return; }
  // ---- the spell goes ----
  const [hx, hy] = staffTip(e), aim = Math.atan2(py - hy, P.x - hx);
  const shot = (a, sp, r, dmg, kind, col, life = 4, from) => e.shots.push({ x: from ? from.x : hx, y: from ? from.y : hy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, a, sp, r, dmg, kind, col, t: life });
  const spell = e.spell;
  if (spell === 'realm') { enterRealm(e, c.A, P, c); return; }   /* THROUGH: you, him and the carpet */
  if (spell === 'bone') { if (e.bones) { e.bones.live = true; e.bones.follow = false; e.bones.t = 0; } e.mode = 'boneWait'; e.modeT = MAGE.bone.secs; sound('heavy'); return; }   /* THE SKULLS CLOSE IN: he holds the storm while it lasts */
  if (spell === 'pull') { if (e.void) { e.void.live = true; e.void.t = 0; } sound('heavy'); e.chained = false; e.mode = 'hover'; e.modeT = MAGE.hover / k; return; }   /* THE GRAVE PULLS, and he goes on casting */
  if (spell === 'orbit') { if (e.orbit) { e.orbit.live = true; e.orbit.t = 0; } e.mode = 'orbitWait'; e.modeT = MAGE.orbit.secs; sound('heavy'); return; }   /* HIS ORRERY TURNS: he holds it while it lasts */
  if (spell === 'script') { const S = e.script; if (S) { S.flash = MAGE.script.flash; if (!P.dead && scriptHits(S, py)) hit(P.x, py, MAGE.dmg.script, true, 'script'); sound('heavy');
      if (S.left > 0) { S.left--; const mine = Math.max(0, Math.min(S.n - 1, scriptBand(S, py))); S.safe = scriptSafe(S.n, mine, rnd); e.mode = 'scriptTell'; e.modeT = MAGE.script.again / k; say(SAY.scriptTell, true); return; } }   /* (his second stage: written again, the dark line moved) */
    e.chained = false; e.mode = 'hover'; e.modeT = MAGE.hover / k; return; }
  if (mageStage(e) === 2 && !e.realm && MAGE.echo.spells.includes(spell)) {   /* (Daniel 10-05: his echo is his second stage's - not in the last, one windup at a time) */   /* PHYLACTERY ECHO: his ghost stays here and casts it again */
    (e.echoes ??= []).push({ spell, x: e.x, y: e.y, face: e.face, t: MAGE.echo.delay, T: MAGE.echo.delay, markX: spell === 'storm' ? P.x : null, enraged: !!e.enraged });
    if (!e.echoSaid) { e.echoSaid = true; say('HIS ECHO CASTS IT AGAIN: DODGE TWICE', true); } }
  if (spell === 'fire') { const fr = e.fireRing && e.fireRing.t < e.fireRing.life ? e.fireRing : null, a0 = fr ? Math.atan2(py - fr.y, P.x - fr.x) : aim;
    if (fr) shot(Math.atan2(fr.y - hy, fr.x - hx), 260, 4, 0, 'feed', RING_COL.fire, Math.hypot(fr.x - hx, fr.y - hy) / 260);   /* into his hand's glow, out of the ring */
    for (const s of e.enraged ? [-0.24, 0, 0.24] : [0]) shot(a0 + s, MAGE.boltV, 5, MAGE.dmg.fire, 'fire', '#ff9b49', 4, fr); if (fr) fr.glow = null; e.fireRing = null; sound('mageBolt'); }
  else if (spell === 'ice') { for (let i = -2; i <= 2; i++) shot(aim + i * 0.3, 120, 4, MAGE.dmg.ice, 'ice', '#9be2ff');   /* wide enough to fly between two of them */ sound('hiss'); }
  else if (spell === 'storm') { if (!P.dead && Math.abs(P.x - e.markX) < 18) hit(e.markX, py, MAGE.dmg.storm, true, 'storm'); e.flashX = e.markX; e.flashY = null; e.flashT = 0.3; sound('heavy'); }
  else if (spell === 'poison') { for (const s of [-0.5, 0, 0.5]) shot(aim + s, 55, 5, MAGE.dmg.orb, 'orb', '#8fd160', 2.4); sound('hiss'); }
  else if (spell === 'hand') { shot(aim, MAGE.handSpeed * (e.enraged ? 1.3 : 1), 7, MAGE.dmg.hand, 'hand', '#2a4a2a', 4.5); sound('heavy'); }
  else if (spell === 'mark') { e.deathMark = { x: P.x, y: py, r: MAGE.markR, t: MAGE.markFuse / (e.enraged ? 1.25 : 1), T: MAGE.markFuse / (e.enraged ? 1.25 : 1) }; e.mode = 'markWait'; e.modeT = 99; sound('crack'); return; }
  else if (spell === 'step') {   /* HE STEPS THROUGH: out of the exit, mid-cast - the next spell's tell is already half gone */
    const b = e.rings.find(r => r.kind === 'exit' && r.flare && !r.used); if (b) { e.x = b.x; e.y = b.y + 24; b.flare = false; b.life = b.t + stayOf(e); keepSpare(e, b); if (b.to) b.to.life = b.t + 0.2; }
    let next = MAGE.order[e.turn++ % MAGE.order.length]; if (RINGED.has(next)) next = 'fire';   /* out of a ring, a spell - never another ring */
    sound('mageBolt'); e.chained = false; begin(e, next, c, true); return; }
  else if (spell === 'decoy') {   /* OUT OF THE REAL ONE, mid-cast, as the step; the decoy just goes out */
    const b = e.rings.find(r => r.kind === 'exit' && r.flare && !r.used); for (const d of e.rings) if (d.kind === 'decoy') { d.flare = false; d.life = Math.min(d.life, d.t + 0.15); }
    if (b) { e.x = b.x; e.y = b.y + 24; b.flare = false; b.life = b.t + stayOf(e); keepSpare(e, b); if (b.to) b.to.life = b.t + 0.2; }
    let next = MAGE.order[e.turn++ % MAGE.order.length]; if (RINGED.has(next)) next = 'fire';
    sound('mageBolt'); e.chained = false; begin(e, next, c, true); return; }
  else if (spell === 'trap') {   /* INTO HIS HAND'S RING, AND DOWN OUT OF THE ONE OVER YOU */
    const b = e.rings.find(r => r.kind === 'exit' && r.trap && !r.used), a = b && b.to;
    if (b) { const n = MAGE.trapN[mageStage(e) - 1];
      if (a) shot(Math.atan2(a.y - hy, a.x - hx), 260, 4, 0, 'feed', RING_COL.fire, Math.hypot(a.x - hx, a.y - hy) / 260);
      for (let i = 0; i < n; i++) shot(Math.PI / 2 + (i - (n - 1) / 2) * MAGE.trapFan, MAGE.boltV, 5, MAGE.dmg.trap, 'trap', '#ff9b49', 2.5, b);
      b.glow = null; b.trap = false; if (a) { a.glow = null; a.life = a.t + 0.2; } b.life = b.t + stayOf(e); keepSpare(e, b); }
    sound('mageBolt'); }
  else if (spell === 'bend') {   /* INTO ONE RING AND OUT OF THE OTHER: from above you, or from behind */
    const b = e.rings.find(r => r.kind === 'exit' && r.glow && !r.used && !r.spare), a = b && b.to;
    if (b) { const n = mageStage(e) === 1 ? 1 : mageStage(e) === 2 ? 2 : 3, a0 = Math.atan2(py - b.y, P.x - b.x);
      if (a) shot(Math.atan2(a.y - hy, a.x - hx), 260, 4, 0, 'feed', RING_COL.fire, Math.hypot(a.x - hx, a.y - hy) / 260);
      for (let i = 0; i < n; i++) shot(a0 + (i - (n - 1) / 2) * 0.2, MAGE.boltV, 5, MAGE.dmg.bent, 'bent', '#ff9b49', 4, b);
      b.glow = null; if (a) { a.glow = null; a.life = a.t + 0.2; } b.life = b.t + stayOf(e); keepSpare(e, b); }
    sound('mageBolt'); }
  /* (no more spells IN PAIRS when he burns - Daniel 10-05: "the end of the fight throws too much at you at once") */
  e.chained = false; e.mode = 'hover'; e.modeT = MAGE.hover / k;
}
export function undeadFrame(e, F) {
  if (e.hurtT > 0) return F.hurt;
  return ({ fireTell: F.fire, iceTell: F.ice, stormTell: F.storm, poisonTell: F.poison, handTell: F.death, markTell: F.storm, markWait: F.death, stepTell: F.blinkOut, bendTell: F.fire, decoyTell: F.blinkOut, trapTell: F.fire, boneTell: F.death, boneWait: F.death, orbitTell: F.storm, orbitWait: F.death, scriptTell: F.storm, pullTell: F.storm, blinkOut: F.blinkOut, blinkIn: F.blinkIn, gather: F.open, breached: F.open, reflected: F.open, scorched: F.open, shattered: F.open, vented: F.open, realmTell: F.blinkOut, wallTell: F.fire, sporeTell: F.poison, wake: F.idle[Math.floor(e.anim * 2.5) % 2] })[e.mode]
    ?? (e.enraged ? F.enraged[Math.floor(e.anim * 4) % 2] : F.idle[Math.floor(e.anim * 2.5) % 2]);
}
/* ONE RING: the desert inside it, and a rim of sparks in his green - the bolt's colour when a bolt is coming through it, and bright and
   fast when it is the exit he is about to step out of (THE FLARE: the tell) */
export function drawMageRing(g, r, cx, cy, time) {
  const k = Math.max(0, Math.min(1, r.on)), rw = Math.round(MAGE.ringW * k), rh = Math.round(MAGE.ringH * k); if (rw < 2 || rh < 2) return;
  const x = Math.round(r.x - cx), y = Math.round(r.y - cy);
  if (r.flare || r.glow) { g.globalCompositeOperation = 'lighter'; g.fillStyle = r.flare ? 'rgba(200,255,220,' + (0.10 + 0.08 * Math.sin(time * 18)).toFixed(3) + ')' : 'rgba(255,155,73,0.14)'; const R = rh + 5, Q = rw + 5; for (let dy = -R; dy <= R; dy++) { const half = Math.round(Q * Math.sqrt(Math.max(0, 1 - (dy / R) * (dy / R)))); if (half > 0) g.fillRect(x - half, y + dy, half * 2, 1); } g.globalCompositeOperation = 'source-over'; }   /* an oval of light round it, not a box */
  if (r.hollow) { g.fillStyle = '#0c1410'; for (let dy = -rh; dy <= rh; dy++) { const half = Math.round(rw * Math.sqrt(Math.max(0, 1 - (dy / rh) * (dy / rh)))); if (half > 0) g.fillRect(x - half, y + dy, half * 2, 1); }
    g.fillStyle = 'rgba(111,224,138,0.35)'; for (let i = 0; i < 5; i++) g.fillRect(x + Math.round(Math.sin(time * 1.7 + i * 1.9) * rw * 0.6), y + Math.round(Math.cos(time * 1.3 + i * 2.3) * rh * 0.6), 2, 1); }   /* THE DECOY: hollow - his fog, and nothing through it */
  else drawDesertOval(g, x, y, rw, rh, time, r.x * 0.01);
  const col = r.flare ? (Math.floor(time * 14) % 2 ? RING_COL.flare : RING_COL.rim) : r.glow || RING_COL.rim, n = 24;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + time * (r.flare ? 4 : 1.6) * (r.kind === 'entry' ? -1 : 1);
    g.fillStyle = i % 6 === 0 ? RING_COL.rimL : col; g.fillRect(x + Math.round(Math.cos(a) * (rw + 1)), y + Math.round(Math.sin(a) * (rh + 1)), r.flare ? 2 : 1, r.flare ? 2 : 1); }
}
/* THE NEW THINGS, DRAWN (archmage2): the storm's ring (ghost skulls and its gaps through the tell, the skulls themselves closing in), his
   echoes (a pale ghost of him where he cast, brightening to its cast), the echo's lightning column, and the void (a black-violet tear with
   the air streaming into it) */
/* (Daniel 10-05) a rim of the colour rule round a thing at (x, y): yellow - guard it, red - dodge it */
function rim(g, x, y, r, col) { g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); }
function skull(g, x, y, a) { if (+a >= 0.9) rim(g, x, y - 1, 7, '#ff4a4a'); g.fillStyle = 'rgba(236,224,196,' + a + ')'; g.fillRect(x - 4, y - 4, 8, 6); g.fillRect(x - 3, y + 2, 6, 2); g.fillStyle = 'rgba(18,14,20,' + a + ')'; g.fillRect(x - 3, y - 2, 2, 2); g.fillRect(x + 1, y - 2, 2, 2); g.fillRect(x - 1, y + 2, 2, 1); }
function drawNew(g, e, cx, cy, time) {
  const B = e.bones; if (B) { const k = B.live ? B.t / MAGE.bone.secs : 0;
    if (!B.live) { const R = MAGE.bone.r0; g.strokeStyle = 'rgba(236,224,196,0.25)'; g.setLineDash([3, 5]); g.beginPath(); g.arc(Math.round(B.cx - cx), Math.round(B.cy - cy), R, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      for (const a of boneGaps(B, 0)) { const gx = Math.round(B.cx - cx + Math.cos(a) * R), gy = Math.round(B.cy - cy + Math.sin(a) * R); g.fillStyle = Math.floor(time * 8) % 2 ? '#8fffb0' : '#ffffff'; g.fillRect(gx - 2, gy - 2, 4, 4); }   /* THE GAPS, flashing: the way out */
      for (const [x, y] of boneSkulls(B, 0)) skull(g, Math.round(x - cx), Math.round(y - cy), (0.25 + 0.2 * Math.sin(time * 10)).toFixed(2)); }
    else for (const [x, y] of boneSkulls(B, k)) skull(g, Math.round(x - cx), Math.round(y - cy), '1'); }
  for (const q of e.echoes || []) { const a = (0.25 + 0.45 * (1 - q.t / q.T)).toFixed(2), x = Math.round(q.x - cx), y = Math.round(q.y - cy);
    g.fillStyle = 'rgba(160,255,190,' + a + ')'; g.fillRect(x - 6, y - 40, 12, 40); g.fillRect(x - 9, y - 30, 18, 6); g.fillStyle = 'rgba(20,40,24,' + a + ')'; g.fillRect(x - 3, y - 36, 2, 2); g.fillRect(x + 1, y - 36, 2, 2);   /* HIS GHOST */
    if (q.markX !== null) { g.fillStyle = 'rgba(200,255,220,' + (0.12 + 0.12 * (1 - q.t / q.T)).toFixed(2) + ')'; g.fillRect(Math.round(q.markX - cx) - 18, 0, 36, g.canvas.height); } }   /* the echo's lightning, told where it will fall */
  if (e.echoFlash) { g.fillStyle = '#e0ffe8'; g.fillRect(Math.round(e.echoFlash.x - cx) - 18, 0, 36, g.canvas.height); }
  /* HIS ORRERY (archmage3): its orbits dotted round him through the tell with the worlds fading in on them; then the worlds, brass, swinging */
  const O = e.orbit; if (O) { const k = O.live ? 1 : Math.min(1, (MAGE.tell.orbit - Math.max(0, e.modeT || 0)) / MAGE.tell.orbit), ox = Math.round(O.cx - cx), oy = Math.round(O.cy - cy);
    for (const w of O.worlds) { g.strokeStyle = 'rgba(230,196,106,' + (O.live ? 0.35 : 0.2 + 0.3 * Math.abs(Math.sin(time * 6))).toFixed(2) + ')'; g.setLineDash([2, 4]); g.beginPath(); g.arc(ox, oy, w.R, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }
    for (const [x, y] of orbitWorlds(O)) { const wx = Math.round(x - cx), wy = Math.round(y - cy), r = MAGE.orbit.r;
      g.globalAlpha = O.live ? 1 : 0.25 + 0.5 * k; g.fillStyle = '#3a2e1c'; g.beginPath(); g.arc(wx, wy, r + 1, 0, Math.PI * 2); g.fill(); if (O.live) rim(g, wx, wy, r + 3, '#ff4a4a'); g.fillStyle = '#b08a3a'; g.beginPath(); g.arc(wx, wy, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#e6c46a'; g.fillRect(wx - 4, wy - 5, 4, 2); g.fillStyle = '#6a4a1c'; g.fillRect(wx - r + 2, wy, r * 2 - 4, 1); g.globalAlpha = 1; } }
  /* THE GRAVE SCRIPT (archmage3): his runes in lines across the whole sky, every band but the dark one; brightening through the tell, white when they go */
  const S = e.script; if (S) { const W = g.canvas.width, k = e.mode === 'scriptTell' ? 1 - Math.max(0, e.modeT || 0) / MAGE.tell.script : 1;
    for (let b = 0; b < S.n; b++) { const y0 = Math.round(S.y0 + b * S.h - cy), h = Math.round(S.h);
      if (b === S.safe) { g.strokeStyle = 'rgba(200,255,220,0.35)'; g.strokeRect(1, y0 + 1, W - 2, h - 2); continue; }   /* THE DARK LINE: outlined, clear */
      if (S.flash > 0 && e.mode !== 'scriptTell') { g.fillStyle = 'rgba(232,255,236,' + Math.min(0.85, 0.35 + S.flash).toFixed(2) + ')'; g.fillRect(0, y0, W, h); continue; }
      g.fillStyle = 'rgba(255,74,74,' + (0.05 + 0.13 * k).toFixed(2) + ')'; g.fillRect(0, y0, W, h); g.fillStyle = 'rgba(255,74,74,0.7)'; g.fillRect(0, y0, W, 1); g.fillRect(0, y0 + h - 1, W, 1);   /* (red: nothing turns a line) */
      g.fillStyle = 'rgba(200,255,220,' + (0.3 + 0.5 * k).toFixed(2) + ')'; const mid = y0 + (h >> 1), off = ((Math.floor(cx) % 14) + 14) % 14;
      for (let x = -off; x < W; x += 14) { const r = ((Math.floor((x + cx) / 14) * 7 + b * 3) % 4 + 4) % 4; g.fillRect(x, mid - 3, 2, 7); if (r & 1) g.fillRect(x - 2, mid - 3, 6, 1); if (r & 2) g.fillRect(x - 2, mid + 3, 6, 1); else g.fillRect(x + 2, mid, 3, 1); } } }   /* a rune every 14 px */
  const V = e.void; if (V) { const x = Math.round(V.x - cx), y = Math.round(V.y - cy), on = V.live ? 1 : Math.min(1, (MAGE.tell.pull - Math.max(0, e.modeT || 0)) / MAGE.tell.pull + 0.2), R = Math.round((MAGE.pull.r + 4) * on);
    g.fillStyle = '#0a0410'; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill(); g.strokeStyle = Math.floor(time * 10) % 2 ? '#a070ff' : '#5a2a9a'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
    if (V.live) for (let i = 0; i < 14; i++) { const t = (time * 1.4 + i / 14) % 1, a = i * 2.4, d = 140 * (1 - t); g.fillStyle = 'rgba(190,160,255,' + (0.6 * t).toFixed(2) + ')'; g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d * 0.6), 2, 1); } }   /* the air streaming in */
}
export function drawUndeadMage(g, e, cx, cy, time) {
  if (!e?.alive) return; g.save();
  for (const r of e.rings || []) drawMageRing(g, r, cx, cy, time);
  if (e.mode === 'blinkOut' && !(e.rings || []).some(r => r.flare)) { g.strokeStyle = Math.floor(time * 10) % 2 ? '#8fffb0' : '#3fe08a'; g.strokeRect(Math.round(e.teleX - cx) - 12, Math.round(e.teleY - cy) - 44, 24, 44); }   /* his destination glows first */
  if (e.mode === 'stormTell' || (e.flashT > 0 && e.flashY === null)) { g.fillStyle = e.mode === 'stormTell' ? 'rgba(210,209,255,.28)' : '#e9e9ff'; g.fillRect(Math.round((e.mode === 'stormTell' ? e.markX : e.flashX) - cx) - 18, 0, 36, g.canvas.height); }
  for (const cl of e.clouds || []) { const a = Math.min(1, cl.t) * 0.5; g.fillStyle = `rgba(110,170,60,${a.toFixed(2)})`; g.beginPath(); g.arc(Math.round(cl.x - cx), Math.round(cl.y - cy), cl.r + Math.sin(time * 3 + cl.x) * 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = `rgba(166,224,74,${(a * 0.8).toFixed(2)})`; for (let i = 0; i < 6; i++) { const t = time * 0.8 + i; g.fillRect(Math.round(cl.x - cx + Math.cos(t * 1.3 + i) * cl.r * 0.7), Math.round(cl.y - cy + Math.sin(t + i * 2) * cl.r * 0.6), 2, 2); } }
  drawNew(g, e, cx, cy, time);
  if (e.deathMark) { const m = e.deathMark, k = 1 - m.t / m.T, r = m.r; rim(g, Math.round(m.x - cx), Math.round(m.y - cy), r + 2, '#ff4a4a'); g.strokeStyle = Math.floor(time * (6 + k * 14)) % 2 ? '#1a2a1a' : '#6fe08a'; g.lineWidth = 2; g.beginPath(); g.arc(Math.round(m.x - cx), Math.round(m.y - cy), r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = `rgba(20,40,20,${(0.15 + k * 0.3).toFixed(2)})`; g.beginPath(); g.arc(Math.round(m.x - cx), Math.round(m.y - cy), r * k, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; }
  if (e.flashT > 0 && e.flashY !== null && e.flashY !== undefined) { g.fillStyle = '#d8ffe0'; g.beginPath(); g.arc(Math.round(e.flashX - cx), Math.round(e.flashY - cy), MAGE.markR, 0, Math.PI * 2); g.fill(); }
  for (const q of e.shots || []) { const x = Math.round(q.x - cx), y = Math.round(q.y - cy);
    if (q.kind === 'hand') { g.fillStyle = '#10180f'; g.fillRect(x - 7, y - 5, 14, 10); g.fillStyle = '#3a6a3a'; for (let i = 0; i < 4; i++) g.fillRect(x + Math.round(Math.cos(q.a) * 6) - 6 + i * 4, y - 8 + Math.round(Math.sin(time * 12 + i) * 1.5), 2, 5); g.fillStyle = '#8fffb0'; g.fillRect(x - 2, y - 1, 4, 2); continue; }
    if (q.kind === 'ice') { g.fillStyle = q.col; const ex = Math.round(Math.cos(q.a) * 7), ey = Math.round(Math.sin(q.a) * 7); for (let i = 0; i < 4; i++) g.fillRect(x - Math.round(ex * i / 4) - 1, y - Math.round(ey * i / 4) - 1, 3, 3); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 1, 2, 2); continue; }
    if (q.kind === 'feed') { g.fillStyle = q.col; g.fillRect(x - 2, y - 2, 4, 4); continue; }
    /* (Daniel 10-05) THE COLOUR RULE: a yellow rim - guard it; a red rim - dodge it. His own firebolt that can be STRUCK BACK wears a turning gold ring and a white heart; struck back it flies home pale */
    if (q.reflected) { g.fillStyle = 'rgba(200,255,220,0.5)'; g.fillRect(x - Math.round(q.vx * 0.04) - 2, y - Math.round(q.vy * 0.04) - 2, 4, 4); g.fillStyle = '#e8fff0'; g.fillRect(x - 4, y - 4, 8, 8); g.fillStyle = '#ffffff'; g.fillRect(x - 2, y - 2, 4, 4); continue; }
    rim(g, x, y, (q.r || 4) + 2, q.kind === 'orb' ? '#ff4a4a' : '#ffd84a');
    if (reflectable(q)) { for (let i = 0; i < 4; i++) { const a = time * 6 + i * Math.PI / 2; g.fillStyle = '#ffe6a0'; g.fillRect(x + Math.round(Math.cos(a) * 9) - 1, y + Math.round(Math.sin(a) * 9) - 1, 2, 2); } }
    g.fillStyle = q.col; g.fillRect(x - q.r, y - q.r, q.r * 2, q.r * 2); g.fillStyle = q.kind === 'orb' ? '#d8ffb0' : '#fff0c0'; g.fillRect(x - 1, y - 2, 2, 2); if (reflectable(q)) { g.fillStyle = '#ffffff'; g.fillRect(x - 2, y - 2, 4, 4); } }
  g.restore();
}
