// src/build.js - WHICH BUILD THIS IS. The batch and its date come from docs/updates.json (src/whatsnew.js versionLine), which the deploy guard
// already insists on; `sha` is the short git sha of the deployed tree, left '' in the repo and stamped by the release (sed this one line).
export const BUILD = { sha: '' };
