# Salvage Captain encounter revision

Stormwreck Harbor's named mini-boss previously used the regular boatswain whistle and pin swing. It now has an encounter-specific rotation; ordinary boatswains and the Hurricane Deck captain keep their existing behavior.

- Blockable belaying-pin swing with a longer opening when blocked.
- Grapnel with a fixed aim line and a blockable hook.
- Ceiling-suspended cargo, locked danger marks, a falling animation and landing debris.
- Low, double-shot volleys from two quay guns mounted on the floor.
- Half-health rally adds two-sided crossfire and three cargo marks per drop.
- Recovery windows after attacks, a teaching sign, bestiary guidance, and projectile cleanup when the gate opens.
- Increased only this named enemy's health to give the rotation time to unfold. No damage or global class-stat changes.

The automatic pilot now leaves cargo marks, jumps incoming low shots and guards or dodges the pin/hook. Focused tests exercise all attack types, phase transition, warning safety, escape lanes and inactive encounter behavior. Runtime tests verify the kill still opens the harbor gate and exit.

## Six-class checks

| Class | Normal-health result | Seconds | Remaining HP | Refill seconds |
|---|---|---:|---:|---:|
| knight | win | 46 | 84 | 47.8 |
| warden | win | 37.1 | 42 | 37.1 |
| pyro | win | 60 | 56 | 59 |
| paladin | win | 71 | 24 | 68.8 |
| pirate | win | 34.2 | 58 | 34.2 |
| reaper | win | 55.6 | 83 | 55.6 |

These are automated encounter probes, not human or co-op acceptance. This is a mini-boss, not a 90–150-second main boss. Normal-health results span 34–71 seconds and do not imply equal class power. Cargo screenshot is a forced visual inspection state; timing results come from the played probes.
