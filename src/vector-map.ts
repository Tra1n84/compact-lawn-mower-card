import { HomeAssistant } from 'custom-card-helpers';
import { svg, SVGTemplateResult, nothing } from 'lit';
import { METERS_PER_DEG_LAT, METERS_PER_DEG_LON } from './constants';

/**
 * Vector map for mower integrations that expose their map as GeoJSON.
 *
 * Currently implemented for the Mammotion integration (mikey0000/Mammotion-HA):
 *   - mammotion.get_geojson               zones, obstacles, virtual walls, channels, dock, RTK
 *   - mammotion.get_mow_progress_geojson  the mower's own recent line while it works
 * The mown lanes themselves come from the position history, see mow-trail.ts.
 *
 * Coordinates are projected into a local metric plane (metres, y pointing south)
 * so the map can be drawn as plain SVG without any tile provider.
 */

export interface GeoJsonGeometry {
  type: string;
  coordinates?: any;
  geometries?: GeoJsonGeometry[];
}

export interface GeoJsonFeature {
  type: string;
  properties?: Record<string, any> | null;
  geometry: GeoJsonGeometry | null;
}

export interface GeoJsonCollection {
  type: string;
  features: GeoJsonFeature[];
}

/** Driven path of the running job as [lon, lat] polylines, plus the mower's own recent line */
export interface TrailLayer {
  lines: number[][][];
  head: number[][];
}

export interface VectorMapLayers {
  base: GeoJsonCollection | null;
  trail: TrailLayer | null;
}

type XY = [number, number];

/** Screen space in px covered by badges and buttons, kept free when the map is fitted */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface Shape {
  d: string;
  title: string;
}

export interface Zone {
  name: string;
  hash: number | null;
  area: number;
  rings: XY[][];
}

interface Label {
  x: number;
  y: number;
  name: string;
  sub: string;
}

interface Marker {
  kind: 'dock' | 'rtk' | 'dot';
  x: number;
  y: number;
  title: string;
}

export interface VectorMapRenderOptions {
  width: number;
  height: number;
  showLabels: boolean;
  showPath: boolean;
  mower?: { lat: number; lon: number } | null;
  mowerActive: boolean;
  mowerDocked: boolean;
  /** Position jumped too far for the smooth movement, draw it at once */
  mowerJump?: boolean;
  /** Error or no movement while mowing: the mower is highlighted and a short note is shown */
  mowerAlert?: { level: 'error' | 'warning'; text: string } | null;
  /** Zone the mower is working on and the job progress, shown in that zone's label */
  activeZone?: string | null;
  activeProgress?: number | null;
  /** Localized word for the default zone names ("Area 1" → "Bereich 1") */
  areaWord?: string;
  /** Direction of travel in degrees, clockwise from north */
  mowerHeading?: number | null;
  /** Width of the mown lanes in metres (the mower's cutting width) */
  pathWidth?: number;
  showRtk: boolean;
  insets?: Insets;
}

// Material Design Icons (Pictogrammers, Apache-2.0)
const ICON_RTK =
  'M4.93,4.93C3.12,6.74 2,9.24 2,12C2,14.76 3.12,17.26 4.93,19.07L6.34,17.66C4.89,16.22 4,14.22 4,12C4,9.79 4.89,7.78 6.34,6.34L4.93,4.93M19.07,4.93L17.66,6.34C19.11,7.78 20,9.79 20,12C20,14.22 19.11,16.22 17.66,17.66L19.07,19.07C20.88,17.26 22,14.76 22,12C22,9.24 20.88,6.74 19.07,4.93M7.76,7.76C6.67,8.85 6,10.35 6,12C6,13.65 6.67,15.15 7.76,16.24L9.17,14.83C8.45,14.11 8,13.11 8,12C8,10.89 8.45,9.89 9.17,9.17L7.76,7.76M16.24,7.76L14.83,9.17C15.55,9.89 16,10.89 16,12C16,13.11 15.55,14.11 14.83,14.83L16.24,16.24C17.33,15.15 18,13.65 18,12C18,10.35 17.33,8.85 16.24,7.76M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z';

