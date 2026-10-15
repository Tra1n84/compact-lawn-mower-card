import { LitElement, html, svg, nothing, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard, fireEvent, forwardHaptic, navigate, toggleEntity } from 'custom-card-helpers';
import type { HassEntity } from 'home-assistant-js-websocket';
import './editor';
import './camera-popup';
import { CameraPopup } from './camera-popup';
import { getDefaultActions } from './defaults';
import {
  CARD_NAME,
  CARD_VERSION,
  DEFAULT_MAP_ZOOM,
  MIN_MAP_ZOOM,
  MAX_MAP_ZOOM,
  MAX_STATIC_MAP_SIZE,
  STATUS_BADGE_GAP,
  STATUS_LABEL_HYSTERESIS,
  STATUS_TEXT_FONT_SIZE,
  STATUS_TEXT_FONT_WEIGHT,
  STATUS_TEXT_LETTER_SPACING,
  MOWER_COLUMN_WIDTH,
  MIN_SKY_PERCENTAGE,
  MAX_SKY_PERCENTAGE,
  CAMERA_RETRY_INTERVAL,
  MAP_UPDATE_INTERVAL,
  CAMERA_LOADING_DELAY,
  IMG_ZOOM_MIN,
  IMG_ZOOM_MAX,
  IMG_ZOOM_STEP_BUTTON,
  IMG_ZOOM_STEP_WHEEL,
  CARD_TRANSLATED_STATES,
  LIVE_UPDATES_CHECK_INTERVAL,
  LIVE_UPDATES_FOLLOW_UP,
  VECTOR_MAP_BASE_TTL,
  VECTOR_MAP_HEADING_MIN_DISTANCE,
  VECTOR_MAP_INSETS,
  VECTOR_MAP_REPORT_MAX_AGE,
  VECTOR_MAP_SMOOTH_MAX_DISTANCE,
  VECTOR_MAP_STREAM_KEEPALIVE,
  VECTOR_MAP_STUCK_MINUTES,
  VECTOR_MAP_TRAIL_INTERVAL,
  VECTOR_MAP_TRAIL_MIN_INTERVAL,
  VECTOR_MAP_WORKING_STATES,
} from './constants';
import { getGraphics } from './graphics';
import { localize } from './localize';
import {
  buildImageUrl,
  cacheMapBackground,
  detectEdgeColor,
  readCachedMapBackground,
  THEME_BACKGROUND,
} from './map-bg';
import {
  CompactLawnMowerCardConfig,
  LawnMowerEntity,
  MowerModel,
  CustomAction,
  ServiceCallActionConfig,
  NavigateActionConfig,
  UrlActionConfig,
  ToggleActionConfig,
  MoreInfoActionConfig,
} from './types';
import { compactLawnMowerCardStyles } from './styles';
import {
  MAMMOTION_DOMAIN,
  VectorMapLayers,
  VectorMapModel,
  displayZoneName,
  fetchGeoJson,
  findSiblingSensor,
  findSiblingTracker,
  getCachedBase,
  isMammotionEntity,
  setCachedBase,
  siblingEntities,
} from './vector-map';
import { LonLat, MowTrail, findJobStart, getTrail, offsetMeters, setTrail } from './mow-trail';

/** Reported position of a device_tracker, null when it has none (0/0 is the integration's "no fix"). */
const trackerPosition = (tracker: HassEntity | undefined): LonLat | null => {
  const lat = Number(tracker?.attributes?.latitude);
  const lon = Number(tracker?.attributes?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lon) && (lat !== 0 || lon !== 0) ? { lat, lon } : null;
};

/** When the report stream was last started per mower, shared by all cards showing it */
const reportStreamStartedAt = new Map<string, number>();

interface HassWithEntities extends HomeAssistant {
  entities: Record<string, { platform?: string; translation_key?: string }>;
}

console.groupCollapsed(
  `%c ${CARD_NAME} %c Version ${CARD_VERSION}`,
  'color: white; background:rgb(90, 135, 91); font-weight: bold; padding: 2px 6px;',
  'color: rgb(90, 135, 91); font-weight: bold;'
);
console.log('Github:', 'https://github.com/Tra1n84/compact-lawn-mower-card');
console.groupEnd();

