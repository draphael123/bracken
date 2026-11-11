/* src/demo-end-config.js - THE END CARD'S WORDS AND LINKS (claude/demoend). Daniel fills the two blanks; until he does the card shows no link at all (never a dead one). */
export const FOLLOW_LINE = 'FOLLOW THORNROAD ON ITCH.IO FOR THE FULL GAME';   /* shown as plain text; it becomes a link only when FOLLOW_URL is set */
export const FOLLOW_URL = 'https://draphael123.itch.io/thornroad';   /* the itch.io page, https only (Daniel owns the page) */
export const FOLLOW_BTN = 'WISHLIST / FOLLOW ON ITCH.IO';   /* (demoend2) the button that opens FOLLOW_URL */
export const SOON_BTN = 'WISHLIST / FOLLOW: COMING SOON';   /* (demoend2) what the button says, shut, while FOLLOW_URL is empty: never a dead link */
export const SOON_LINE = 'THE FULL GAME HAS NO PAGE YET. IT IS COMING.';   /* (demoend2) the plain line while FOLLOW_URL is empty (the follow line would promise a page that is not there) */
export const TEASER_HEAD = "WHAT'S IN THE FULL GAME";   /* (demoend2) the vignette strip's heading (src/demo-teaser.js has the pictures) */
export const KEEP_FILE = 'thornroad-demo-progress.json';
export const CARD_LINES = [
  'YOU BROUGHT DOWN KING GORM. THAT IS THE END OF THE DEMO.',
  'THANK YOU FOR PLAYING. THE ROAD GOES ON IN THE FULL GAME.',
  'YOUR HERO CARRIES OVER: SAVE YOUR PROGRESS HERE, THEN USE SETTINGS > IMPORT SAVE IN THE FULL GAME.',
];
export const MAP_CAPTION = 'THE ROAD ENDS HERE... FOR NOW';   /* the demo map's plate at Kingswood: the other levels are not shown (demohide), so it says the road stops here, not that it goes on */