const VIEW_PADDING_RATIO = 0.03;
const VIEW_PADDING_MIN = 0.4;

const OBSTACLE_TYPES = new Set(['obstacle', 'visual_obstacle_zone', 'visual_safety_zone']);

// ---------------------------------------------------------------------------
// Data access
// ---------------------------------------------------------------------------

export const MAMMOTION_DOMAIN = 'mammotion';

/** Base map per mower, kept while the card is alive so switching views does not reload it */
const baseCache = new Map<string, { base: GeoJsonCollection | null; at: number }>();

export const getCachedBase = (entityId: string) => baseCache.get(entityId);

export const setCachedBase = (entityId: string, base: GeoJsonCollection | null): void => {
  baseCache.set(entityId, { base, at: Date.now() });
};

const normalizeCollection = (value: unknown): GeoJsonCollection | null => {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, any>;
  if (obj.type === 'FeatureCollection' && Array.isArray(obj.features)) {
    return { type: 'FeatureCollection', features: obj.features.filter((f: any) => f && f.geometry) };
  }
  if (obj.type === 'Feature' && obj.geometry) {
    return { type: 'FeatureCollection', features: [obj as GeoJsonFeature] };
  }
  return null;
};

/** Calls one of the Mammotion GeoJSON services for the mower. */
export const fetchGeoJson = async (
  hass: HomeAssistant,
  service: string,
  entityId: string
): Promise<GeoJsonCollection | null> => {
  const result = await hass.callWS<{ response?: unknown }>({
    type: 'call_service',
    domain: MAMMOTION_DOMAIN,
    service,
    service_data: { entity_id: entityId },
    return_response: true,
  });
  return normalizeCollection(result?.response);
};

interface RegistryEntry {
  platform?: string;
  device_id?: string;
  translation_key?: string;
}

const entityRegistry = (hass: HomeAssistant): Record<string, RegistryEntry> | undefined =>
  (hass as HomeAssistant & { entities?: Record<string, RegistryEntry> }).entities;

// The registry object is replaced when it changes, so results are kept per registry object
const siblingCache = new WeakMap<object, Map<string, [string, RegistryEntry][]>>();

/** Entities of `domain` that belong to the same device as the mower entity, with their registry entries. */
export const siblingEntities = (hass: HomeAssistant, entityId: string, domain: string): [string, RegistryEntry][] => {
  const registry = entityRegistry(hass);
  const deviceId = registry?.[entityId]?.device_id;
  if (!registry || !deviceId) return [];
  let cache = siblingCache.get(registry);
  if (!cache) siblingCache.set(registry, (cache = new Map()));
  const key = `${deviceId}|${domain}`;
  let found = cache.get(key);
  if (!found) {
    found = Object.entries(registry).filter(
      ([id, entry]) => id.startsWith(`${domain}.`) && entry.device_id === deviceId
    );
    cache.set(key, found);
  }
  return found;
};

export const isMammotionEntity = (hass: HomeAssistant | undefined, entityId: string | undefined): boolean =>
  !!hass && !!entityId && entityRegistry(hass)?.[entityId]?.platform === MAMMOTION_DOMAIN;

/** Finds a sensor of the mower's device by its translation key, e.g. `left_time`. */
export const findSiblingSensor = (hass: HomeAssistant, entityId: string, key: string): string | undefined =>
  siblingEntities(hass, entityId, 'sensor').find(([, entry]) => entry.translation_key === key)?.[0];

/** Finds the device_tracker belonging to the same device as the mower entity. */
export const findSiblingTracker = (hass: HomeAssistant, entityId: string): string | undefined =>
  siblingEntities(hass, entityId, 'device_tracker')[0]?.[0];

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

const fmt = (n: number): string => (Math.round(n * 100) / 100).toString();

