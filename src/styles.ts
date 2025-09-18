import { css } from 'lit';

/* =================== */
/*    Popup Styles     */
/* =================== */
export const cameraPopupStyles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .popup-content {
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border-radius: 16px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      display: flex;
      flex-direction: column;
      min-width: 40vw;
      will-change: transform, opacity;
    }
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: var(--secondary-background-color);
      border-bottom: 1px solid var(--divider-color);
    }
    
    .popup-title {
      margin: 0;
      color: var(--primary-text-color);
      font-size: 16px;
      font-weight: 500;
    }
    
    .popup-close {
      background: rgba(255, 255, 255, 0.85);
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--primary-text-color);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      will-change: background-color;
    }
    
    .popup-close:hover {
      background: rgba(208, 208, 208, 0.85);
    }
    
    .popup-stream-container {
      width: 100%;
      height: auto;
      max-height: calc(90vh - 65px);
      display: flex;
      min-height: 30vh;
    }

    .popup-stream-container.camera-error {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color);
      padding: 40px;
      box-sizing: border-box;
    }

    .popup-stream-container.camera-error ha-icon {
      --mdc-icon-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    ha-camera-stream {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
    }
`;

/* =================== */
/*    Card Styles      */
/* =================== */
export const compactLawnMowerCardStyles = css`

    :host {
      --tile-color: var(--surface-variant, var(--secondary-background-color));
      --outline-color: var(--outline, rgba(var(--rgb-on-surface), 0.12));
      --badge-box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px,
        rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
      --tile-button-box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px,
        rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
    }

    ha-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background: var(--ha-card-background,var(--card-background-color,#fff));
      border-radius: 12px;
      box-shadow: var(--ha-card-box-shadow, 
        0 2px 8px 0 rgba(0, 0, 0, 0.08),
        0 1px 16px 0 rgba(0, 0, 0, 0.04)
      );
      backdrop-filter: blur(20px);
      border: none;
      overflow: hidden;
      transition: all 0.15s cubic-bezier(0.2, 0, 0, 1);
      font-family: var(--mdc-typography-body2-font-family, Roboto);
      position: relative;
      color: var(--primary-text-color);
    }

    .warning {
      padding: 16px;
      color: var(--error-color);
      text-align: center;
    }

    .card-content {
      padding: 8px;
      flex: 1;
      display: grid;
      grid-template-rows: 1fr auto;
      grid-template-columns: 1fr;
      gap: 8px;
      height: 100%;
      position: relative;
      box-sizing: border-box;
      min-height: 0;
    }

    /* =================== */
    /*   Main Display      */
    /* =================== */
    .main-display-area {
      display: grid;
      grid-template-areas: "display";
      grid-template-rows: 1fr;
      grid-template-columns: 1fr;
      border-radius: 12px;
      border: 1px solid var(--outline-color);
      position: relative;
      overflow: hidden;
      min-height: 120px;
      container-type: inline-size;
    }

    .mower-display {
      grid-area: display;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      position: relative;
      overflow: hidden;
      padding: 0px;
      box-sizing: border-box;
      background: linear-gradient(
        to bottom, 
        var(--sky-color-top, rgb(41, 128, 185)) 0%,
        var(--sky-color-bottom, rgb(109, 213, 250)) var(--sky-percentage, 70%),
        var(--grass-color-top, rgb(88, 140, 54)) var(--sky-percentage, 70%),    
        var(--grass-color-bottom, rgb(133, 187, 88)) 100%   
      );
    }

    /* =================== */
    /*      Badges         */
    /* =================== */
    .progress-badges {
      grid-area: display;
      position: relative;
      z-index: 10;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 8px;
      pointer-events: none;
    }

    .progress-badge {
      background: rgba(255, 255, 255, 0.70);
      backdrop-filter: blur(20px) saturate(180%);
      border: none;
      border-radius: 12px;
      padding: 6px 10px;
      box-shadow: var(--badge-box-shadow);
      display: flex;
      align-items: center;
      pointer-events: auto;
      gap: 6px;
      height: 38px;
      box-sizing: border-box;
    }

    .status-badges {
      grid-area: display;
      position: relative;
      z-index: 10;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 8px;
      pointer-events: none;
    }

    .status-ring {
      background: rgba(255, 255, 255, 0.70);
      backdrop-filter: blur(20px) saturate(180%);
      border: none;
      border-radius: 12px;
      box-shadow: var(--badge-box-shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      pointer-events: auto;
      padding: 6px 10px;
      gap: 6px;
      min-width: fit-content;
      height: 38px;
      box-sizing: border-box;
    }

    .status-ring.charging {
      border: 1px solid rgba(var(--rgb-success-color), 0.3);
    }

    .view-toggle {
      grid-area: display;
      position: relative;
      z-index: 10;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      padding: 8px;
      gap: 4px;
      pointer-events: none;
    }

    .view-toggle-button {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.60);
      backdrop-filter: blur(10px) saturate(180%);
      border: none;
      border-radius: 12px;
      box-shadow: var(--badge-box-shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s ease-out, transform 0.15s ease-out, box-shadow 0.2s ease-out;
      pointer-events: auto;
      color: var(--primary-text-color);
      will-change: background-color, box-shadow;
    }

    .view-toggle-button:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px) scale(1.02);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.15),
        0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .view-toggle-button:active {
      transform: scale(0.95);
    }

    .view-toggle-button ha-icon {
      --mdc-icon-size: 20px;
      transition: transform 0.15s ease-out;
      will-change: transform;
    }

    .view-toggle-button.active {
      background: var(--primary-color);
      color: white;
    }

    .main-display-area.camera-view .progress-badge,
    .main-display-area.camera-view .status-ring,
    .main-display-area.camera-view .view-toggle-button:not(.active) {
      background: rgba(255, 255, 255, 0.85);
    }

    .badge-icon {
      --mdc-icon-size: 22px;
      font-size: 18px;
      color: var(--primary-text-color);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .progress-text-small,
    .status-text,
    .battery-text-badge {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary-text-color);
      white-space: nowrap;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .status-icon {
      width: 22px;
      height: 22px;
      font-weight: bold;
      flex-shrink: 0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .status-icon.charging {
      color: var(--success-color, #4caf50);
    }

    .status-icon.mowing {
      color: var(--warning-color, #ff9800);
    }

    .status-icon.returning {
      color: var(--primary-color, rgba(33, 150, 243, 0.6));
    }

    .status-icon.paused {
      color: rgb(0, 0, 0);
    }

    .status-icon.error {
      color: var(--error-color);
    }

    .status-icon::after {
      content: '';
      position: absolute;
      top: -6px;
      left: -6px;
      width: calc(100% + 12px);
      height: calc(100% + 12px);
      border-radius: 50%;
      opacity: 0;
      will-change: transform, opacity;
      pointer-events: none;
    }

    .status-icon.charging::after,
    .status-icon.mowing::after,
    .status-icon.returning::after,
    .status-icon.error::after {
      animation: pulse-scale 2s ease-out infinite;
    }

    .status-icon.error::after {
      animation-duration: 1s;
    }

    .status-icon.charging::after {
      box-shadow: 0 0 8px 2px rgba(76, 175, 80, 0.7);
    }

    .status-icon.mowing::after {
      box-shadow: 0 0 8px 2px rgba(255, 152, 0, 0.7);
    }

    .status-icon.returning::after {
      box-shadow: 0 0 8px 2px rgba(33, 150, 243, 0.7);
    }

    .status-icon.error::after {
      box-shadow: 0 0 8px 2px rgba(244, 67, 54, 0.7);
    }

    .status-ring.text-hidden .status-text,
    .status-ring.text-hidden .badge-separator {
      display: none;
    }
    /* =================== */
    /*     Mower SVG       */
    /* =================== */
    .mower-svg {
      width: 90%;
      min-width: 170px;
      max-height: 90%;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
      transition: filter 0.3s cubic-bezier(0.2, 0, 0, 1);
      display: block;
      flex-shrink: 0;
      position: absolute;
      left: 10px;
      bottom: -2%;
      will-change: filter;
    }

    .mower-svg.active {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)) drop-shadow(0 0 8px rgba(255, 152, 0, 0.3));
    }

    .mower-svg.charging {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)) drop-shadow(0 0 8px rgba(76, 175, 80, 0.3));
    }

    .mower-svg.returning {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)) drop-shadow(0 0 8px rgba(33, 150, 243, 0.3));
    }

    .mower-svg.error {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)) drop-shadow(0 0 8px rgba(244, 67, 54, 0.3));
    }

    .mower-svg.active .mower-led-strip {
      animation: ledStripActive 2s ease-in-out infinite;
      will-change: opacity;
    }

    .mower-svg.charging-animated .mower-led-strip,
    .mower-svg.charging-animated .charging-station-led {
      animation: ledStripCharging 2s ease-in-out infinite;
      will-change: opacity;
    }

    .mower-svg.returning .mower-led-strip {
      animation: ledStripReturning 2s ease-in-out infinite;
      will-change: opacity;
    }

    .mower-svg.error .mower-led-strip {
      animation: ledStripError 1s ease-in-out infinite;
      will-change: opacity;
    }

    .mower-svg.charging-static .mower-led-strip,
    .mower-svg.charging-static .charging-station-led {
      opacity: 0.8;
    }

    .mower-svg.docked-static .mower-led-strip {
      opacity: 0.8;
    }

    .mower-svg.on-lawn-static.active .wheel-back .wheel-rotation {
      animation: rotateWheel 1.5s linear infinite;
      will-change: transform;
    }
    .mower-svg.on-lawn-static.active .wheel-front .wheel-rotation {
      animation: rotateWheel 0.6s linear infinite;
      will-change: transform;
    }

    .mower-svg.driving-to-dock .wheel-back .wheel-rotation,
    .mower-svg.driving-from-dock .wheel-back .wheel-rotation {
      animation: rotateWheelDriveBack 2s cubic-bezier(0.45, 0, 0.55, 1) forwards;
      will-change: transform;
    }
    .mower-svg.driving-to-dock .wheel-front .wheel-rotation,
    .mower-svg.driving-from-dock .wheel-front .wheel-rotation {
      animation: rotateWheelDriveFront 2s cubic-bezier(0.45, 0, 0.55, 1) forwards;
      will-change: transform;
    }
    
    .mower-svg.driving-to-dock .mower-body {
      animation: driveToDock 2s linear forwards;
      will-change: transform;
    }

    .mower-svg.driving-from-dock .mower-body {
      animation: driveFromDock 2s linear forwards;
      will-change: transform;
    }

    .mower-svg.docked-static:not(.driving-from-dock):not(.driving-to-dock) .mower-body {
      transform: translateX(-20px);
    }

    .mower-svg.charging-static:not(.driving-from-dock):not(.driving-to-dock) .mower-body {
      transform: translateX(-20px);
    }

    .mower-svg.on-lawn-static:not(.driving-from-dock):not(.driving-to-dock) .mower-body {
      transform: translateX(30px);
    }

    .mower-svg.on-lawn-static.active .mower-body {
      transform: translateX(30px);
      animation: BounceOnLawn 3s cubic-bezier(0.45, 0, 0.55, 1) infinite;
      will-change: transform;
    }

    .sleep-animation {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 15;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .sleep-z {
      font-size: 24px;
      font-weight: bold;
      color: var(--primary-text-color);
      opacity: 0;
      animation: sleepZFloat 4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
      will-change: transform, opacity;
    }

    .sleep-z:nth-child(1) {
      animation-delay: 0s;
      font-size: 18px;
    }

    .sleep-z:nth-child(2) {
      animation-delay: 0.8s;
      font-size: 20px;
    }

    .sleep-z:nth-child(3) {
      animation-delay: 2s;
      font-size: 24px;
    }

    .mower-svg.sleeping .mower-led-strip {
      opacity: 0.3;
      animation: sleepBreathe 4s ease-in-out infinite;
      will-change: opacity;
    }

    /* =================== */
    /*    Camera View      */
    /* =================== */
    .camera-in-popup {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--primary-text-color);
      background-color: rgba(0,0,0,0.05);
      text-align: center;
      padding: 16px;
      cursor: pointer;
    }

    .camera-in-popup ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.7;
      color: rgba(255, 255, 255, 0.9);
    }

    .camera-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
      background-color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
    }

    .camera-container.clickable {
      transition: transform 0.15s ease-out;
      cursor: pointer;
    }

    .camera-container.clickable:hover {
      transform: scale(1.02);
    }

    .camera-container:not(.clickable) .camera-overlay {
      transition: opacity 0.4s ease-in-out;
      will-change: opacity;
    }

    .camera-container ha-camera-stream {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      justify-content: center;
    }

    .camera-container ha-camera-stream.fit-mode-contain {
      align-items: center;
    }

    .camera-container ha-camera-stream.fit-mode-cover {
      align-items: stretch;
    }

    .camera-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      color: rgba(255, 255, 255, 0.9);
      text-align: center;
      padding: 16px;
    }

    .camera-error ha-icon {
      --mdc-icon-size: 32px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .camera-overlay {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(20px) saturate(180%);
      box-shadow: var(--badge-box-shadow);
      padding: 4px 8px;
      border-radius: 12px;
      transition: background-color 0.15s ease-out, transform 0.15s ease-out;
      will-change: background-color;
    }

    .camera-overlay:hover {
      background: rgba(var(--rgb-primary-color), 0.2);
      transform: scale(1.05);
    }

    /* =================== */
    /*     Map View        */
    /* =================== */
    .map-container {
      position: relative;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background-color: #f0f0f0;
      border-radius: 12px;
      overflow: hidden;
      transition: background-color 0.3s ease;
      will-change: background-color;
    }

    .map-container.is-loading {
      background-color: #000;
    }

    .map-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      color: var(--secondary-text-color);
      text-align: center;
      padding: 16px;
    }

    .map-error ha-icon {
      --mdc-icon-size: 32px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .map-image {
      width: 100%;
      height: 100%;
      display: block;
    }

    .mower-marker {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      color: #ff6b35;
      font-size: 24px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mower-marker ha-icon {
      --mdc-icon-size: 20px;
      color: var(--primary-color);
    }

    .map-controls-wrapper {
      position: absolute;
      bottom: 8px;
      left: 8px;
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .map-controls {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .map-control-button {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      will-change: background;
    }

    .map-control-button:hover {
      background: rgba(255, 255, 255, 1);
    }

    /* =================== */
    /*  Action Buttons     */
    /* =================== */
    .controls-area {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: center;
      min-height: 44px;
    }

    .buttons-section {
      display: flex;
      gap: 4px;
    }

    .tile-card-button {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid var(--outline-color);
      border-radius: 8px;
      background: var(--tile-color);
      color: var(--primary-text-color);
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s ease-out, box-shadow 0.2s ease-out;
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      will-change: background-color, box-shadow;
    }

    .tile-card-button:hover {
      background: color-mix(in srgb, var(--tile-color) 92%, black);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .tile-card-button ha-icon {
      --mdc-icon-size: 20px;
    }

    /* =================== */
    /*      Loader         */
    /* =================== */
    .loading-indicator {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      transition: all 0.3s ease;
      border-radius: 12px;
    }

    .loader {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 4px solid rgba(var(--rgb-primary-text-color), 0.2);
      border-top-color: var(--primary-color);
      animation: spin 1s linear infinite;
      will-change: transform;
    }

    /* =================== */
    /*    Animations       */
    /* =================== */
    @keyframes pulse-scale {
      0% {
        transform: scale(0.7);
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: scale(1.1);
        opacity: 0;
      }
    }

    @keyframes sleepZFloat {
      0% {
        opacity: 0;
        transform: translate3d(0, 10px, 0) scale(0.8);
      }
      25% {
        opacity: 1;
        transform: translate3d(2px, -10px, 0) scale(1);
      }
      75% {
        opacity: 0.5;
        transform: translate3d(-2px, -35px, 0) scale(0.9);
      }
      100% {
        opacity: 0;
        transform: translate3d(0, -50px, 0) scale(0.8);
      }
    }

    @keyframes sleepBreathe {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }

    @keyframes rotateWheel {
      from { 
        transform: rotate(0deg);
      }
      to { 
        transform: rotate(360deg);
      }
    }

    @keyframes rotateWheelDriveBack {
      from { transform: rotate(0deg); }
      to { transform: rotate(480deg); }
    }

    @keyframes rotateWheelDriveFront {
      from { transform: rotate(0deg); }
      to { transform: rotate(1200deg); }
    }

    @keyframes driveToDock {
      0%    { transform: translate(30px, 0px); }
      10%   { transform: translate(29px, 0px); }
      20%   { transform: translate(26px, 0px); }
      30%   { transform: translate(21px, 0px); }
      40%   { transform: translate(14px, 0px); }
      50%   { transform: translate(5px, 0px); }
      60%   { transform: translate(-4px, 0px); }
      70%   { transform: translate(-11px, 0px); }
      80%   { transform: translate(-16px, 0px); }
      90%   { transform: translate(-19px, 0.3px); }
      95%   { transform: translate(-19.75px, 0.5px); }
      100%  { transform: translate(-20px, 0px); }
    }

    @keyframes driveFromDock {
      0%    { transform: translate(-20px, 0px); }
      5%    { transform: translate(-19.9px, -0.3px); }
      10%   { transform: translate(-19.5px, -0.5px); }
      15%   { transform: translate(-18.5px, -0.5px); }
      20%   { transform: translate(-17px, -0.4px); }
      30%   { transform: translate(-13px, -0.2px); }
      40%   { transform: translate(-8px, 0px); }
      50%   { transform: translate(-1.5px, 0px); }
      60%   { transform: translate(6px, 0px); }
      70%   { transform: translate(14px, 0px); }
      80%   { transform: translate(21.5px, 0px); }
      90%   { transform: translate(27px, 0px); }
      100%  { transform: translate(30px, 0px); }
    }

    @keyframes BounceOnLawn {
      0%, 100% { 
        transform: translateX(30px) translateY(0px); 
      }
      25% { 
        transform: translateX(30px) translateY(-1px); 
      }
      50% { 
        transform: translateX(30px) translateY(-0.2px); 
      }
      75% { 
        transform: translateX(30px) translateY(-1.2px); }
    }

    @keyframes ledStripActive {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; }
    }

    @keyframes ledStripCharging {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    @keyframes ledStripReturning {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    @keyframes ledStripError {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* =================== */
    /*  Responsive Design  */
    /* =================== */
    @container (max-width: 200px) {
      .card-content {
        padding: 4px;
        gap: 4px;
      }
      
      .main-display-area {
        min-height: 80px;
      }

      .progress-badges,
      .status-badges,
      .view-toggle {
        padding: 4px;
      }

      .progress-badge {
        padding: 6px 10px;
        height: 36px;
      }
      
      .progress-text-small {
        font-size: 11px;
      }
      
      .controls-area {
        grid-template-columns: 1fr;
        gap: 4px;
        min-height: auto;
      }

      .tile-card-button {
        padding: 6px 8px;
        min-height: 34px;
        font-size: 10px;
      }
      
      .tile-card-button ha-icon {
        --mdc-icon-size: 18px;
      }

      .status-ring,
      .view-toggle-button {
        width: 34px;
        height: 36px;
      }

      .view-toggle-button ha-icon {
        --mdc-icon-size: 18px;
      }

      .badge-icon {
        --mdc-icon-size: 20px;
        font-size: 12px;
      }

      .status-icon {
        width: 20px;
        height: 20px;
      }
    }

    @container (min-width: 300px) and (max-width: 380px) {
      .card-content {
        padding: 6px;
        gap: 6px;
      }
      
      .main-display-area {
        min-height: 100px;
      }

      .progress-badges,
      .status-badges,
      .view-toggle {
        padding: 6px;
      }

      .progress-badge {
        padding: 8px 12px;
        gap: 3px;
      }
      
      .progress-text-small {
        font-size: 12px;
      }
      
      .controls-area {
        grid-template-columns: 1fr;
        gap: 6px;
        min-height: auto;
      }

      .tile-card-button {
        padding: 6px 8px;
        min-height: 36px;
        font-size: 10px;
      }
      
      .tile-card-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .view-toggle-button {
        width: 36px;
        height: 36px;
      }

      .view-toggle-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .badge-icon {
        font-size: 14px;
      }

      .status-icon {
        width: 22px;
        height: 22px;
      }
    }

    @media (max-width: 600px) {
      .buttons-section {
        gap: 2px;
      }
      
      .tile-card-button {
        padding: 8px;
        min-height: 36px;
      }
      
      .tile-card-button ha-icon {
        --mdc-icon-size: 20px;
      }
    }

    @media (max-width: 480px) {
      .camera-container {
        padding: 2px;
      }
      
      .camera-overlay {
        bottom: 8px;
        right: 8px;
        padding: 2px 6px;
        font-size: 9px;
      }
    }

    @media (min-width: 768px) {
      .status-ring {
        padding: 8px 12px;
        gap: 6px;
      }

      .badge-icon {
        --mdc-icon-size: 22px;
        font-size: 15px;
      }

      .status-icon {
        width: 22px;
        height: 22px;
      }

      .status-text {
        font-size: 12px;
      }

      .progress-badge {
        padding: 8px 12px;
      }

      .tile-card-button {
        font-size: 13px;
        padding: 10px 14px;
        min-height: 40px;
      }

      .view-toggle-button {
        width: 36px;
        height: 36px;
      }

      .view-toggle-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .tile-card-button ha-icon {
        --mdc-icon-size: 20px;
      }
    }

    @media (prefers-color-scheme: dark) {
      .camera-container {
        background-color: rgba(var(--rgb-primary-background-color), 0.8);
      }
    }

    /* =================== */
    /*  Performance        */
    /* =================== */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    .mower-svg,
    .status-icon,
    .view-toggle-button,
    .sleep-z,
    .loader,
    .camera-overlay,
    .tile-card-button {
      backface-visibility: hidden;
      perspective: 1000px;
    }

`;

/* =================== */
/*   Editor Styles     */
/* =================== */
export const editorStyles = css`

    .card-config {
      padding: 16px;
      overflow: visible;
      min-height: fit-content;
    }

    .card-config.loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 120px;
    }

    .loading-text {
      color: var(--secondary-text-color);
      font-style: italic;
    }

    /* =================== */
    /*      Header         */
    /* =================== */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
    }

    .card-header .name {
      font-weight: bold;
      font-size: 1.1em;
      color: rgb(86, 159, 66);
    }

    .card-header .version {
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }

    .config-container {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      border: 1px solid var(--divider-color, #e0e0e0);
      overflow: visible;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* =================== */
    /*     Sections        */
    /* =================== */
    .config-section {
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .config-section:last-child {
      border-bottom: none;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      user-select: none;
      will-change: background-color;
    }

    .section-header:hover {
      background: var(--secondary-background-color, #f8f9fa);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .section-title ha-icon {
      --mdc-icon-size: 20px;
      color: var(--primary-color, #03a9f4);
    }

    .action-count {
      font-size: 0.8em;
      font-weight: 400;
      color: var(--secondary-text-color);
      margin-left: 4px;
    }

    .collapse-icon {
      --mdc-icon-size: 24px;
      color: var(--secondary-text-color);
      transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
      will-change: transform;
    }

    .collapse-icon.expanded {
      transform: rotate(180deg);
    }

    .section-content {
      overflow: hidden;
      transition: max-height 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s ease;
      will-change: max-height, opacity;
    }

    .section-content.expanded {
      padding: 0 20px 20px 20px;
      max-height: none;
      opacity: 1;
    }

    .section-content.collapsed {
      padding: 0 20px;
      max-height: 0;
      opacity: 0;
    }

    .section-description {
      font-size: 14px;
      color: var(--secondary-text-color);
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .form-group {
      border: 1px solid var(--divider-color);
      padding: 16px;
      border-radius: 12px;
      margin-top: 16px;
    }

    .form-group-title {
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--primary-text-color);
      font-size: 15px;
    }

    /* =================== */
    /*  Forms & Buttons    */
    /* =================== */
    ha-form {
      width: 100%;
    }

    .form-buttons ha-button,
    .actions-header ha-button {
      --mdc-theme-primary: var(--primary-color);
      --mdc-button-outline-color: transparent;
      --mdc-button-outline-width: 0;
      box-shadow: none;
      border: none;
      padding: 0;
      min-width: 100px;
      height: 40px;
      border-radius: 20px;
      font-weight: bold;
    }

    .add-action-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px;
      border: 2px solid var(--primary-color);
      border-radius: 12px;
      margin: 16px 0 24px 0;
      background: var(--card-background-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 10;
    }
    
    .form-header {
      font-weight: 600;
      color: var(--primary-text-color);
      margin-bottom: 8px;
      font-size: 18px;
      padding-left: 12px;
      border-left: 4px solid var(--primary-color);
    }
    
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .form-section-title {
      font-weight: 500;
      color: var(--primary-text-color);
      font-size: 15px;
      margin-bottom: 4px;
    }
    
    .form-buttons {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      justify-content: flex-end;
    }

    /* =================== */
    /*     Actions         */
    /* =================== */
    .actions-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
      gap: 8px;
    }
    
    .action-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 12px;
      margin-bottom: 12px;
      border-left: 4px solid var(--primary-color);
      gap: 12px;
    }
    
    .action-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: linear-gradient(0deg,rgba(84, 179, 122, 1) 0%, rgba(106, 217, 139, 1) 100%);
      border-radius: 12px;
      color: var(--text-primary-color, white);
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    .action-icon ha-icon {
      --mdc-icon-size: 24px;
    }
    
    .action-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .action-name {
      font-weight: 600;
      color: var(--primary-text-color);
      font-size: 15px;
      line-height: 1.2;
    }
    
    .action-type {
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
      position: relative;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .action-buttons ha-icon-button {
      --mdc-icon-button-size: 42px;
      --mdc-icon-size: 20px;
      height: 42px;
      color: var(--secondary-text-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
      border-radius: 8px;
      --mdc-ripple-border-radius: 8px;
      will-change: background-color, color;
    }

    .action-buttons ha-icon-button ha-icon {
      display: flex;
    }

    .action-buttons ha-icon-button:hover {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
      color: var(--primary-color);
    }

    .action-buttons ha-icon-button:nth-child(2):hover {
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.2);
      color: var(--error-color, #f44336);
    }

    .max-actions-reached {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, var(--info-color, #2196f3), var(--info-color, #1976d2));
      color: var(--text-primary-color, white);
      border-radius: 12px;
      margin-top: 16px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
    }
    
    .max-actions-reached ha-icon {
      --mdc-icon-size: 22px;
    }
    
    .no-actions-text {
      color: var(--secondary-text-color);
      font-style: italic;
      text-align: center;
      margin: 24px 0;
      padding: 32px 20px;
      background: var(--secondary-background-color);
      border-radius: 12px;
      border: 2px dashed var(--divider-color);
    }

    /* =================== */
    /*      Icons          */
    /* =================== */
    .icon-selector {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .icon-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      border: 2px solid var(--primary-color);
    }
    
    .icon-preview ha-icon {
      --mdc-icon-size: 28px;
      color: var(--primary-color);
    }
    
    .icon-preview span {
      font-family: 'Roboto Mono', monospace;
      font-size: 14px;
      color: var(--primary-text-color);
      font-weight: 500;
    }
    
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(36px, 1fr));
      gap: 6px;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      max-height: 400px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .icon-option {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      cursor: pointer;
      border: 2px solid transparent;
      background: var(--card-background-color);
      transition: border-color 0.15s ease, transform 0.15s ease;
      will-change: border-color;
    }
    
    .icon-option.selected {
      border-color: var(--primary-color);
      transform: scale(1.1);
    }
    
    .icon-option ha-icon {
      --mdc-icon-size: 18px;
      color: var(--primary-text-color);
    }

    .icon-option.selected ha-icon {
      color: var(--primary-color);
    }

    /* =================== */
    /*  Responsive Design  */
    /* =================== */
    @media (max-width: 600px) {
      .action-item {
        padding: 12px;
        gap: 12px;
        min-height: 64px;
      }

      .action-icon {
        width: 40px;
        height: 40px;
      }

      .action-icon ha-icon {
        --mdc-icon-size: 20px;
      }

      .action-buttons ha-icon-button {
        --mdc-icon-button-size: 42px;
        --mdc-icon-size: 20px;
      }

      .icon-grid {
        grid-template-columns: repeat(auto-fit, minmax(32px, 1fr));
        gap: 4px;
      }
      
      .icon-option {
        width: 32px;
        height: 32px;
      }
      
      .icon-option ha-icon {
        --mdc-icon-size: 16px;
      }

      .form-buttons {
        flex-direction: column;
      }

      .form-buttons ha-button {
        width: 100%;
      }
    }

    @media (min-width: 768px) {
      .icon-grid {
        max-height: 500px;
      }
    }

    @media (max-height: 600px) {
      .icon-grid {
        max-height: 300px;
      }
    }

    /* =================== */
    /*     Dark Mode       */
    /* =================== */
    @media (prefers-color-scheme: dark) {
      .config-container {
        background: var(--card-background-color, #1e1e1e);
        border-color: var(--divider-color, #333);
      }
      
      .section-header:hover {
        background: var(--secondary-background-color, #2a2a2a);
      }

      .action-item:hover {
        background: var(--primary-background-color, #252525);
      }

      .add-action-form {
        background: var(--primary-background-color, #1a1a1a);
        border-color: var(--primary-color);
      }

      .max-actions-reached {
        background: linear-gradient(135deg, var(--info-color, #1976d2), var(--info-color, #1565c0));
      }
    }

    /* =================== */
    /*  Performance        */
    /* =================== */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    .action-item,
    .action-icon,
    .collapse-icon {
      backface-visibility: hidden;
      perspective: 1000px;
    }
`;