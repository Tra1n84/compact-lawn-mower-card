import { LitElement, html, nothing, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { localize } from './localize';
import { cameraPopupStyles } from './styles';

@customElement('camera-popup')
export class CameraPopup extends LitElement {
  @property() title = '';
  @property() onClose?: () => void;
  @property() hass?: HomeAssistant;
  @property() entityId?: string;
  @property({ type: Boolean }) isReachable = true;

  static styles = cameraPopupStyles;

  private _escHandler?: (e: KeyboardEvent) => void;

  connectedCallback() {
    super.connectedCallback();
    this._escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this._close();
      }
    };
    document.addEventListener('keydown', this._escHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = undefined;
    }
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

declare global {
  interface HTMLElementTagNameMap {
    'camera-popup': CameraPopup;
  }
}
