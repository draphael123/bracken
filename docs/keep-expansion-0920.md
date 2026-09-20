# Drowned Keep expansion

The Keep grows from 200 to 600 tiles, retaining the Drowned King and adding six approach sections: Sunken Outer Court, Countercurrent, Flooded Library, Sluice Works, Thermal Cistern and Bell Approach.

- Scoped breathing capacity is tripled: 18 base units, 27 with the diver lamp, 36 with the tide charm. Existing capped-water drain remains unchanged, so time underwater is tripled. Air replenishes proportionally faster; HUD, warnings, respawn and co-op regroup use the same capacity.
- Frequent permanent air refuges and bubble vents, seven approach checkpoints, three redistributed silver coins and longer medal targets support the route.
- Swim above opposing currents, weave over and under library walls, strike sluice wheels or use their upper bypass, use thermal updrafts and carry/drop ballast, and strike a clam for air. Added aquatic enemy encounters, masonry, grounded statues and light shafts.
- The Vault Keeper has four opening attacks (hook, aimed spear, bell ring, marked pressure burst). Half health adds a pressure band and a three-spear volley. Attacks have visible warnings, safe responses and 1.7-second punish windows. Its defeat persists on checkpoint retry.
- Fixed mini-boss lab selection so each class fights the named mini, rather than an ordinary guard after the first victory.

Validation: all six classes passed actual-input vertical swimming and scoped breath/refill checks. All six normal-health Keeper probes won, in 35–85.2 seconds; refill probes won in 37.7–97.4 seconds. These are automated solo probes, not human or co-op balance acceptance. Unit tests exercise all five attacks, early warning windows, safe responses, phase-two rotation and recovery. Browser tests verify retry persistence, boss gates, level completion and music decoding. Screenshots inspected; boss warning screenshots deliberately stage each state.

Full-suite results and the exact local commit are recorded in the delivery receipt. This work has not been deployed. The broader improvement queue remains open.
