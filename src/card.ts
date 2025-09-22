import { LitElement, html, nothing, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard } from 'custom-card-helpers';
import './editor';
import { getDefaultActions } from './defaults';
import { CARD_NAME, CARD_VERSION } from './constants';
import { getGraphics } from './graphics';
import { localize } from './localize';
import {
  CompactLawnMowerCardConfig,
  LawnMowerEntity,
  MowerModel,
  CustomAction,
  ServiceCallActionConfig,
} from './types';
import { cameraPopupStyles, compactLawnMowerCardStyles } from './styles';

console.groupCollapsed(
  `%c ${CARD_NAME} %c Version ${CARD_VERSION}`,
  'color: white; background:rgb(90, 135, 91); font-weight: bold; padding: 2px 6px;',
  'color: rgb(90, 135, 91); font-weight: bold;'
);
console.log(
  "Github:",
  "https://github.com/Tra1n84/compact-lawn-mower-card"
);
console.groupEnd();

@customElement('camera-popup')
class CameraPopup extends LitElement {
  @property() title = '';
  @property() onClose?: () => void;
  @property() hass?: HomeAssistant;
  @property() entityId?: string;
  @property({ type: Boolean }) isReachable = true;
  static styles = cameraPopupStyles;

  connectedCallback() {
    super.connectedCallback();
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this._close();
      }
    };
    document.addEventListener('keydown', escHandler);
    this.addEventListener('close', () => document.removeEventListener('keydown', escHandler), { once: true });
  }

  private _close() {
    if (this.onClose) {
      this.onClose();
    }
    this.dispatchEvent(new Event('close'));
  }

  render() {
    if (!this.hass || !this.entityId) {
      return nothing;
    }
    const stateObj = this.hass.states[this.entityId];
    if (!stateObj) {
      return nothing;
    }

    let content: TemplateResult;

    if (stateObj.state === 'unavailable') {
      content = html`
        <div class="popup-stream-container camera-error">
          <ha-icon icon="mdi:camera-off"></ha-icon>
          <span>${localize("camera.not_available", { hass: this.hass })}</span>
        </div>
      `;
    } else if (!this.isReachable) {
      content = html`
        <div class="popup-stream-container camera-error">
          <ha-icon icon="mdi:lan-disconnect"></ha-icon>
          <span>${localize("camera.not_reachable", { hass: this.hass })}</span>
        </div>
      `;
    } else {
      content = html`
        <div class="popup-stream-container">
          <ha-camera-stream
            .hass=${this.hass}
            .stateObj=${stateObj}
            controls
            muted
          ></ha-camera-stream>
        </div>
      `;
    }

    return html`
      <div class="popup-content" @click=${(e: Event) => e.stopPropagation()}>
        <div class="popup-header">
          <h3 class="popup-title">${this.title}</h3>
          <button class="popup-close" @click=${this._close}>×</button>
        </div>
        ${content}
      </div>
    `;
  }
}

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
  private _currentPopup?: CameraPopup;
  @query('.main-display-area') private _mainDisplayArea?: HTMLElement;
  @query('.progress-badge') private _progressBadge?: HTMLElement;
  @query('.status-ring') private _statusRing?: HTMLElement;

  @property({ attribute: false }) private _viewMode: 'mower' | 'camera' | 'map' = 'mower';
  @state() private _mapWidth = 0;
  @state() private _mapHeight = 0;
  @state() private _mapZoom = 19;
  private _mapUpdateInterval?: number;
  private _cameraUpdateInterval?: number;
  private _animationTimeout?: number;
  private _mainResizeObserver?: ResizeObserver;
  private _mowerResizeObserver?: ResizeObserver;
  private _badgeOverlapCheckTimeout?: number;
  @state() private _mapCardElement?: HTMLElement;
  private _lastProgressLevel: number | string = '-';

  connectedCallback() {
    super.connectedCallback();
    this._viewMode = this.config?.default_view ?? 'mower';
    const useHaMap = !this.config.google_maps_api_key || this.config.use_google_maps === false;

    if (this._viewMode === 'map' && useHaMap) {
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

    this.updateComplete.then(() => {
      this._checkBadgeOverlap();
    });
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
          this._checkBadgeOverlap();
        }
      }
      this.dispatchEvent(new Event("iron-resize", { bubbles: true, composed: true }));
    });

    if (this._mainDisplayArea) {
      this._mainResizeObserver.observe(this._mainDisplayArea);
    }

    this._checkBadgeOverlap();
    this._applyStyles();
    this.requestUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._mapUpdateInterval) {
      clearInterval(this._mapUpdateInterval);
    }
    if (this._cameraUpdateInterval) {
      clearInterval(this._cameraUpdateInterval);
    }
    if (this._animationTimeout) {
      clearTimeout(this._animationTimeout);
    }
    if (this._badgeOverlapCheckTimeout) {
      clearTimeout(this._badgeOverlapCheckTimeout);
    }
    this._mainResizeObserver?.disconnect();
    this._mowerResizeObserver?.disconnect();
    this._closePopup();
  }
  
  private _checkBadgeOverlap(): void {
    const statusRing = this._statusRing;
    if (!statusRing) return;

    if (this._badgeOverlapCheckTimeout) {
      window.cancelAnimationFrame(this._badgeOverlapCheckTimeout);
    }

    this._badgeOverlapCheckTimeout = window.requestAnimationFrame(() => {
      const progressBadge = this._progressBadge;

      if (!this.config.progress_entity || !progressBadge) {
        statusRing.classList.remove('text-hidden');
        return;
      }

      const progressRect = progressBadge.getBoundingClientRect();
      const statusRect = statusRing.getBoundingClientRect();
      const containerWidth = this._mainDisplayArea?.getBoundingClientRect().width || 0;

      const isTextHidden = statusRing.classList.contains('text-hidden');
      const statusTextElement = statusRing.querySelector('.status-text') as HTMLElement;
      const textWidth = statusTextElement ? statusTextElement.getBoundingClientRect().width : 70;

      if (isTextHidden) {
        const requiredSpace = statusRect.width + textWidth + 20;
        if (progressRect.right < containerWidth - requiredSpace) {
          statusRing.classList.remove('text-hidden');
        }
      } else {
        const hideThreshold = 10;
        const positionOverlap = progressRect.right > statusRect.left - hideThreshold;
        const widthOverlap = (progressRect.width + statusRect.width) > containerWidth - hideThreshold;
        if (positionOverlap || widthOverlap) {
          statusRing.classList.add('text-hidden');
        }
      }
    });
  }

  private _setInitialAnimationState(currentState: string): void {
    const onLawnStates = ['mowing', 'paused', 'returning', 'error'];
    const isDocked = this._isCurrentlyDocked(currentState, this.chargingStatus);

    if (isDocked) {
      this._animationClass = 'docked';
    }
    else if (onLawnStates.includes(currentState)) {
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

    const estimatedColumns = Math.max(1, Math.floor(containerWidth / 120));
    const skyPercentage = Math.max(45, 70 - (estimatedColumns * 2));
    mowerDisplay.style.setProperty('--sky-percentage', `${skyPercentage}%`);

    const mowerHeight = mowerSvg.clientHeight;
    if (mowerHeight === 0) return;

    const wheelOffsetFromBottomInSvg = mowerHeight * 0.05;
    const grassHeight = containerHeight * (1 - (skyPercentage / 100));

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

    const onAnimationEnd = () => {
      if (mowerBody) {
        mowerBody.style.willChange = 'auto';
      }
      this._setInitialAnimationState(this.mowerState);
    };

    if (wasDocked && !isDocked) {
      if (this._animationClass !== 'driving-from-dock') {
        if (mowerBody) {
          mowerBody.addEventListener('animationend', onAnimationEnd, { once: true });
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
          mowerBody.addEventListener('animationend', onAnimationEnd, { once: true });
          mowerBody.style.willChange = 'transform';
          this._animationClass = 'driving-to-dock';
        } else {
          this._animationClass = 'driving-to-dock';
          this._animationTimeout = window.setTimeout(onAnimationEnd, 2000);
        }
      }
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
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (!this.hass || !this.config?.entity) {
      return;
    }

    if (this.config.custom_actions === undefined) {
      this.config = {
        ...this.config, custom_actions: getDefaultActions(this.hass)
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

        const oldChargingStatus = CompactLawnMowerCard._getChargingStatus(oldHass, oldMowerState, this.config.charging_entity);
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

    if (changedProperties.has('hass')) {
      const currentProgress = this.progressLevel;
      if (this._lastProgressLevel !== currentProgress) {
        this._lastProgressLevel = currentProgress;
      }
    }

    if ((changedProperties as any).has('_viewMode') && this._viewMode === 'mower') {
      this._updateMowerPosition();
      this._setupMowerResizeObserver();
    }
    if ((changedProperties as any).has('_viewMode') && this._viewMode !== 'mower') {
      this._mowerResizeObserver?.disconnect();
    }

    this.updateComplete.then(() => {
      this._checkBadgeOverlap();
    });
  }

  private _isCurrentlyDocked(state: string, isCharging: boolean): boolean {
    if (isCharging) {
      return true;
    }
    return state === 'docked';
  }

  setConfig(config: CompactLawnMowerCardConfig): void {
    if (!config || !config.entity) {
      throw new Error(`${localize("error.missing_entity", { hass: this.hass })}`);
    }

    this.config = config;
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
    return document.createElement("compact-lawn-mower-card-editor");
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

  private _executeCustomAction(customAction: CustomAction): void {
    if (!customAction || !customAction.action || !this.hass) {
      return;
    }

    const action = customAction.action;

    try {
      if (action.action === 'call-service') {
        this._executeServiceCall(action as ServiceCallActionConfig);
      } else {
        console.warn('Unsupported action type:', (action as any).action);
      }
    } catch (error) {
      console.error('Error executing custom action:', error);
      this._showError(`Fehler beim Ausführen der Aktion: ${customAction.name}`);
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

    this.hass.callService(domain, service, serviceData, target)
      .catch((error) => {
        console.error('Service call failed:', error);
        this._showError(`Service-Aufruf fehlgeschlagen: ${action.service}`);
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
    const event = new Event('hass-notification', {
      bubbles: true,
      composed: true,
    });
    (event as any).detail = { message };
    this.dispatchEvent(event);
  }

  private _getMowerSVGClass(state: string): string {
    const classes: string[] = [];
    const displayState = this._getDisplayStatus(state);

    if (this._animationClass === 'driving-to-dock' || this._animationClass === 'driving-from-dock') {
      classes.push(this._animationClass, 'active');
    } else {
      if (this._getDisplayStatus(state) === 'charging') {
        classes.push('docked-static', 'charging', 'charging-animated');
      } else if (displayState === 'docked') {
        classes.push('docked-static');
      } else if (displayState === 'mowing') {
        classes.push('on-lawn-static', 'active');
      } else if (displayState === 'paused') {
        classes.push('on-lawn-static', 'sleeping');
      } else if (displayState === 'returning') {
        classes.push('on-lawn-static', 'returning', 'active');
      } else if (displayState === 'error') {
        classes.push('on-lawn-static', 'error');
      }
    }

    return classes.join(' ');
  }
  
  private _statusClass(state: string): string {
    if (state === "charging") return "charging";
    if (state === "mowing") return "mowing";
    if (state === "paused") return "paused";
    if (state === "error") return "error";
    if (state === "returning") return "returning";
    return "";
  }

  private _getDisplayStatus(state: string, charging?: boolean): string {
    const isCharging = charging === undefined ? this.chargingStatus : charging;
    if (isCharging) {
      return 'charging';
    }
    return state;
  }

  private _getTranslatedStatus(state: string): string {
    const statusKey = `status.${state.toLowerCase()}`;
    const translated = localize(statusKey, { hass: this.hass });
    return translated !== statusKey ? translated : state;
  }

  private _getStatusIcon(state: string): string {
    if (this.chargingStatus) return 'mdi:lightning-bolt';
    if (state === 'mowing') return 'mdi:robot-mower';
    if (state === 'returning') return 'mdi:home-import-outline';
    if (state === 'error') return 'mdi:alert-circle';
    if (state === 'paused') return 'mdi:pause-circle';
    if (state === 'docked') return 'mdi:home-circle';
    return 'mdi:robot';
  }

  private _getLEDColor(state: string): string {
    if (this.chargingStatus) return 'rgb(184, 79, 27)';
    if (state === 'mowing') return 'var(--warning-color, #ff9800)';
    if (state === 'returning') return 'var(--primary-color, #2196f3)';
    if (state === 'error') return 'var(--error-color, #f44336)';
    return 'var(--disabled-text-color, #9e9e9e)';
  }

  private _getChargingStationColor(state: string): string {
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
    const shouldShowSleep = state === 'paused' && !this.chargingStatus && this._viewMode === 'mower';

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
      return this._renderErrorView('camera-container', 'camera-error', 'mdi:camera-off', localize("camera.not_available", { hass: this.hass }));
    }

    if (!this._isCameraReachable) {
      return this._renderErrorView('camera-container', 'camera-error', 'mdi:lan-disconnect', localize("camera.not_reachable", { hass: this.hass }));
    }

    const fitMode = this.config.camera_fit_mode || 'cover';

    return html`
      <div class="camera-container clickable ${this._isCameraLoading ? 'is-loading' : ''}" @click=${this._openCameraPopup}>
        ${this._isCameraLoading ? html`
          <div class="loading-indicator">
            <div class="loader"></div>
          </div>
        ` : ''}
        <ha-camera-stream
          class="fit-mode-${fitMode}"
          .hass=${this.hass}
          .stateObj=${this.cameraEntity}
          .fitMode=${fitMode}
          muted
          style="opacity: ${this._isCameraLoading ? 0.3 : 1};"
        ></ha-camera-stream>
        <div class="camera-overlay" style="opacity: ${this._isCameraLoading ? 0 : 1};">

        </div>
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

  private _handleZoom(e: Event, direction: 'in' | 'out'): void {
    e.stopPropagation();
    if (direction === 'in') {
      this._mapZoom = Math.min(21, this._mapZoom + 1);
    } else {
      this._mapZoom = Math.max(1, this._mapZoom - 1);
    }
    if (this.config.google_maps_api_key && this.config.use_google_maps) {
      this._isMapLoading = true;
    }
  }

  private _renderMowerModel() {
    const state = this.mowerState;
    const battery = Number(this.batteryLevel) || 0;
    const batteryColor = this._getBatteryColor(battery);

    const ringRadius = 10;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringStrokeOffset = ringCircumference * (1 - (battery / 100));

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

  private _renderMapView() {
    const deviceTracker = this.config.map_entity ? this.hass.states[this.config.map_entity] : null;

    if (!deviceTracker || !deviceTracker.attributes.latitude) {
      return this._renderErrorView('map-container', 'map-error', 'mdi:map-marker-off-outline', localize("map.not_available", { hass: this.hass }));
    }

    const lat = deviceTracker.attributes.latitude;
    const lon = deviceTracker.attributes.longitude;

    if (this.config.google_maps_api_key && this.config.use_google_maps) {
      const mapUrl = this._getMapUrl(lat, lon);

      return html`
        <div class="map-container ${this._isMapLoading ? 'is-loading' : ''}">
          ${this._isMapLoading ? html`
            <div class="loading-indicator">
              <div class="loader"></div>
            </div>
          ` : ''}
          <img 
            class="map-image" 
            src="${mapUrl}"
            alt="Mower Location"
            @load=${() => this._isMapLoading = false}
            @error=${() => { this._isMapLoading = false; this._handleMapError(); }}
            style="opacity: ${this._isMapLoading ? 0 : 1};"
          />
          
          <div class="mower-marker" style="opacity: ${this._isMapLoading ? 0 : 1};">
            <ha-icon icon="mdi:robot-mower"></ha-icon>
          </div>
          
          <div class="map-controls-wrapper" style="opacity: ${this._isMapLoading ? 0 : 1};">
            <div class="map-controls">
              <button class="map-control-button" @click=${(e: Event) => this._handleZoom(e, 'in')} .disabled=${this._isMapLoading}>
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
              <button class="map-control-button" @click=${(e: Event) => this._handleZoom(e, 'out')} .disabled=${this._isMapLoading}>
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
    return html`<div class="map-container">${this._mapCardElement}</div>`;
  }

  private _getMapUrl(lat: number, lon: number): string {
    const apiKey = this.config.google_maps_api_key;
    let reqWidth = this._mapWidth;
    let reqHeight = this._mapHeight;

    if (reqWidth <= 0 || reqHeight <= 0) {
      return '';
    }

    const maxSize = 640;
    if (reqWidth > maxSize || reqHeight > maxSize) {
      const ratio = reqWidth > reqHeight ? maxSize / reqWidth : maxSize / reqHeight;
      reqWidth = Math.floor(reqWidth * ratio);
      reqHeight = Math.floor(reqHeight * ratio);
    }

    const mapType = this.config.map_type || 'hybrid';
    let styleParams = '';
    if (mapType === 'satellite') {
      styleParams = 'style=feature:all|element:labels|visibility:off&';
    }

    return `https://maps.googleapis.com/maps/api/staticmap?` +
      `center=${lat},${lon}&` +
      `zoom=${this._mapZoom}&` +
      `size=${reqWidth}x${reqHeight}&` +
      `maptype=${mapType}&` +
      styleParams +
      `key=${apiKey}`;
  }

  private _renderViewToggles() {
    const buttons = [];


    buttons.push(html`
      <button class="view-toggle-button ${this._viewMode === 'mower' ? 'active' : ''}" 
              @click=${() => this._setViewMode('mower')}
              aria-label=${localize('view.mower', { hass: this.hass })}>
        <ha-icon icon="mdi:robot-mower"></ha-icon>
      </button>
    `);

    if (this.config.camera_entity && this.cameraEntity) {
      buttons.push(html`
        <button class="view-toggle-button ${this._viewMode === 'camera' ? 'active' : ''}" 
                @click=${() => this._setViewMode('camera')}
                aria-label=${localize('view.camera', { hass: this.hass })}>
          <ha-icon icon="mdi:camera"></ha-icon>
        </button>
      `);
    }

    if (this.config.map_entity && this.config.enable_map !== false) {
      buttons.push(html`
        <button class="view-toggle-button ${this._viewMode === 'map' ? 'active' : ''}" 
                @click=${() => this._setViewMode('map')}
                aria-label=${localize('view.map', { hass: this.hass })}>
          <ha-icon icon="mdi:map-marker"></ha-icon>
        </button>
      `);
    }

    return html`
      <div class="view-toggle">
        ${buttons}
      </div>
    `;
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
    }
    else if (mode === 'map') {
      const useHaMap = !this.config.google_maps_api_key || this.config.use_google_maps === false;
      if (useHaMap) {
        this._loadMapElement();
      } else {
        this._isMapLoading = true;
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
      setTimeout(() => { this._isCameraLoading = false; }, 1000);
    }

    if (this._isCameraReachable) {
      if (this._cameraUpdateInterval) {
        clearInterval(this._cameraUpdateInterval);
        this._cameraUpdateInterval = undefined;
      }
    } else {
      if (!this._cameraUpdateInterval && this._viewMode === 'camera') {
        this._cameraUpdateInterval = window.setInterval(() => this._updateCameraState(false), 5000);
      }
    }
  }

  private _updateMapPosition() {
    if (!this.config.map_entity) return;

    if (this._viewMode === 'map') {
      this._mapUpdateInterval = window.setInterval(() => {
        if (this._mapCardElement) {
          (this._mapCardElement as any).hass = this.hass;
        }
        this.requestUpdate();
      }, 10000);
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

    } catch (e) {
      console.error('Compact Lawn Mower Card: Error loading map card element', e);
    }
  }

  private static _getChargingStatus(
    hass: HomeAssistant,
    mowerState: string,
    chargingEntityId?: string
  ): boolean {
    if (chargingEntityId) {
      const chargingEntity = hass?.states[chargingEntityId];
      if (chargingEntity) {
        const state = chargingEntity.state?.toLowerCase();
        return ['on', 'true', 'charging'].includes(state);
      }
    }
    const mowerStateLower = mowerState.toLowerCase();
    return ['charging'].includes(mowerStateLower);
  }

  render() {
    const mower = this.mower;
    if (!mower) {
      return html`
        <ha-card>
          <div class="warning">
            ${this.config.entity
          ? `${localize('error.entity_not_found', { hass: this.hass })}: ${this.config.entity}`
          : localize('error.missing_entity', { hass: this.hass })}
          </div>
        </ha-card>`;
    }

    const state = this.mowerState;
    const isCharging = this.chargingStatus;

    return html`
      <ha-card>
        <div class="card-content">
          <div class="main-display-area ${this._viewMode}-view">
            <div class="mower-display">
              ${this._renderMowerDisplay()}
              ${this._renderSleepAnimation()}
            </div>
            
            ${this.progressLevel !== '-' ? html`
              <div class="progress-badges">
                <div class="progress-badge">
                  <ha-icon class="badge-icon" icon="mdi:progress-helper"></ha-icon>
                  <span class="progress-text-small">${this.progressLevel}%</span>
                </div>
              </div>
            ` : ''}
            
            ${this._renderViewToggles()}
            
            <div class="status-badges">
              <div class="status-ring ${isCharging ? 'charging' : ''}">
                <div class="badge-icon status-icon ${this._statusClass(this._getDisplayStatus(this.mowerState))}">
                  <ha-icon icon="${this._getStatusIcon(this.mowerState)}"></ha-icon>
                </div>
                <span class="status-text">${this._getTranslatedStatus(this._getDisplayStatus(this.mowerState))}</span>
              </div>
            </div>

          </div>
          
          <div class="controls-area">
            ${this.config?.custom_actions && this.config.custom_actions.length > 0 ? html`
              <div class="buttons-section">
                ${this.config.custom_actions.map((action) => html`
                  <button 
                    class="tile-card-button" 
                    @click=${() => this._executeCustomAction(action)}
                    aria-label=${action.name}
                    title=${action.name}
                  >
                    <ha-icon icon=${action.icon}></ha-icon>
                  </button>
                `)}
              </div>
            ` : html`
              <div class="no-actions-message">
              </div>
            `}
          </div>

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
      max_rows: 4,
      min_columns: 6,
      max_columns: 12,
    };
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'compact-lawn-mower-card': CompactLawnMowerCard;
    'camera-popup': CameraPopup;
  }
}

if (!(window as any).customCards) {
  (window as any).customCards = [];
}

(window as any).customCards.push({
  type: "compact-lawn-mower-card",
  name: "Compact Lawn Mower Card",
  preview: true,
  description: "A compact, modern and feature-rich custom card for your robotic lawn mower in Home Assistant"
});