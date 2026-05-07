/**
 * Content Moderation Utility
 * Checks post content for inappropriate language, spam patterns, and quality.
 */

// Profanity list — TR + EN (sanitized for source code)
const BANNED_WORDS = [
  // Turkish
  'orospu','siktir','amk','bok','oç','piç','göt','yarrak','sik','ibne',
  'orospu çocuğu','amına','ananı','bok yemek','kahpe','sürtük',
  // English
  'fuck','shit','bitch','ass','bastard','damn','crap','dick','pussy',
  'asshole','motherfucker','bullshit','wtf','stfu',
];

// Spam patterns
const SPAM_PATTERNS = [
  /(.)\1{5,}/,               // 6+ same character in a row: "aaaaaaa"
  /[A-ZÇŞĞÜÖİ]{10,}/,       // 10+ consecutive uppercase
  /https?:\/\//i,            // URLs (no external links allowed in posts)
  /\b(\d{10,})\b/,           // long number sequences (phone/CC)
  /(\S+\s){0,3}\S+@\S+\.\S+/, // email addresses
];

// Minimum quality checks
const MIN_TITLE_WORDS   = 3;
const MIN_DESC_WORDS    = 10;
const MAX_TITLE_LEN     = 120;
const MAX_DESC_LEN      = 2000;

/**
 * Normalize text for checking (lowercase, remove accents)
 */
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c');
}

/**
 * Check a single text field for banned words.
 * Returns the first found word or null.
 */
function findBannedWord(text) {
  const norm = normalize(text);
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`\\b${normalize(word)}\\b`, 'i');
    if (regex.test(norm)) return word;
  }
  return null;
}

/**
 * Main moderation function.
 * @param {{ title, description, expertiseRequired }} fields
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function moderatePost({ title = '', description = '', expertiseRequired = '' }) {
  const errors = [];

  // ── Profanity ──────────────────────────────────────────────────────────
  const allText = `${title} ${description} ${expertiseRequired}`;
  const banned  = findBannedWord(allText);
  if (banned) {
    errors.push('Your post contains inappropriate language. Please revise the content.');
  }

  // ── Spam patterns ──────────────────────────────────────────────────────
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(allText)) {
      if (/https?:\/\//i.test(allText)) {
        errors.push('External URLs are not allowed in posts. Share links in the meeting instead.');
      } else if (/\S+@\S+\.\S+/.test(allText)) {
        errors.push('Email addresses are not allowed in posts. Use the meeting request system to make contact.');
      } else {
        errors.push('Your post appears to contain spam-like patterns. Please review your content.');
      }
      break;
    }
  }

  // ── Length / quality ───────────────────────────────────────────────────
  const titleWords = title.trim().split(/\s+/).filter(Boolean).length;
  const descWords  = description.trim().split(/\s+/).filter(Boolean).length;

  if (title.length > MAX_TITLE_LEN) {
    errors.push(`Title is too long (max ${MAX_TITLE_LEN} characters).`);
  }
  if (titleWords < MIN_TITLE_WORDS) {
    errors.push(`Title must contain at least ${MIN_TITLE_WORDS} words.`);
  }
  if (description.length > MAX_DESC_LEN) {
    errors.push(`Description is too long (max ${MAX_DESC_LEN} characters).`);
  }
  if (descWords < MIN_DESC_WORDS) {
    errors.push(`Description is too short. Please provide at least ${MIN_DESC_WORDS} words to help potential partners understand your project.`);
  }

  // ── Meaningful content ─────────────────────────────────────────────────
  if (title.trim() === description.trim() && title.length > 0) {
    errors.push('Title and description cannot be identical.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Quick single-field check — returns error string or null.
 */
export function checkField(value, fieldName) {
  const banned = findBannedWord(value);
  if (banned) return `${fieldName} contains inappropriate language.`;
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(value)) return `${fieldName} contains invalid content.`;
  }
  return null;
}
