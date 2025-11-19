import { html, TemplateResult } from 'lit';
import { MowerRenderFunction } from '../types';

export const renderDefaultMower: MowerRenderFunction = (
  state,
  svgClass,
  ledColor,
  batteryColor,
  ringCircumference,
  ringStrokeOffset,
  stationLedColor
) => {
  return html`
    <?xml version="1.0" encoding="utf-8"?>
    <svg viewBox="0 0 178 100" preserveAspectRatio="xMinYMax meet" class="mower-svg ${svgClass}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mowerBodyGradient" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stop-color="var(--mower-body-highlight, #f5f5f5)"/>
          <stop offset="1" stop-color="var(--mower-body-base, #e0e0e0)"/>
        </linearGradient>
        <radialGradient id="wheelTireGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0.85" stop-color="var(--wheel-tire-color, #333)"/>
          <stop offset="1" stop-color="var(--wheel-tire-edge-color, #222)"/>
        </radialGradient>
        <radialGradient id="wheelRimGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="var(--wheel-rim-highlight, #ccc)"/>
          <stop offset="1" stop-color="var(--wheel-rim-base, #999)"/>
        </radialGradient>
        <linearGradient id="stationBaseGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#555"/>
          <stop offset="0.5" stop-color="#444"/>
          <stop offset="1" stop-color="#555"/>
        </linearGradient>

        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.15"/>
        </filter>
        <filter id="ledGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="batteryGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g transform="translate(0, 10)">
        <g class="mower-body body-translate" filter="url(#softShadow)" transform="matrix(1, 0, 0, 0.99008, 0, 0.872922)">
          <g class="wheel-back" transform="matrix(1, 0, 0, 1, 2, 0)">
            <g class="wheel-rotation" transform-origin="55 70">
              <circle cx="55" cy="70" r="15" fill="url(#wheelTireGradient)"/>
              <g class="tire-profile" transform="translate(55, 70)" opacity="0.3">
                <path d="M -10 -10 L -12 -8 L -8 -12 L -10 -10 M 10 10 L 12 8 L 8 12 L 10 10 M -10 10 L -12 8 L -8 12 L -10 10 M 10 -10 L 12 -8 L 8 -12 L 10 -10" stroke="#111" stroke-width="1" fill="none"/>
              </g>
              <circle cx="55" cy="70" r="7" fill="url(#wheelRimGradient)"/>
              <g class="wheel-spokes" transform="translate(55, 70)" stroke="#777" stroke-width="1" opacity="0.7">
                <line x1="0" y1="-6" x2="0" y2="6"/>
                <line x1="-4.24" y1="-4.24" x2="4.24" y2="4.24"/>
                <line x1="-6" y1="0" x2="6" y2="0"/>
                <line x1="-4.24" y1="4.24" x2="4.24" y2="-4.24"/>
              </g>
              <circle cx="55" cy="70" r="2" fill="#555"/>
            </g>
          </g>
          <g class="wheel-front" transform="matrix(1, 0, 0, 1, 18.293166, 1.063422)">
            <g class="wheel-rotation" transform-origin="110 74">
              <circle cx="110" cy="74" r="10" fill="url(#wheelTireGradient)"/>
              <circle cx="110" cy="74" r="5" fill="url(#wheelRimGradient)"/>
              <g class="wheel-spokes" transform="translate(110, 74)" stroke="#777" stroke-width="0.8" opacity="0.7">
                <line x1="0" y1="-4" x2="0" y2="4"/>
                <line x1="-2.83" y1="-2.83" x2="2.83" y2="2.83"/>
                <line x1="-4" y1="0" x2="4" y2="0"/>
                <line x1="-2.83" y1="2.83" x2="2.83" y2="-2.83"/>
              </g>
              <circle cx="110" cy="74" r="1.5" fill="#555"/>
            </g>
          </g>
          <path d="M 40 61.062 C 37.5 54.359 43.817 41.062 47.567 37.152 C 50.717 33.867 55.551 29.385 63.424 27.649 C 64.719 27.363 69.722 27.218 71.252 27.284 L 81.768 29.71 C 85.08 30.968 88.612 31.873 91.46 32.965 C 95.934 34.68 104.803 37.769 108.243 39.138 C 115.539 42.041 115.714 42.453 121.409 44.848 C 122.997 45.516 131.345 50.246 132.123 50.745 C 137.513 54.202 139.531 55.222 141.426 56.962 C 145.246 60.469 144.215 63.412 144.412 69.769 L 131.515 69.851 L 120 70 L 85 70 L 50 70 L 45 65.531 L 40 61.062 Z" fill="url(#mowerBodyGradient)" stroke="#ccc" stroke-width="0.5"/>
          <rect x="79.317" y="56.547" width="30.754" height="3.655" rx="1" fill="${ledColor}" filter="url(#ledGlow)" class="mower-led-strip" style="paint-order: fill;"/>
          <g class="circular-battery-display" transform="matrix(1, 0, 0, 1, 62.883192, 29.151221)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#333" stroke-width="2.5" opacity="0.3"/>
            <circle 
              cx="0" cy="0" r="10"
              fill="none"
              stroke="${batteryColor}"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="${ringCircumference}"
              stroke-dashoffset="${ringStrokeOffset}"
              transform="rotate(-90)"
              filter="url(#batteryGlow)"
              class="battery-progress-ring"
            />
            <circle cx="0" cy="0" r="7" fill="#ffffff" stroke="#333" stroke-width="1" filter="url(#batteryGlow)"/>
            <g transform="scale(0.75)">
              <rect x="-3" y="-2.5" width="6" height="5" rx="0.8" fill="none" stroke="#333" stroke-width="1"/>
              <rect x="3" y="-1" width="1.5" height="2" rx="0.3" fill="#333"/>
              <rect x="-2.5" y="-2" width="5" height="4" rx="0.5" fill="${batteryColor}" opacity="0.8"/>
            </g>
          </g>
          <ellipse cx="87" cy="84" rx="56.319" ry="4" fill="#000" opacity="0.1" filter="blur(1px)"/>
        </g>
        <g class="charging-station" filter="url(#softShadow)" transform="matrix(1, 0, 0, 1.091808, 0, -4.724333)">
          <path d="M 0 85 L 40 85 L 40 55.652 C 40 51.459 35 51.459 30 51.459 L 10 51.459 C 5 51.459 0 51.459 0 55.652 L 0 85 Z" fill="url(#stationBaseGradient)" stroke="#222" stroke-width="0.5"/>
          <rect x="14.474" y="54.581" width="10" height="3.751" fill="${stationLedColor}" class="charging-station-led"/>
        </g>
      </g>
    </svg>
  `;
};