const toPath = (points: XY[], closed: boolean): string => {
  if (points.length === 0) return '';
  let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`;
  for (let i = 1; i < points.length; i++) {
    d += `L${fmt(points[i][0])} ${fmt(points[i][1])}`;
  }
  return closed ? `${d}Z` : d;
};

/** Default zone names of the integration ("Area 1") in the user's language. */
export const displayZoneName = (name: string, areaWord?: string): string => {
  const match = areaWord ? /^area\s*(\d+)$/i.exec(name.trim()) : null;
  return match ? `${areaWord} ${match[1]}` : name;
};

const ringArea = (ring: XY[]): number => {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return a / 2;
};

const ringCentroid = (ring: XY[]): XY => {
  const a = ringArea(ring);
  if (Math.abs(a) < 1e-9) {
    const sx = ring.reduce((s, p) => s + p[0], 0);
    const sy = ring.reduce((s, p) => s + p[1], 0);
    return [sx / ring.length, sy / ring.length];
  }
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    cx += (ring[j][0] + ring[i][0]) * f;
    cy += (ring[j][1] + ring[i][1]) * f;
  }
  return [cx / (6 * a), cy / (6 * a)];
};

const pointInRing = (p: XY, ring: XY[]): boolean => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
};

/** Label anchor inside the polygon: centroid, or the middle of the widest horizontal span through it. */
const labelPoint = (ring: XY[]): XY => {
  const c = ringCentroid(ring);
  if (pointInRing(c, ring)) return c;

  const y = c[1];
  const xs: number[] = [];
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y) {
      xs.push(xi + ((y - yi) * (xj - xi)) / (yj - yi));
    }
  }
  xs.sort((a, b) => a - b);
  let best: XY = c;
  let bestWidth = -1;
  for (let i = 0; i + 1 < xs.length; i += 2) {
    const width = xs[i + 1] - xs[i];
    if (width > bestWidth) {
      bestWidth = width;
      best = [(xs[i] + xs[i + 1]) / 2, y];
    }
  }
  return best;
};

const extendBounds = (b: Bounds | null, p: XY): Bounds => {
  if (!b) return { minX: p[0], minY: p[1], maxX: p[0], maxY: p[1] };
  return {
    minX: Math.min(b.minX, p[0]),
    minY: Math.min(b.minY, p[1]),
    maxX: Math.max(b.maxX, p[0]),
    maxY: Math.max(b.maxY, p[1]),
  };
};

/** Splits a geometry into rings/lines/points, including Multi- and Collection geometries. */
const explode = (
  geometry: GeoJsonGeometry | null,
  out: { polygons: number[][][][]; lines: number[][][]; points: number[][] } = { polygons: [], lines: [], points: [] }
) => {
  if (!geometry) return out;
  const c = geometry.coordinates;
  switch (geometry.type) {
    case 'Point':
      out.points.push(c);
      break;
    case 'MultiPoint':
      out.points.push(...c);
      break;
    case 'LineString':
      out.lines.push(c);
      break;
    case 'MultiLineString':
      out.lines.push(...c);
      break;
    case 'Polygon':
      out.polygons.push(c);
      break;
    case 'MultiPolygon':
      out.polygons.push(...c);
      break;
    case 'GeometryCollection':
      (geometry.geometries ?? []).forEach(g => explode(g, out));
      break;
  }
  return out;
};

const featureType = (f: GeoJsonFeature): string => String(f.properties?.type_name ?? '').toLowerCase();
const featureTitle = (f: GeoJsonFeature): string =>
  String(f.properties?.Name ?? f.properties?.title ?? f.properties?.name ?? '');

// ---------------------------------------------------------------------------
// Model: projects the GeoJSON once, rendering only places it in the view
// ---------------------------------------------------------------------------

export class VectorMapModel {
  readonly areas: Shape[] = [];
  readonly zones: Zone[] = [];
  readonly obstacles: Shape[] = [];
  readonly dumps: Shape[] = [];
  readonly patterns: Shape[] = [];
  readonly others: Shape[] = [];
  readonly channels: string[] = [];
  readonly corridors: string[] = [];
  readonly walls: string[] = [];
  readonly labels: Label[] = [];
  readonly markers: Marker[] = [];
  /** Mown lanes and the mower's own recent line, as SVG path data */
  trail = '';
  trailHead = '';
  bounds: Bounds | null = null;
  private readonly _clipId = `vm-clip-${Math.random().toString(36).slice(2, 9)}`;

  private readonly _lat0: number;
  private readonly _lon0: number;
  private readonly _kx: number;
  private readonly _cos: number;
  private readonly _sin: number;

  constructor(
    readonly layers: VectorMapLayers,
    readonly rotation: number
  ) {
    const origin = VectorMapModel._origin(layers);
    this._lat0 = origin[1];
    this._lon0 = origin[0];
    this._kx = METERS_PER_DEG_LON * Math.cos((this._lat0 * Math.PI) / 180);
    const rad = ((rotation || 0) * Math.PI) / 180;
    this._cos = Math.cos(rad);
    this._sin = Math.sin(rad);

    for (const f of layers.base?.features ?? []) this._addBaseFeature(f);
    this._addTrail(layers.trail);
  }

  /** [lon, lat] → local metres, x east / y south, rotated clockwise by `rotation`. */
  project(lon: number, lat: number): XY {
    const x = (lon - this._lon0) * this._kx;
    const y = -(lat - this._lat0) * METERS_PER_DEG_LAT;
    return [x * this._cos - y * this._sin, x * this._sin + y * this._cos];
  }

  private static _origin(layers: VectorMapLayers): XY {
    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;
    const visit = (c: any): void => {
      if (typeof c?.[0] === 'number' && typeof c?.[1] === 'number') {
        minLon = Math.min(minLon, c[0]);
        maxLon = Math.max(maxLon, c[0]);
        minLat = Math.min(minLat, c[1]);
        maxLat = Math.max(maxLat, c[1]);
      } else if (Array.isArray(c)) {
        c.forEach(visit);
      }
    };
    for (const f of layers.base?.features ?? []) {
      const parts = explode(f.geometry);
      visit(parts.polygons);
      visit(parts.lines);
      visit(parts.points);
    }
    return Number.isFinite(minLon) ? [(minLon + maxLon) / 2, (minLat + maxLat) / 2] : [0, 0];
  }

  private _projectAll(coords: number[][]): XY[] {
    return coords.filter(c => Number.isFinite(c?.[0]) && Number.isFinite(c?.[1])).map(c => this.project(c[0], c[1]));
  }

  private _track(points: XY[]): void {
    for (const p of points) this.bounds = extendBounds(this.bounds, p);
  }

  private _addBaseFeature(f: GeoJsonFeature): void {
    const type = featureType(f);
    const title = featureTitle(f);
    const parts = explode(f.geometry);

    for (const polygon of parts.polygons) {
      const rings = polygon.map(r => this._projectAll(r)).filter(r => r.length >= 3);
      if (!rings.length) continue;
      this._track(rings[0]);
      const d = rings.map(r => toPath(r, true)).join('');

      if (type === 'area') {
        this.areas.push({ d, title });
        const area = Number(f.properties?.area);
        const hash = Number(f.properties?.hash);
        this.zones.push({ name: title, hash: Number.isFinite(hash) ? hash : null, area, rings });
        const [x, y] = labelPoint(rings[0]);
        this.labels.push({ x, y, name: title, sub: area > 0 ? `${Math.round(area)} m²` : '' });
      } else if (OBSTACLE_TYPES.has(type)) {
        this.obstacles.push({ d, title });
      } else if (type === 'dump') {
        this.dumps.push({ d, title });
      } else if (type === 'svg') {
        this.patterns.push({ d, title });
      } else {
        this.others.push({ d, title });
      }
    }

    for (const line of parts.lines) {
      const points = this._projectAll(line);
      if (points.length < 2) continue;
      this._track(points);
      const d = toPath(points, false);
      if (type === 'virtual_wall') this.walls.push(d);
      else if (type === 'path') this.channels.push(d);
      else if (type === 'corridor_line') this.corridors.push(d);
      else if (type === 'svg') this.patterns.push({ d, title });
      else this.others.push({ d, title });
    }

    for (const point of parts.points) {
      if (!Number.isFinite(point?.[0]) || !Number.isFinite(point?.[1])) continue;
      const [x, y] = this.project(point[0], point[1]);
      this._track([[x, y]]);
      const icon = String(f.properties?.iconImage ?? '').toLowerCase();
      const lower = title.toLowerCase();
      let kind: Marker['kind'] = 'dot';
      if (lower.includes('rtk') || icon.includes('rtk')) kind = 'rtk';
      else if (lower === 'dock' || icon.includes('recharge')) kind = 'dock';
      this.markers.push({ kind, x, y, title });
    }
  }

  private _addTrail(trail: TrailLayer | null): void {
    if (!trail) return;
    const toLine = (line: number[][]): string => {
      const points = this._projectAll(line);
      if (!points.length) return '';
      // A single position is drawn as a dot: zero-length segment with round caps
      return toPath(points.length === 1 ? [points[0], points[0]] : points, false);
    };
    this.trail = trail.lines.map(toLine).join('');
    this.trailHead = trail.head.length >= 2 ? toLine(trail.head) : '';
  }

  /** Visible area in local metres, padded and stretched to the container aspect ratio. */
  viewBox(
    width: number,
    height: number,
    insets: Insets = { top: 0, right: 0, bottom: 0, left: 0 }
  ): { x: number; y: number; w: number; h: number } {
    const b = this.bounds ?? { minX: -10, minY: -10, maxX: 10, maxY: 10 };
    let w = Math.max(b.maxX - b.minX, 1);
    let h = Math.max(b.maxY - b.minY, 1);
    const pad = Math.max(VIEW_PADDING_MIN, Math.max(w, h) * VIEW_PADDING_RATIO);
    w += pad * 2;
    h += pad * 2;
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;

    if (!(width > 0 && height > 0)) {
      return { x: cx - w / 2, y: cy - h / 2, w, h };
    }

    // Fit the map into the free area between badges and buttons, but never shrink it below half the card
    const top = Math.min(insets.top, height * 0.25);
    const bottom = Math.min(insets.bottom, height * 0.25);
    const left = Math.min(insets.left, width * 0.25);
    const right = Math.min(insets.right, width * 0.25);
    const innerW = width - left - right;
    const innerH = height - top - bottom;
    const ppm = Math.min(innerW / w, innerH / h);

    return {
      x: cx - (left + innerW / 2) / ppm,
      y: cy - (top + innerH / 2) / ppm,
      w: width / ppm,
      h: height / ppm,
    };
  }

  /** Mower position in map units; while docked it is drawn on the dock. */
  mowerPoint(mower: { lat: number; lon: number } | null | undefined, docked: boolean): XY | null {
    const dock = docked ? this.markers.find(m => m.kind === 'dock') : undefined;
    if (dock) return [dock.x, dock.y];
    return mower ? this.project(mower.lon, mower.lat) : null;
  }

  /** Zone under a point in map units, holes excluded. */
  zoneAt(point: XY): Zone | undefined {
    return this.zones.find(z => pointInRing(point, z.rings[0]) && !z.rings.slice(1).some(r => pointInRing(point, r)));
  }

  /** Pixels in the unzoomed view → map units. */
  fromScreen(px: XY, width: number, height: number, insets?: Insets): XY {
    const vb = this.viewBox(width, height, insets);
    return [vb.x + (px[0] / width) * vb.w, vb.y + (px[1] / height) * vb.h];
  }

  /** Map units → pixels in the unzoomed view. */
  toScreen(point: XY, width: number, height: number, insets?: Insets): XY {
    const vb = this.viewBox(width, height, insets);
    return [((point[0] - vb.x) / vb.w) * width, ((point[1] - vb.y) / vb.h) * height];
  }

  render(options: VectorMapRenderOptions): SVGTemplateResult {
    const vb = this.viewBox(options.width, options.height, options.insets);
    const ppm = options.width > 0 ? options.width / vb.w : 20;

    // While docked the mower is drawn on the dock instead of its last reported position
    const dock = options.mowerDocked ? this.markers.find(m => m.kind === 'dock') : undefined;
    const mower = this.mowerPoint(options.mower, options.mowerDocked);

    // Heading is clockwise from north, the map itself may be rotated
    const heading = (options.mowerHeading ?? 0) + (this.rotation || 0);
    const activeZone = options.activeZone?.trim().toLowerCase();
    const singleZone = this.labels.length === 1;

    return svg`
      <svg
        class="vm-svg"
        viewBox="${fmt(vb.x)} ${fmt(vb.y)} ${fmt(vb.w)} ${fmt(vb.h)}"
        preserveAspectRatio="xMidYMid meet"
        style="--clm-ppm: ${ppm};"
        role="img"
      >
        <defs>
          <clipPath id=${this._clipId}>${this.areas.map(a => svg`<path d=${a.d}></path>`)}</clipPath>
        </defs>
        ${this.areas.map(a => svg`<path class="vm-area" d=${a.d}><title>${a.title}</title></path>`)}
        ${this.dumps.map(a => svg`<path class="vm-dump" d=${a.d}></path>`)}
        ${this.others.map(a => svg`<path class="vm-other" d=${a.d}></path>`)}
        ${
          this.channels.length
            ? svg`<path class="vm-channel" d=${this.channels.join('')}></path>
              <path class="vm-channel-center" d=${this.channels.join('')}></path>`
            : nothing
        }
        ${this.patterns.map(a => svg`<path class="vm-pattern" d=${a.d}></path>`)}
        ${this.corridors.length ? svg`<path class="vm-corridor" d=${this.corridors.join('')}></path>` : nothing}
        ${
          options.showPath && (this.trail || this.trailHead)
            ? svg`<g class="vm-trail-layer" clip-path="url(#${this._clipId})" style="--vm-trail-width: ${fmt(
                options.pathWidth ?? 0.2
              )}px">
              ${this.trail ? svg`<path class="vm-trail" d=${this.trail}></path>` : nothing}
              ${this.trailHead ? svg`<path class="vm-trail vm-trail-head" d=${this.trailHead}></path>` : nothing}
            </g>`
            : nothing
        }
        ${this.areas.map(a => svg`<path class="vm-area-edge" d=${a.d}></path>`)}
        ${this.obstacles.map(o => svg`<path class="vm-obstacle" d=${o.d}><title>${o.title}</title></path>`)}
        ${this.walls.length ? svg`<path class="vm-wall" d=${this.walls.join('')}></path>` : nothing}
        ${this.markers.filter(m => m !== dock && (options.showRtk || m.kind !== 'rtk')).map(m => this._renderMarker(m))}
        ${
          options.showLabels
            ? this.labels
                .filter(l => l.name)
                .map(l => {
                  const active =
                    options.activeProgress !== null &&
                    options.activeProgress !== undefined &&
                    (singleZone || (!!activeZone && l.name.trim().toLowerCase() === activeZone));
                  const sub = active ? [l.sub, `${options.activeProgress} %`].filter(Boolean).join(' · ') : l.sub;
                  const name = displayZoneName(l.name, options.areaWord);
                  // The zone being mown gets a pill like in the Mammotion app, the others plain text
                  const width = Math.round(16 + name.length * 6.6);
                  return svg`
                    <g class="vm-label ${active ? 'active' : ''}" transform="translate(${fmt(l.x)} ${fmt(l.y)})">
                      <g class="vm-fixed">
                        ${
                          active
                            ? svg`<rect class="vm-label-pill" x=${-width / 2} y="-10" width=${width} height="20" rx="6"></rect>`
                            : nothing
                        }
                        <text class="vm-label-name" y=${active ? 4 : sub ? -2 : 4}>${name}</text>
                        ${sub ? svg`<text class="vm-label-sub" y=${active ? 22 : 11}>${sub}</text>` : nothing}
                      </g>
                    </g>
                  `;
                })
            : nothing
        }
        ${
          mower
            ? svg`
              <g
                class="vm-mower ${options.mowerActive ? 'active' : ''} ${options.mowerJump ? 'jump' : ''} ${options.mowerAlert ? `alert-${options.mowerAlert.level}` : ''}"
                style="transform: translate(${fmt(mower[0])}px, ${fmt(mower[1])}px)"
              >
                <g class="vm-fixed">
                  <circle class="vm-mower-pulse" r="15"></circle>
                  ${options.mowerAlert ? svg`<circle class="vm-mower-alert-ring" r="17"></circle>` : nothing}
                  <g class="vm-mower-rotate" style="transform: rotate(${fmt(heading)}deg)">
                    <rect class="vm-mower-wheel" x="-11.5" y="-10" width="4" height="7" rx="1.5"></rect>
                    <rect class="vm-mower-wheel" x="7.5" y="-10" width="4" height="7" rx="1.5"></rect>
                    <rect class="vm-mower-wheel" x="-11.5" y="4" width="4" height="7" rx="1.5"></rect>
                    <rect class="vm-mower-wheel" x="7.5" y="4" width="4" height="7" rx="1.5"></rect>
                    <rect class="vm-mower-body" x="-8.5" y="-13" width="17" height="26" rx="6"></rect>
                    <rect class="vm-mower-shell" x="-5" y="-5" width="10" height="13" rx="3"></rect>
                    <circle class="vm-mower-front" cx="0" cy="-9.5" r="2"></circle>
                    <path class="vm-mower-arrow" d="M0 -20L4.5 -15H-4.5Z"></path>
                  </g>
                  ${options.mowerAlert ? this._renderAlert(options.mowerAlert) : nothing}
                </g>
              </g>
            `
            : nothing
        }
      </svg>
    `;
  }

  private _renderAlert(alert: { level: 'error' | 'warning'; text: string }): SVGTemplateResult {
    const width = Math.min(220, alert.text.length * 6.2 + 16);
    return svg`
      <g class="vm-alert vm-alert-${alert.level}" transform="translate(0 -26)">
        <rect x=${-width / 2} y="-11" width=${width} height="20" rx="10"></rect>
        <text y="3">${alert.text}</text>
      </g>
    `;
  }

  private _renderMarker(m: Marker): SVGTemplateResult {
    if (m.kind === 'dot') {
      return svg`<g transform="translate(${fmt(m.x)} ${fmt(m.y)})"><circle class="vm-dot vm-fixed" r="3"></circle></g>`;
    }
    if (m.kind === 'dock') {
      return svg`
        <g class="vm-station vm-dock" transform="translate(${fmt(m.x)} ${fmt(m.y)})">
          <g class="vm-fixed">
            <title>${m.title}</title>
            <rect class="vm-dock-body" x="-9" y="-12" width="18" height="24" rx="4"></rect>
            <circle class="vm-dock-badge" r="7"></circle>
            <path class="vm-dock-bolt" d="M1 -5L-3.5 1H0L-1 5L3.5 -1H0Z"></path>
          </g>
        </g>
      `;
    }
    return svg`
      <g class="vm-station vm-${m.kind}" transform="translate(${fmt(m.x)} ${fmt(m.y)})">
        <g class="vm-fixed">
          <title>${m.title}</title>
          <circle class="vm-station-body" r="10"></circle>
          <path class="vm-station-icon" transform="translate(-7 -7) scale(0.5833)" d=${ICON_RTK}></path>
        </g>
      </g>
    `;
  }
}
