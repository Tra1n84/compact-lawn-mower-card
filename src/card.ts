import { LitElement, html, nothing, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard, fireEvent, forwardHaptic, navigate, toggleEntity } from 'custom-card-helpers';
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
} from './constants';
import { getGraphics } from './graphics';
import { localize } from './localize';
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
  @state() private _isNarrow = false;
  @state() private _forceCameraRefresh = false;
  @state() private _isCameraLoading = false;
  @state() private _isCameraReachable = true;
  @state() private _isPopupOpen = false;
  @state() private _isMapLoading = false;
  @state() private _isMapImageLoading = false;
  @state() private _mapImageError = false;
  private _imgScale = 1;
  private _imgTranslateX = 0;
  private _imgTranslateY = 0;
  private _imgContainer?: HTMLElement;
  private _lastMapLat?: number;
  private _lastMapLon?: number;
  @state() private _areActionsExpanded = false;
  private _currentPopup?: CameraPopup;
  @query('.main-display-area') private _mainDisplayArea?: HTMLElement;
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

  connectedCallback() {
    super.connectedCallback();
    this._viewMode = this.config?.default_view ?? 'mower';
    this._restoreImgTransform();
    const useImage =
      this.config.map_source === 'image' ||
      (!this.config.map_source && !this.config.map_entity && !!this.config.map_image_entity);
    const useHaMap = !useImage && (!this.config.google_maps_api_key || this.config.use_google_maps === false);

    if (this._viewMode === 'map' && useImage) {
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

        const isNarrow = newWidth > 0 && newWidth < 175;
        if (this._isNarrow !== isNarrow) {
          this._isNarrow = isNarrow;
        }
      }
      fireEvent(this, 'iron-resize' as any);
    });

    if (this._mainDisplayArea) {
      this._mainResizeObserver.observe(this._mainDisplayArea);
    }

    this._applyStyles();
    this.requestUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearAllTimers();
    this._mainResizeObserver?.disconnect();
    this._mowerResizeObserver?.disconnect();
    this._closePopup();
    this._haMapShadowObserver?.disconnect();
    this._haMapShadowObserver = undefined;
    this._imgActivePointers.clear();
    this._imgIsDragging = false;
    this._imgIsPinching = false;
  }

  private _clearAllTimers(): void {
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

    let verticalPositionFactor = 0.4;
    if (containerWidth < 300) {
      verticalPositionFactor = 0.7;
    } else if (containerWidth < 380) {
      verticalPositionFactor = 0.5;
    }
    const desiredWheelPosition = grassHeight * verticalPositionFactor;
    const newBottom = desiredWheelPosition - wheelOffsetFromBottomInSvg;

    mowerSvg.style.bottom = `${newBottom}px`;
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
          this._animationClass = 'driving-from-dock';
        } else {
          this._animationClass = 'driving-from-dock';
          this._animationTimeout = window.setTimeout(onAnimationEnd, 2000);
        }
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
          this._animationClass = 'driving-to-dock';
        } else {
          this._animationClass = 'driving-to-dock';
          this._animationTimeout = window.setTimeout(onAnimationEnd, 2000);
        }
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
      }, 800);
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
      }, 700);
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
          !this.config.map_entity &&
          !this.config.map_image_entity &&
          (oldConfig.map_entity || oldConfig.map_image_entity)
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
        }

        if (this._viewMode === 'map' && this.config.map_source !== oldConfig.map_source) {
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

        if (this._viewMode === 'map' && useHaMapNow && !useHaMapBefore) {
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
      }
    }
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
    const progressEntity = this.config.progress_entity ? this.hass?.states[this.config.progress_entity] : undefined;
    const rawValue = progressEntity?.state;
    return this._parsePercentage(rawValue);
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

  private _executeCustomAction(customAction: CustomAction): void {
    if (!customAction || !customAction.action || !this.hass) {
      return;
    }

    forwardHaptic('light');
    const action = customAction.action;

    try {
      switch (action.action) {
        case 'call-service':
          this._executeServiceCall(action as ServiceCallActionConfig);
          break;
        case 'navigate':
          navigate(this, (action as NavigateActionConfig).navigation_path);
          break;
        case 'url':
          window.open((action as UrlActionConfig).url_path, '_blank');
          break;
        case 'toggle':
          toggleEntity(this.hass, (action as ToggleActionConfig).entity || this.config.entity);
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

  private _executeServiceCall(action: ServiceCallActionConfig): void {
    if (!action.service) {
      console.error('No service specified for action');
      return;
    }

    const [domain, service] = action.service.split('.');
    if (!domain || !service) {
      console.error('Invalid service format:', action.service);
      return;
    }

    const serviceData = this._processTemplates(action.data || action.service_data || {});
    const target = this._processTemplates(action.target);

    this.hass.callService(domain, service, serviceData, target).catch(error => {
      console.error('Service call failed:', error);
      this._showError(`Service call failed: ${action.service}`);
    });
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

  private _getStatusIcon(state: string): string {
    if (this.chargingStatus) return 'mdi:lightning-bolt';
    const resolved = this._resolveStateBehavior(state);
    if (resolved === 'mowing') return 'mdi:robot-mower';
    if (resolved === 'returning') return 'mdi:home-import-outline';
    if (resolved === 'error') return 'mdi:alert-circle';
    if (resolved === 'paused') return 'mdi:pause-circle';
    if (resolved === 'docked') return 'mdi:home-circle';
    return 'mdi:robot';
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
        ${this._isCameraLoading
          ? html`
              <div class="loading-indicator">
                <div class="loader"></div>
              </div>
            `
          : ''}
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

  private _saveImgTransform(): void {
    if (!this.config?.map_image_entity) return;
    try {
      localStorage.setItem(
        `clm_img_${this.config.map_image_entity}`,
        JSON.stringify({ scale: this._imgScale, x: this._imgTranslateX, y: this._imgTranslateY })
      );
    } catch {}
  }

  private _restoreImgTransform(): void {
    if (!this.config?.map_image_entity) return;
    try {
      const stored = localStorage.getItem(`clm_img_${this.config.map_image_entity}`);
      if (stored) {
        const { scale, x, y } = JSON.parse(stored);
        if (typeof scale === 'number') this._imgScale = Math.max(IMG_ZOOM_MIN, Math.min(IMG_ZOOM_MAX, scale));
        if (typeof x === 'number') this._imgTranslateX = x;
        if (typeof y === 'number') this._imgTranslateY = y;
      }
    } catch {}
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

    const entityPicture = imageEntity.attributes.entity_picture;
    const isCamera = this.config.map_image_entity?.split('.')[0] === 'camera';
    const fallbackUrl = isCamera
      ? `/api/camera_proxy/${this.config.map_image_entity}`
      : `/api/image_proxy/${this.config.map_image_entity}`;
    const imageUrl = entityPicture ? entityPicture : fallbackUrl;

    const cacheBustedUrl = imageUrl.includes('?')
      ? `${imageUrl}&_t=${imageEntity.last_updated}`
      : `${imageUrl}?_t=${imageEntity.last_updated}`;

    return html`
      <div
        class="map-container pannable ${this._isMapImageLoading ? 'is-loading' : ''}"
        style="touch-action: none;"
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
          style="transform: translate(${this._imgTranslateX}px, ${this._imgTranslateY}px) scale(${this
            ._imgScale}); transform-origin: 0 0;"
        >
          <img
            class="map-image map-image-entity"
            src="${cacheBustedUrl}"
            alt="Mowing Map"
            draggable="false"
            @load=${() => {
              this._isMapImageLoading = false;
              this._mapImageError = false;
            }}
            @error=${() => {
              this._isMapImageLoading = false;
              this._mapImageError = true;
            }}
            style="opacity: ${this._isMapImageLoading ? 0 : 1};"
          />
        </div>
        ${!this._isMapImageLoading
          ? html`<div class="map-controls-wrapper">
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
              </div>
            </div>`
          : nothing}
      </div>
    `;
  }

  private _renderMapView() {
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
          ${this._isMapLoading
            ? html`
                <div class="loading-indicator">
                  <div class="loader"></div>
                </div>
              `
            : ''}
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

    if ((this.config.map_entity || this.config.map_image_entity) && this.config.enable_map !== false) {
      const useImage =
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

    return html` <div class="view-toggle ${this._isNarrow ? 'narrow' : ''}">${buttons}</div> `;
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

    this._viewMode = mode;

    if (mode === 'camera') {
      this._isPopupOpen = false;
      this._updateCameraState(true);
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
      ${visibleActions.map(
        action => html`
          <button
            class="action-button"
            @click=${() => this._executeCustomAction(action)}
            aria-label=${action.name}
            title=${action.name}
          >
            <ha-icon icon=${action.icon}></ha-icon>
          </button>
        `
      )}
      ${hasMoreActions
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
        : nothing}
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
                >${this.config.entity
                  ? localize('error.entity_not_found', { hass: this.hass })
                  : localize('error.missing_entity', { hass: this.hass })}</span
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

            ${this.progressLevel !== '-'
              ? html`
                  <div class="progress-badges">
                    <div class="progress-badge">
                      <ha-icon class="badge-icon" icon="mdi:progress-helper"></ha-icon>
                      <span class="progress-text">${this.progressLevel}%</span>
                    </div>
                  </div>
                `
              : ''}
            ${this._renderViewToggles()}

            <div class="status-badges">
              ${(() => {
                const displayStatus = this._getDisplayStatus(this.mowerState);
                const statusClass = this._statusClass(displayStatus);
                return html`<div
                  class="status-ring ${isCharging ? 'charging' : ''} ${statusClass} ${this._isNarrow ? 'narrow' : ''}"
                >
                  <div class="badge-icon status-icon ${statusClass}">
                    <ha-icon icon="${this._getStatusIcon(this.mowerState)}"></ha-icon>
                  </div>
                  <span class="status-text">${this._getTranslatedStatus(displayStatus)}</span>
                </div>`;
              })()}
            </div>
          </div>

          ${this.config?.custom_actions && this.config.custom_actions.length > 0
            ? html`
                <div class="controls-area">
                  <div class="buttons-section ${this._areActionsExpanded ? 'expanded' : ''}">
                    ${this._renderActionButtons()}
                  </div>
                </div>
              `
            : nothing}
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
});
