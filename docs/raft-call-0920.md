# Level-two raft calls

Both Marsh Wood raft departures now have a reusable CALL RAFT winch on solid bank: the paid ferry and the grove crossing after Reed Island. Use the normal interact control (E on keyboard, Up on controller or touch). Each winch addresses its own raft using a stable ID through level growth.

Calling an empty raft starts a visible return at 96 pixels/second (roughly four to six seconds from the far dock). Calling again is safe. A raft at home reports READY; an occupied raft reports IN USE. Payment and passengers are preserved, and the raft waits for boarding after docking. Checkpoint recovery clears the temporary recall state. Automatic return now recognizes either co-op player as a rider.

`tools/raft-call.mjs` uses real interact input to verify both winches, repeated calls, payment retention, reboarding, partner occupancy, and recall after an actual checkpoint respawn. `tools/rafts.mjs` retains the existing grace, toll and return behavior checks. The isolated screenshot was inspected. The full regression result and archive are recorded in the checkpoint44 receipt.
