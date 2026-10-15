/* Whole-game, report-only companion to the existing Buried City drawn-solids gate. The old gate remains unchanged; art
   lanes can clear the wider backlog before making all levels mandatory. Its separate name lets the release script rerun it. */
process.argv.push('--all', '--report-only');
await import('./drawn-solids.mjs');
