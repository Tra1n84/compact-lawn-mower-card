import { HomeAssistant } from 'custom-card-helpers';
import { METERS_PER_DEG_LAT, METERS_PER_DEG_LON } from './constants';

/**
 * The path a mower has actually driven during the running job.
 *
 * Home Assistant records every position the integration reports for the mower's
 * device_tracker. While the integration's report stream is running the mower sends a
 * position every few seconds, which is dense enough to draw the mown lanes. Outside the
 * stream positions can be minutes apart; those are never connected, so the trail only
 * shows what is known.
 *
 * The trail is built once from the recorder history of the job and then extended with
 * every new position the card sees, so it does not depend on the map being open from the
 * start of the job. Nothing is stored in the browser.
 */

export interface LonLat {
  lon: number;
  lat: number;
}

export interface TrailPoint extends LonLat {
  /** Time the position was reported, ms since epoch (server time) */
  t: number;
}

/** Positions closer than this are the same spot (GPS jitter while standing) */
const MIN_STEP = 0.05;
/** Two positions further apart in time than this are not connected, the mower could have driven anywhere in between */
const MAX_GAP_SECONDS = 20;
/** Sanity limit for one segment, nothing drives faster than this between two reports */
const MAX_SEGMENT_METERS = 10;
/** How far back the start of the job is searched */
const MAX_JOB_AGE = 12 * 60 * 60 * 1000;
/** Overlap when fetching new history entries, so none is missed at the boundary */
const FETCH_OVERLAP = 5000;
/** Same report seen twice (live and from the history) when the times are this close */
const SAME_REPORT_MS = 500;

interface CompressedState {
  s: string;
  a?: Record<string, unknown>;
  /** last_changed, seconds */
  lc?: number;
  /** last_updated, seconds; only present when it differs from lc */
  lu?: number;
}

/** Offset from `a` to `b` in metres, x east and y north */
export const offsetMeters = (a: LonLat, b: LonLat): [number, number] => [
  (b.lon - a.lon) * METERS_PER_DEG_LON * Math.cos((b.lat * Math.PI) / 180),
  (b.lat - a.lat) * METERS_PER_DEG_LAT,
];

export const distanceMeters = (a: LonLat, b: LonLat): number => Math.hypot(...offsetMeters(a, b));

const stateTime = (st: CompressedState): number | undefined => {
  const seconds = st.lu ?? st.lc;
  return seconds ? seconds * 1000 : undefined;
};

const historyDuring = async (
  hass: HomeAssistant,
  entityId: string,
  start: number,
  withAttributes: boolean
): Promise<CompressedState[]> => {
  const result = await hass.callWS<Record<string, CompressedState[]>>({
    type: 'history/history_during_period',
    start_time: new Date(start).toISOString(),
    entity_ids: [entityId],
    minimal_response: !withAttributes,
    no_attributes: !withAttributes,
    significant_changes_only: false,
  });
  return result?.[entityId] ?? [];
};

/**
 * Start of the running job: the first state after the mower was last not on a job (docked or idle).
 * `unavailable` and `unknown` are skipped, a restart of the integration does not end a job.
 */
export const findJobStart = async (
  hass: HomeAssistant,
  mowerEntity: string,
  isOnJob: (state: string) => boolean
): Promise<number> => {
  const earliest = Date.now() - MAX_JOB_AGE;
  const states = await historyDuring(hass, mowerEntity, earliest, false);
  for (let i = states.length - 1; i >= 0; i--) {
    const state = states[i].s;
    if (!isOnJob(state) && state !== 'unavailable' && state !== 'unknown') {
      const next = states[i + 1];
      return (next && stateTime(next)) || Date.now();
    }
  }
  return earliest;
};

export class MowTrail {
  readonly points: TrailPoint[] = [];
  /** The mower's own recent line from the integration, [lon, lat] pairs, drawn on top of the trail */
  head: number[][] = [];
  private _fetchedUntil = 0;

  constructor(readonly jobStart: number) {}

  /** Loads all positions of the job recorded so far, or only the ones since the last call. Returns true when the trail changed. */
  async extend(hass: HomeAssistant, trackerEntity: string): Promise<boolean> {
    const from = this._fetchedUntil ? this._fetchedUntil - FETCH_OVERLAP : this.jobStart;
    const states = await historyDuring(hass, trackerEntity, from, true);
    let changed = false;
    for (const st of states) {
      const t = stateTime(st);
      const lat = Number(st.a?.latitude);
      const lon = Number(st.a?.longitude);
      if (!t || !Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0)) continue;
      if (this._push({ lon, lat, t })) changed = true;
      // Server time, so the next fetch does not depend on the browser clock
      if (t > this._fetchedUntil) this._fetchedUntil = t;
    }
    if (!this._fetchedUntil) this._fetchedUntil = this.jobStart;
    return changed;
  }

  /** Adds the position the card just saw in `hass`, so the trail follows the mower between history fetches. */
  pushLive(lon: number, lat: number, lastUpdated: string): boolean {
    const t = Date.parse(lastUpdated);
    if (!Number.isFinite(t) || (lat === 0 && lon === 0)) return false;
    return this._push({ lon, lat, t });
  }

  /** Replaces the mower's own recent line. Returns true when it differs from the one before. */
  setHead(line: number[][]): boolean {
    const same =
      line.length === this.head.length && line.every((p, i) => p[0] === this.head[i][0] && p[1] === this.head[i][1]);
    if (same) return false;
    this.head = line;
    return true;
  }

  /**
   * The trail as polylines of [lon, lat]: consecutive positions are joined when they are close in
   * time and distance, a position without a neighbour becomes a single-point line (drawn as a dot).
   */
  lines(): number[][][] {
    const out: number[][][] = [];
    let current: number[][] = [];
    let prev: TrailPoint | undefined;
    for (const p of this.points) {
      const joined = prev && p.t - prev.t <= MAX_GAP_SECONDS * 1000 && distanceMeters(prev, p) <= MAX_SEGMENT_METERS;
      if (!joined && current.length) {
        out.push(current);
        current = [];
      }
      current.push([p.lon, p.lat]);
      prev = p;
    }
    if (current.length) out.push(current);
    return out;
  }

  /** Inserts in time order, ignores duplicates and jitter. Returns true when the trail changed. */
  private _push(p: TrailPoint): boolean {
    // Points arrive almost sorted (live pushes, history fetches with a small overlap), so search from the end
    let index = this.points.length;
    while (index > 0 && this.points[index - 1].t > p.t) index--;
    const before = this.points[index - 1];
    const after = this.points[index];
    if ((before && Math.abs(before.t - p.t) < SAME_REPORT_MS) || (after && Math.abs(after.t - p.t) < SAME_REPORT_MS)) {
      return false;
    }
    if (before && distanceMeters(before, p) < MIN_STEP) return false;
    this.points.splice(index, 0, p);
    return true;
  }
}

/** One trail per mower, kept while the card is alive so switching views does not start over. */
const trails = new Map<string, MowTrail>();

export const getTrail = (entityId: string): MowTrail | undefined => trails.get(entityId);

export const setTrail = (entityId: string, trail: MowTrail | undefined): void => {
  if (trail) trails.set(entityId, trail);
  else trails.delete(entityId);
};
