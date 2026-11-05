# KFORK lane report (claude/kfork, from claude/ltfork 0b381fef) - 11-04

## What changed
The three Knight B techniques as forks on the ltfork framework. Physical kit only: no beams, rings, flying slashes or waves (existing ringAt flourishes were NOT reused; only dust, debris sparks, steel impacts, a chain line).
- src/tech-knight.js: L30 / L40 / L50 are now `{fork:[A,B]}`. A entries get roles + trade lines; B entries:
  - L30 B LINK CUT (offence, trade GUARD OR STRIKE): HOLD X with >= 1 link spends 1 link, the heavy cut falls at 0.24 s (not 0.5), k 2.0 (= PUNISH), breaks the guard, shoves the front non-boss foe (vx 190, stagger 0.45, boot-scuff dust). Needs heavy stamina on hand (checked before the link is spent). 
  - L40 B SHIELD HOOK (control, TURN IT OR HOOK IT): the existing shield throw, when it strikes a ranged ground foe, hooks it: the shield turns for home and drags the shooter along the floor on a drawn chain (dust scrape) to 14 px, releases it dazed (0.9 s stagger). Not bosses, minis, fliers (wasp/drone/bell), pinned or maxHp foes; stops at a wall.
  - L50 B THE BREAKING WHEEL (far capstone, CLOSE OR FAR; A = Long Charge, role close): UP+C at 3 links (the ultimate input) throws the shield 13 tiles at 340 px/s along the floor at 1.5x size, spinning, dust trail; each ordinary foe crossed takes 1.2 x swordDmg x amul (0.6 on the return) and has its guard broken (broken 1.3, guard dropped). Boss / mini: stops the wheel, damage only, NO guard drop or stagger (boss law: only the OPEN rule). Shield is away (no block, no heavy) until caught. HUD label reads BREAKING WHEEL: UP+C when held.
- src/main.js: hold-trigger line in updateCharge, heavyCut/cutHit flags (linkCutWant, cutLink), hook/wheel code (hookable, hookDrag, hookRelease, wheelThrow, wheelHits) before updateThrown, `thrown` object extended (s.wheel, s.hook), ultRegister fire/ready, meter label, shield draw (scale, chain).
- tools/tech-cards.mjs: synthetic test pair removed, now asserts the real data (roles differ, trade shared, capstone pair [kcharge2,kwheel]); fixed `TECHNIQUES.knight[n].id` readers. tools/knight-chain.mjs: probes + asserts for LINK CUT and THE BREAKING WHEEL added.

## Commits (pushed to origin claude/kfork)
kfork 1 data + tech-cards; kfork 2 effects; kfork 3 knight-chain probes; kfork 4 this report.

## Checks (node only, GATE flag existed)
node --check main.js / tech-knight.js / knight-chain.mjs OK. tech-cards PASS, progression PASS, coop-progress PASS.

## Owed (browser, not run)
- tools/knight-chain.mjs (new probes untested; SHIELD HOOK has NO probe: needs the skill key helper for the F press), textfit (new names/what/teach lines; card trade line), a LOOK at all three: the chain line, wheel scale/dust, link-cut pose, banner.
- Not built: capstone preview clip, yard TRY station, ability-law pair asserts (tool still absent), AI companions (take A, no capstone per Q3), co-op tech-id snapshot, art pass (wheel uses the shield icon at 1.5x, hook the stock toss pose).

## Judgement calls / conservative numbers
- LINK CUT k 2.0, WHEEL k 1.2 out / 0.6 back (brief gave none); an every-hold-with-a-link auto-upgrade of the heavy means a player holding for a normal heavy cut with a link will spend it: that is the brief's wording (rec keep; alt: require UP held).
- Bosses: wheel does damage only; the normal shield throw's existing guard-drop on bosses is untouched (hook never applies to bosses).
- Wheel does not stop the player: he can still move/jump while the shield is out.

## Questions (recs held, none blocking)
- Q1: LINK CUT trigger: auto at 0.24 s whenever a link is held (built, rec) vs a deliberate modifier (UP+X-hold)?
- Q2: Should the wheel spend its links on a miss (nothing crossed)? Built: yes, always 3 (rec keep, it is an ultimate).
