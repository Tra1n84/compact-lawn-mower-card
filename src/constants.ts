export const CARD_NAME = 'Compact Lawn Mower Card';
export const CARD_VERSION = '1.6.2';

export const DEFAULT_MAP_ZOOM = 18;
export const MIN_MAP_ZOOM = 1;
export const MAX_MAP_ZOOM = 21;
export const MAX_STATIC_MAP_SIZE = 640;

export const STATUS_BADGE_GAP = 6;
export const STATUS_LABEL_HYSTERESIS = 8;
export const STATUS_TEXT_FONT_SIZE = 12;
export const STATUS_TEXT_FONT_WEIGHT = 600;
export const STATUS_TEXT_LETTER_SPACING = 0.5;

export const MOWER_COLUMN_WIDTH = 120;
export const MIN_SKY_PERCENTAGE = 38;
export const MAX_SKY_PERCENTAGE = 62;

export const CAMERA_RETRY_INTERVAL = 5000;
export const MAP_UPDATE_INTERVAL = 10000;
export const CAMERA_LOADING_DELAY = 1000;

export const CARD_TRANSLATED_STATES = new Set([
  'mowing',
  'docked',
  'charging',
  'paused',
  'returning',
  'error',
  'unavailable',
  'unknown',
]);

/** Metres per degree, for projecting GPS positions onto a local plane */
export const METERS_PER_DEG_LAT = 110574;
export const METERS_PER_DEG_LON = 111320;

/** The mown lanes are refreshed on this timer while the mower works, and on movement at most this often */
export const VECTOR_MAP_TRAIL_INTERVAL = 60000;
export const VECTOR_MAP_TRAIL_MIN_INTERVAL = 15000;
/** The zones are reloaded when the map is opened after this time */
export const VECTOR_MAP_BASE_TTL = 30 * 60 * 1000;
/** get_geojson starts the integration's 5 minute report stream (status and position every few seconds), renewed after this */
export const VECTOR_MAP_STREAM_KEEPALIVE = 4 * 60 * 1000;
/** How often a visible card checks whether the report stream needs renewing */
export const LIVE_UPDATES_CHECK_INTERVAL = 30000;
/** After a command the card asks for a report again at these delays, until the mower has switched */
export const LIVE_UPDATES_FOLLOW_UP = [5000, 15000, 30000, 60000];
/** Space in px covered by the badges and buttons, kept free when the map is fitted */
export const VECTOR_MAP_INSETS = { top: 56, right: 8, bottom: 64, left: 8 };
/** Positions closer than this in metres count as standing still (heading, "not moving" note) */
export const VECTOR_MAP_HEADING_MIN_DISTANCE = 0.3;
/** A mowing mower that has not moved for this long is flagged on the map */
export const VECTOR_MAP_STUCK_MINUTES = 5;
/** A position report older than this means the stream is off, so standing still cannot be judged */
export const VECTOR_MAP_REPORT_MAX_AGE = 90000;
/** States (after the user's state_map) in which a job is running or interrupted; idle and docked are not */
export const VECTOR_MAP_WORKING_STATES = new Set(['mowing', 'paused', 'returning', 'error']);
/** Position changes above this distance in metres are not animated (GPS jumps, dock, reconnect) */
export const VECTOR_MAP_SMOOTH_MAX_DISTANCE = 3;

export const IMG_ZOOM_MIN = 0.5;
export const IMG_ZOOM_MAX = 8.0;
export const IMG_ZOOM_STEP_BUTTON = 0.25;
export const IMG_ZOOM_STEP_WHEEL = 0.15;
