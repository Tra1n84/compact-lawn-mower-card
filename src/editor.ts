import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, ActionConfig } from 'custom-card-helpers';
import { CARD_NAME, CARD_VERSION } from './constants';
import { getDefaultActions } from './defaults';
import { getAvailableMowerModels } from './graphics';
import { localize } from './localize';
import { editorStyles } from './styles';
import type { 
  CompactLawnMowerCardConfig,
  CustomAction, 
  ServiceCallActionConfig
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
  };
  @state() private _showActionForm = false;
  @state() private _newActionName = '';
  @state() private _newActionIcon = 'mdi:play';
  @state() private _editingActionIndex: number | null = null;
  @state() private _newActionService = '';
  @state() private _newActionTarget = '';
  @state() private _newActionServiceData: Record<string, any> = {};
  @state() private _targetMode: 'default' | 'custom' | 'none' = 'default';
  private _resizeObserver?: ResizeObserver;
  private _cachedServices?: {
    services: Array<{ value: string; label: string }>;
    hassServices: HomeAssistant['services'];
  };

  private _boundComputeLabel = this._computeLabel.bind(this);
  private _boundComputePowerLabel = this._computePowerLabel.bind(this);
  private _boundComputeOptionsLabel = this._computeOptionsLabel.bind(this);
  private _boundComputeActionsLabel = this._computeActionsLabel.bind(this);
  
  private readonly MAX_ACTIONS = 3;

  private readonly MOWER_ICONS = [
    'mdi:play', 'mdi:pause', 'mdi:stop', 'mdi:home-map-marker',
    'mdi:robot-mower', 'mdi:map-marker', 'mdi:battery', 'mdi:map',
    'mdi:cog', 'mdi:wrench', 'mdi:refresh', 'mdi:power', 'mdi:grass', 'mdi:leaf'
  ];

  connectedCallback() {
    super.connectedCallback();
    this._loadHelpers();

    this._resizeObserver = new ResizeObserver(() => {
      this.dispatchEvent(new Event("iron-resize", { bubbles: true, composed: true }));
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

    if (!this.config.map_entity && newConfig.map_entity) {
      newConfig.enable_map = true;
    }

    if (this.config.map_entity && !newConfig.map_entity) {
      newConfig.enable_map = false;
      if (newConfig.default_view === 'map') {
        newConfig.default_view = 'mower';
      }
    }

    if (newConfig.enable_map === false && newConfig.default_view === 'map') {
      newConfig.default_view = 'mower';
    }

    if (!newConfig.camera_entity && newConfig.default_view === 'camera') {
      newConfig.default_view = 'mower';
    }

    this._fireConfigChanged(newConfig);
  }

  private _actionFormValueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    const { action_name, action_service, action_target, action_service_data, target_mode } = ev.detail.value;

    this._newActionName = action_name ?? '';
    this._newActionService = action_service ?? '';
    this._newActionTarget = action_target ?? '';
    this._newActionServiceData = action_service_data ?? {};
    this._targetMode = target_mode ?? this._targetMode;
  }

  private _fireConfigChanged(config: CompactLawnMowerCardConfig): void {
    this.config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { 
      detail: { config },
      bubbles: true,
      composed: true
    }));
  }

  private _toggleSection(section: 'main' | 'power' | 'ui' | 'actions') {
    this._sectionsExpanded = {
      ...this._sectionsExpanded,
      [section]: !this._sectionsExpanded[section]
    };
  }

  private _addAction(): void {
    const service = this._newActionService.trim();

    if (!this.config || !this._newActionName.trim() || !service) {
      return;
    }

    if (this.config.custom_actions && this.config.custom_actions.length >= this.MAX_ACTIONS) {
      return;
    }
    
    let target: ServiceCallActionConfig['target'] | undefined;
    if (this._targetMode === 'custom' && this._newActionTarget.trim()) {
      target = { entity_id: this._newActionTarget.trim() };
    } else if (this._targetMode === 'default') {
      target = { entity_id: this.config.entity || '{{ entity }}' };
    }
    
    const newAction: CustomAction = {
      name: this._newActionName.trim(),
      icon: this._newActionIcon,
      action: {
        action: 'call-service',
        service: service,
        target: target,
        data: this._newActionServiceData,
      } as ServiceCallActionConfig
    };
    
    const newActions = [...(this.config.custom_actions || []), newAction];
    this._fireConfigChanged({ ...this.config, custom_actions: newActions });

    this._hideActionForm();
  }

  private _editAction(index: number): void {
    if (!this.config?.custom_actions?.[index]) return;
    
    this._editingActionIndex = index;
    const action = this.config.custom_actions[index];
    this._newActionName = action.name;
    this._newActionIcon = action.icon || 'mdi:play';
    
    if (action.action.action === 'call-service') {
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
    }
    this._showActionForm = true;
  }

  private _saveEditingAction(): void {
    if (!this.config?.custom_actions || this._editingActionIndex === null || !this._newActionService.trim()) return;

    const newActions = [...this.config.custom_actions];
    const service = this._newActionService.trim();

    let target: ServiceCallActionConfig['target'] | undefined;
    if (this._targetMode === 'custom' && this._newActionTarget.trim()) {
      target = { entity_id: this._newActionTarget.trim() };
    } else if (this._targetMode === 'default') {
      target = { entity_id: this.config.entity || '{{ entity }}' };
    }

    newActions[this._editingActionIndex] = {
      name: this._newActionName.trim(),
      icon: this._newActionIcon,
      action: {
        action: 'call-service',
        service: service,
        target: target,
        data: this._newActionServiceData,
      } as ServiceCallActionConfig
    };
    
    this._fireConfigChanged({ ...this.config, custom_actions: newActions });
    this._hideActionForm();
  }
  
  private _resetActionForm(): void {
    this._editingActionIndex = null;
    this._newActionName = '';
    this._newActionIcon = 'mdi:play';
    this._newActionService = '';
    this._newActionTarget = '';
    this._newActionServiceData = {};
    this._targetMode = 'default';
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
        name: "action_name", 
        selector: { 
          text: {} 
        },
        required: true
      },
      { 
        name: "action_service", 
        selector: { 
          select: {
            mode: "dropdown",
            options: this._getAvailableServices(),
            custom_value: true
          }
        },
        required: true
      },
      {
        name: "action_service_data",
        selector: {
          object: {}
        },
        required: false
      },
      {
        name: "target_mode",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "default", label: localize('editor.actions.target_mode_label.default', { hass: this.hass }) },
              { value: "custom", label: localize('editor.actions.target_mode_label.custom', { hass: this.hass }) },
              { value: "none", label: localize('editor.actions.target_mode_label.none', { hass: this.hass }) }
            ],
            custom_value: false
          }
        },
        required: true
      }
    ];

    if (this._targetMode === 'custom') {
      schema.push({ name: "action_target", selector: { entity: {} } });
    }

    return schema;
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
        services.push({
          value: fullService,
          label: fullService
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
      action_service: this._newActionService,
      action_target: this._newActionTarget,
      action_service_data: this._newActionServiceData,
      target_mode: this._targetMode,
    };
  }

  private _getServiceDisplayName(service: string): { display: string; tooltip: string } {
    const maxLength = 25;
    if (service.length <= maxLength) {
      return { display: service, tooltip: service };
    }
    
    const parts = service.split('.');
    if (parts.length > 1) {
      const domain = parts[0];
      const serviceName = parts.slice(1).join('.');
      
      if (serviceName.length <= maxLength - 3) {
        return { display: `${domain}.${serviceName}`, tooltip: service };
      } else {
        return { display: `${domain}.${serviceName.substring(0, maxLength - domain.length - 4)}...`, tooltip: service };
      }
    }
    
    return { display: `${service.substring(0, maxLength)}...`, tooltip: service };
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
        isDefault: true 
      };
    }

    const friendlyName = this.hass?.states[entityId]?.attributes?.friendly_name || entityId;
    
    return { 
      display: friendlyName,
      tooltip: entityId, 
      isDefault: isDefault 
    };
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
          ${this.MOWER_ICONS.map(icon => html`
            <div 
              class="icon-option ${this._newActionIcon === icon ? 'selected' : ''}"
              data-icon=${icon}
              title=${icon}
            >
              <ha-icon icon=${icon}></ha-icon>
            </div>
          `)}
        </div>
        
        <ha-textfield
          .label=${localize('editor.actions.icon_custom', { hass: this.hass })}
          .value=${this._newActionIcon}
          @input=${(e: any) => this._newActionIcon = e.target.value}
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
    return this._getLocalizedLabel(`editor.options.${schema.name}`, schema.name);
  }

  private _computeActionsLabel(schema: { name: string }): string {
    const labelMap: Record<string, string> = {
      action_name: localize('editor.actions.name', { hass: this.hass }),
      action_service: localize('editor.actions.service', { hass: this.hass }),
      action_target: localize('editor.actions.target_entity', { hass: this.hass }),
      action_service_data: localize('editor.actions.service_data', { hass: this.hass }),
      target_mode: localize('editor.actions.target_mode', { hass: this.hass })
    };
    return labelMap[schema.name] || schema.name;
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
          <ha-icon
            class="collapse-icon ${this._sectionsExpanded.actions ? 'expanded' : ''}"
            icon="mdi:chevron-down"
          >
          </ha-icon>
        </div>

        <div class="section-content ${this._sectionsExpanded.actions ? 'expanded' : 'collapsed'}">
          <div class="section-description">
            ${localize('editor.actions.description', { hass: this.hass })}
          </div>
          
          <div class="actions-header">
            <ha-button
              @click=${this._resetToDefaults}
            >
              ${localize('editor.actions.reset_to_defaults', { hass: this.hass })}
            </ha-button>
          </div>
          
          ${this.config.custom_actions && this.config.custom_actions.length > 0
            ? this.config.custom_actions.map((action, index) => {
                const serviceInfo = this._getServiceDisplayName((action.action as ServiceCallActionConfig).service || 'N/A');
                const targetEntityId = (action.action as ServiceCallActionConfig).target?.entity_id || '';
                const target = (action.action as ServiceCallActionConfig).target;
                const entityIdString = target && target.entity_id ? (Array.isArray(target.entity_id) ? target.entity_id[0] : target.entity_id) : '';
                const entityInfo = this._getEntityDisplayName(entityIdString);
                const serviceData = (action.action as ServiceCallActionConfig).data || (action.action as any).service_data;
                const hasServiceData = serviceData && Object.keys(serviceData).length > 0;
                
                return html`
                  <div class="action-item">
                    <div class="action-icon">
                      <ha-icon icon=${action.icon || 'mdi:help'}></ha-icon>
                    </div>
                    <div class="action-info">
                      <div class="action-name">${action.name}</div>
                      <div class="action-type">
                        ${localize('editor.actions.service', { hass: this.hass })}: ${serviceInfo.display}
                      </div>
                      <div class="action-target ${entityInfo.isDefault ? 'default-target' : 'custom-target'}">
                        ${localize('editor.actions.target', { hass: this.hass })}: ${entityInfo.display}
                      </div>
                      <div class="action-service-data">
                        ${localize('editor.actions.service_data', { hass: this.hass })}:
                        ${hasServiceData ? localize('editor.actions.service_data_configured', { hass: this.hass }) : localize('editor.actions.service_data_none', { hass: this.hass })}
                      </div>
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
            : html`<p class="no-actions-text">${localize('editor.actions.no_actions_configured', { hass: this.hass })}</p>`
          }

          ${this._showActionForm
            ? html`
            <div class="add-action-form">
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

              ${this._targetMode === 'default' ? html`
                <div class="default-target-info form-section">
                  <ha-icon icon="mdi:information-outline"></ha-icon>
                  <span>
                    ${localize('editor.actions.using_default_entity', { hass: this.hass })}:
                    <strong>${this.config.entity ? this._getEntityDisplayName(this.config.entity).display : localize('editor.actions.no_entity_selected', { hass: this.hass })}</strong>
                  </span>
                </div>
              ` : ''}

              ${this._targetMode === 'none' ? html`
                <div class="default-target-info form-section">
                  <ha-icon icon="mdi:information-outline"></ha-icon>
                  <span>
                    ${localize('editor.actions.target_mode_none_helper', { hass: this.hass })}
                  </span>
                </div>
              ` : ''}

              <div class="form-section">
                <div class="form-section-title">${localize('editor.actions.icon', { hass: this.hass })}</div>
                ${this._renderIconSelector()}
              </div>
              
              <div class="form-buttons">
                ${this._editingActionIndex !== null
                  ? html`
                    <ha-button
                      @click=${this._saveEditingAction}
                      .disabled=${!this._newActionName.trim() || !this._newActionService.trim() || (this._targetMode === 'custom' && !this._newActionTarget.trim())}
                    >
                      ${localize('editor.actions.save', { hass: this.hass })}
                    </ha-button>
                  `
                  : html`
                    <ha-button
                      @click=${this._addAction}
                      .disabled=${!this._newActionName.trim() || !this._newActionService.trim() || !canAddAction || (this._targetMode === 'custom' && !this._newActionTarget.trim())}
                    >
                      ${localize('editor.actions.add_button', { hass: this.hass })}
                    </ha-button>
                  `}
                <ha-button
                  @click=${this._hideActionForm}
                >
                  ${localize('editor.actions.cancel', { hass: this.hass })}
                </ha-button>
              </div>
            </div>
            `
            : html`
              ${canAddAction
                ? html`
                  <div class="actions-header">
                    <ha-button
                      @click=${this._showAddActionForm}
                    >
                      ${localize('editor.actions.add', { hass: this.hass })}
                    </ha-button>
                  </div>
                `
                : html`
                  <div class="max-actions-reached">
                    <ha-icon icon="mdi:information-outline"></ha-icon>
                    <span>${localize('editor.actions.max_reached', { hass: this.hass, search: '{MAX_ACTIONS}', replace: String(this.MAX_ACTIONS) })}</span>
                  </div>
                `}
            `}
        </div>
      </div>
    `;
  }

  private get _mainSchema() {
    return [
      { name: "entity", selector: { entity: { domain: "lawn_mower" } } },
      { name: "camera_entity", selector: { entity: { domain: "camera" } }, required: false },
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
      { name: "map_entity", selector: { entity: { domain: "device_tracker" } }, required: false }
    ];
  }

  private readonly _infoSchema = [
    { name: "progress_entity", selector: { entity: { domain: "sensor" } }, required: false },
    { name: "battery_entity", selector: { entity: { domain: "sensor", device_class: "battery" } }, required: false },
    { name: "charging_entity", selector: { entity: { domain: ["binary_sensor", "sensor"] } }, required: false }
  ];

  private get _viewOptionsSchema() {
    const defaultViewOptions = [
      { value: 'mower', label: localize('view.mower', { hass: this.hass }) }
    ];

    if (this.config.camera_entity) {
      defaultViewOptions.push({ value: 'camera', label: localize('view.camera', { hass: this.hass }) });
    }

    if (this.config.map_entity) {
      defaultViewOptions.push({ value: 'map', label: localize('view.map', { hass: this.hass }) });
    }
    
    return [{
        name: 'default_view',
        selector: {
          select: {
            mode: 'dropdown',
            options: defaultViewOptions,
          },
        },
    }];
  }

  private get _mapOptionsSchema() {
    const hasMapEntity = !!this.config.map_entity;
    const mapIsEnabled = hasMapEntity && this.config.enable_map !== false;
    const hasApiKey = !!this.config.google_maps_api_key;
    const useGoogleMaps = !!this.config.use_google_maps;

    const schema: any[] = [
      {
        name: 'enable_map',
        selector: { boolean: {} },
        disabled: !hasMapEntity,
      },
      {
        name: 'google_maps_api_key',
        selector: { text: {} },
        disabled: !mapIsEnabled,
      },
      {
        name: 'use_google_maps',
        selector: { boolean: {} },
        disabled: !mapIsEnabled || !hasApiKey,
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
        disabled: !mapIsEnabled || !hasApiKey || !useGoogleMaps,
      },
    ];

    return schema;
  }

  private get _colorOptionsSchema() {
    return [
      { name: 'sky_color_top', selector: { "color_rgb": {} } },
      { name: 'sky_color_bottom', selector: { "color_rgb": {} } },
      { name: 'grass_color_top', selector: { "color_rgb": {} } },
      { name: 'grass_color_bottom', selector: { "color_rgb": {} } },
    ];
  }

  private get _badgeColorOptionsSchema() {
    return [
      { name: 'badge_text_color', selector: { "color_rgb": {} } },
      { name: 'badge_icon_color', selector: { "color_rgb": {} } },
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

  private get _mainData() {
    return {
      entity: this.config.entity || '',
      camera_entity: this.config.camera_entity || '',
      camera_fit_mode: this.config.camera_fit_mode || 'cover',
      map_entity: this.config.map_entity || ''
    };
  }

  private get _infoData() {
    return {
      progress_entity: this.config.progress_entity || '',
      battery_entity: this.config.battery_entity || '',
      charging_entity: this.config.charging_entity || ''
    };
  }

  private get _optionsData() {
    return {
      default_view: this.config.default_view || 'mower',
      enable_map: this.config.enable_map !== false,
      google_maps_api_key: this.config.google_maps_api_key || '',
      map_type: this.config.map_type || 'hybrid',
      use_google_maps: this.config.use_google_maps === true && !!this.config.google_maps_api_key,
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
          <div class="version">
            ${localize('editor.version', { hass: this.hass })}: ${CARD_VERSION}
          </div>
        </div>
        <div class="config-container">
          
          <div class="config-section">
            <div class="section-header" @click=${() => this._toggleSection('main')}>
              <div class="section-title">
                <ha-icon icon="mdi:robot-mower"></ha-icon>
                ${localize("editor.section.main", { hass: this.hass })}
              </div>
              <ha-icon 
                class="collapse-icon ${this._sectionsExpanded.main ? 'expanded' : ''}" 
                icon="mdi:chevron-down">
              </ha-icon>
            </div>
            
            <div class="section-content ${this._sectionsExpanded.main ? 'expanded' : 'collapsed'}">
              <div class="section-description">
                ${localize("editor.section.main_description", { hass: this.hass })}
              </div>
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
                ${localize("editor.section.power", { hass: this.hass })}
              </div>
              <ha-icon 
                class="collapse-icon ${this._sectionsExpanded.power ? 'expanded' : ''}" 
                icon="mdi:chevron-down">
              </ha-icon>
            </div>
            
            <div class="section-content ${this._sectionsExpanded.power ? 'expanded' : 'collapsed'}">
              <div class="section-description">
                ${localize("editor.section.power_description", { hass: this.hass })}
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
                ${localize("editor.section.options", { hass: this.hass })}
              </div>
              <ha-icon 
                class="collapse-icon ${this._sectionsExpanded.ui ? 'expanded' : ''}" 
                icon="mdi:chevron-down">
              </ha-icon>
            </div>
            
            <div class="section-content ${this._sectionsExpanded.ui ? 'expanded' : 'collapsed'}">
              <div class="section-description">
                ${localize("editor.section.options_description", { hass: this.hass })}
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
                <div class="form-group-title">${localize('editor.options.model_options_title', { hass: this.hass })}</div>
                <ha-form
                  .hass=${this.hass}
                  .data=${this._optionsData}
                  .schema=${this._appearanceOptionsSchema}
                  .computeLabel=${this._boundComputeOptionsLabel}
                  @value-changed=${this._valueChanged}
                ></ha-form>
              </div>

              <div class="form-group">
                <div class="form-group-title">${localize('editor.options.color_options_title', { hass: this.hass })}</div>
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

          ${this._renderActionsSection()}
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