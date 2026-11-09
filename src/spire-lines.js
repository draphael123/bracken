/* src/spire-lines.js - THE SPIRE FIELD's words (claude/ft5b). No imports, so src/hint-lines.js can route them (SAY_LINES) without pulling the field in.
   Every line here is said through callout() or a number() that hint-lines routes to the hint box (ft5a found unrouted lines never show). */
export const SPIRE_LINES = {
  tide: ['HIS POISON RISES: KEEP HIGH', 'HIS POISON RISES AGAIN', 'HIS POISON RISES: THE LAST TIDE'],
  topple: 'A SPIRE GOES OVER: A NEW WAY ACROSS',
  fall: 'HE FALLS: STRIKE HIM WHERE HE LIES',
  holds: 'HE HOLDS - THE TOWERS SHAKE',
  crush: 'THE SPIRE COMES DOWN ON HIM',
  miss: 'THE BUTTRESS FELL: HE WAS NOT UNDER IT',
  warded: 'HIS WARD HOLDS: WAIT FOR HIM',
  fade: 'HE FADES - THE TOWERS GO',
  caught: 'THE CARPET CATCHES YOU',
  reform: 'HE RE-FORMS IN THE SKY: AFTER HIM',
};
export const SPIRE_SAY = [...new Set([...SPIRE_LINES.tide, ...Object.values(SPIRE_LINES).filter(v => typeof v === 'string')])];
