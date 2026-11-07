// src/warden-id.js - THE WARDEN'S IDENTITY PASS: "reach is the verb" (claude/wardenid, Daniel 10-31 + 11-01; brief-heroidentity-1101.md sec 2.6).
// Pure numbers and rules, no world: main.js owns the frame and calls these (tipPay, the third swing, the vigil update, the phalanx, the pole-vault).
//
// 1. THE THIRD JAB IS THE LONG THRUST (Daniel 11-01 07:42, "Warden long thrust"): the third swing of a run is no longer a shove with the same box - she plants her
//    back foot (NO step forward, the first two jabs step 75 px/s), the spear goes out LONG (+16 px past the first two thrusts) along a thin line, and what it hits is
//    DRIVEN back out to the point. Trade-off, stated in the card: it lands later (the long reach is only live on the far frame), it recovers slower (commit.js
//    warden third 0.12 -> 0.30), it is a thin line (misses what is lower or higher than a hand's breadth) and it pays its x1.25 only at the point: a foe INSIDE the
//    spear gets the haft (x0.3). Use it at reach to keep the spacing; do not throw it at something in your face.
// 2. THE REACH BAND (VIGIL, 0-100, no longer spent): fills with tip hits, an impaled charge, a deflect at range; DRAINS while anything has been inside the haft (< 14 px)
//    for more than 1.5 s. It is never spent: it WIDENS the tip (the point starts earlier down the shaft) and lifts the tip's pay a little.
// 3. PHALANX is a SKILL now (id setSpears, cooldown, not a bar); it trips and staggers - it does not pin (pins are skewer, javelin, rain of spears only).
export const WID = {
  long: {
    reach: 60,          /* px from her centre at the far frame (the first two thrusts reach 44 on the ground) */
    near: 46,           /* px on the coil frame, before the far one */
    from: 0.09, to: 0.21,   /* the s of the swing the box is live: it lands LATE (art frame 2 is on the screen from 0.10) */
    top: 13, bot: 3,    /* the thin line: 10 px tall (the first two thrusts are 15) */
    mul: 1.25,          /* x her swing damage (the old third cut's 1.5 had no tip-pay of its own to add to) */
    keep: 38,           /* px from her to the foe's near edge after the drive: the point's range, so the next jab is a tip too */
    recoil: 55,         /* px/s she is pushed back by a boss at the point (spacing kept against what cannot be driven) */
    rec: 0.30,          /* s of recovery (commit.js warden third) */
  },
  band: {
    hold: 14,           /* px: inside this (edge to edge) it is the haft */
    after: 1.5,         /* s with a foe on the haft before the band starts to drain */
    drain: 14,          /* band per s while it drains */
    tipFrom: 28, tipFull: 18,   /* px: where the tip starts at band 0, and at band 100 (the sweet spot widens by 10 px) */
    payLo: 0.92, payHi: 1.04,   /* x the tip's pay at band 0 / 100 */
    range: 70,          /* a deflect/brace turn from a foe further than this (edge to edge) is "at range" and pays the band */
  },
  /* 4. WARDEN'S REACH, THE ULTIMATE (Daniel 11-01): a FULL band + TAP C. For `t` s the spear is huge and ghostly (x2 reach, drawn out to the hitbox), every hit is a max TIP hit,
     knocks back (a boss only gets a small push, its resist floors untouched), the box skewers a whole line; it ends with one big final thrust (+ stagger; a boss's stagger is small),
     and the band is empty afterwards. */
  reach: { t: 6, mul: 2, knock: 260, push: 3, finalLen: 220, finalKnock: 320, finalStagger: 1.2, bossStagger: 1.2,   /* (claude/wardenult) a boss's final stagger 0.6 -> 1.2 s, once per ult (never a lock) */
    poiseHit: 4, poiseCap: 0.7 },   /* every hit leans 4 on a boss's break bar, up to 70% of it; the final thrust leans on it like a skill (x0.6 outside an opening) on top of its heavy */
  phalanx: { cd: 16, st: 28, trip: 1.1 },   /* the skill: seconds of cooldown, stamina, seconds a tripped foe stays down */
  vault: { cd: 7, st: 28, over: 90 },
};
/* where along the shaft the tip starts, for a band of 0-100 */
export const tipStart = (band, keen = false) => WID.band.tipFrom - (WID.band.tipFrom - WID.band.tipFull) * (Math.max(0, Math.min(100, band)) / 100) - (keen ? 4 : 0);
/* the band's scaling of a tip's pay */
export const bandPay = band => WID.band.payLo + (WID.band.payHi - WID.band.payLo) * (Math.max(0, Math.min(100, band)) / 100);
/* the long thrust's box (pure): x, y = her feet, face = +-1, atk = s into the swing, stretch = FULL STRETCH multiplier; null before it is live */
export function longBox(x, y, face, atk, stretch = 1) {
  const L = WID.long; if (!(atk >= L.from && atk < L.to)) return null;
  const r = (atk >= 0.10 ? L.reach : L.near) * stretch;
  return face > 0 ? { l: x + 2, r: x + r, t: y - L.top, b: y - L.bot } : { l: x - r, r: x - 2, t: y - L.top, b: y - L.bot };
}
/* the drive: how fast to knock a foe whose near edge is `d` px out so it comes to rest at the point's range (a knock bleeds off 0.25^t over 0.45 s: ~0.335 s of its speed) */
export const driveSpeed = d => (d >= WID.long.keep - 2 ? 0 : Math.max(60, (WID.long.keep - d) / 0.335));
