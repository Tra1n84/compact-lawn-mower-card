import { renderDefaultMower } from './default';
import { MowerRenderFunction } from '../types';

export const mowerGraphics: { [key: string]: MowerRenderFunction } = {
  default: renderDefaultMower,
};