import { mowerGraphics } from './graphics/index';
import { MowerModel } from './types';
import { HomeAssistant } from 'custom-card-helpers';
import { localize } from './localize';

export const getGraphics = (model: MowerModel = 'default') => {
  return mowerGraphics[model] || mowerGraphics.default;
};

export const getAvailableMowerModels = (hass: HomeAssistant) => {
  return Object.keys(mowerGraphics).map(key => {
    const localizedLabel = localize(`editor.options.mower_models.${key}`, { hass });
    const label = localizedLabel !== `editor.options.mower_models.${key}`
      ? localizedLabel
      : key.charAt(0).toUpperCase() + key.slice(1);

    return { value: key, label };
  });
};