# Compact Lawn Mower Card

A compact, modern and feature-rich custom card for your robotic lawn mower in Home Assistant!

<div align="center">
  <img src="https://github.com/Tra1n84/compact-lawn-mower-card/blob/main/img/Compact_Lawn_Mower_Card_6Columns.png" height="300" alt="Compact Lawn Mower Card with 6 Columns"><br>
  <sub>Grid Layout with 6 columns</sub>
</div>

---

## ✨ Features

* **Dynamic Mower View:**   
A graphical view of your robotic lawn mower with an Status LED indicating the current state, a graphical battery indicator and animations based on the current state - mowing, pausing, returning or charging
* **Multiple Views:**   
Switch between multiple views - the mower UI, a live video stream from your mower's camera or track your mower's location on map (Google Maps or HA Map)
* **Custom Action Buttons:**   
Define up to 3 customizable action buttons to trigger any Home Assistant service you choose
* **Info Badges:**   
Info badges with the current status and the mowing progress
* **Powerful UI Editor:**   
A user-friendly UI editor for all your card settings - no YAML required. Define additional entities, camera settings, map parameters, mower models or the mower view colors
* **Localization:**   
Comes with English and German translation - ready to be extended with more languages


---

## 🔮 Planned Features

Ideas for future development - no guarantee, but candidates for upcoming features

* **Support for additional service-call parameters** at the action buttons
* **More than 3 custom actions** (but card would need a slighlty different layout)
* **Improved graphics + animations** for the default mower graphic
* **Additional Mower Models / Graphics** - technically prepared with a modular file structure for models including an model selection within the UI editor
* **Support for more languages** if contributed by the community
* **A more advanced map view** with mowing paths, mower maps, no-go zones etc. (Need to validated with individual lawn mower integrations)
* **More customization options** like default map zoom levels and more
* **...and more Ideas to come!**


---

## 🐞 Known Issues / Bugs

There are known issues / bugs that haven't been resolved yet

* In Map View, when using HA Map with more than 6 columns (Grid), the lawn mower marker is not centered correctly. (Google Maps works as expected.) Possibly caused by aspect ratio issues
* ...

---

## 🚀 Installation

The recommended installation method is via the **Home Assistant Community Store (HACS)**. This card is **officially available in the HACS store**, so you can easily find and install it directly from there. Alternatively, you can install the card manually.  

### HACS (recommended)

1. Open **HACS** from the sidebar in Home Assistant.  
2. Use the **search bar** to find the **`Compact Lawn Mower Card`**.  
3. Click on the card to open the detail page.  
4. In the bottom-right corner, click **Download** to install the card.  
5. HACS will automatically add the resource to Lovelace.  

### Manual

1. Download the `compact-lawn-mower-card.js` from the [latest release](https://github.com/Tra1n84/compact-lawn-mower-card/releases/latest).
2. Save it in the `config/www` folder.
3. Add it to Lovelace:

   * **Settings > Dashboards > Resources**
   * **ADD RESOURCE**
     - URL: `/local/compact-lawn-mower-card.js`
     - Type: **JavaScript Module**

---

## ⚙️ Configuration

You can configure the card via the visual editor or YAML.

### Visual Editor

1. Enable edit mode on your dashboard.
2. **ADD CARD** → "Compact Lawn Mower Card".
3. Configure all settings with help of the UI.

### YAML Examples

**Minimal:**

```yaml
type: custom:compact-lawn-mower-card
entity: lawn_mower.my_mower
```

**Advanced:**

```yaml
type: custom:compact-lawn-mower-card
entity: lawn_mower.my_mower
camera_entity: camera.my_mower_camera
camera_fit_mode: contain
map_entity: device_tracker.my_mower
progress_entity: sensor._my_mower_progress
battery_entity: sensor.my_mower_battery
charging_entity: binary_sensor.my_mower_charging
default_view: mower
enable_map: true
google_maps_api_key: YOUR_GOOGLE_API_KEY
use_google_maps: true
map_type: hybrid
mower_model: default
sky_color_top:
  - 41
  - 128
  - 185
sky_color_bottom:
  - 109
  - 213
  - 250
grass_color_top:
  - 65
  - 150
  - 8
grass_color_bottom:
  - 133
  - 187
  - 88
custom_actions:
  - name: Start Mowing
    icon: mdi:play
    action:
      action: call-service
      service: lawn_mower.start_mowing
      target:
        entity_id: lawn_mower.my_mower
  - name: Pause
    icon: mdi:pause
    action:
      action: call-service
      service: lawn_mower.pause
      target:
        entity_id: lawn_mower.my_mower
  - name: Return to Dock
    icon: mdi:home-map-marker
    action:
      action: call-service
      service: lawn_mower.dock
      target:
        entity_id: lawn_mower.my_mower
```

### Configuration Options

| Name                 | Type     | Required     | Description                                                                                  |
|----------------------|----------|--------------|----------------------------------------------------------------------------------------------|
| `entity`             | string   | Yes          | The main entity of your lawn mower                                                           |
| `camera_entity`      | string   | No           | Camera entity for the camera view                                                            |
| `camera_fit_mode`    | string   | No           | How to fit the camera image: `cover` or `contain`                                            |
| `map_entity`         | string   | No           | Device tracker entity for the map view                                                       |
| `battery_entity`     | string   | No           | Optional sensor for battery level                                                            |
| `progress_entity`    | string   | No           | Optional sensor for mowing progress                                                          |
| `charging_entity`    | string   | No           | Optional binary sensor or sensor for charging status                                         |
| `default_view`       | string   | No           | Default view of the card: `mower`, `camera`, `map` (Default: `mower`)                        |
| `enable_map`         | boolean  | No           | Enable or disable the map view (Default: `true` if `map_entity` is set)                      |
| `use_google_maps`    | boolean  | No           | Use Google Maps instead of Home Assistant map (Google Maps API key is required)              |
| `google_maps_api_key`| string   | No           | Your Google Maps Static API key                                                              |
| `map_type`           | string   | No           | Map type for Google Maps: `roadmap`, `satellite`, `hybrid` (Default: `hybrid`)               |
| `mower_model`        | string   | No           | Select mower model graphic (Default: `default`)                                              |
| `sky_color_top`      | list     | No           | RGB value for the top sky color                                                              |
| `sky_color_bottom`   | list     | No           | RGB value for the bottom sky color                                                           |
| `grass_color_top`    | list     | No           | RGB value for the top grass color                                                            |
| `grass_color_bottom` | list     | No           | RGB value for the bottom grass color                                                         |
| `custom_actions`     | list     | No           | Define up to 3 custom actions                                                                |


---

## 🌐 Localization

**Currently supported languages:**
* English
* German


---

## 🤝 How to Contribute

Contributions are welcome! Whether it's new features, improvements to the mower design or animations, additional mower models / graphics, translations or bug reports - feel free to open an [issue](https://github.com/Tra1n84/compact-lawn-mower-card/issues) or submit a [pull request](https://github.com/Tra1n84/compact-lawn-mower-card/pulls).


---

## 📄 License

MIT License – see `LICENSE` for details.

## 💖 Support

☕🍺 If you enjoy my work, [buy me a coffee *or* a beer](https://www.buymeacoffee.com/tra1n84)!