@customElement('compact-lawn-mower-card')
export class CompactLawnMowerCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public config!: CompactLawnMowerCardConfig;

  @state() private _animationClass = '';

  @state() private _forceCameraRefresh = false;
  @state() private _isCameraLoading = false;
  @state() private _isCameraReachable = true;
  @state() private _isPopupOpen = false;
  @state() private _isMapLoading = false;
  @state() private _isMapImageLoading = false;
  @state() private _mapImageError = false;
  @state() private _mapImageBgColor: string | null = null;
  private _imgScale = 1;
  private _imgTranslateX = 0;
  private _imgTranslateY = 0;
  private _imgContainer?: HTMLElement;
  private _lastMapLat?: number;
  private _lastMapLon?: number;
  @state() private _areActionsExpanded = false;
  @state() private _pendingActionName: string | null = null;
  @state() private _actionFeedback: { name: string; status: 'success' | 'error' } | null = null;
  private _feedbackTimeout: ReturnType<typeof setTimeout> | null = null;
  private _currentPopup?: CameraPopup;
  @query('.main-display-area') private _mainDisplayArea?: HTMLElement;
  @query('.badge-row') private _badgeRow?: HTMLElement;
  @query('.status-ring') private _statusRing?: HTMLElement;
  @state() private _statusLabelTier = 0;
  private _badgeResizeObserver?: ResizeObserver;
  @property({ attribute: false }) private _viewMode: 'mower' | 'camera' | 'map' = 'mower';
  @state() private _mapWidth = 0;
  @state() private _mapHeight = 0;
  @state() private _mapZoom = DEFAULT_MAP_ZOOM;
  private _mapUpdateInterval?: number;
  private _cameraUpdateInterval?: number;
  private _animationTimeout?: number;
  private _mowerBodyAnimEndListener?: EventListener;
  private _mainResizeObserver?: ResizeObserver;
  private _mowerResizeObserver?: ResizeObserver;
  private _hadValidMower = false;
  @state() private _mapCardElement?: HTMLElement;
  private _imgIsDragging = false;
  private _imgIsPinching = false;
  private _imgDragStartX = 0;
  private _imgDragStartY = 0;
  private _imgDragStartTranslateX = 0;
  private _imgDragStartTranslateY = 0;
  private _imgPinchStartDistance = 0;
  private _imgPinchStartScale = 1;
  private _imgPinchMidX = 0;
  private _imgPinchMidY = 0;
  private _imgPinchStartTranslateX = 0;
  private _imgPinchStartTranslateY = 0;
  private _imgActivePointers: Map<number, PointerEvent> = new Map();
  private _haMapShadowObserver?: MutationObserver;
  private _mapBgDetectedFor?: string;
  private _drawnMower?: LonLat & { docked: boolean };
  @state() private _vectorLayers: VectorMapLayers = { base: null, trail: null };
  @state() private _vectorStatus: 'idle' | 'loading' | 'ready' | 'empty' | 'error' = 'idle';
  private _vectorModel?: VectorMapModel;
  private _vectorTimer?: number;
  private _vectorBaseBusy = false;
  private _liveTimer?: number;
  private _followUpTimers: number[] = [];
  private _vectorTrackerLookup?: { entity: string; tracker?: string };
  private _trailBusy = false;
  private _trailRefreshedAt = 0;
  private _mowerHeading: number | null = null;
  private _headingFrom?: LonLat;
  @state() private _vectorSize = { width: 0, height: 0 };
  @state() private _vectorFollow = false;
  @state() private _zoneDialog?: { name: string; hash: number | null; area: number };
  private _tapStart?: { x: number; y: number; t: number };
  private _lastMovedAt = Date.now();
  private _lastReportAt = 0;
  private _lastReportPos?: LonLat;
  private _displayHeading?: number;
  private _vectorResizeObserver?: ResizeObserver;
  private _vectorObserved?: Element;

  connectedCallback() {
    super.connectedCallback();
    this._startLiveUpdates();
    this._viewMode = this.config?.default_view ?? 'mower';
    this._restoreImgTransform();
    this._restoreMapBackground();
    const useImage =
      this.config.map_source === 'image' ||
      (!this.config.map_source && !this.config.map_entity && !!this.config.map_image_entity);
    const useHaMap = !useImage && (!this.config.google_maps_api_key || this.config.use_google_maps === false);

    if (this._viewMode === 'map' && this._isVectorMap) {
      this._startVectorMap();
    } else if (this._viewMode === 'map' && useImage) {
      this._isMapImageLoading = true;
    } else if (this._viewMode === 'map' && useHaMap) {
      this._loadMapElement();
    }

    if (this._viewMode === 'camera') {
      this.updateComplete.then(() => this._updateCameraState(true));
    }

    if (this._viewMode === 'mower') {
      this.updateComplete.then(() => {
        this._updateMowerPosition();
        this._setupMowerResizeObserver();
      });
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);

    this._mainResizeObserver = new ResizeObserver(() => {
      if (this._mainDisplayArea) {
        const newWidth = Math.round(this._mainDisplayArea.clientWidth);
        const newHeight = Math.round(this._mainDisplayArea.clientHeight);

        if (newWidth > 0 && newHeight > 0 && (this._mapWidth !== newWidth || this._mapHeight !== newHeight)) {
          this._mapWidth = newWidth;
          this._mapHeight = newHeight;
        }
      }
      fireEvent(this, 'iron-resize' as any);
    });

    if (this._mainDisplayArea) {
      this._mainResizeObserver.observe(this._mainDisplayArea);
    }

    this._setupBadgeResizeObserver();
    document.fonts?.ready.then(() => this._measureStatusLabelTier());

    this._applyStyles();
    this.requestUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopLiveUpdates();
    this._clearAllTimers();
    this._mainResizeObserver?.disconnect();
    this._mowerResizeObserver?.disconnect();
    this._badgeResizeObserver?.disconnect();
    this._closePopup();
    this._haMapShadowObserver?.disconnect();
    this._haMapShadowObserver = undefined;
    this._vectorResizeObserver?.disconnect();
    this._vectorObserved = undefined;
    this._imgActivePointers.clear();
    this._imgIsDragging = false;
    this._imgIsPinching = false;
  }

  private _clearAllTimers(): void {
    this._stopVectorMap();
    if (this._mapUpdateInterval) {
      clearInterval(this._mapUpdateInterval);
      this._mapUpdateInterval = undefined;
    }
    if (this._cameraUpdateInterval) {
      clearInterval(this._cameraUpdateInterval);
      this._cameraUpdateInterval = undefined;
    }
    if (this._animationTimeout) {
      clearTimeout(this._animationTimeout);
      this._animationTimeout = undefined;
    }
  }

  private _setInitialAnimationState(currentState: string): void {
    const onLawnStates = ['mowing', 'paused', 'returning', 'error'];
    const isDocked = this._isCurrentlyDocked(currentState, this.chargingStatus);
    const resolved = this._resolveStateBehavior(currentState);

    if (isDocked) {
      this._animationClass = 'docked';
    } else if (onLawnStates.includes(resolved)) {
      this._animationClass = 'on-lawn';
    } else {
      this._animationClass = '';
    }
  }

  _updateMowerPosition() {
    if (this._viewMode !== 'mower') return;

    const mowerDisplay = this.shadowRoot?.querySelector('.mower-display') as HTMLElement;
    const mowerSvg = this.shadowRoot?.querySelector('.mower-svg') as HTMLElement;

    if (!mowerDisplay || !mowerSvg) {
      return;
    }

    const containerWidth = mowerDisplay.clientWidth;
    const containerHeight = mowerDisplay.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) {
      return;
    }

    const estimatedColumns = Math.max(1, Math.floor(containerWidth / MOWER_COLUMN_WIDTH));
    const skyPercentage = Math.max(MIN_SKY_PERCENTAGE, MAX_SKY_PERCENTAGE - estimatedColumns * 2);
    mowerDisplay.style.setProperty('--sky-percentage', `${skyPercentage}%`);

    const mowerHeight = mowerSvg.clientHeight;
    if (mowerHeight === 0) return;

    const wheelOffsetFromBottomInSvg = mowerHeight * 0.05;
    const grassHeight = containerHeight * (1 - skyPercentage / 100);

    let verticalPositionFactor = 0.32;
    if (containerWidth < 300) {
      verticalPositionFactor = 0.55;
    } else if (containerWidth < 380) {
      verticalPositionFactor = 0.4;
    }
    const desiredWheelPosition = grassHeight * verticalPositionFactor;
    const newBottom = desiredWheelPosition - wheelOffsetFromBottomInSvg;

    mowerSvg.style.bottom = `${newBottom}px`;
  }

  private _setupBadgeResizeObserver(): void {
    if (this._badgeResizeObserver) {
      this._badgeResizeObserver.disconnect();
    }

    if (!this._badgeRow) return;

    this._badgeResizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => this._measureStatusLabelTier());
    });
    this._badgeResizeObserver.observe(this._badgeRow);
  }

  _setupMowerResizeObserver() {
    if (this._mowerResizeObserver) {
      this._mowerResizeObserver.disconnect();
    }

    this._mowerResizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => this._updateMowerPosition());
    });

    const mowerDisplay = this.shadowRoot?.querySelector('.mower-display');
    if (mowerDisplay) {
      this._mowerResizeObserver.observe(mowerDisplay);
    }
  }

  private _updateAnimation(previousState: string, currentState: string, wasDocked: boolean): void {
    const isDocked = this._isCurrentlyDocked(currentState, this.chargingStatus);

    if (this._animationClass === 'driving-from-dock' || this._animationClass === 'driving-to-dock') {
      return;
    }

    if (this._animationTimeout) {
      clearTimeout(this._animationTimeout);
      this._animationTimeout = undefined;
    }

    const mowerBody = this.shadowRoot?.querySelector('.mower-svg .mower-body') as HTMLElement | null;

    if (this._mowerBodyAnimEndListener && mowerBody) {
      mowerBody.removeEventListener('animationend', this._mowerBodyAnimEndListener);
      this._mowerBodyAnimEndListener = undefined;
    }

    const onAnimationEnd = () => {
      this._mowerBodyAnimEndListener = undefined;
      if (this._animationTimeout) {
        clearTimeout(this._animationTimeout);
        this._animationTimeout = undefined;
      }
      if (mowerBody) {
        mowerBody.style.willChange = 'auto';
      }
      this._setInitialAnimationState(this.mowerState);
    };

    const makeAnimationEndListener = (expectedAnimationName: string): EventListener => {
      const listener: EventListener = (e: Event) => {
        if (!(e as AnimationEvent).animationName.startsWith(expectedAnimationName)) return;
        if (mowerBody) mowerBody.removeEventListener('animationend', listener);
        onAnimationEnd();
      };
      return listener;
    };

    if (wasDocked && !isDocked) {
      if (this._animationClass !== 'driving-from-dock') {
        if (mowerBody) {
          const listener = makeAnimationEndListener('driveFromDock');
          this._mowerBodyAnimEndListener = listener;
          mowerBody.addEventListener('animationend', listener);
          mowerBody.style.willChange = 'transform';
        }
        this._animationClass = 'driving-from-dock';
        this._animationTimeout = window.setTimeout(onAnimationEnd, 2500);
      }
      return;
    }

    if (!wasDocked && isDocked) {
      if (this._animationClass !== 'driving-to-dock') {
        if (mowerBody) {
          const listener = makeAnimationEndListener('driveToDock');
          this._mowerBodyAnimEndListener = listener;
          mowerBody.addEventListener('animationend', listener);
          mowerBody.style.willChange = 'transform';
        }
        this._animationClass = 'driving-to-dock';
        this._animationTimeout = window.setTimeout(onAnimationEnd, 2500);
      }
      return;
    }

    const resolvedCurrent = this._resolveStateBehavior(currentState);
    const resolvedPrevious = this._resolveStateBehavior(previousState);

    const isGoingToPause =
      resolvedCurrent === 'paused' && (resolvedPrevious === 'mowing' || resolvedPrevious === 'returning');
    if (isGoingToPause && this._animationClass !== 'pausing') {
      if (mowerBody) {
        mowerBody.style.willChange = 'transform';
      }
      this._animationClass = 'pausing';
      this._animationTimeout = window.setTimeout(() => {
        if (mowerBody) {
          mowerBody.style.willChange = 'auto';
        }
        this._setInitialAnimationState(this.mowerState);
      }, 900);
      return;
    }

    const isStartingFromPause = resolvedCurrent === 'mowing' || resolvedCurrent === 'returning';
    if (resolvedPrevious === 'paused' && isStartingFromPause && this._animationClass !== 'startup') {
      if (mowerBody) {
        mowerBody.style.willChange = 'transform';
      }
      this._animationClass = 'startup';
      this._animationTimeout = window.setTimeout(() => {
        if (mowerBody) {
          mowerBody.style.willChange = 'auto';
        }
        this._setInitialAnimationState(this.mowerState);
      }, 800);
      return;
    }

    this._setInitialAnimationState(currentState);
  }

  private _toCssColor(color: string | number[] | undefined): string | null {
    if (typeof color === 'string') {
      return color;
    }
    if (Array.isArray(color) && color.length === 3) {
      return `rgb(${color.join(',')})`;
    }
    return null;
  }

  private _applyStyles(): void {
    const style = this.style;
    style.setProperty('--sky-color-top', this._toCssColor(this.config.sky_color_top));
    style.setProperty('--sky-color-bottom', this._toCssColor(this.config.sky_color_bottom));
    style.setProperty('--grass-color-top', this._toCssColor(this.config.grass_color_top));
    style.setProperty('--grass-color-bottom', this._toCssColor(this.config.grass_color_bottom));
    style.setProperty('--badge-text-color', this._toCssColor(this.config.badge_text_color));
    style.setProperty('--badge-icon-color', this._toCssColor(this.config.badge_icon_color));
    style.setProperty('--toggle-active-color', this._toCssColor(this.config.toggle_active_color));
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (!this.hass || !this.config?.entity) {
      return;
    }

    if (this.config.custom_actions === undefined) {
      this.config = {
        ...this.config,
        custom_actions: getDefaultActions(this.hass),
      };
    }

    if (this._mapCardElement && changedProperties.has('hass')) {
      (this._mapCardElement as any).hass = this.hass;
    }

    if (
      this._viewMode === 'map' &&
      this._isVectorMap &&
      this._vectorStatus === 'loading' &&
      !this._vectorLayers.base &&
      !this._vectorBaseBusy
    ) {
      this._fetchVectorBase();
    }

    if (changedProperties.has('config')) {
      this._setInitialAnimationState(this.mowerState);
      const oldConfig = changedProperties.get('config') as CompactLawnMowerCardConfig | undefined;
      if (oldConfig && this.config.default_view !== oldConfig.default_view) {
        this._setViewMode(this.config.default_view || 'mower');
      }

      if (oldConfig) {
        if (this.config.camera_entity !== oldConfig.camera_entity && this._viewMode === 'camera') {
          if (!this.config.camera_entity) {
            this._setViewMode('mower');
          } else {
            this._updateCameraState(true);
          }
        }

        if (this.config.enable_map === false && oldConfig.enable_map !== false && this._viewMode === 'map') {
          this._setViewMode(this.config.default_view || 'mower');
        }

        if (
          this._viewMode === 'map' &&
          !this._isVectorMap &&
          !this.config.map_entity &&
          !this.config.map_image_entity &&
          (oldConfig.map_entity || oldConfig.map_image_entity || oldConfig.map_source === 'mammotion')
        ) {
          this._setViewMode(this.config.default_view || 'mower');
        }

        if (this.config.map_image_entity !== oldConfig.map_image_entity) {
          this._isMapImageLoading = true;
          this._mapImageError = false;
          this._imgScale = 1;
          this._imgTranslateX = 0;
          this._imgTranslateY = 0;
          this._restoreImgTransform();
          this._mapBgDetectedFor = undefined;
          this._restoreMapBackground();
        }

        if (this.config.map_image_bg_auto !== oldConfig.map_image_bg_auto) {
          this._mapBgDetectedFor = undefined;
          this._restoreMapBackground();
        }

        if (
          this.config.map_source !== oldConfig.map_source &&
          (this._isVectorMap || oldConfig.map_source === 'mammotion')
        ) {
          this._imgScale = 1;
          this._imgTranslateX = 0;
          this._imgTranslateY = 0;
          this._restoreImgTransform();
          if (!this._isVectorMap) {
            this._stopVectorMap();
          }
        }

        if (
          this._viewMode === 'map' &&
          this._isVectorMap &&
          (this.config.map_source !== oldConfig.map_source || this.config.entity !== oldConfig.entity)
        ) {
          this._startVectorMap();
        } else if (this._viewMode === 'map' && this.config.map_source !== oldConfig.map_source) {
          const newUseImage =
            this.config.map_source === 'image' ||
            (!this.config.map_source && !this.config.map_entity && !!this.config.map_image_entity) ||
            (this.config.map_source === 'gps' && !this.config.map_entity && !!this.config.map_image_entity);
          const wasUseImage =
            oldConfig.map_source === 'image' ||
            (!oldConfig.map_source && !oldConfig.map_entity && !!oldConfig.map_image_entity) ||
            (oldConfig.map_source === 'gps' && !oldConfig.map_entity && !!oldConfig.map_image_entity);
          if (newUseImage) {
            if (!wasUseImage) {
              this._isMapImageLoading = true;
              this._mapImageError = false;
            }
          } else if (!this.config.google_maps_api_key || this.config.use_google_maps === false) {
            this._mapCardElement = undefined;
            this.updateComplete.then(() => this._loadMapElement());
          } else {
            this._isMapLoading = true;
          }
        }

        const useHaMapNow = !this.config.google_maps_api_key || this.config.use_google_maps === false;
        const useHaMapBefore = !oldConfig.google_maps_api_key || oldConfig.use_google_maps === false;

        if (this._viewMode === 'map' && !this._isVectorMap && useHaMapNow && !useHaMapBefore) {
          this._mapCardElement = undefined;
          this.updateComplete.then(() => this._loadMapElement());
        }
        this._applyStyles();
      }
    } else if (changedProperties.has('hass')) {
      const oldHass = changedProperties.get('hass') as HomeAssistant | undefined;
      if (oldHass) {
        const oldMowerState = oldHass.states[this.config.entity]?.state;
        const newMowerState = this.mowerState;

        const oldChargingStatus = CompactLawnMowerCard._getChargingStatus(
          oldHass,
          oldMowerState,
          this.config.charging_entity
        );
        const newChargingStatus = this.chargingStatus;

        const wasDocked = this._isCurrentlyDocked(oldMowerState, oldChargingStatus);
        const isDocked = this._isCurrentlyDocked(newMowerState, newChargingStatus);

        if (oldMowerState !== newMowerState || wasDocked !== isDocked) {
          this._updateAnimation(oldMowerState, newMowerState, wasDocked);
        }

        if (this._viewMode === 'camera' && this.config.camera_entity) {
          const oldCameraState = oldHass.states[this.config.camera_entity]?.state;
          const newCameraState = this.cameraEntity?.state;

          if (oldCameraState !== newCameraState) {
            this._updateCameraState(false);
          }
        }
      } else {
        this._setInitialAnimationState(this.mowerState);
      }
    }

    if ((changedProperties as any).has('_viewMode')) {
      this._setInitialAnimationState(this.mowerState);
    }

    if (changedProperties.has('hass')) {
      const oldState = (changedProperties.get('hass') as HomeAssistant | undefined)?.states[this.config.entity]?.state;
      // A job started elsewhere (schedule, app, automation): its stream is started at once
      if (oldState && oldState !== this.mowerState && this._hasLiveUpdates) {
        const resolved = this._resolveStateBehavior(this.mowerState);
        if (resolved === 'mowing' || resolved === 'returning') this._keepReportStream(this.config.entity, true);
      }
    }

    if (changedProperties.has('hass') && this._isVectorMap) {
      this._trackMovement();
      if (this._viewMode === 'map') {
        this._onVectorHassUpdate(changedProperties.get('hass') as HomeAssistant | undefined);
      }
    }
  }

  /** A new mower state reloads the trail, a new position extends it at once. */
  private _onVectorHassUpdate(oldHass: HomeAssistant | undefined): void {
    const trackerId = this._vectorTrackerEntity();
    const tracker = trackerId ? this.hass.states[trackerId] : undefined;
    if (oldHass && oldHass.states[this.config.entity]?.state !== this.mowerState) {
      this._refreshMowTrail();
    } else if (tracker && trackerId && oldHass?.states[trackerId] !== tracker) {
      // The history is only read to fill in what was missed between two updates
      this._pushLivePosition(tracker);
      if (Date.now() - this._trailRefreshedAt > VECTOR_MAP_TRAIL_MIN_INTERVAL) this._refreshMowTrail();
    }
  }

  private async _checkCameraReachability(): Promise<void> {
    if (!this.cameraEntity?.attributes.entity_picture) {
      this._isCameraReachable = true;
      return;
    }
    if (this.cameraEntity.state === 'unavailable') {
      this._isCameraReachable = false;
      return;
    }
    try {
      const imageUrl = this.cameraEntity.attributes.entity_picture;
      const cacheBuster = `&t=${Date.now()}`;
      const urlWithCacheBuster = imageUrl.includes('?') ? `${imageUrl}${cacheBuster}` : `${imageUrl}?${cacheBuster}`;
      const response = await fetch(urlWithCacheBuster);
      this._isCameraReachable = response.ok;
    } catch (error) {
      this._isCameraReachable = false;
    }
  }

  updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);

    if ((changedProperties as any).has('_viewMode') && this._viewMode === 'mower') {
      this._updateMowerPosition();
      this._setupMowerResizeObserver();
    }
    if ((changedProperties as any).has('_viewMode') && this._viewMode !== 'mower') {
      this._mowerResizeObserver?.disconnect();
    }

    const hasValidMower = !!this.mower;
    if (hasValidMower && !this._hadValidMower && this._viewMode === 'mower') {
      this.updateComplete.then(() => {
        this._updateMowerPosition();
        this._setupMowerResizeObserver();
      });
    }
    this._hadValidMower = hasValidMower;

    if (this._isMapImageLoading && this._viewMode === 'map') {
      const img = this.shadowRoot?.querySelector('.map-image-entity') as HTMLImageElement | null;
      if (img?.complete && img.naturalWidth > 0) {
        this._isMapImageLoading = false;
        this._detectMapBackground(img);
      }
    }

    this._setupBadgeResizeObserver();
    this._measureStatusLabelTier();
    this._observeVectorContainer();
  }

  /** A tap on a zone offers to mow just that zone, unless the mower is working on it right now. */
  private _handleZoneTap(e: PointerEvent): void {
    const model = this._vectorModel;
    const container = this.shadowRoot?.querySelector('.map-container.vector') as HTMLElement | null;
    if (!model || !container) return;
    const rect = container.getBoundingClientRect();
    const px: [number, number] = [
      (e.clientX - rect.left - this._imgTranslateX) / this._imgScale,
      (e.clientY - rect.top - this._imgTranslateY) / this._imgScale,
    ];
    const { width, height } = this._vectorViewSize();
    const zone = model.zoneAt(model.fromScreen(px, width, height, VECTOR_MAP_INSETS));
    this._zoneDialog =
      zone && !this._isZoneInWork(zone.name) ? { name: zone.name, hash: zone.hash, area: zone.area } : undefined;
  }

  /** Name of the zone the mower is working on, undefined when the integration does not know it. */
  private _workZone(): string | undefined {
    if (!this._isMowerWorking) return undefined;
    const current = this._mowerSensor('work_area')?.trim();
    // The sensor also reports "path", "unknown" and "Not working" (its state when the hash is 0)
    return current && !['path', 'unknown', 'not working'].includes(current.toLowerCase()) ? current : undefined;
  }

  /** The zone of the running job; when the integration does not say which one, every zone counts as busy. */
  private _isZoneInWork(name: string): boolean {
    if (!this._isMowerWorking) return false;
    const current = this._workZone();
    return !current || current.toLowerCase() === name.trim().toLowerCase();
  }

  /**
   * The integration starts a job for selected zones via their area switches. They carry the zone's
   * hash as an attribute; when that does not match (hashes above 2^53 lose precision on the way to
   * the browser) the switch named after the zone is taken.
   */
  private _zoneSwitch(zone: { name: string; hash: number | null }): string | undefined {
    if (!this.hass) return undefined;
    // Configured switches first, then the ones on the mower's device, and without a usable
    // entity registry every area switch in HA
    const configured = this.config.zone_switches?.filter(Boolean) ?? [];
    let ids = configured;
    if (!ids.length) ids = siblingEntities(this.hass, this.config.entity, 'switch').map(([id]) => id);
    if (!ids.length) ids = Object.keys(this.hass.states).filter(id => id.startsWith('switch.'));
    const candidates = ids
      .map(id => ({ id, state: this.hass.states[id] }))
      .filter(c => c.state && c.state.attributes?.hash !== undefined);
    const byHash = candidates.find(c => zone.hash !== null && Number(c.state.attributes.hash) === zone.hash);
    if (byHash) return byHash.id;
    const name = zone.name.trim().toLowerCase();
    const byName = candidates.find(c => {
      const friendly = String(c.state.attributes.friendly_name ?? '')
        .trim()
        .toLowerCase();
      return !!name && (friendly === name || friendly.endsWith(` ${name}`));
    });
    if (byName) return byName.id;
    // One zone on the map and one configured switch: no ambiguity
    return configured.length === 1 && this._vectorModel?.zones.length === 1 ? configured[0] : undefined;
  }

  /** Sends the start and closes the dialog at once; errors from the integration show up as HA's own toast. */
  private _startZone(e: Event): void {
    e.stopPropagation();
    const dialog = this._zoneDialog;
    this._zoneDialog = undefined;
    if (!dialog) return;
    const area = this._zoneSwitch(dialog);
    if (!area) {
      fireEvent(this, 'hass-notification' as any, { message: localize('map.zone_not_found', { hass: this.hass }) });
      return;
    }
    this.hass
      .callService(MAMMOTION_DOMAIN, 'start_mow', { areas: [area] }, { entity_id: this.config.entity })
      .catch(() => undefined);
    this._followUpCommand();
  }

  private _renderZoneDialog() {
    const dialog = this._zoneDialog;
    if (!dialog || this._isZoneInWork(dialog.name)) return nothing;
    const stop = (e: Event) => e.stopPropagation();
    return html`
      <div class="vm-zone-dialog" @pointerdown=${stop} @pointerup=${stop} @dblclick=${stop}>
        <span class="vm-zone-name"
          >${displayZoneName(dialog.name, localize('map.area', { hass: this.hass }))}${dialog.area > 0 ? ` · ${Math.round(dialog.area)} m²` : ''}</span
        >
        <button class="vm-zone-start" @click=${this._startZone}>
          ${localize('map.mow_zone', { hass: this.hass })}
        </button>
        <button
          class="vm-zone-cancel"
          @click=${(e: Event) => {
            e.stopPropagation();
            this._zoneDialog = undefined;
          }}
        >
          ${localize('map.cancel', { hass: this.hass })}
        </button>
      </div>
    `;
  }

  /** Red when the mower reports an error, amber when it has not moved for a while during a job. */
  private _mowerAlert(): { level: 'error' | 'warning'; text: string } | null {
    if (this._resolveStateBehavior(this.mowerState) === 'error') {
      const message = this._mowerSensor('error_1_message');
      return { level: 'error', text: message || localize('status.error', { hass: this.hass }) };
    }
    // Standing still is only known while positions keep coming in (the report stream is running)
    if (
      this._resolveStateBehavior(this.mowerState) === 'mowing' &&
      Date.now() - this._lastReportAt < VECTOR_MAP_REPORT_MAX_AGE
    ) {
      const minutes = Math.floor((Date.now() - this._lastMovedAt) / 60000);
      if (minutes >= VECTOR_MAP_STUCK_MINUTES) {
        return {
          level: 'warning',
          text: localize('map.not_moving', { hass: this.hass }).replace('{n}', String(minutes)),
        };
      }
    }
    return null;
  }

  /** Keeps the rotation continuous (350° → 10° turns by 20°, not back by 340°) so the transition looks right. */
  private _continuousHeading(heading: number): number {
    const prev = this._displayHeading;
    if (prev === undefined) {
      this._displayHeading = heading;
      return heading;
    }
    let delta = ((((heading - prev) % 360) + 540) % 360) - 180;
    if (Math.abs(delta) < 0.01) delta = 0;
    this._displayHeading = prev + delta;
    return this._displayHeading;
  }

  /** Keeps the mower in the middle of the free map area while "follow" is on. */
  private _followMower(model: VectorMapModel | undefined, mower: LonLat | null, docked: boolean): void {
    if (!this._vectorFollow || !model || this._imgIsDragging || this._imgIsPinching) return;
    const point = model.mowerPoint(mower, docked);
    const { width, height } = this._vectorViewSize();
    if (!point || !width || !height) return;
    const [x, y] = model.toScreen(point, width, height, VECTOR_MAP_INSETS);
    const centerY = (VECTOR_MAP_INSETS.top + height - VECTOR_MAP_INSETS.bottom) / 2;
    this._imgTranslateX = width / 2 - this._imgScale * x;
    this._imgTranslateY = centerY - this._imgScale * y;
  }

  private _toggleFollow(e: Event): void {
    e.stopPropagation();
    this._vectorFollow = !this._vectorFollow;
    if (this._vectorFollow && this._imgScale < 2) {
      this._imgScale = 2.5;
    }
  }

  /** The map is fitted to the size of its own container, which can differ from the display area. */
  private _observeVectorContainer(): void {
    const el = this._viewMode === 'map' ? this.shadowRoot?.querySelector('.map-container.vector') : null;
    if (el === this._vectorObserved) return;
    this._vectorResizeObserver?.disconnect();
    this._vectorObserved = el ?? undefined;
    if (!el) return;
    this._vectorResizeObserver ??= new ResizeObserver(entries => {
      const rect = entries[entries.length - 1].contentRect;
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width > 0 && height > 0 && (width !== this._vectorSize.width || height !== this._vectorSize.height)) {
        this._vectorSize = { width, height };
      }
    });
    this._vectorResizeObserver.observe(el);
  }

  private _isCurrentlyDocked(state: string, isCharging: boolean): boolean {
    if (isCharging) {
      return true;
    }
    return this._resolveStateBehavior(state) === 'docked';
  }

  private _resolveStateBehavior(state: string): string {
    const userMap = this.config?.state_map ?? {};
    return userMap[state] ?? state;
  }

  setConfig(config: CompactLawnMowerCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    this.config = config;
    this._mapZoom = config.default_map_zoom ?? DEFAULT_MAP_ZOOM;
  }

  static getStubConfig(hass: HomeAssistant, entities: string[]): CompactLawnMowerCardConfig {
    const lawnMowerEntity = entities.find(entity => entity.startsWith('lawn_mower.'));

    const allEntities = Object.keys(hass.states);
    const fallbackEntity = allEntities.find(entity => entity.startsWith('lawn_mower.'));

    return {
      type: 'custom:compact-lawn-mower-card',
      entity: lawnMowerEntity || fallbackEntity || 'lawn_mower.example',
      battery_entity: '',
      charging_entity: '',
      camera_entity: '',
      progress_entity: '',
      default_view: 'mower',
    };
  }

  static async getConfigElement() {
    return document.createElement('compact-lawn-mower-card-editor');
  }

  static styles = compactLawnMowerCardStyles;

  get mower(): LawnMowerEntity | undefined {
    if (!this.hass || !this.config?.entity) {
      return undefined;
    }

    const entity = this.hass.states[this.config.entity];
    if (!entity) {
      return undefined;
    }

    return entity as LawnMowerEntity;
  }

  private _parsePercentage(rawValue: unknown): number | string {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return '-';
    }

    const numericValue = parseFloat(String(rawValue).replace(',', '.'));

    if (!isNaN(numericValue)) {
      return Math.round(Math.max(0, Math.min(100, numericValue)));
    }

    return '-';
  }

  get mowerState(): string {
    return this.mower?.state ?? 'unknown';
  }

  get batteryLevel(): number | string {
    const mowerAttributes = this.mower?.attributes;
    let rawValue: unknown;

    if (mowerAttributes?.battery_level !== undefined && mowerAttributes?.battery_level !== null) {
      rawValue = mowerAttributes.battery_level;
    } else if (this.config.battery_entity) {
      const batteryEntity = this.hass?.states[this.config.battery_entity];
      rawValue = batteryEntity ? (batteryEntity.attributes?.battery_level ?? batteryEntity.state) : undefined;
    }

    return this._parsePercentage(rawValue);
  }

  get progressLevel(): number | string {
    return this._parsePercentage(this._mowerSensor('progress'));
  }

  get chargingStatus(): boolean {
    return CompactLawnMowerCard._getChargingStatus(this.hass, this.mowerState, this.config.charging_entity);
  }

  get cameraEntity() {
    if (!this.config.camera_entity || !this.hass) {
      return undefined;
    }
    return this.hass.states[this.config.camera_entity];
  }

  get mapImageEntity() {
    if (!this.config.map_image_entity || !this.hass) {
      return undefined;
    }
    return this.hass.states[this.config.map_image_entity];
  }

  private async _executeCustomAction(customAction: CustomAction): Promise<void> {
    if (!customAction || !customAction.action || !this.hass) {
      return;
    }

    forwardHaptic('light');
    const action = customAction.action;

    if (action.action === 'call-service' || action.action === 'toggle') {
      if (this._feedbackTimeout) clearTimeout(this._feedbackTimeout);
      this._pendingActionName = customAction.name;
      this._actionFeedback = null;

      let feedbackStatus: 'success' | 'error' = 'success';
      try {
        if (action.action === 'call-service') {
          await this._executeServiceCall(action as ServiceCallActionConfig);
        } else {
          await toggleEntity(this.hass, (action as ToggleActionConfig).entity || this.config.entity);
        }
      } catch (error) {
        // Some integrations (Mammotion) report only that the reply went missing; the command itself was sent
        if ((error as { translation_key?: string })?.translation_key !== 'command_unconfirmed') {
          console.error('Error executing custom action:', error);
          this._showError(localize('error.action_failed', { hass: this.hass }) + ': ' + customAction.name);
          feedbackStatus = 'error';
        }
      }

      this._pendingActionName = null;
      this._actionFeedback = { name: customAction.name, status: feedbackStatus };
      if (feedbackStatus === 'success') this._followUpCommand();
      this._feedbackTimeout = setTimeout(
        () => {
          this._actionFeedback = null;
        },
        feedbackStatus === 'error' ? 2500 : 1500
      );
      return;
    }

    try {
      switch (action.action) {
        case 'navigate':
          navigate(this, (action as NavigateActionConfig).navigation_path);
          break;
        case 'url':
          window.open((action as UrlActionConfig).url_path, '_blank');
          break;
        case 'more-info':
          fireEvent(this, 'hass-more-info' as any, {
            entityId: (action as MoreInfoActionConfig).entity || this.config.entity,
          });
          break;
        case 'none':
          break;
        default:
          console.warn('Unsupported action type:', (action as any).action);
          break;
      }
    } catch (error) {
      console.error('Error executing custom action:', error);
      this._showError(localize('error.action_failed', { hass: this.hass }) + ': ' + customAction.name);
    }
  }

  private _executeServiceCall(action: ServiceCallActionConfig): Promise<void> {
    if (!action.service) {
      return Promise.reject(new Error('No service specified for action'));
    }

    const [domain, service] = action.service.split('.');
    if (!domain || !service) {
      return Promise.reject(new Error(`Invalid service format: ${action.service}`));
    }

    const serviceData = this._processTemplates(action.data || action.service_data || {});
    const target = this._processTemplates(action.target);

    return this.hass.callService(domain, service, serviceData, target);
  }

  private _processTemplates(obj: any): any {
    if (typeof obj === 'string') {
      let processedString = obj.replace(/\{\{\s*entity\s*\}\}/g, this.config.entity);

      const trimmed = processedString.trim();
      if (/^[-+]?\d+(\.\d+)?$/.test(trimmed) && !isNaN(parseFloat(trimmed))) {
        return parseFloat(trimmed);
      }

      return processedString;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this._processTemplates(item));
    }

    if (obj && typeof obj === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this._processTemplates(value);
      }
      return result;
    }

    return obj;
  }

  private _showError(message: string): void {
    fireEvent(this, 'hass-notification' as any, { message });
  }

  private _getMowerSVGClass(state: string): string {
    const classes: string[] = [];
    const displayState = this._getDisplayStatus(state);
    const behaviorState = displayState === 'charging' ? 'charging' : this._resolveStateBehavior(displayState);

    if (this._animationClass === 'driving-to-dock' || this._animationClass === 'driving-from-dock') {
      classes.push(this._animationClass, 'active');
    } else if (this._animationClass === 'startup') {
      classes.push('on-lawn-static', 'active', 'startup');
      if (behaviorState === 'returning') {
        classes.push('returning');
      }
    } else if (this._animationClass === 'pausing') {
      classes.push('on-lawn-static', 'pausing');
    } else {
      if (behaviorState === 'charging') {
        classes.push('docked-static', 'charging', 'charging-animated');
      } else if (behaviorState === 'docked') {
        classes.push('docked-static');
      } else if (behaviorState === 'mowing') {
        classes.push('on-lawn-static', 'active');
      } else if (behaviorState === 'paused') {
        classes.push('on-lawn-static', 'sleeping');
      } else if (behaviorState === 'returning') {
        classes.push('on-lawn-static', 'returning', 'active');
      } else if (behaviorState === 'error') {
        classes.push('on-lawn-static', 'error');
      }
    }

    return classes.join(' ');
  }

  private _statusClass(state: string): string {
    const resolved = this._resolveStateBehavior(state);
    if (resolved === 'charging') return 'charging';
    if (resolved === 'mowing') return 'mowing';
    if (resolved === 'paused') return 'paused';
    if (resolved === 'error') return 'error';
    if (resolved === 'returning') return 'returning';
    if (resolved === 'docked') return 'docked';
    return '';
  }

  private _getDisplayStatus(state: string, charging?: boolean): string {
    const isCharging = charging === undefined ? this.chargingStatus : charging;
    if (isCharging) {
      return 'charging';
    }
    return state;
  }

  private _getTranslatedStatus(state: string): string {
    const stateLower = state.toLowerCase();

    if (CARD_TRANSLATED_STATES.has(stateLower)) {
      const translated = localize(`status.${stateLower}`, { hass: this.hass });
      if (translated !== `status.${stateLower}`) return translated;
    }

    if (this.hass && this.config?.entity) {
      const entityEntry = (this.hass as HassWithEntities).entities?.[this.config.entity];
      if (entityEntry) {
        const platform = entityEntry.platform;
        const translationKey = entityEntry.translation_key ?? 'mower';
        const hassTranslated = this.hass.localize(
          `component.${platform}.entity.lawn_mower.${translationKey}.state.${stateLower}`
        );
        if (hassTranslated) return hassTranslated;
      }
    }

    const mappedState = this.config?.state_map?.[stateLower];
    if (mappedState && CARD_TRANSLATED_STATES.has(mappedState)) {
      const translated = localize(`status.${mappedState}`, { hass: this.hass });
      if (translated !== `status.${mappedState}`) return translated;
    }

    return state.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
  }

  private _getStatusLabelCandidates(state: string): string[] {
    const full = this._getTranslatedStatus(state);
    if (this._resolveStateBehavior(state).toLowerCase() !== 'returning') return [full];
    const short = localize('status.returning_short', { hass: this.hass });
    return short === 'status.returning_short' || short === full ? [full] : [full, short];
  }

  private _getStatusLabel(state: string): string {
    const candidates = this._getStatusLabelCandidates(state);
    if (this._statusLabelTier === 0) return candidates[0];
    if (this._statusLabelTier >= candidates.length) return '';
    return candidates[this._statusLabelTier];
  }

  private _measureStatusLabelTier(): void {
    const row = this._badgeRow;
    const ring = this._statusRing;
    if (!row || !ring) return;

    const available = row.clientWidth - this._badgeRowFixedWidth(row);
    if (available <= 0) return;

    const candidates = this._getStatusLabelCandidates(this.mowerState);
    const iconOnlyWidth = this._statusRingChromeWidth(ring);
    if (iconOnlyWidth <= 0) return;

    let tier = candidates.length;
    for (let i = 0; i < candidates.length; i++) {
      const needed = iconOnlyWidth + this._measureStatusTextWidth(candidates[i], ring);
      const budget = i < this._statusLabelTier ? available - STATUS_LABEL_HYSTERESIS : available;
      if (needed <= budget) {
        tier = i;
        break;
      }
    }

    if (tier !== this._statusLabelTier) this._statusLabelTier = tier;
  }

  /**
   * Job sensors: the configured entity, otherwise the Mammotion sensor of the mower's device
   * with that translation key.
   */
  private _mowerSensor(key: 'area' | 'left_time' | 'work_area' | 'error_1_message' | 'progress'): string | undefined {
    if (!this.hass) return undefined;
    const configured = {
      area: this.config.task_area_entity,
      left_time: this.config.remaining_time_entity,
      work_area: this.config.work_zone_entity,
      error_1_message: this.config.error_entity,
      progress: this.config.progress_entity,
    }[key];
    const entityId =
      configured ||
      (isMammotionEntity(this.hass, this.config.entity)
        ? findSiblingSensor(this.hass, this.config.entity, key)
        : undefined);
    const value = entityId ? this.hass.states[entityId]?.state : undefined;
    return value === undefined || value === 'unknown' || value === 'unavailable' ? undefined : value;
  }

  /** "55 / 103 m² · 1 h 2 min" while a job is running: mown and total area of the job, time left. */
  private _jobDetail(): string {
    if (!this._isMowerWorking) return '';
    const parts: string[] = [];
    // The integration's area sensor is the total area of the job, the mown part follows from the progress
    const total = Number(this._mowerSensor('area'));
    const progress = Number(this.progressLevel);
    if (total > 0) {
      parts.push(
        Number.isFinite(progress)
          ? `${Math.round((total * progress) / 100)} / ${Math.round(total)} m²`
          : `${Math.round(total)} m²`
      );
    }
    const left = Number(this._mowerSensor('left_time'));
    if (left > 0) parts.push(left >= 60 ? `${Math.floor(left / 60)} h ${left % 60} min` : `${left} min`);
    return parts.join(' · ');
  }

  private _renderProgressBadge(progress: number, detail = ''): TemplateResult {
    const value = Math.max(0, Math.min(100, progress));
    const radius = 8;
    const circumference = 2 * Math.PI * radius;
    const mowing = this._resolveStateBehavior(this.mowerState) === 'mowing';
    // Hue runs from amber at the start to lawn green when the job is done
    const hue = Math.round(35 + (value / 100) * 85);

    return html`
      <div
        class="progress-badge ${mowing ? 'is-mowing' : ''} ${value >= 100 ? 'is-done' : ''}"
        style="--progress: ${value}%; --progress-hue: ${hue};"
      >
        <div class="progress-fill"></div>
        <svg class="badge-icon progress-ring" viewBox="0 0 22 22" aria-hidden="true">
          <circle class="progress-ring-track" cx="11" cy="11" r=${radius}></circle>
          <circle
            class="progress-ring-value"
            cx="11"
            cy="11"
            r=${radius}
            stroke-dasharray=${circumference}
            stroke-dashoffset=${circumference * (1 - value / 100)}
          ></circle>
          ${value >= 100 ? svg`<path class="progress-ring-check" d="M7.2 11.3l2.5 2.5 5-5.2"></path>` : nothing}
        </svg>
        <span class="progress-text"
          >${value}%${detail ? html`<span class="progress-detail"> · ${detail}</span>` : nothing}</span
        >
      </div>
    `;
  }

  private _badgeRowFixedWidth(row: HTMLElement): number {
    const style = getComputedStyle(row);
    let used = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const progress = row.querySelector<HTMLElement>('.progress-badge');
    if (progress) {
      const gap = parseFloat(style.columnGap || '0');
      const rendered = progress.getBoundingClientRect().width;
      used += Math.max(rendered, progress.scrollWidth) + (Number.isNaN(gap) ? 0 : gap);
    }
    return used;
  }

  private _statusRingChromeWidth(ring: HTMLElement): number {
    const style = getComputedStyle(ring);
    const icon = ring.querySelector<HTMLElement>('.status-icon');
    const iconWidth = icon ? icon.getBoundingClientRect().width : 0;
    const isIconOnly = ring.classList.contains('icon-only');
    const gap = isIconOnly ? STATUS_BADGE_GAP : parseFloat(style.columnGap || '0');
    const labelPaddingX = parseFloat(style.getPropertyValue('--status-ring-padding-x'));
    const sidePadding =
      isIconOnly && !Number.isNaN(labelPaddingX)
        ? labelPaddingX * 2
        : parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    return (
      sidePadding +
      parseFloat(style.borderLeftWidth) +
      parseFloat(style.borderRightWidth) +
      iconWidth +
      (Number.isNaN(gap) ? 0 : gap)
    );
  }

  private _measureStatusTextWidth(text: string, ring: HTMLElement): number {
    if (!text) return 0;
    const probe = ring.querySelector<HTMLElement>('.status-text');
    const style = getComputedStyle(probe ?? ring);
    const fontSize = probe ? style.fontSize : `${STATUS_TEXT_FONT_SIZE}px`;
    const fontWeight = probe ? style.fontWeight : `${STATUS_TEXT_FONT_WEIGHT}`;
    const spacing = probe ? parseFloat(style.letterSpacing) : STATUS_TEXT_LETTER_SPACING;
    const ctx = CompactLawnMowerCard._textMeasureContext();
    if (!ctx) return text.length * parseFloat(fontSize) * 0.62;
    ctx.font = `${fontWeight} ${fontSize} ${style.fontFamily}`;
    return ctx.measureText(text).width + (Number.isNaN(spacing) ? 0 : spacing * text.length);
  }

  private static _measureCanvas?: HTMLCanvasElement;

  private static _textMeasureContext(): CanvasRenderingContext2D | null {
    if (!CompactLawnMowerCard._measureCanvas) {
      CompactLawnMowerCard._measureCanvas = document.createElement('canvas');
    }
    return CompactLawnMowerCard._measureCanvas.getContext('2d');
  }

  private _getStatusIcon(state: string): string {
    if (this.chargingStatus) return this._chargingIcon();
    const resolved = this._resolveStateBehavior(state);
    if (resolved === 'mowing') return 'mdi:robot-mower';
    if (resolved === 'returning') return 'mdi:home-import-outline';
    if (resolved === 'error') return 'mdi:alert-circle';
    if (resolved === 'paused') return 'mdi:pause-circle';
    if (resolved === 'docked') return 'mdi:home-circle';
    return 'mdi:robot';
  }

  /** Charging battery filled to the current level, in steps of ten as MDI has them. */
  private _chargingIcon(): string {
    const level = Number(this.batteryLevel);
    if (!Number.isFinite(level) || level < 5) return 'mdi:battery-charging-outline';
    return `mdi:battery-charging-${Math.min(100, Math.max(10, Math.round(level / 10) * 10))}`;
  }

  private _getLEDColor(state: string): string {
    if (this.chargingStatus) return 'rgb(184, 79, 27)';
    const resolved = this._resolveStateBehavior(state);
    if (resolved === 'mowing') return '#e8930f';
    if (resolved === 'returning') return '#1e88e5';
    if (resolved === 'error') return '#d32f2f';
    return 'var(--disabled-text-color, #9e9e9e)';
  }

  private _getChargingStationColor(_state: string): string {
    if (this.chargingStatus) return 'rgb(184, 79, 27)';
    return 'var(--disabled-text-color)';
  }

  private _getBatteryColor(battery: number): string {
    if (battery > 50) return 'var(--success-color, #4caf50)';
    if (battery > 20) return 'var(--warning-color, #ff9800)';
    return 'var(--error-color, #f44336)';
  }

  private _renderSleepAnimation(): TemplateResult | typeof nothing {
    const state = this.mowerState;
    const resolvedState = this._resolveStateBehavior(state);
    const shouldShowSleep = resolvedState === 'paused' && !this.chargingStatus && this._viewMode === 'mower';

    if (!shouldShowSleep) return nothing;

    return html`
      <div class="sleep-animation">
        <span class="sleep-z">z</span>
        <span class="sleep-z">z</span>
        <span class="sleep-z">Z</span>
      </div>
    `;
  }

  private _renderErrorView(containerClass: string, errorClass: string, icon: string, message: string): TemplateResult {
    return html`
      <div class=${containerClass}>
        <div class=${errorClass}>
          <ha-icon icon=${icon}></ha-icon>
          <span>${message}</span>
        </div>
      </div>
    `;
  }

  private _renderMowerDisplay() {
    switch (this._viewMode) {
      case 'camera':
        return this._renderCameraView();
      case 'map':
        return this._renderMapView();
      case 'mower':
      default:
        return this._renderMowerModel();
    }
  }

  private _renderCameraView() {
    if (this._isPopupOpen) {
      return html`
        <div class="camera-container camera-in-popup" @click=${this._openCameraPopup}>
          <ha-icon icon="mdi:fullscreen-exit"></ha-icon>
        </div>
      `;
    }

    if (this._forceCameraRefresh) {
      return html`
        <div class="camera-container is-loading">
          <div class="loading-indicator">
            <div class="loader"></div>
          </div>
        </div>
      `;
    }
    if (!this.cameraEntity || this.cameraEntity.state === 'unavailable') {
      return this._renderErrorView(
        'camera-container',
        'camera-error',
        'mdi:camera-off',
        localize('camera.not_available', { hass: this.hass })
      );
    }

    if (!this._isCameraReachable) {
      return this._renderErrorView(
        'camera-container',
        'camera-error',
        'mdi:lan-disconnect',
        localize('camera.not_reachable', { hass: this.hass })
      );
    }

    const fitMode = this.config.camera_fit_mode || 'cover';

    return html`
      <div
        class="camera-container clickable ${this._isCameraLoading ? 'is-loading' : ''}"
        @click=${this._openCameraPopup}
      >
        ${
          this._isCameraLoading
            ? html`
                <div class="loading-indicator">
                  <div class="loader"></div>
                </div>
              `
            : ''
        }
        <ha-camera-stream
          class="fit-mode-${fitMode}"
          .hass=${this.hass}
          .stateObj=${this.cameraEntity}
          .fitMode=${fitMode}
          muted
          style="opacity: ${this._isCameraLoading ? 0.3 : 1};"
        ></ha-camera-stream>
        <div class="camera-overlay" style="opacity: ${this._isCameraLoading ? 0 : 1};"></div>
      </div>
    `;
  }

  private _openCameraPopup() {
    if (!this.cameraEntity || this._currentPopup) return;

    this._isPopupOpen = true;
    const popup = document.createElement('camera-popup') as CameraPopup;

    popup.hass = this.hass;
    popup.entityId = this.config.camera_entity;
    popup.title = localize('camera.camera_title', { hass: this.hass });
    popup.onClose = () => this._closePopup();
    popup.isReachable = this._isCameraReachable;

    this._currentPopup = popup;

    document.body.appendChild(popup);

    popup.addEventListener('click', () => this._closePopup());
  }

  private _closePopup() {
    if (this._currentPopup && this._currentPopup.parentNode) {
      document.body.removeChild(this._currentPopup);
      this._currentPopup = undefined;
      this._isPopupOpen = false;

      this._forceCameraRefresh = true;
      this.updateComplete.then(() => {
        this._forceCameraRefresh = false;
        this._updateCameraState(true);
      });
    }
  }

  private _handleMapError(): void {
    console.error('Compact Lawn Mower Card: Failed to load map image.');
  }

  private _getHaMapShadowRoot(): ShadowRoot | null {
    const haMap = (this._mapCardElement as any)?.shadowRoot?.querySelector('ha-map');
    return (haMap as any)?.shadowRoot ?? null;
  }

  private _handleHaMapZoomIn(e: Event): void {
    e.stopPropagation();
    (this._getHaMapShadowRoot()?.querySelector('.leaflet-control-zoom-in') as HTMLElement)?.click();
  }

  private _handleHaMapZoomOut(e: Event): void {
    e.stopPropagation();
    (this._getHaMapShadowRoot()?.querySelector('.leaflet-control-zoom-out') as HTMLElement)?.click();
  }

  private _handleZoom(e: Event, direction: 'in' | 'out'): void {
    e.stopPropagation();
    const delta = direction === 'in' ? 1 : -1;
    this._mapZoom = Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, this._mapZoom + delta));
  }

  private _getDistance(p1: PointerEvent, p2: PointerEvent): number {
    const dx = p1.clientX - p2.clientX;
    const dy = p1.clientY - p2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private _applyImgTransformDirect(): void {
    const layer = this.shadowRoot?.querySelector('.map-image-transform-layer') as HTMLElement | null;
    if (layer) {
      layer.style.transform = `translate(${this._imgTranslateX}px, ${this._imgTranslateY}px) scale(${this._imgScale})`;
      layer.style.setProperty('--clm-zoom', String(this._imgScale));
    }
  }

  private _constrainPan(): void {
    const container = this._imgContainer ?? (this.shadowRoot?.querySelector('.map-container') as HTMLElement | null);
    if (!container) return;
    const cW = container.clientWidth;
    const cH = container.clientHeight;
    const minX = -(cW * this._imgScale - cW * 0.2);
    const maxX = cW * 0.8;
    const minY = -(cH * this._imgScale - cH * 0.2);
    const maxY = cH * 0.8;
    this._imgTranslateX = Math.max(minX, Math.min(maxX, this._imgTranslateX));
    this._imgTranslateY = Math.max(minY, Math.min(maxY, this._imgTranslateY));
  }

  private _applyZoom(factor: number, originX: number, originY: number): void {
    const rawScale = this._imgScale * factor;
    const newScale = Math.max(IMG_ZOOM_MIN, Math.min(IMG_ZOOM_MAX, rawScale));
    const actualFactor = newScale / this._imgScale;
    this._imgTranslateX = originX - actualFactor * (originX - this._imgTranslateX);
    this._imgTranslateY = originY - actualFactor * (originY - this._imgTranslateY);
    this._imgScale = newScale;
    this._constrainPan();
  }

  private _handleImgWheel(e: WheelEvent): void {
    if (!e.ctrlKey) return;
    e.preventDefault();
    e.stopPropagation();
    this._imgContainer = e.currentTarget as HTMLElement;
    const rect = this._imgContainer.getBoundingClientRect();
    const factor = 1 + (e.deltaY < 0 ? 1 : -1) * IMG_ZOOM_STEP_WHEEL;
    this._applyZoom(factor, e.clientX - rect.left, e.clientY - rect.top);
    this._applyImgTransformDirect();
    this._saveImgTransform();
  }

  private _handleImgPointerDown(e: PointerEvent): void {
    this._vectorFollow = false;
    this._tapStart = this._imgActivePointers.size === 0 ? { x: e.clientX, y: e.clientY, t: Date.now() } : undefined;
    const container = e.currentTarget as HTMLElement;
    this._imgContainer = container;
    container.setPointerCapture(e.pointerId);
    this._imgActivePointers.set(e.pointerId, e);

    if (this._imgActivePointers.size === 1) {
      this._imgIsDragging = true;
      this._imgIsPinching = false;
      this._imgDragStartX = e.clientX;
      this._imgDragStartY = e.clientY;
      this._imgDragStartTranslateX = this._imgTranslateX;
      this._imgDragStartTranslateY = this._imgTranslateY;
    } else if (this._imgActivePointers.size === 2) {
      this._imgIsDragging = false;
      this._imgIsPinching = true;
      const [p1, p2] = [...this._imgActivePointers.values()];
      this._imgPinchStartDistance = this._getDistance(p1, p2);
      this._imgPinchStartScale = this._imgScale;
      const rect = container.getBoundingClientRect();
      this._imgPinchMidX = (p1.clientX + p2.clientX) / 2 - rect.left;
      this._imgPinchMidY = (p1.clientY + p2.clientY) / 2 - rect.top;
      this._imgPinchStartTranslateX = this._imgTranslateX;
      this._imgPinchStartTranslateY = this._imgTranslateY;
    }
  }

  private _handleImgPointerMove(e: PointerEvent): void {
    if (!this._imgActivePointers.has(e.pointerId)) return;
    this._imgActivePointers.set(e.pointerId, e);

    if (this._imgIsPinching && this._imgActivePointers.size === 2) {
      const [p1, p2] = [...this._imgActivePointers.values()];
      const dist = this._getDistance(p1, p2);
      const rawScale = this._imgPinchStartScale * (dist / this._imgPinchStartDistance);
      const newScale = Math.max(IMG_ZOOM_MIN, Math.min(IMG_ZOOM_MAX, rawScale));
      const scaleDelta = newScale / this._imgPinchStartScale;
      this._imgTranslateX = this._imgPinchMidX - scaleDelta * (this._imgPinchMidX - this._imgPinchStartTranslateX);
      this._imgTranslateY = this._imgPinchMidY - scaleDelta * (this._imgPinchMidY - this._imgPinchStartTranslateY);
      this._imgScale = newScale;
      this._constrainPan();
      this._applyImgTransformDirect();
      return;
    }

    if (this._imgIsDragging) {
      const dx = e.clientX - this._imgDragStartX;
      const dy = e.clientY - this._imgDragStartY;
      this._imgTranslateX = this._imgDragStartTranslateX + dx;
      this._imgTranslateY = this._imgDragStartTranslateY + dy;
      this._constrainPan();
      this._applyImgTransformDirect();
    }
  }

  private _handleImgPointerUp(e: PointerEvent): void {
    const tap = this._tapStart;
    this._tapStart = undefined;
    if (
      tap &&
      e.type === 'pointerup' &&
      this._isVectorMap &&
      Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 6 &&
      Date.now() - tap.t < 500
    ) {
      this._handleZoneTap(e);
    }
    this._imgActivePointers.delete(e.pointerId);
    if (this._imgActivePointers.size === 0) {
      this._imgIsDragging = false;
      this._imgIsPinching = false;
      this._saveImgTransform();
    } else if (this._imgActivePointers.size === 1) {
      this._imgIsPinching = false;
    }
  }

  private _handleImgZoomButton(e: Event, direction: 'in' | 'out'): void {
    e.stopPropagation();
    const container = this.shadowRoot?.querySelector('.map-container') as HTMLElement | null;
    if (!container) return;
    this._imgContainer = container;
    this._applyZoom(
      direction === 'in' ? 1 + IMG_ZOOM_STEP_BUTTON : 1 - IMG_ZOOM_STEP_BUTTON,
      container.clientWidth / 2,
      container.clientHeight / 2
    );
    this._applyImgTransformDirect();
    this._saveImgTransform();
  }

  private _handleImgReset(e: Event): void {
    e.stopPropagation();
    this._vectorFollow = false;
    this._imgScale = 1;
    this._imgTranslateX = 0;
    this._imgTranslateY = 0;
    this._applyImgTransformDirect();
    this._saveImgTransform();
  }

  private _handleImgDblClick(e: MouseEvent): void {
    e.stopPropagation();
    this._imgScale = 1;
    this._imgTranslateX = 0;
    this._imgTranslateY = 0;
    this._applyImgTransformDirect();
    this._saveImgTransform();
  }

  private get _imgTransformKey(): string | undefined {
    if (this._isVectorMap) {
      return this.config?.entity ? `clm_vec_${this.config.entity}` : undefined;
    }
    return this.config?.map_image_entity ? `clm_img_${this.config.map_image_entity}` : undefined;
  }

  private _saveImgTransform(): void {
    const key = this._imgTransformKey;
    if (!key || (this._isVectorMap && this.config.map_keep_view === false)) return;
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ scale: this._imgScale, x: this._imgTranslateX, y: this._imgTranslateY })
      );
    } catch {}
  }

  private _restoreImgTransform(): void {
    const key = this._imgTransformKey;
    if (!key || (this._isVectorMap && this.config.map_keep_view === false)) return;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const { scale, x, y } = JSON.parse(stored);
        if (typeof scale === 'number') this._imgScale = Math.max(IMG_ZOOM_MIN, Math.min(IMG_ZOOM_MAX, scale));
        if (typeof x === 'number') this._imgTranslateX = x;
        if (typeof y === 'number') this._imgTranslateY = y;
      }
    } catch {}
  }

  private _restoreMapBackground(): void {
    if (!this.config?.map_image_entity) {
      this._mapImageBgColor = null;
      return;
    }
    this._mapImageBgColor = readCachedMapBackground(this.config.map_image_entity);
  }

  private _detectMapBackground(img: HTMLImageElement): void {
    const entityId = this.config?.map_image_entity;

    if (!entityId || this.config.map_image_bg_auto === false || this._mapBgDetectedFor === entityId) {
      return;
    }

    this._mapBgDetectedFor = entityId;

    const result = detectEdgeColor(img);

    if (result.type === 'unknown') {
      return;
    }

    if (result.type === 'transparent') {
      this._mapImageBgColor = THEME_BACKGROUND;
      return;
    }

    this._mapImageBgColor = result.value;
    cacheMapBackground(entityId, result.value);
  }

  private _resolveMapBackground(): string | null {
    if (this.config.map_image_bg_auto === false) {
      return this._toCssColor(this.config.map_image_bg_color);
    }
    return this._mapImageBgColor;
  }

  private _renderMowerModel() {
    const state = this.mowerState;
    const battery = Number(this.batteryLevel) || 0;
    const batteryColor = this._getBatteryColor(battery);

    const ringRadius = 10;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringStrokeOffset = ringCircumference * (1 - battery / 100);

    const mowerModel = this.config.mower_model || 'default';
    const renderFunction = getGraphics(mowerModel as MowerModel);

    return renderFunction(
      state,
      this._getMowerSVGClass(state),
      this._getLEDColor(state),
      batteryColor,
      ringCircumference,
      ringStrokeOffset,
      this._getChargingStationColor(state)
    );
  }

  private _renderMapImageView() {
    const imageEntity = this.mapImageEntity;

    if (!imageEntity) {
      return this._renderErrorView(
        'map-container',
        'map-error',
        'mdi:image-off-outline',
        localize('map.image_not_available', { hass: this.hass })
      );
    }

    if (imageEntity.state === 'unavailable') {
      return this._renderErrorView(
        'map-container',
        'map-error',
        'mdi:image-broken-variant',
        localize('map.image_unavailable', { hass: this.hass })
      );
    }

    if (this._mapImageError) {
      return this._renderErrorView(
        'map-container',
        'map-error',
        'mdi:image-broken-variant',
        localize('map.image_load_error', { hass: this.hass })
      );
    }

    const imageUrl = buildImageUrl(this.config.map_image_entity as string, imageEntity.attributes.entity_picture);

    const cacheBustedUrl = imageUrl.includes('?')
      ? `${imageUrl}&_t=${imageEntity.last_updated}`
      : `${imageUrl}?_t=${imageEntity.last_updated}`;

    const backgroundColor = this._resolveMapBackground();

    return html`
      <div
        class="map-container pannable ${this._isMapImageLoading ? 'is-loading' : ''}"
        style="touch-action: none;${backgroundColor ? ` --clm-map-bg: ${backgroundColor};` : ''}"
        @wheel=${this._handleImgWheel}
        @pointerdown=${this._handleImgPointerDown}
        @pointermove=${this._handleImgPointerMove}
        @pointerup=${this._handleImgPointerUp}
        @pointercancel=${this._handleImgPointerUp}
        @dblclick=${this._handleImgDblClick}
      >
        ${this._isMapImageLoading ? html`<div class="loading-indicator"><div class="loader"></div></div>` : ''}
        <div
          class="map-image-transform-layer"
          style="transform: translate(${this._imgTranslateX}px, ${this._imgTranslateY}px) scale(${
            this._imgScale
          }); transform-origin: 0 0;"
        >
          <img
            class="map-image map-image-entity"
            src="${cacheBustedUrl}"
            alt="Mowing Map"
            draggable="false"
            @load=${(e: Event) => {
              this._isMapImageLoading = false;
              this._mapImageError = false;
              this._detectMapBackground(e.target as HTMLImageElement);
            }}
            @error=${() => {
              this._isMapImageLoading = false;
              this._mapImageError = true;
            }}
            style="opacity: ${this._isMapImageLoading ? 0 : 1};"
          />
        </div>
        ${!this._isMapImageLoading ? this._renderImgControls() : nothing}
      </div>
    `;
  }

  private _renderImgControls(): TemplateResult {
    return html`<div class="map-controls-wrapper">
      <div class="map-controls">
        <button
          class="map-control-button"
          @pointerdown=${(e: PointerEvent) => e.stopPropagation()}
          @dblclick=${(e: MouseEvent) => e.stopPropagation()}
          @click=${(e: Event) => this._handleImgZoomButton(e, 'in')}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
        <button
          class="map-control-button"
          @pointerdown=${(e: PointerEvent) => e.stopPropagation()}
          @dblclick=${(e: MouseEvent) => e.stopPropagation()}
          @click=${(e: Event) => this._handleImgZoomButton(e, 'out')}
        >
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <button
          class="map-control-button"
          @pointerdown=${(e: PointerEvent) => e.stopPropagation()}
          @dblclick=${(e: MouseEvent) => e.stopPropagation()}
          @click=${(e: Event) => this._handleImgReset(e)}
        >
          <ha-icon icon="mdi:fit-to-screen-outline"></ha-icon>
        </button>
        ${
          this._isVectorMap
            ? html`<button
                class="map-control-button ${this._vectorFollow ? 'active' : ''}"
                aria-label=${localize('map.follow', { hass: this.hass })}
                @pointerdown=${(e: PointerEvent) => e.stopPropagation()}
                @dblclick=${(e: MouseEvent) => e.stopPropagation()}
                @click=${(e: Event) => this._toggleFollow(e)}
              >
                <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
              </button>`
            : nothing
        }
      </div>
    </div>`;
  }

  // ---------------------------------------------------------------------------
  // Vector map (Mammotion GeoJSON)
  // ---------------------------------------------------------------------------

  private get _isVectorMap(): boolean {
    return this.config?.map_source === 'mammotion';
  }

  /** Size the map is fitted to: its own container, before the first measurement the display area. */
  private _vectorViewSize(): { width: number; height: number } {
    return {
      width: this._vectorSize.width || this._mapWidth,
      height: this._vectorSize.height || this._mapHeight,
    };
  }

  /** A job is running or interrupted: not docked, not idle after a finished job, not charging. */
  private get _isMowerWorking(): boolean {
    return !this.chargingStatus && VECTOR_MAP_WORKING_STATES.has(this._resolveStateBehavior(this.mowerState));
  }

  private _vectorTrackerEntity(): string | undefined {
    if (this.config.map_entity) {
      return this.config.map_entity;
    }
    if (!this.hass || !this.config.entity) {
      return undefined;
    }
    if (this._vectorTrackerLookup?.entity !== this.config.entity || !this._vectorTrackerLookup.tracker) {
      this._vectorTrackerLookup = {
        entity: this.config.entity,
        tracker: findSiblingTracker(this.hass, this.config.entity),
      };
    }
    return this._vectorTrackerLookup.tracker;
  }

  private _startVectorMap(): void {
    const entityId = this.config?.entity;
    if (!entityId) return;

    this._stopVectorMap();
    const cached = getCachedBase(entityId);
    const trail = getTrail(entityId);

    if (cached?.base) {
      this._vectorLayers = { base: cached.base, trail: trail ? this._trailLayer(trail) : null };
      this._vectorStatus = cached.base.features.length ? 'ready' : 'empty';
    } else {
      this._vectorLayers = { base: null, trail: null };
      this._vectorStatus = 'loading';
    }

    if (!cached?.base || Date.now() - cached.at > VECTOR_MAP_BASE_TTL) {
      this._fetchVectorBase();
    }
    // A trail kept from an earlier visit may belong to a finished job, so its start is checked again
    this._refreshMowTrail(true);
    this._vectorTimer = window.setInterval(() => this._refreshMowTrail(), VECTOR_MAP_TRAIL_INTERVAL);
  }

  private _stopVectorMap(): void {
    if (this._vectorTimer) {
      clearInterval(this._vectorTimer);
      this._vectorTimer = undefined;
    }
  }

  private async _fetchVectorBase(): Promise<void> {
    const entityId = this.config?.entity;
    if (!this.hass || !entityId || this._vectorBaseBusy) return;

    this._vectorBaseBusy = true;
    try {
      const base = await fetchGeoJson(this.hass, MAMMOTION_DOMAIN, 'get_geojson', entityId);
      setCachedBase(entityId, base);
      reportStreamStartedAt.set(entityId, Date.now());
      if (entityId !== this.config.entity) return;
      this._vectorLayers = { ...this._vectorLayers, base };
      this._vectorStatus = base?.features.length ? 'ready' : 'empty';
    } catch (err) {
      console.warn('Compact Lawn Mower Card: Failed to load Mammotion map.', err);
      if (!this._vectorLayers.base) {
        this._vectorStatus = 'error';
      }
    } finally {
      this._vectorBaseBusy = false;
    }
  }

  /**
   * The integration reports status and position every few seconds only while its report stream is
   * running, and `get_geojson` is the service that starts it (for five minutes). Without it a change
   * of state shows up late, unless the Mammotion app happens to be open.
   */
  private async _keepReportStream(entityId: string, force = false): Promise<void> {
    if (!this.hass) return;
    if (!force && Date.now() - (reportStreamStartedAt.get(entityId) ?? 0) < VECTOR_MAP_STREAM_KEEPALIVE) return;
    reportStreamStartedAt.set(entityId, Date.now());
    const base = await fetchGeoJson(this.hass, MAMMOTION_DOMAIN, 'get_geojson', entityId).catch(() => undefined);
    // The zones come along anyway, so the map view does not have to load them again
    if (base) setCachedBase(entityId, base);
  }

  /** Keeps the report stream running while the card is visible, in every view and mower state. */
  private _startLiveUpdates(): void {
    this._stopLiveUpdates();
    this._liveTimer = window.setInterval(this._liveTick, LIVE_UPDATES_CHECK_INTERVAL);
    document.addEventListener('visibilitychange', this._liveTick);
    this.updateComplete.then(this._liveTick);
  }

  private _stopLiveUpdates(): void {
    if (this._liveTimer) {
      clearInterval(this._liveTimer);
      this._liveTimer = undefined;
    }
    document.removeEventListener('visibilitychange', this._liveTick);
    this._followUpTimers.forEach(timer => clearTimeout(timer));
    this._followUpTimers = [];
  }

  private get _hasLiveUpdates(): boolean {
    const entityId = this.config?.entity;
    return (
      !!entityId && this.config.live_updates !== false && (this._isVectorMap || isMammotionEntity(this.hass, entityId))
    );
  }

  private _liveTick = (): void => {
    if (!this._hasLiveUpdates || !this.isConnected || document.visibilityState !== 'visible') return;
    this._keepReportStream(this.config.entity);
  };

  /**
   * Away from mowing the integration answers get_geojson with a single report instead of a stream,
   * so after a command the card asks again until the mower has switched and its stream runs.
   */
  private _followUpCommand(): void {
    if (!this._hasLiveUpdates) return;
    const entityId = this.config.entity;
    this._followUpTimers.forEach(timer => clearTimeout(timer));
    this._followUpTimers = LIVE_UPDATES_FOLLOW_UP.map(delay =>
      window.setTimeout(() => this._keepReportStream(entityId, true), delay)
    );
  }

  private _trailLayer(trail: MowTrail): VectorMapLayers['trail'] {
    return { lines: trail.lines(), head: trail.head };
  }

  /** Adds a position the card just received to the trail without waiting for the next history fetch. */
  private _pushLivePosition(tracker: HassEntity): void {
    const trail = getTrail(this.config.entity);
    const pos = trackerPosition(tracker);
    if (!trail || !pos || !this._isMowerWorking) return;
    if (trail.pushLive(pos.lon, pos.lat, tracker.last_updated)) {
      this._vectorLayers = { ...this._vectorLayers, trail: this._trailLayer(trail) };
    }
  }

  /**
   * Keeps the driven path of the running job up to date: positions from the recorder history since
   * the job started, and the mower's own recent line from the integration on top.
   */
  private async _refreshMowTrail(verifyStart = false): Promise<void> {
    const entityId = this.config?.entity;
    if (!this.hass || !entityId || this._trailBusy || this.config.map_show_path === false) return;

    if (!this._isMowerWorking) {
      setTrail(entityId, undefined);
      if (this._vectorLayers.trail) this._vectorLayers = { ...this._vectorLayers, trail: null };
      return;
    }

    this._trailBusy = true;
    this._trailRefreshedAt = Date.now();
    try {
      let trail = getTrail(entityId);
      if (!trail || verifyStart) {
        const start = await findJobStart(this.hass, entityId, state =>
          VECTOR_MAP_WORKING_STATES.has(this._resolveStateBehavior(state))
        );
        if (!trail || Math.abs(trail.jobStart - start) > 1000) {
          trail = new MowTrail(start);
          setTrail(entityId, trail);
        }
      }

      const trackerId = this._vectorTrackerEntity();
      const [head, extended] = await Promise.all([
        fetchGeoJson(this.hass, MAMMOTION_DOMAIN, 'get_mow_progress_geojson', entityId).catch(() => null),
        trackerId ? trail.extend(this.hass, trackerId).catch(() => false) : false,
        this._keepReportStream(entityId),
      ]);
      const line = head?.features.find(f => f.properties?.type_name === 'dynamics_line');
      const headChanged = trail.setHead(line?.geometry?.type === 'LineString' ? line.geometry.coordinates : []);

      if (entityId !== this.config.entity || !this._isMowerWorking) return;
      if (extended || headChanged || !this._vectorLayers.trail) {
        this._vectorLayers = { ...this._vectorLayers, trail: this._trailLayer(trail) };
      }
    } finally {
      this._trailBusy = false;
    }
  }

  /** Large position changes are drawn at once, only small steps are animated. */
  private _isMowerJump(pos: LonLat | null, docked: boolean): boolean {
    const prev = this._drawnMower;
    this._drawnMower = pos ? { ...pos, docked } : undefined;
    if (!prev || !pos || prev.docked !== docked) return true;
    return !docked && Math.hypot(...offsetMeters(prev, pos)) > VECTOR_MAP_SMOOTH_MAX_DISTANCE;
  }

  /** Remembers when the mower last reported and last moved, for the "not moving" note on the map. */
  private _trackMovement(): void {
    const trackerId = this._vectorTrackerEntity();
    const tracker = trackerId ? this.hass.states[trackerId] : undefined;
    const pos = trackerPosition(tracker);
    const reportAt = tracker ? Date.parse(tracker.last_updated) : NaN;
    if (!pos || !Number.isFinite(reportAt) || reportAt === this._lastReportAt) return;
    this._lastReportAt = reportAt;
    const prev = this._lastReportPos;
    const moved = !prev || Math.hypot(...offsetMeters(prev, pos)) >= VECTOR_MAP_HEADING_MIN_DISTANCE;
    if (moved || this._resolveStateBehavior(this.mowerState) !== 'mowing') {
      this._lastMovedAt = reportAt;
      this._lastReportPos = pos;
    }
  }

  /** Direction of travel from the last two positions that are far enough apart. */
  private _updateMowerHeading(pos: LonLat | null, docked: boolean): void {
    if (!pos || docked) {
      this._mowerHeading = null;
      this._headingFrom = pos ?? undefined;
      return;
    }
    const from = this._headingFrom;
    if (!from) {
      this._headingFrom = pos;
      return;
    }
    const [dx, dy] = offsetMeters(from, pos);
    if (Math.hypot(dx, dy) < VECTOR_MAP_HEADING_MIN_DISTANCE) return;
    this._mowerHeading = (Math.atan2(dx, dy) * 180) / Math.PI;
    this._headingFrom = pos;
  }

  private _getVectorModel(): VectorMapModel {
    const layers = this._vectorLayers;
    const rotation = Number(this.config.map_rotation) || 0;
    const model = this._vectorModel;
    if (
      !model ||
      model.rotation !== rotation ||
      model.layers.base !== layers.base ||
      model.layers.trail !== layers.trail
    ) {
      this._vectorModel = new VectorMapModel(layers, rotation);
    }
    return this._vectorModel as VectorMapModel;
  }

  private _renderVectorMapView() {
    if (this._vectorStatus === 'error') {
      return this._renderErrorView(
        'map-container',
        'map-error',
        'mdi:map-marker-alert-outline',
        localize('map.vector_load_error', { hass: this.hass })
      );
    }

    if (this._vectorStatus === 'empty') {
      return this._renderErrorView(
        'map-container',
        'map-error',
        'mdi:map-outline',
        localize('map.vector_empty', { hass: this.hass })
      );
    }

    const isLoading = this._vectorStatus !== 'ready';
    const model = isLoading ? undefined : this._getVectorModel();

    const trackerId = this._vectorTrackerEntity();
    const tracker = trackerId ? this.hass.states[trackerId] : undefined;
    const mower = trackerPosition(tracker);
    const docked = this._isCurrentlyDocked(this.mowerState, this.chargingStatus);
    this._updateMowerHeading(mower, docked);
    this._followMower(model, mower, docked);
    const mowerJump = this._isMowerJump(mower, docked);
    // Mammotion reports the heading in degrees clockwise from north (east = 90).
    // Fall back to the direction of travel when the attribute is missing.
    const direction = Number(tracker?.attributes?.direction);
    const heading = Number.isFinite(direction) ? direction : this._mowerHeading;

    return html`
      <div
        class="map-container pannable vector ${isLoading ? 'is-loading' : ''}"
        style="touch-action: none;"
        @wheel=${this._handleImgWheel}
        @pointerdown=${this._handleImgPointerDown}
        @pointermove=${this._handleImgPointerMove}
        @pointerup=${this._handleImgPointerUp}
        @pointercancel=${this._handleImgPointerUp}
        @dblclick=${this._handleImgDblClick}
      >
        ${isLoading ? html`<div class="loading-indicator"><div class="loader"></div></div>` : nothing}
        ${
          model
            ? html`<div
                  class="map-image-transform-layer"
                  style="transform: translate(${this._imgTranslateX}px, ${this._imgTranslateY}px) scale(${
                    this._imgScale
                  }); transform-origin: 0 0; --clm-zoom: ${this._imgScale};"
                >
                  ${model.render({
                    ...this._vectorViewSize(),
                    showLabels: this.config.map_show_labels !== false,
                    showPath: this.config.map_show_path !== false,
                    mower,
                    mowerActive: this._resolveStateBehavior(this.mowerState) === 'mowing',
                    mowerDocked: docked,
                    mowerJump,
                    mowerHeading: heading === null ? null : this._continuousHeading(heading),
                    mowerAlert: this._mowerAlert(),
                    areaWord: localize('map.area', { hass: this.hass }),
                    showRtk: this.config.map_show_rtk !== false,
                    pathWidth: Number(this.config.map_path_width) > 0 ? Number(this.config.map_path_width) : undefined,
                    activeZone: this._workZone() ?? null,
                    activeProgress:
                      this._isMowerWorking && this.progressLevel !== '-' ? Number(this.progressLevel) : null,
                    insets: VECTOR_MAP_INSETS,
                  })}
                </div>
                ${this._renderImgControls()} ${this._renderZoneDialog()}`
            : nothing
        }
      </div>
    `;
  }

  private _renderMapView() {
    if (this._isVectorMap) {
      return this._renderVectorMapView();
    }

    const useImage =
      this.config.map_source === 'image' ||
      (!this.config.map_source && !this.config.map_entity && !!this.config.map_image_entity) ||
      (this.config.map_source === 'gps' && !this.config.map_entity && !!this.config.map_image_entity);
    if (useImage) {
      return this._renderMapImageView();
    }

    const deviceTracker = this.config.map_entity ? this.hass.states[this.config.map_entity] : null;

    if (!deviceTracker) {
      return this._renderErrorView(
        'map-container',
        'map-error',
        'mdi:map-marker-off-outline',
        localize('map.not_available', { hass: this.hass })
      );
    }

    if (!deviceTracker.attributes.latitude || !deviceTracker.attributes.longitude) {
      return this._renderErrorView(
        'map-container',
        'map-error',
        'mdi:crosshairs-gps',
        localize('map.no_gps_coordinates', { hass: this.hass })
      );
    }

    const lat = deviceTracker.attributes.latitude;
    const lon = deviceTracker.attributes.longitude;

    if (this.config.google_maps_api_key && this.config.use_google_maps) {
      const mapUrl = this._getMapUrl(lat, lon);

      return html`
        <div class="map-container ${this._isMapLoading ? 'is-loading' : ''}">
          ${
            this._isMapLoading
              ? html`
                  <div class="loading-indicator">
                    <div class="loader"></div>
                  </div>
                `
              : ''
          }
          <img
            class="map-image"
            src="${mapUrl}"
            alt="Mower Location"
            draggable="false"
            @load=${() => (this._isMapLoading = false)}
            @error=${() => {
              this._isMapLoading = false;
              this._handleMapError();
            }}
            style="opacity: ${this._isMapLoading ? 0 : 1};"
          />
          <div class="mower-marker" style="opacity: ${this._isMapLoading ? 0 : 1};">
            <ha-icon icon="mdi:robot-mower"></ha-icon>
          </div>

          <div
            class="map-controls-wrapper"
            style="opacity: ${this._isMapLoading ? 0 : 1}; pointer-events: ${this._isMapLoading ? 'none' : 'auto'};"
          >
            <div class="map-zoom-control">
              <button
                class="map-zoom-button map-zoom-button--in"
                @click=${(e: Event) => this._handleZoom(e, 'in')}
                .disabled=${this._mapZoom >= MAX_MAP_ZOOM}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
              <button
                class="map-zoom-button map-zoom-button--out"
                @click=${(e: Event) => this._handleZoom(e, 'out')}
                .disabled=${this._mapZoom <= MIN_MAP_ZOOM}
              >
                <ha-icon icon="mdi:minus"></ha-icon>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (!this._mapCardElement) {
      return html`
        <div class="map-container is-loading">
          <div class="loading-indicator"><div class="loader"></div></div>
        </div>
      `;
    }
    return html`
      <div class="map-container">
        ${this._mapCardElement}
        <div class="map-controls-wrapper">
          <div class="map-zoom-control">
            <button class="map-zoom-button map-zoom-button--in" @click=${this._handleHaMapZoomIn}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
            <button class="map-zoom-button map-zoom-button--out" @click=${this._handleHaMapZoomOut}>
              <ha-icon icon="mdi:minus"></ha-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _getMapUrl(lat: number, lon: number): string {
    const apiKey = this.config.google_maps_api_key;
    let reqWidth = this._mapWidth;
    let reqHeight = this._mapHeight;

    if (reqWidth <= 0 || reqHeight <= 0) {
      return '';
    }

    if (reqWidth > MAX_STATIC_MAP_SIZE || reqHeight > MAX_STATIC_MAP_SIZE) {
      const ratio = reqWidth > reqHeight ? MAX_STATIC_MAP_SIZE / reqWidth : MAX_STATIC_MAP_SIZE / reqHeight;
      reqWidth = Math.floor(reqWidth * ratio);
      reqHeight = Math.floor(reqHeight * ratio);
    }

    const mapType = this.config.map_type || 'hybrid';
    let styleParams = '';
    if (mapType === 'satellite') {
      styleParams = 'style=feature:all|element:labels|visibility:off&';
    }

    return (
      `https://maps.googleapis.com/maps/api/staticmap?` +
      `center=${lat},${lon}&` +
      `zoom=${this._mapZoom}&` +
      `size=${reqWidth}x${reqHeight}&` +
      `maptype=${mapType}&` +
      styleParams +
      `key=${apiKey}`
    );
  }

  private _renderViewToggles() {
    const buttons = [];

    buttons.push(html`
      <button
        class="view-toggle-button ${this._viewMode === 'mower' ? 'active' : ''}"
        @click=${() => this._setViewMode('mower')}
        aria-label=${localize('view.mower', { hass: this.hass })}
      >
        <ha-icon icon="mdi:robot-mower"></ha-icon>
      </button>
    `);

    if (this.config.camera_entity && this.cameraEntity) {
      buttons.push(html`
        <button
          class="view-toggle-button ${this._viewMode === 'camera' ? 'active' : ''}"
          @click=${() => this._setViewMode('camera')}
          aria-label=${localize('view.camera', { hass: this.hass })}
        >
          <ha-icon icon="mdi:camera"></ha-icon>
        </button>
      `);
    }

    if (
      (this.config.map_entity || this.config.map_image_entity || this._isVectorMap) &&
      this.config.enable_map !== false
    ) {
      const useImage =
        this._isVectorMap ||
        this.config.map_source === 'image' ||
        (!this.config.map_source && !this.config.map_entity && !!this.config.map_image_entity);
      buttons.push(html`
        <button
          class="view-toggle-button ${this._viewMode === 'map' ? 'active' : ''}"
          @click=${() => this._setViewMode('map')}
          aria-label=${localize('view.map', { hass: this.hass })}
        >
          <ha-icon icon="${useImage ? 'mdi:map' : 'mdi:map-marker'}"></ha-icon>
        </button>
      `);
    }

    return html` <div class="view-toggle">${buttons}</div> `;
  }

  private async _setViewMode(mode: 'mower' | 'camera' | 'map') {
    if (this._cameraUpdateInterval) {
      clearInterval(this._cameraUpdateInterval);
      this._cameraUpdateInterval = undefined;
    }
    if (this._mapUpdateInterval) {
      clearInterval(this._mapUpdateInterval);
      this._mapUpdateInterval = undefined;
    }

    this._stopVectorMap();
    this._viewMode = mode;

    if (mode === 'camera') {
      this._isPopupOpen = false;
      this._updateCameraState(true);
    } else if (mode === 'map' && this._isVectorMap) {
      this._startVectorMap();
    } else if (mode === 'map') {
      const useImage =
        this.config.map_source === 'image' ||
        (!this.config.map_source && !this.config.map_entity && !!this.config.map_image_entity) ||
        (this.config.map_source === 'gps' && !this.config.map_entity && !!this.config.map_image_entity);
      if (useImage) {
        this._isMapImageLoading = true;
        this._mapImageError = false;
      } else {
        const useHaMap = !this.config.google_maps_api_key || this.config.use_google_maps === false;
        if (useHaMap) {
          this._loadMapElement();
        } else {
          this._isMapLoading = true;
        }
      }
      this._updateMapPosition();
    }
  }

  private async _updateCameraState(showLoader = false): Promise<void> {
    if (!this.cameraEntity) {
      this._isCameraReachable = false;
      if (this._cameraUpdateInterval) {
        clearInterval(this._cameraUpdateInterval);
        this._cameraUpdateInterval = undefined;
      }
      return;
    }

    if (showLoader) {
      this._isCameraLoading = true;
      this._isCameraReachable = true;
    }
    await this._checkCameraReachability();
    if (showLoader) {
      setTimeout(() => {
        this._isCameraLoading = false;
      }, CAMERA_LOADING_DELAY);
    }

    if (this._isCameraReachable) {
      if (this._cameraUpdateInterval) {
        clearInterval(this._cameraUpdateInterval);
        this._cameraUpdateInterval = undefined;
      }
    } else {
      if (!this._cameraUpdateInterval && this._viewMode === 'camera') {
        this._cameraUpdateInterval = window.setInterval(() => this._updateCameraState(false), CAMERA_RETRY_INTERVAL);
      }
    }
  }

  private _updateMapPosition() {
    if (!this.config.map_entity && !this.config.map_image_entity) return;

    if (this._viewMode === 'map') {
      this._mapUpdateInterval = window.setInterval(() => {
        if (this._mapCardElement) {
          (this._mapCardElement as any).hass = this.hass;
          return;
        }
        if (!this.config.google_maps_api_key || !this.config.use_google_maps || !this.config.map_entity) return;
        const tracker = this.hass?.states[this.config.map_entity];
        const lat = tracker?.attributes?.latitude;
        const lon = tracker?.attributes?.longitude;
        if (lat !== this._lastMapLat || lon !== this._lastMapLon) {
          this._lastMapLat = lat;
          this._lastMapLon = lon;
          this.requestUpdate();
        }
      }, MAP_UPDATE_INTERVAL);
    }
  }

  private async _loadMapElement(): Promise<void> {
    if (this._mapCardElement) {
      return;
    }

    try {
      const helpers = await (window as any).loadCardHelpers();
      const element = helpers.createCardElement({
        type: 'map',
        entities: [this.config.map_entity],
        default_zoom: this._mapZoom,
        dark_mode: false,
        auto_fit: true,
      });

      if (this.hass) {
        (element as any).hass = this.hass;
      }

      this._mapCardElement = element;
      this.updateComplete.then(() => this._injectHaMapControlStyles());
    } catch (e) {
      console.error('Compact Lawn Mower Card: Error loading map card element', e);
    }
  }

  private _injectHaMapControlStyles(retries = 20): void {
    const el = this._mapCardElement;
    if (!el) return;

    if (el.shadowRoot && !el.shadowRoot.querySelector('#clm-card-style')) {
      const cardStyle = document.createElement('style');
      cardStyle.id = 'clm-card-style';
      cardStyle.textContent = `ha-card { height: 100%; } ha-map { flex: 1; min-height: 0; }`;
      el.shadowRoot.appendChild(cardStyle);
    }

    const haMap = el.shadowRoot?.querySelector('ha-map') as HTMLElement | null;
    if (!haMap?.shadowRoot) {
      if (retries > 0) {
        setTimeout(() => this._injectHaMapControlStyles(retries - 1), 150);
      }
      return;
    }

    this._applyHaMapStyles(haMap.shadowRoot);

    if (!this._haMapShadowObserver) {
      this._haMapShadowObserver = new MutationObserver(() => {
        const sr = haMap.shadowRoot;
        if (!sr) return;
        if (!sr.querySelector('#clm-leaflet-style')) {
          this._applyHaMapStyles(sr);
          return;
        }
        const zc = sr.querySelector('.leaflet-control-zoom') as HTMLElement | null;
        if (zc && zc.style.display !== 'none') {
          zc.style.setProperty('display', 'none', 'important');
        }
      });
      this._haMapShadowObserver.observe(haMap.shadowRoot, { childList: true, subtree: true });
    }
  }

  private _applyHaMapStyles(shadowRoot: ShadowRoot): void {
    shadowRoot.querySelector('#clm-leaflet-style')?.remove();
    const style = document.createElement('style');
    style.id = 'clm-leaflet-style';
    style.textContent =
      `.leaflet-control-zoom { display: none !important; }` +
      `#buttons { position: absolute !important; bottom: 8px !important; left: 42px !important; top: auto !important; right: auto !important; }` +
      `#buttons ha-icon-button { --mdc-icon-button-size: 26px !important; --mdc-icon-size: 18px !important; }`;
    shadowRoot.appendChild(style);

    const zoomControl = shadowRoot.querySelector('.leaflet-control-zoom') as HTMLElement | null;
    if (zoomControl) {
      zoomControl.style.setProperty('display', 'none', 'important');
    }

    const buttonsEl = shadowRoot.querySelector('#buttons') as HTMLElement | null;
    if (buttonsEl) {
      buttonsEl.style.position = 'absolute';
      buttonsEl.style.bottom = '8px';
      buttonsEl.style.left = '42px';
      buttonsEl.style.top = 'auto';
      buttonsEl.style.right = 'auto';
      const iconBtn = buttonsEl.querySelector('ha-icon-button') as HTMLElement | null;
      if (iconBtn) {
        iconBtn.style.setProperty('--mdc-icon-button-size', '26px');
        iconBtn.style.setProperty('--mdc-icon-size', '18px');
      }
    }
  }

  private static _getChargingStatus(hass: HomeAssistant, mowerState: string, chargingEntityId?: string): boolean {
    if (chargingEntityId) {
      const chargingEntity = hass?.states[chargingEntityId];
      if (chargingEntity?.state) {
        const state = chargingEntity.state.toLowerCase();
        return ['on', 'true', 'charging'].includes(state);
      }
    }
    if (!mowerState) {
      return false;
    }
    const mowerStateLower = mowerState.toLowerCase();
    return ['charging'].includes(mowerStateLower);
  }

  private _renderActionButtons() {
    if (!this.config.custom_actions || this.config.custom_actions.length === 0) {
      return nothing;
    }

    const MAX_VISIBLE_ACTIONS = 3;
    const totalActions = this.config.custom_actions.length;
    const hasMoreActions = totalActions > MAX_VISIBLE_ACTIONS;

    const visibleActions = this._areActionsExpanded
      ? this.config.custom_actions.slice(MAX_VISIBLE_ACTIONS, MAX_VISIBLE_ACTIONS * 2)
      : this.config.custom_actions.slice(0, MAX_VISIBLE_ACTIONS);

    return html`
      ${visibleActions.map(action => {
        const isPending = this._pendingActionName === action.name;
        const feedback = this._actionFeedback?.name === action.name ? this._actionFeedback : null;
        const stateClass = isPending
          ? 'is-pending'
          : feedback?.status === 'success'
            ? 'is-success'
            : feedback?.status === 'error'
              ? 'is-error'
              : '';
        const icon = isPending
          ? 'mdi:loading'
          : feedback?.status === 'success'
            ? 'mdi:check'
            : feedback?.status === 'error'
              ? 'mdi:close'
              : action.icon;

        return html`
          <button
            class="action-button ${stateClass}"
            @click=${() => this._executeCustomAction(action)}
            ?disabled=${isPending}
            aria-label=${action.name}
            title=${action.name}
          >
            <ha-icon icon=${icon}></ha-icon>
          </button>
        `;
      })}
      ${
        hasMoreActions
          ? html`
              <button
                class="action-button more-button ${this._areActionsExpanded ? 'expanded' : ''}"
                @click=${() => this._toggleActionsExpanded()}
                aria-label=${this._areActionsExpanded ? 'Show first actions' : 'Show more actions'}
                title=${this._areActionsExpanded ? 'Show first actions' : 'Show more actions'}
              >
                <ha-icon icon=${this._areActionsExpanded ? 'mdi:chevron-left' : 'mdi:dots-horizontal'}></ha-icon>
              </button>
            `
          : nothing
      }
    `;
  }

  private _toggleActionsExpanded(): void {
    this._areActionsExpanded = !this._areActionsExpanded;
  }

  render() {
    const mower = this.mower;
    if (!mower) {
      return html` <ha-card>
        <div class="card-content">
          <div class="main-display-area error-view">
            <div class="entity-error">
              <ha-icon icon="mdi:robot-mower-outline"></ha-icon>
              <span class="error-title"
                >${
                  this.config.entity
                    ? localize('error.entity_not_found', { hass: this.hass })
                    : localize('error.missing_entity', { hass: this.hass })
                }</span
              >
              ${this.config.entity ? html`<span class="error-entity">${this.config.entity}</span>` : nothing}
            </div>
          </div>
        </div>
      </ha-card>`;
    }

    const isCharging = this.chargingStatus;

    return html`
      <ha-card>
        <div class="card-content">
          <div class="main-display-area ${this._viewMode}-view">
            <div class="mower-display">${this._renderMowerDisplay()} ${this._renderSleepAnimation()}</div>

            ${this._renderViewToggles()}

            <div class="badge-row">
              ${
                this.progressLevel !== '-'
                  ? this._renderProgressBadge(Number(this.progressLevel), this._jobDetail())
                  : html`<div class="badge-spacer"></div>`
              }
              ${(() => {
                // The badge names the mower's state; charging only shows in the icon
                const statusClass = this._statusClass(this.mowerState);
                const label = this._getStatusLabel(this.mowerState);
                return html`<div
                  class="status-ring ${isCharging ? 'charging' : ''} ${statusClass} ${label ? '' : 'icon-only'}"
                >
                  <div class="badge-icon status-icon ${isCharging ? 'charging' : statusClass}">
                    <ha-icon icon="${this._getStatusIcon(this.mowerState)}"></ha-icon>
                  </div>
                  ${label ? html`<span class="status-text">${label}</span>` : nothing}
                </div>`;
              })()}
            </div>
          </div>

          ${
            this.config?.custom_actions && this.config.custom_actions.length > 0
              ? html`
                  <div class="controls-area">
                    <div class="buttons-section ${this._areActionsExpanded ? 'expanded' : ''}">
                      ${this._renderActionButtons()}
                    </div>
                  </div>
                `
              : nothing
          }
        </div>
      </ha-card>
    `;
  }

  getCardSize(): number {
    return 4;
  }

  getGridOptions() {
    return {
      rows: 4,
      columns: 6,
      min_rows: 4,
      max_rows: 6,
      min_columns: 6,
      max_columns: 12,
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'compact-lawn-mower-card': CompactLawnMowerCard;
  }
}

if (!(window as any).customCards) {
  (window as any).customCards = [];
}

(window as any).customCards.push({
  type: 'compact-lawn-mower-card',
  name: 'Compact Lawn Mower Card',
  preview: true,
  description: 'A compact, modern and feature-rich custom card for your robotic lawn mower in Home Assistant',
  getEntitySuggestion: (_hass: any, entityId: string) => {
    if (entityId.split('.')[0] !== 'lawn_mower') {
      return null;
    }
    return {
      config: {
        type: 'custom:compact-lawn-mower-card',
        entity: entityId,
      },
    };
  },
});
