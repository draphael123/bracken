import { edit } from './patch.mjs';
const A = 'src/audio.js';
edit(A, "kind === 'court' ? 0.28 :", "kind === 'court' ? 0.28 : kind === 'palisade' ? 0.27 :");
edit(A, "'rootway', 'court', 'litchurch'", "'rootway', 'court', 'palisade', 'litchurch'");
edit(A, "court: ['synth:leaves', 'synth:far-horn',", "palisade: ['synth:leaves', 'synth:far-saw', 'synth:far-axe', 'synth:mallet', 'synth:rope-groan', 'synth:timber-settle', 'file:amb_creak'], court: ['synth:leaves', 'synth:far-horn',");
edit(A, "  court() {\n", `  /* (claude/palisadeart) THE PALISADE WOOD's air: a wood of dry leaves being walled in, all synth and the one creak clip on disk. WIND in the dry leaves (a high band that swells and fades), a low
     breath under it; a far SAW (a rasping saw-tooth, two or three strokes), a far AXE (a dull knock on a trunk, then its tail), a MALLET driving a stake (two quick taps, a pause, a third), ROPE
     taking weight (the creak clip), a stack of TIMBER settling (a hollow wooden knock and a slide) and very far a goblin shout. No horn (the cavalry's and the volley's tell), no drum (the court's). */
  palisade() {
    const leaves = loopNoise(2400, 0.7, 0.05); lfoOn(leaves.g.gain, 0.12, 0.04); lfoOn(leaves.f.frequency, 0.05, 600);
    const breath = loopNoise(240, 0.9, 0.45, 'lowpass'); lfoOn(breath.g.gain, 0.05, 0.22); lfoOn(breath.f.frequency, 0.04, 60);
    ambTick = () => {
      if (Math.random() < 0.05) { const f = 150 + Math.random() * 40; for (let i = 0; i < 3 + ((Math.random() * 3) | 0); i++) { farVoice('sawtooth', f, f * 0.96, 0.22, 0.03, i * 0.3, 1500); noise(0.2, 0.012, 3200, 0.8, i * 0.3, ambGain); } }   /* a far saw: strokes */
      if (Math.random() < 0.045) { tone('sine', 120, 70, 0.1, 0.05); noise(0.05, 0.03, 900, 1.2); tone('sine', 90, 60, 0.3, 0.012, 0.05); }   /* a far axe on a trunk */
      if (Math.random() < 0.05) { const d = [0, 0.12, 0.42]; for (const t of d) { tone('square', 520 + Math.random() * 30, 380, 0.04, 0.03, t); noise(0.03, 0.025, 2200, 1.4, t); } }   /* a mallet on a stake: two taps, a third */
      if (Math.random() < 0.03) ambClip('amb_creak', 0.1, 1000);   /* rope taking weight */
      if (Math.random() < 0.025) { tone('sine', 180, 110, 0.12, 0.05); noise(0.5, 0.012, 500, 1.1, 0.06); tone('sine', 140, 90, 0.1, 0.03, 0.2); }   /* a stack of timber settling */
      if (Math.random() < 0.01) { const f = 210 + Math.random() * 60; farVoice('sawtooth', f, f * 1.2, 0.5, 0.02, 0, 900); farVoice('sawtooth', f * 1.3, f * 1.1, 0.4, 0.015, 0.3, 900); }   /* a goblin shouting, very far */
    };
    ambTickMs = 470;
  },
  court() {
`);
