import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { CARD_NAME, CARD_VERSION, MIN_MAP_ZOOM, MAX_MAP_ZOOM, DEFAULT_MAP_ZOOM } from './constants';
import { getDefaultActions } from './defaults';
import { getAvailableMowerModels } from './graphics';
import { localize } from './localize';
import { editorStyles } from './styles';
import type {
  CompactLawnMowerCardConfig,
  CustomAction,
  CustomActionConfig,
  ActionType,
  ServiceCallActionConfig,
  NavigateActionConfig,
  UrlActionConfig,
  ToggleActionConfig,
  MoreInfoActionConfig,
} from './types';

@customElement('compact-lawn-mower-card-editor')
export class CompactLawnMowerCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public config!: CompactLawnMowerCardConfig;

  @state() private _helpersLoaded = false;
  @state() private _sectionsExpanded = {
    main: true,
    power: false,
    ui: false,
    actions: false,
    state_map: false,
  };
  @state() private _showStateMappingForm = false;
  @state() private _editingStateMappingKey: string | null = null;
  @state() private _newStateMappingCustomState = '';
  @state() private _newStateMappingBehavior = 'mowing';
  @state() private _showActionForm = false;
  @state() private _newActionName = '';
  @state() private _newActionIcon = 'mdi:play';
  @state() private _editingActionIndex: number | null = null;
  @state() private _newActionType: ActionType = 'call-service';
  @state() private _newActionService = '';
  @state() private _newActionTarget = '';
  @state() private _newActionServiceData: Record<string, any> = {};
  @state() private _targetMode: 'default' | 'custom' | 'none' = 'default';
  @state() private _newActionNavigationPath = '';
  @state() private _newActionUrlPath = '';
  @state() private _newActionEntity = '';
  private _resizeObserver?: ResizeObserver;
  private _serviceTranslationsLoaded = false;
  private _cachedServices?: {
    services: Array<{ value: string; label: string }>;
    hassServices: HomeAssistant['services'];
  };

  private _boundComputeLabel = this._computeLabel.bind(this);
  private _boundComputePowerLabel = this._computePowerLabel.bind(this);
  private _boundComputeOptionsLabel = this._computeOptionsLabel.bind(this);
  private _boundComputeActionsLabel = this._computeActionsLabel.bind(this);
  private _boundComputeStateMappingLabel = this._computeStateMappingLabel.bind(this);

  private readonly MAX_ACTIONS = 6;

  private readonly MOWER_ICONS = [
    'mdi:play',
    'mdi:pause',
    'mdi:stop',
    'mdi:home-map-marker',
    'mdi:robot-mower',
    'mdi:map-marker',
    'mdi:battery',
    'mdi:map',
    'mdi:cog',
    'mdi:wrench',
    'mdi:refresh',
    'mdi:power',
    'mdi:grass',
    'mdi:leaf',
  ];

  connectedCallback() {
    super.connectedCallback();
    this._loadHelpers();

    this._resizeObserver = new ResizeObserver(() => {
      this.dispatchEvent(new Event('iron-resize', { bubbles: true, composed: true }));
    });
    this._resizeObserver.observe(this);
  }

  private async _loadHelpers(): Promise<void> {
    try {
      await (window as any).loadCardHelpers();
      this._helpersLoaded = true;
    } catch (e) {
      console.error('Error loading card helpers. The editor may not function correctly.', e);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
  }

  updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    if (changedProps.has('hass') && this.hass && !this._serviceTranslationsLoaded) {
      this._loadServiceTranslations();
    }
  }

  private async _loadServiceTranslations(): Promise<void> {
    try {
      await (this.hass as any).loadBackendTranslation?.('services');
      this._serviceTranslationsLoaded = true;
      this._cachedServices = undefined;
      this.requestUpdate();
    } catch (e) {}
  }

  setConfig(config: CompactLawnMowerCardConfig): void {
    if (config.custom_actions === undefined) {
      config.custom_actions = getDefaultActions(this.hass);
    }

    this.config = config;
    this.requestUpdate();
  }

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this.config || !this.hass) {
      return;
    }

    const newConfig = { ...this.config };
    const newValues = ev.detail.value;

    for (const [key, value] of Object.entries(newValues)) {
      if (value === '' || value === null) {
        delete newConfig[key];
      } else {
        newConfig[key] = value;
      }
    }

    const hadAnyMapSource = !!(this.config.map_entity || this.config.map_image_entity);
    const hasAnyMapSourceNow = !!(newConfig.map_entity || newConfig.map_image_entity);

    if (!hadAnyMapSource && hasAnyMapSourceNow) {
      newConfig.enable_map = true;
    }

    if (hadAnyMapSource && !hasAnyMapSourceNow) {
      newConfig.enable_map = false;
      if (newConfig.default_view === 'map') {
        newConfig.default_view = 'mower';
      }
    }

    if (this.config.map_entity && !newConfig.map_entity && newConfig.map_image_entity) {
      newConfig.map_source = 'image';
    }
    if (this.config.map_image_entity && !newConfig.map_image_entity && newConfig.map_entity) {
      newConfig.map_source = 'gps';
    }

    if (newConfig.enable_map === false && newConfig.default_view === 'map') {
      newConfig.default_view = 'mower';
    }

    if (!hasAnyMapSourceNow && newConfig.default_view === 'map') {
      newConfig.default_view = 'mower';
    }

    if (!newConfig.camera_entity && newConfig.default_view === 'camera') {
      newConfig.default_view = 'mower';
    }

    this._fireConfigChanged(newConfig);
  }

  private _actionFormValueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    const {
      action_name,
      action_type,
      action_service,
      action_target,
      action_service_data,
      target_mode,
      action_navigation_path,
      action_url_path,
    } = ev.detail.value;

    this._newActionName = action_name ?? '';
    this._newActionService = action_service ?? '';
    this._newActionTarget = action_target ?? '';
    this._newActionServiceData = action_service_data ?? {};
    this._targetMode = target_mode ?? this._targetMode;
    this._newActionNavigationPath = action_navigation_path ?? '';
    this._newActionUrlPath = action_url_path ?? '';

    if (action_type !== undefined && action_type !== this._newActionType) {
      this._newActionType = action_type;
    }
  }

  private _fireConfigChanged(config: CompactLawnMowerCardConfig): void {
    this.config = config;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggleSection(section: 'main' | 'power' | 'ui' | 'actions' | 'state_map') {
    this._sectionsExpanded = {
      ...this._sectionsExpanded,
      [section]: !this._sectionsExpanded[section],
    };
  }

  private _buildActionConfig(): CustomActionConfig {
    switch (this._newActionType) {
      case 'call-service': {
        let target: ServiceCallActionConfig['target'] | undefined;
        if (this._targetMode === 'custom' && this._newActionTarget.trim()) {
          target = { entity_id: this._newActionTarget.trim() };
        } else if (this._targetMode === 'default') {
          target = { entity_id: this.config.entity || '{{ entity }}' };
        }
        return {
          action: 'call-service',
          service: this._newActionService.trim(),
          target: target,
          data: this._newActionServiceData,
        } as ServiceCallActionConfig;
      }
      case 'navigate':
        return { action: 'navigate', navigation_path: this._newActionNavigationPath.trim() } as NavigateActionConfig;
      case 'url':
        return { action: 'url', url_path: this._newActionUrlPath.trim() } as UrlActionConfig;
      case 'toggle': {
        const entity =
          this._targetMode === 'custom' && this._newActionTarget.trim() ? this._newActionTarget.trim() : undefined;
        return { action: 'toggle', entity } as ToggleActionConfig;
      }
      case 'more-info': {
        const entity =
          this._targetMode === 'custom' && this._newActionTarget.trim() ? this._newActionTarget.trim() : undefined;
        return { action: 'more-info', entity } as MoreInfoActionConfig;
      }
      case 'none':
        return { action: 'none' };
      default:
        return { action: 'none' };
    }
  }

  private _isActionFormValid(): boolean {
    if (!this._newActionName.trim()) return false;

    switch (this._newActionType) {
      case 'call-service':
        if (!this._newActionService.trim()) return false;
        if (this._targetMode === 'custom' && !this._newActionTarget.trim()) return false;
        return true;
      case 'navigate':
        return !!this._newActionNavigationPath.trim();
      case 'url':
        return !!this._newActionUrlPath.trim();
      case 'toggle':
      case 'more-info':
        if (this._targetMode === 'custom' && !this._newActionTarget.trim()) return false;
        return true;
      case 'none':
        return true;
      default:
        return false;
    }
  }

  private _addAction(): void {
    if (!this.config || !this._isActionFormValid()) {
      return;
    }

    if (this.config.custom_actions && this.config.custom_actions.length >= this.MAX_ACTIONS) {
      return;
    }

    const newAction: CustomAction = {
      name: this._newActionName.trim(),
      icon: this._newActionIcon,
      action: this._buildActionConfig(),
    };

    const newActions = [...(this.config.custom_actions || []), newAction];
    this._fireConfigChanged({ ...this.config, custom_actions: newActions });

    this._hideActionForm();
  }

  private _editAction(index: number): void {
    if (!this.config?.custom_actions?.[index]) return;

    this._resetActionForm();
    this._editingActionIndex = index;
    const action = this.config.custom_actions[index];
    this._newActionName = action.name;
    this._newActionIcon = action.icon || 'mdi:play';
    this._newActionType = (action.action.action as ActionType) || 'call-service';

    switch (action.action.action) {
      case 'call-service': {
        const serviceCall = action.action as ServiceCallActionConfig;
        this._newActionService = serviceCall.service || '';

        const target = serviceCall.target;
        if (!target || (!target.entity_id && !target.device_id && !target.area_id)) {
          this._targetMode = 'none';
          this._newActionTarget = '';
        } else {
          const targetEntityId = serviceCall.target?.entity_id || '';
          const entityIdString = Array.isArray(targetEntityId) ? targetEntityId[0] : targetEntityId;
          const isDefaultEntity = entityIdString === '{{ entity }}' || entityIdString === this.config.entity;

          if (isDefaultEntity || !entityIdString) {
            this._targetMode = 'default';
            this._newActionTarget = '';
          } else {
            this._targetMode = 'custom';
            this._newActionTarget = entityIdString;
          }
        }
        this._newActionServiceData = serviceCall.data || (serviceCall as any).service_data || {};
        break;
      }
      case 'navigate':
        this._newActionNavigationPath = (action.action as NavigateActionConfig).navigation_path || '';
        break;
      case 'url':
        this._newActionUrlPath = (action.action as UrlActionConfig).url_path || '';
        break;
      case 'toggle': {
        const entity = (action.action as ToggleActionConfig).entity;
        if (entity) {
          this._targetMode = 'custom';
          this._newActionTarget = entity;
        } else {
          this._targetMode = 'default';
        }
        break;
      }
      case 'more-info': {
        const entity = (action.action as MoreInfoActionConfig).entity;
        if (entity) {
          this._targetMode = 'custom';
          this._newActionTarget = entity;
        } else {
          this._targetMode = 'default';
        }
        break;
      }
    }

    this._showActionForm = true;
  }

  private _saveEditingAction(): void {
    if (!this.config?.custom_actions || this._editingActionIndex === null || !this._isActionFormValid()) return;

    const newActions = [...this.config.custom_actions];
    newActions[this._editingActionIndex] = {
      name: this._newActionName.trim(),
      icon: this._newActionIcon,
      action: this._buildActionConfig(),
    };

    this._fireConfigChanged({ ...this.config, custom_actions: newActions });
    this._hideActionForm();
  }

  private _resetActionForm(): void {
    this._editingActionIndex = null;
    this._newActionName = '';
    this._newActionIcon = 'mdi:play';
    this._newActionType = 'call-service';
    this._newActionService = '';
    this._newActionTarget = '';
    this._newActionServiceData = {};
    this._targetMode = 'default';
    this._newActionNavigationPath = '';
    this._newActionUrlPath = '';
    this._newActionEntity = '';
  }

  private _showAddActionForm(): void {
    this._resetActionForm();
    this._showActionForm = true;
  }

  private _hideActionForm(): void {
    this._showActionForm = false;
    this._resetActionForm();
  }

  private _removeAction(index: number): void {
    if (!this.config?.custom_actions) return;
    const newActions = [...this.config.custom_actions];
    newActions.splice(index, 1);
    this._fireConfigChanged({ ...this.config, custom_actions: newActions });
    this._hideActionForm();
  }

  private _resetToDefaults(): void {
    if (!this.config) return;
    if (window.confirm(localize('editor.actions.confirm_reset', { hass: this.hass }))) {
      this._fireConfigChanged({
        ...this.config,
        custom_actions: getDefaultActions(this.hass),
      });
      this._hideActionForm();
    }
  }

  private get _actionFormSchema() {
    const schema: any[] = [
      {
        name: 'action_name',
        selector: { text: {} },
        required: true,
      },
      {
        name: 'action_type',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              {
                value: 'call-service',
                label: localize('editor.actions.action_type.call_service', { hass: this.hass }),
              },
              { value: 'navigate', label: localize('editor.actions.action_type.navigate', { hass: this.hass }) },
              { value: 'url', label: localize('editor.actions.action_type.url', { hass: this.hass }) },
              { value: 'toggle', label: localize('editor.actions.action_type.toggle', { hass: this.hass }) },
              { value: 'more-info', label: localize('editor.actions.action_type.more_info', { hass: this.hass }) },
              { value: 'none', label: localize('editor.actions.action_type.none', { hass: this.hass }) },
            ],
            custom_value: false,
          },
        },
        required: true,
      },
    ];

    switch (this._newActionType) {
      case 'call-service':
        schema.push(
          {
            name: 'action_service',
            selector: {
              select: {
                mode: 'dropdown',
                options: this._getAvailableServices(),
                custom_value: true,
              },
            },
            required: true,
          },
          {
            name: 'action_service_data',
            selector: { object: {} },
            required: false,
          },
          {
            name: 'target_mode',
            selector: {
              select: {
                mode: 'dropdown',
                options: [
                  {
                    value: 'default',
                    label: localize('editor.actions.target_mode_label.default', { hass: this.hass }),
                  },
                  { value: 'custom', label: localize('editor.actions.target_mode_label.custom', { hass: this.hass }) },
                  { value: 'none', label: localize('editor.actions.target_mode_label.none', { hass: this.hass }) },
                ],
                custom_value: false,
              },
            },
            required: true,
          }
        );
        if (this._targetMode === 'custom') {
          schema.push({ name: 'action_target', selector: { entity: {} } });
        }
        break;

      case 'navigate':
        schema.push({
          name: 'action_navigation_path',
          selector: { text: {} },
          required: true,
        });
        break;

      case 'url':
        schema.push({
          name: 'action_url_path',
          selector: { text: {} },
          required: true,
        });
        break;

      case 'toggle':
      case 'more-info':
        schema.push({
          name: 'target_mode',
          selector: {
            select: {
              mode: 'dropdown',
              options: [
                { value: 'default', label: localize('editor.actions.target_mode_label.default', { hass: this.hass }) },
                { value: 'custom', label: localize('editor.actions.target_mode_label.custom', { hass: this.hass }) },
              ],
              custom_value: false,
            },
          },
          required: true,
        });
        if (this._targetMode === 'custom') {
          schema.push({ name: 'action_target', selector: { entity: {} } });
        }
        break;

      case 'none':
        break;
    }

    return schema;
  }

  private _getServiceFriendlyName(serviceId: string): string | undefined {
    if (!this.hass || !serviceId) return undefined;
    const [domain, service] = serviceId.split('.', 2);
    if (!domain || !service) return undefined;
    const name = this.hass.services?.[domain]?.[service]?.name;
    if (name) return name;
    const localized = this.hass.localize?.(`component.${domain}.services.${service}.name`);
    if (localized && localized !== `component.${domain}.services.${service}.name`) return localized;
    return undefined;
  }

  private _getAvailableServices(): Array<{ value: string; label: string }> {
    if (this._cachedServices && this._cachedServices.hassServices === this.hass.services) {
      return this._cachedServices.services;
    }

    if (!this.hass?.services) return [];

    const services: Array<{ value: string; label: string }> = [];

    for (const domain of Object.keys(this.hass.services)) {
      for (const service of Object.keys(this.hass.services[domain])) {
        const fullService = `${domain}.${service}`;
        const friendlyName = this._getServiceFriendlyName(fullService);
        services.push({
          value: fullService,
          label: friendlyName ? `${friendlyName} (${fullService})` : fullService,
        });
      }
    }

    const sortedServices = services.sort((a, b) => a.label.localeCompare(b.label));
    this._cachedServices = { services: sortedServices, hassServices: this.hass.services };
    return sortedServices;
  }

  private get _actionFormData() {
    return {
      action_name: this._newActionName,
      action_type: this._newActionType,
      action_service: this._newActionService,
      action_target: this._newActionTarget,
      action_service_data: this._newActionServiceData,
      target_mode: this._targetMode,
      action_navigation_path: this._newActionNavigationPath,
      action_url_path: this._newActionUrlPath,
    };
  }

  private _getEntityDisplayName(entityId: string): { display: string; tooltip: string; isDefault: boolean } {
    if (!entityId) {
      const display = localize('editor.actions.target_none', { hass: this.hass });
      return { display: display, tooltip: display, isDefault: true };
    }

    const isDefault = entityId === '{{ entity }}' || entityId === this.config.entity;

    if (entityId === '{{ entity }}') {
      return {
        display: localize('editor.actions.default_entity', { hass: this.hass }),
        tooltip: `${localize('editor.actions.default_entity', { hass: this.hass })} (${this.config.entity || localize('editor.actions.not_set', { hass: this.hass })})`,
        isDefault: true,
      };
    }

    const friendlyName = this.hass?.states[entityId]?.attributes?.friendly_name || entityId;

    return {
      display: friendlyName,
      tooltip: entityId,
      isDefault: isDefault,
    };
  }

  private _getActionTypeBadge(actionType: string): string {
    const typeKey = actionType.replace('-', '_');
    return localize(`editor.actions.action_type.${typeKey}`, { hass: this.hass });
  }

  private _getActionDetailLine(action: CustomAction): string {
    switch (action.action.action) {
      case 'call-service': {
        const serviceCall = action.action as ServiceCallActionConfig;
        if (!serviceCall.service) return localize('editor.actions.action_type.not_configured', { hass: this.hass });
        return this._getServiceFriendlyName(serviceCall.service) || serviceCall.service;
      }
      case 'navigate':
        return (action.action as NavigateActionConfig).navigation_path || '';
      case 'url':
        return (action.action as UrlActionConfig).url_path || '';
      case 'toggle': {
        const entity = (action.action as ToggleActionConfig).entity;
        return entity
          ? this._getEntityDisplayName(entity).display
          : localize('editor.actions.default_entity', { hass: this.hass });
      }
      case 'more-info': {
        const entity = (action.action as MoreInfoActionConfig).entity;
        return entity
          ? this._getEntityDisplayName(entity).display
          : localize('editor.actions.default_entity', { hass: this.hass });
      }
      case 'none':
        return '';
      default:
        return '';
    }
  }

  private _getActionServiceId(action: CustomAction): string | null {
    if (action.action.action !== 'call-service') return null;
    const serviceCall = action.action as ServiceCallActionConfig;
    if (!serviceCall.service) return null;
    const friendlyName = this._getServiceFriendlyName(serviceCall.service);
    return friendlyName ? serviceCall.service : null;
  }

  private _handleIconClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const iconContainer = target.closest<HTMLElement>('.icon-option');
    if (iconContainer?.dataset.icon) {
      this._newActionIcon = iconContainer.dataset.icon;
    }
  }

  private _renderIconSelector() {
    return html`
      <div class="icon-selector">
        <div class="icon-preview">
          <ha-icon icon=${this._newActionIcon}></ha-icon>
          <span>${this._newActionIcon}</span>
        </div>

        <div class="icon-grid" @click=${this._handleIconClick}>
          ${this.MOWER_ICONS.map(
            icon => html`
              <div
                class="icon-option ${this._newActionIcon === icon ? 'selected' : ''}"
                data-icon=${icon}
                title=${icon}
              >
                <ha-icon icon=${icon}></ha-icon>
              </div>
            `
          )}
        </div>

        <ha-textfield
          .label=${localize('editor.actions.icon_custom', { hass: this.hass })}
          .value=${this._newActionIcon}
          @input=${(e: any) => (this._newActionIcon = e.target.value)}
          .helper=${localize('editor.actions.icon_custom_helper', { hass: this.hass })}
        ></ha-textfield>
      </div>
    `;
  }

  private _getLocalizedLabel(key: string, fallback: string): string {
    const translation = localize(key, { hass: this.hass });
    return translation === key ? fallback : translation;
  }

  private _computeLabel(schema: { name: string }): string {
    return this._getLocalizedLabel(`editor.${schema.name}`, schema.name);
  }

  private _computePowerLabel(schema: { name: string }): string {
    return this._getLocalizedLabel(`editor.power.${schema.name}`, schema.name);
  }

  private _computeOptionsLabel(schema: { name: string }): string {
    if (schema.name.includes('_color_')) {
      const parts = schema.name.split('_');
      const translated = `${localize(`editor.options.color.${parts[0]}`, { hass: this.hass })} (${localize(`editor.options.color.${parts[2]}`, { hass: this.hass })})`;
      return translated;
    }
    if (schema.name === 'badge_text_color') {
      return this._getLocalizedLabel(`editor.options.badge_text_color`, schema.name);
    }
    if (schema.name === 'badge_icon_color') {
      return this._getLocalizedLabel(`editor.options.badge_icon_color`, schema.name);
    }
    if (schema.name === 'toggle_active_color') {
      return this._getLocalizedLabel(`editor.options.toggle_active_color`, schema.name);
    }
    return this._getLocalizedLabel(`editor.options.${schema.name}`, schema.name);
  }

  private _computeActionsLabel(schema: { name: string }): string {
    const labelMap: Record<string, string> = {
      action_name: localize('editor.actions.name', { hass: this.hass }),
      action_type: localize('editor.actions.type', { hass: this.hass }),
      action_service: localize('editor.actions.service', { hass: this.hass }),
      action_target: localize('editor.actions.target_entity', { hass: this.hass }),
      action_service_data: localize('editor.actions.service_data', { hass: this.hass }),
      target_mode: localize('editor.actions.target_mode', { hass: this.hass }),
      action_navigation_path: localize('editor.actions.navigation_path', { hass: this.hass }),
      action_url_path: localize('editor.actions.url_path', { hass: this.hass }),
    };
    return labelMap[schema.name] || schema.name;
  }

  private _computeStateMappingLabel(schema: { name: string }): string {
    const labelMap: Record<string, string> = {
      custom_state: localize('editor.state_map.custom_state', { hass: this.hass }),
      behavior: localize('editor.state_map.behavior', { hass: this.hass }),
    };
    return labelMap[schema.name] || schema.name;
  }

  private _addStateMapping(): void {
    this._newStateMappingCustomState = '';
    this._newStateMappingBehavior = 'mowing';
    this._editingStateMappingKey = null;
    this._showStateMappingForm = true;
  }

  private _editStateMapping(key: string): void {
    this._editingStateMappingKey = key;
    this._newStateMappingCustomState = key;
    this._newStateMappingBehavior = this.config.state_map?.[key] ?? 'mowing';
    this._showStateMappingForm = true;
  }

  private _removeStateMapping(key: string): void {
    const updated = { ...(this.config.state_map ?? {}) };
    delete updated[key];
    this._fireConfigChanged({ ...this.config, state_map: Object.keys(updated).length ? updated : undefined });
  }

  private _saveStateMapping(): void {
    const customState = this._newStateMappingCustomState.trim();
    if (!customState) return;
    const updated = { ...(this.config.state_map ?? {}) };
    if (this._editingStateMappingKey && this._editingStateMappingKey !== customState) {
      delete updated[this._editingStateMappingKey];
    }
    updated[customState] = this._newStateMappingBehavior;
    this._showStateMappingForm = false;
    this._editingStateMappingKey = null;
    this._fireConfigChanged({ ...this.config, state_map: updated });
  }

  private _cancelStateMapping(): void {
    this._showStateMappingForm = false;
    this._editingStateMappingKey = null;
  }

  private _renderStateMappingSection() {
    const expanded = this._sectionsExpanded.state_map;
    const stateMap = this.config?.state_map ?? {};
    const entries = Object.entries(stateMap);
    const canonicalStates = ['mowing', 'paused', 'returning', 'error', 'docked'];

    const behaviorLabel = (b: string): string => {
      const key = `editor.state_map.behaviors.${b}`;
      const t = localize(key, { hass: this.hass });
      return t !== key ? t : b;
    };

    return html`
      <div class="config-section">
        <div class="section-header" @click=${() => this._toggleSection('state_map')}>
          <div class="section-title">
            <ha-icon icon="mdi:state-machine"></ha-icon>
            ${localize('editor.state_map.title', { hass: this.hass })}
          </div>
          <ha-icon class="collapse-icon ${expanded ? 'expanded' : ''}" icon="mdi:chevron-down"></ha-icon>
        </div>

        <div class="section-content ${expanded ? 'expanded' : 'collapsed'}">
          <div class="section-description">${localize('editor.state_map.description', { hass: this.hass })}</div>

          ${entries.length === 0 && !this._showStateMappingForm
            ? html`<div class="no-actions-text">${localize('editor.state_map.no_mappings', { hass: this.hass })}</div>`
            : ''}
          ${entries.map(
            ([key, behavior]) => html`
              <div class="action-item">
                <div class="action-info">
                  <div class="action-name">${key}</div>
                  <div class="action-meta">→ ${behaviorLabel(behavior)}</div>
                </div>
                <div class="action-buttons">
                  <ha-icon-button @click=${() => this._editStateMapping(key)}>
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </ha-icon-button>
                  <ha-icon-button @click=${() => this._removeStateMapping(key)}>
                    <ha-icon icon="mdi:close"></ha-icon>
                  </ha-icon-button>
                </div>
              </div>
            `
          )}

          <div class="add-action-form ${this._showStateMappingForm ? '' : 'hidden'}">
            <ha-form
              .hass=${this.hass}
              .data=${{ custom_state: this._newStateMappingCustomState, behavior: this._newStateMappingBehavior }}
              .schema=${[
                { name: 'custom_state', selector: { text: {} }, required: true },
                {
                  name: 'behavior',
                  selector: {
                    select: {
                      mode: 'dropdown',
                      options: canonicalStates.map(b => ({ value: b, label: behaviorLabel(b) })),
                      custom_value: false,
                    },
                  },
                  required: true,
                },
              ]}
              .computeLabel=${this._boundComputeStateMappingLabel}
              @value-changed=${(ev: CustomEvent) => {
                ev.stopPropagation();
                const { custom_state, behavior } = ev.detail.value;
                if (custom_state !== undefined) this._newStateMappingCustomState = custom_state;
                if (behavior !== undefined) this._newStateMappingBehavior = behavior;
              }}
            ></ha-form>
            <div class="form-buttons">
              <ha-button @click=${this._saveStateMapping}>
                ${localize('editor.state_map.save', { hass: this.hass })}
              </ha-button>
              <ha-button @click=${this._cancelStateMapping}>
                ${localize('editor.state_map.cancel', { hass: this.hass })}
              </ha-button>
            </div>
          </div>
          ${!this._showStateMappingForm
            ? html`
                <div class="actions-header">
                  <ha-button @click=${this._addStateMapping}>
                    ${localize('editor.state_map.add', { hass: this.hass })}
                  </ha-button>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _renderActionsSection() {
    const currentActionCount = this.config?.custom_actions?.length || 0;
    const canAddAction = currentActionCount < this.MAX_ACTIONS;

    return html`
      <div class="config-section">
        <div class="section-header" @click=${() => this._toggleSection('actions')}>
          <div class="section-title">
            <ha-icon icon="mdi:play-box-outline"></ha-icon>
            ${localize('editor.actions.title', { hass: this.hass })}
            <span class="action-count">(${currentActionCount}/${this.MAX_ACTIONS})</span>
          </div>
          <ha-icon class="collapse-icon ${this._sectionsExpanded.actions ? 'expanded' : ''}" icon="mdi:chevron-down">
          </ha-icon>
        </div>

        <div class="section-content ${this._sectionsExpanded.actions ? 'expanded' : 'collapsed'}">
          <div class="section-description">${localize('editor.actions.description', { hass: this.hass })}</div>

          <div class="actions-header">
            <ha-button @click=${this._resetToDefaults}>
              ${localize('editor.actions.reset_to_defaults', { hass: this.hass })}
            </ha-button>
          </div>

          ${this.config.custom_actions && this.config.custom_actions.length > 0
            ? this.config.custom_actions.map((action, index) => {
                const typeBadge = this._getActionTypeBadge(action.action.action);
                const detailLine = this._getActionDetailLine(action);
                const serviceId = this._getActionServiceId(action);

                return html`
                  <div class="action-item">
                    <div class="action-icon">
                      <ha-icon icon=${action.icon || 'mdi:help'}></ha-icon>
                    </div>
                    <div class="action-info">
                      <div class="action-name">${action.name}</div>
                      <div class="action-meta">
                        <span class="action-type-badge">${typeBadge}</span>
                        ${detailLine ? html`<span class="action-detail">${detailLine}</span>` : ''}
                      </div>
                      ${serviceId ? html`<div class="action-service-id">(${serviceId})</div>` : ''}
                    </div>
                    <div class="action-buttons">
                      <ha-icon-button
                        .label=${localize('editor.actions.edit', { hass: this.hass })}
                        @click=${() => this._editAction(index)}
                        .disabled=${this._showActionForm && this._editingActionIndex !== index}
                      >
                        <ha-icon icon="mdi:pencil"></ha-icon>
                      </ha-icon-button>
                      <ha-icon-button
                        .label=${localize('editor.actions.remove', { hass: this.hass })}
                        @click=${() => this._removeAction(index)}
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </ha-icon-button>
                    </div>
                  </div>
                `;
              })
            : html`<p class="no-actions-text">
                ${localize('editor.actions.no_actions_configured', { hass: this.hass })}
              </p>`}
          <div class="add-action-form ${this._showActionForm ? '' : 'hidden'}">
            <div class="form-header">
              ${this._editingActionIndex !== null
                ? localize('editor.actions.edit', { hass: this.hass })
                : localize('editor.actions.add', { hass: this.hass })}
            </div>

            <div class="form-section">
              <ha-form
                .hass=${this.hass}
                .data=${this._actionFormData}
                .schema=${this._actionFormSchema}
                .computeLabel=${this._boundComputeActionsLabel}
                @value-changed=${this._actionFormValueChanged}
              ></ha-form>
            </div>

            ${this._targetMode === 'default' && ['call-service', 'toggle', 'more-info'].includes(this._newActionType)
              ? html`
                  <div class="default-target-info form-section">
                    <ha-icon icon="mdi:information-outline"></ha-icon>
                    <span>
                      ${localize('editor.actions.using_default_entity', { hass: this.hass })}:
                      <strong
                        >${this.config.entity
                          ? this._getEntityDisplayName(this.config.entity).display
                          : localize('editor.actions.no_entity_selected', { hass: this.hass })}</strong
                      >
                    </span>
                  </div>
                `
              : ''}
            ${this._targetMode === 'none' && this._newActionType === 'call-service'
              ? html`
                  <div class="default-target-info form-section">
                    <ha-icon icon="mdi:information-outline"></ha-icon>
                    <span> ${localize('editor.actions.target_mode_none_helper', { hass: this.hass })} </span>
                  </div>
                `
              : ''}

            <div class="form-section">
              <div class="form-section-title">${localize('editor.actions.icon', { hass: this.hass })}</div>
              ${this._renderIconSelector()}
            </div>

            <div class="form-buttons">
              ${this._editingActionIndex !== null
                ? html`
                    <ha-button @click=${this._saveEditingAction} .disabled=${!this._isActionFormValid()}>
                      ${localize('editor.actions.save', { hass: this.hass })}
                    </ha-button>
                  `
                : html`
                    <ha-button @click=${this._addAction} .disabled=${!this._isActionFormValid() || !canAddAction}>
                      ${localize('editor.actions.add_button', { hass: this.hass })}
                    </ha-button>
                  `}
              <ha-button @click=${this._hideActionForm}>
                ${localize('editor.actions.cancel', { hass: this.hass })}
              </ha-button>
            </div>
          </div>
          ${!this._showActionForm
            ? html`
                ${canAddAction
                  ? html`
                      <div class="actions-header">
                        <ha-button @click=${this._showAddActionForm}>
                          ${localize('editor.actions.add', { hass: this.hass })}
                        </ha-button>
                      </div>
                    `
                  : html`
                      <div class="max-actions-reached">
                        <ha-icon icon="mdi:information-outline"></ha-icon>
                        <span
                          >${localize('editor.actions.max_reached', {
                            hass: this.hass,
                            search: '{MAX_ACTIONS}',
                            replace: String(this.MAX_ACTIONS),
                          })}</span
                        >
                      </div>
                    `}
              `
            : ''}
        </div>
      </div>
    `;
  }

  private get _mainSchema() {
    return [
      { name: 'entity', selector: { entity: { domain: 'lawn_mower' } } },
      { name: 'camera_entity', selector: { entity: { domain: 'camera' } }, required: false },
      {
        name: 'camera_fit_mode',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              { value: 'cover', label: localize('editor.camera_fit_mode_label.cover', { hass: this.hass }) },
              { value: 'contain', label: localize('editor.camera_fit_mode_label.contain', { hass: this.hass }) },
            ],
            custom_value: false,
          },
        },
        disabled: !this.config.camera_entity,
      },
      { name: 'map_entity', selector: { entity: { domain: 'device_tracker' } }, required: false },
      { name: 'map_image_entity', selector: { entity: { domain: ['image', 'camera'] } }, required: false },
    ];
  }

  private readonly _infoSchema = [
    { name: 'progress_entity', selector: { entity: { domain: 'sensor' } }, required: false },
    { name: 'battery_entity', selector: { entity: { domain: 'sensor', device_class: 'battery' } }, required: false },
    { name: 'charging_entity', selector: { entity: { domain: ['binary_sensor', 'sensor'] } }, required: false },
  ];

  private get _viewOptionsSchema() {
    const defaultViewOptions = [{ value: 'mower', label: localize('view.mower', { hass: this.hass }) }];

    if (this.config.camera_entity) {
      defaultViewOptions.push({ value: 'camera', label: localize('view.camera', { hass: this.hass }) });
    }

    if (this.config.map_entity || this.config.map_image_entity) {
      defaultViewOptions.push({ value: 'map', label: localize('view.map', { hass: this.hass }) });
    }

    return [
      {
        name: 'default_view',
        selector: {
          select: {
            mode: 'dropdown',
            options: defaultViewOptions,
          },
        },
      },
    ];
  }

  private get _mapOptionsSchema() {
    const hasMapEntity = !!this.config.map_entity;
    const hasImageEntity = !!this.config.map_image_entity;
    const hasAnyMapSource = hasMapEntity || hasImageEntity;
    const hasBothSources = hasMapEntity && hasImageEntity;
    const mapIsEnabled = hasAnyMapSource && this.config.enable_map !== false;
    const hasApiKey = !!this.config.google_maps_api_key;
    const useGoogleMaps = !!this.config.use_google_maps;

    const effectiveSource = hasBothSources ? this.config.map_source || 'gps' : hasMapEntity ? 'gps' : 'image';
    const gpsActive = mapIsEnabled && effectiveSource === 'gps';

    const mapSourceOptions: { value: string; label: string }[] = [];
    if (hasMapEntity) {
      mapSourceOptions.push({
        value: 'gps',
        label: localize('editor.options.map_source_label.gps', { hass: this.hass }),
      });
    }
    if (hasImageEntity) {
      mapSourceOptions.push({
        value: 'image',
        label: localize('editor.options.map_source_label.image', { hass: this.hass }),
      });
    }

    const schema: any[] = [
      {
        name: 'enable_map',
        selector: { boolean: {} },
        disabled: !hasAnyMapSource,
      },
      {
        name: 'map_source',
        selector: {
          select: {
            mode: 'dropdown',
            options: mapSourceOptions,
            custom_value: false,
          },
        },
        disabled: !mapIsEnabled,
      },
      {
        name: 'google_maps_api_key',
        selector: { text: {} },
        disabled: !gpsActive,
      },
      {
        name: 'use_google_maps',
        selector: { boolean: {} },
        disabled: !gpsActive || !hasApiKey,
      },
      {
        name: 'map_type',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              { value: 'roadmap', label: localize('editor.options.map_type_label.roadmap', { hass: this.hass }) },
              { value: 'satellite', label: localize('editor.options.map_type_label.satellite', { hass: this.hass }) },
              { value: 'hybrid', label: localize('editor.options.map_type_label.hybrid', { hass: this.hass }) },
            ],
            custom_value: false,
          },
        },
        disabled: !gpsActive || !hasApiKey || !useGoogleMaps,
      },
      {
        name: 'default_map_zoom',
        selector: {
          number: {
            min: MIN_MAP_ZOOM,
            max: MAX_MAP_ZOOM,
            mode: 'slider',
            step: 1,
          },
        },
        disabled: !gpsActive,
      },
    ];

    return schema;
  }

  private get _colorOptionsSchema() {
    return [
      { name: 'sky_color_top', selector: { color_rgb: {} } },
      { name: 'sky_color_bottom', selector: { color_rgb: {} } },
      { name: 'grass_color_top', selector: { color_rgb: {} } },
      { name: 'grass_color_bottom', selector: { color_rgb: {} } },
    ];
  }

  private get _badgeColorOptionsSchema() {
    return [
      { name: 'badge_text_color', selector: { color_rgb: {} } },
      { name: 'badge_icon_color', selector: { color_rgb: {} } },
      { name: 'toggle_active_color', selector: { color_rgb: {} } },
    ];
  }

  private get _appearanceOptionsSchema() {
    return [
      {
        name: 'mower_model',
        selector: {
          select: {
            mode: 'dropdown',
            options: getAvailableMowerModels(this.hass),
          },
        },
      },
    ];
  }

  private _parseColor(color: string | number[] | undefined): number[] | undefined {
    if (Array.isArray(color)) {
      return color;
    }
    if (typeof color === 'string') {
      const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
      if (rgbMatch) {
        return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
      }
    }
    return undefined;
  }

  private _getPrimaryColorRgb(): number[] {
    const fallback: number[] = [3, 169, 244];
    try {
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
      if (primaryColor) {
        const parsed = this._parseColor(primaryColor);
        if (parsed) {
          return parsed;
        }
      }
    } catch {}
    return fallback;
  }

  private get _mainData() {
    return {
      entity: this.config.entity || '',
      camera_entity: this.config.camera_entity || '',
      camera_fit_mode: this.config.camera_fit_mode || 'cover',
      map_entity: this.config.map_entity || '',
      map_image_entity: this.config.map_image_entity || '',
    };
  }

  private get _infoData() {
    return {
      progress_entity: this.config.progress_entity || '',
      battery_entity: this.config.battery_entity || '',
      charging_entity: this.config.charging_entity || '',
    };
  }

  private get _optionsData() {
    return {
      default_view: this.config.default_view || 'mower',
      enable_map: this.config.enable_map !== false,
      map_source: this.config.map_source || (this.config.map_image_entity && !this.config.map_entity ? 'image' : 'gps'),
      google_maps_api_key: this.config.google_maps_api_key || '',
      map_type: this.config.map_type || 'hybrid',
      use_google_maps: this.config.use_google_maps === true && !!this.config.google_maps_api_key,
      default_map_zoom: this.config.default_map_zoom ?? DEFAULT_MAP_ZOOM,
      mower_model: this.config.mower_model || 'default',
      sky_color_top: this._parseColor(this.config.sky_color_top) || [41, 128, 185],
      sky_color_bottom: this._parseColor(this.config.sky_color_bottom) || [109, 213, 250],
      grass_color_top: this._parseColor(this.config.grass_color_top) || [65, 150, 8],
      grass_color_bottom: this._parseColor(this.config.grass_color_bottom) || [133, 187, 88],
    };
  }

  private get _badgeColorData() {
    return {
      badge_text_color: this._parseColor(this.config.badge_text_color) || [0, 0, 0],
      badge_icon_color: this._parseColor(this.config.badge_icon_color) || [0, 0, 0],
      toggle_active_color: this._parseColor(this.config.toggle_active_color) || this._getPrimaryColorRgb(),
    };
  }

  render() {
    if (!this.hass || !this.config || !this._helpersLoaded) {
      return html`
        <div class="card-config loading">
          <div class="loading-text">${localize('editor.loading', { hass: this.hass })}</div>
        </div>
      `;
    }

    return html`
      <div class="card-config">
        <div class="card-header">
          <div class="name">${CARD_NAME}</div>
          <div class="version">${localize('editor.version', { hass: this.hass })}: ${CARD_VERSION}</div>
        </div>
        <div class="config-container">
          <div class="config-section">
            <div class="section-header" @click=${() => this._toggleSection('main')}>
              <div class="section-title">
                <ha-icon icon="mdi:robot-mower"></ha-icon>
                ${localize('editor.section.main', { hass: this.hass })}
              </div>
              <ha-icon class="collapse-icon ${this._sectionsExpanded.main ? 'expanded' : ''}" icon="mdi:chevron-down">
              </ha-icon>
            </div>

            <div class="section-content ${this._sectionsExpanded.main ? 'expanded' : 'collapsed'}">
              <div class="section-description">${localize('editor.section.main_description', { hass: this.hass })}</div>
              <ha-form
                .hass=${this.hass}
                .data=${this._mainData}
                .schema=${this._mainSchema}
                .computeLabel=${this._boundComputeLabel}
                @value-changed=${this._valueChanged}
              ></ha-form>
            </div>
          </div>

          <div class="config-section">
            <div class="section-header" @click=${() => this._toggleSection('power')}>
              <div class="section-title">
                <ha-icon icon="mdi:battery"></ha-icon>
                ${localize('editor.section.power', { hass: this.hass })}
              </div>
              <ha-icon class="collapse-icon ${this._sectionsExpanded.power ? 'expanded' : ''}" icon="mdi:chevron-down">
              </ha-icon>
            </div>

            <div class="section-content ${this._sectionsExpanded.power ? 'expanded' : 'collapsed'}">
              <div class="section-description">
                ${localize('editor.section.power_description', { hass: this.hass })}
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${this._infoData}
                .schema=${this._infoSchema}
                .computeLabel=${this._boundComputePowerLabel}
                @value-changed=${this._valueChanged}
              ></ha-form>
            </div>
          </div>

          <div class="config-section">
            <div class="section-header" @click=${() => this._toggleSection('ui')}>
              <div class="section-title">
                <ha-icon icon="mdi:view-dashboard"></ha-icon>
                ${localize('editor.section.options', { hass: this.hass })}
              </div>
              <ha-icon class="collapse-icon ${this._sectionsExpanded.ui ? 'expanded' : ''}" icon="mdi:chevron-down">
              </ha-icon>
            </div>

            <div class="section-content ${this._sectionsExpanded.ui ? 'expanded' : 'collapsed'}">
              <div class="section-description">
                ${localize('editor.section.options_description', { hass: this.hass })}
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${this._optionsData}
                .schema=${this._viewOptionsSchema}
                .computeLabel=${this._boundComputeOptionsLabel}
                @value-changed=${this._valueChanged}
              ></ha-form>

              <div class="form-group">
                <div class="form-group-title">${localize('editor.options.map_options_title', { hass: this.hass })}</div>
                <ha-form
                  .hass=${this.hass}
                  .data=${this._optionsData}
                  .schema=${this._mapOptionsSchema}
                  .computeLabel=${this._boundComputeOptionsLabel}
                  @value-changed=${this._valueChanged}
                ></ha-form>
              </div>

              <div class="form-group">
                <div class="form-group-title">
                  ${localize('editor.options.model_options_title', { hass: this.hass })}
                </div>
                <ha-form
                  .hass=${this.hass}
                  .data=${this._optionsData}
                  .schema=${this._appearanceOptionsSchema}
                  .computeLabel=${this._boundComputeOptionsLabel}
                  @value-changed=${this._valueChanged}
                ></ha-form>
              </div>

              <div class="form-group">
                <div class="form-group-title">
                  ${localize('editor.options.color_options_title', { hass: this.hass })}
                </div>
                <ha-form
                  .hass=${this.hass}
                  .data=${this._badgeColorData}
                  .schema=${this._badgeColorOptionsSchema}
                  .computeLabel=${this._boundComputeOptionsLabel}
                  @value-changed=${this._valueChanged}
                ></ha-form>
                <div class="separator"></div>
                <div class="color-group">
                  <ha-form
                    .hass=${this.hass}
                    .data=${this._optionsData}
                    .schema=${this._colorOptionsSchema}
                    .computeLabel=${this._boundComputeOptionsLabel}
                    @value-changed=${this._valueChanged}
                  ></ha-form>
                </div>
              </div>
            </div>
          </div>

          ${this._renderActionsSection()} ${this._renderStateMappingSection()}
        </div>
      </div>
    `;
  }

  static styles = editorStyles;
}

declare global {
  interface Window {
    loadCardHelpers?: () => Promise<void>;
  }

  interface HTMLElementTagNameMap {
    'compact-lawn-mower-card-editor': CompactLawnMowerCardEditor;
  }
}
