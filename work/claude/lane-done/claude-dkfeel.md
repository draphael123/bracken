# claude/dkfeel (10-16)
Numbers changed: DK2.rhythm.rate 0.46 -> 0.56 (= Paladin chain); DK2.price.rate 0.32 -> 0.40 (= Paladin heavy 0.56 x 0.72). Hold/price ticks, damage, hit stop, cancel windows unchanged. Dodge untouched.
Tools updated for the deliberate change: commitment.mjs LIGHT_TOTAL reaper 0.76 -> 0.65, MASH_MAX reaper 7 -> 9 (8 in 6 s measured); dk2.mjs rate check now = Paladin's.
Rates (boss-rates, human, kit flasks, practiced, 12 seeds, L3: wood/stockade/marsh/burning), k/p/DK:
 before 33/48 69%, 36/48 75%, 34/48 71%;  after 33/48 69%, 36/48 75%, 39/48 81% (DK +6 over hero avg 75%: within 10; no damage trim).
Art: reaperGravePoses (src/chars.js): own up-air reaping rise (4 beats, green flame + soul wisps) and Cull plunge pose (necrotic glow, bone splinters). FX (src/main.js): green reaping crescent + wisps; graveFall now draws a grave burst (bone spikes, risen hands, necrotic shockwave); damage/reach unchanged. Grade B. Strips kept outside git: scratch/dkfeel-art/.
Checks green: dk2, commitment, attack-animation, ability-poses, plunges, blow-tags, hero-trials, normal-health, boss-openings, mash-gate, mobile-perf (rerun). Red/inconclusive: textfit timed out twice (scope talk[knight], 480 s, machine under suite load) - not DK related.
