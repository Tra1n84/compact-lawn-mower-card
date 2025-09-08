import { HomeAssistant } from 'custom-card-helpers';
import { localize } from './localize';
import { CustomAction, ServiceCallActionConfig } from './types';

export const getDefaultActions = (hass: HomeAssistant): CustomAction[] => [
  {
    name: localize('default_actions.start_mowing', { hass }),
    icon: 'mdi:play',
    action: {
      action: 'call-service',
      service: 'lawn_mower.start_mowing',
      target: { entity_id: '{{ entity }}' },
    } as ServiceCallActionConfig,
  },
  {
    name: localize('default_actions.pause', { hass }),
    icon: 'mdi:pause',
    action: {
      action: 'call-service',
      service: 'lawn_mower.pause',
      target: { entity_id: '{{ entity }}' },
    } as ServiceCallActionConfig,
  },
  {
    name: localize('default_actions.return_to_dock', { hass }),
    icon: 'mdi:home-map-marker',
    action: {
      action: 'call-service',
      service: 'lawn_mower.dock',
      target: { entity_id: '{{ entity }}' },
    } as ServiceCallActionConfig,
  },
];