// src/feedback-config.js - THE ONE PLACE THE FEEDBACK FORM IS WIRED (claude/feedback, Daniel 11-03).
// The in-game GIVE FEEDBACK form (src/feedback-form.js) posts, invisibly, to a Google Form's formResponse endpoint; the answers land in Daniel's Google Sheet.
// Until FEEDBACK_FORM_URL is filled in NOTHING is sent: Send says 'Thanks!' and the text stays on this device only (localStorage).
// HOW TO FILL THIS IN (2 minutes): scratch\feedback-form-questions.md (bracken-lanes) - create the Google Form, 'Get pre-filled link', paste the two things below.
//   FEEDBACK_FORM_URL    the form's address ending in /formResponse   (https://docs.google.com/forms/d/e/<FORM ID>/formResponse)
//   FEEDBACK_FIELDS      each 'entry.1234567890' id from the pre-filled link, one per question
export const FEEDBACK_FORM_URL = '';
export const FEEDBACK_FIELDS = {
  rating: '',        // linear scale 1-5
  hero: '',          // short answer, filled by the game
  level: '',         // short answer, filled by the game
  build: '',         // short answer, filled by the game
  liked: '',         // checkboxes (the chip labels below, same order)
  frustrating: '',   // checkboxes (the chip labels below, same order)
  text: '',          // paragraph
};
/* the chips, in the order the Google Form's checkbox options must be: the label is BOTH what is drawn (capitals) and the exact option text sent */
export const FEEDBACK_TOPICS = ['Combat', 'Bosses', 'Platforming', 'Co-op', 'Heroes', 'Difficulty', 'Controls', 'Art', 'Music', 'Performance'];
export const FEEDBACK_MAX_CHARS = 1000;
export const FEEDBACK_GAP_MS = 60000;   /* one send a minute */
