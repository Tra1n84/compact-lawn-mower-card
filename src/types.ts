import { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor, ActionConfig } from 'custom-card-helpers';
import { TemplateResult } from 'lit';

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface HassEntityAttributeBase {
  friendly_name?: string;
  icon?: string;
  entity_picture?: string;
  supported_features?: number;
  hidden?: boolean;
  assumed_state?: boolean;
  device_class?: string;
  state_class?: string;
  unit_of_measurement?: string;
}

export interface LawnMowerEntity extends HassEntity {
  entity_id: string;
  state: string;
  attributes: LawnMowerAttributes;
}

export interface LawnMowerAttributes extends HassEntityAttributeBase {
  battery_level?: number;
}

export interface ServiceCallActionConfig {
  action: 'call-service';
  service: string;
  service_data?: Record<string, any>;
  data?: Record<string, any>;
  target?: {
    entity_id?: string | string[];
    device_id?: string | string[];
    area_id?: string | string[];
  };
  confirmation?: {
    text?: string;
    exemptions?: Array<{
      user: string;
    }>;
  };
}

export type CustomActionConfig = 
  | ServiceCallActionConfig 
  | ActionConfig;

export type MowerModel = 'default' | string;

export type MowerRenderFunction = (
  state: string,
  svgClass: string,
  ledColor: string,
  batteryColor: string,
  ringCircumference: number,
  ringStrokeOffset: number,
  stationLedColor: string
) => TemplateResult;

export interface CustomAction {
  name: string;
  icon: string;
  action: CustomActionConfig;
}

export interface CompactLawnMowerCardConfig extends LovelaceCardConfig {
  type: string;
  entity: string;
  battery_entity?: string;
  charging_entity?: string;
  camera_entity?: string;
  progress_entity?: string;
  map_entity?: string; 
  google_maps_api_key?: string; 
  mower_model?: MowerModel;
  use_google_maps?: boolean;
  default_view?: 'mower' | 'camera' | 'map';
  enable_map?: boolean; 
  camera_fit_mode?: 'cover' | 'contain';
  custom_actions?: CustomAction[];
  map_type?: 'roadmap' | 'satellite' | 'hybrid';
  sky_color_top?: string | number[];
  sky_color_bottom?: string | number[];
  grass_color_top?: string | number[];
  grass_color_bottom?: string | number[];
  badge_text_color?: string | number[];
  badge_icon_color?: string | number[];
}