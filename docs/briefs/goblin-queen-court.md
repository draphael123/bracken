# THE GOBLIN QUEEN HOLDS COURT (Highcrown)

Daniel, 2026-09-29, after playing her: *"she's basically the Ram Lord - just ramming into walls. She's supposed to be an
important boss."* He approved this design ("this works"). It replaces `docs/briefs/queen-pillars.md` (her charge into a
pillar). Her other attacks and her numbers stay: the sceptre throw, the slam, the sweep, the decree, the chandeliers and
round three's shadow step and burning crown.

## The rule
**She holds court; you bring her hall down on her.** The Ram Lord charges; she commands. She has no charge any more
(no `chargeTell`, `charge` or `dazed`: a wall never matters).

## Round one (100% to 66%, the round break she already had)
- **She leaps about her hall.** Every leap is told: a red `!!`, and her shadow on the floor where she will land for the
  whole tell and the flight. The landing is her one new attack, **THE QUAKE**: waves both ways along the floor and a
  shock that hurts a hero standing within 70 px. Nothing reaches a hero in the air: answer JUMP, height low
  (`src/marks.js`).
- **She holds court beside a pillar.** Her first choice (the top of her chain) is to leap to the standing pillar nearest
  you, land on its FAR side (46 px off it), turn her back on you and point for **3.5 s**. Where she points her gallery
  looses: a red cross on the floor under you, and five arrows onto it 0.9 s later, every 1.15 s of the hold.
- **You break the pillar.** Three blows on the pillar's own box (a blow on it is never eaten by her plate). The crack
  widens at each blow (drawn states 0, 1, 2), dust drops off the capital, and the third leaves it **TOTTERING for 1.7 s**:
  the grace to wait for her to land. Then it falls toward her side. On her (within 150 px of it on the floor) she is
  **PINNED**, exactly the chandelier's pin (`gqPin`: 4.6 s, 7%, open). Broken while she is anywhere else it is wasted:
  only its rubble platform.
- The door sign: `HER PLATE TURNS BLADES. BREAK THE PILLAR SHE HOLDS COURT BESIDE: IT COMES DOWN ON HER.`

## Round two (66% to 33%): her plate
- The pillars stay down (none stands again this round). Her court leaps land near you, anywhere on the floor.
- **Her plate gets its own bar** under her health: 6 pieces. Only two things take a piece: a **chandelier** on her
  (2 pieces, and it pins her as always), or a blow while she **points** that lands on her back (her back is to you when
  she commands) or is heavy (1 piece, at most one each half second). Three chandeliers, six back blows, or any mix.
- When the bar empties **the plate shatters**: 22 pieces of violet iron fly off her and bounce on the floor, a sting
  (`dkWardBreak`, `golemShatter`, `crack`), and `HER PLATE IS OFF`. For the rest of the round she is fought **like any
  foe**: every blow lands at its own weight (`gqOpen` is true).
- To pay for that she fights like a **duelist**, every blow told: leaps every 2.2 s instead of 4.5, 0.6 s in the air
  instead of 0.75, landing AT you; the sceptre comes back to her hand and goes straight into her sweep (or a leap at you);
  her court every 3.6 s instead of 6 (a 2.6 s hold), and her decree every 6 s instead of 9. Never more health.

## Round three (33% to the end): as it was
The pillars stand again and her plate is whole: only a pin opens her. Her shadow step still comes first; her court leap
takes the place her charge had (so the pillars still matter), and her crown burns at 15%.

## Proof
`tools/queen-court.mjs` (in `tools/check.mjs`; the old queen-pillars check is folded into it and retired), red first on
d78b15e. The boss-lab bot (`src/lab.js`) waits by a pillar, cracks it twice while she is away and gives the third blow
when she holds court beside it; in round two it cuts chandeliers and strikes her back while she points; it jumps her quake.
