# Compact Lawn Mower Card

A compact, modern and feature-rich custom card for your robotic lawn mower in Home Assistant!

<div align="center">
  <img src="https://github.com/Tra1n84/compact-lawn-mower-card/blob/main/img/Compact_Lawn_Mower_Card_Mowing.png" height="300" alt="Compact Lawn Mower Card – Mowing State"><br>
  <sub>Mower View – Mowing State</sub>
</div>

---

## ✨ Features

* **Mower View:**
A graphical view of your robotic lawn mower with a status LED indicating the current state, a graphical battery indicator and animations based on the current state - mowing, pausing, returning or charging
* **Camera View:**
A live video stream from your mower's camera
* **Map View:**
Track your mower's location on a map - choose between a GPS device tracker with HA Map or Google Maps or a static image / camera entity as your mower map with full pinch-to-zoom and drag-to-pan support. The background color of an image map is detected automatically so the card blends in with your mower's own map - or pick your own color. For **Mammotion** mowers the card can draw a native vector map with mowing zones, obstacles, virtual walls, channels, dock / RTK station, live position and the mown lanes of the running job
* **Custom Action Buttons:**
Define up to 6 customizable action buttons - trigger services, toggle entities, navigate within HA, open URLs or show entity details
* **Custom State Mapping:**
Map custom integration states (e.g. `edgecut`, `rain_delayed`) to a standard visual behavior so the card displays the correct animation and status badge for any mower integration
* **Info Badges:**
Info badges with the current status and the mowing progress
* **Powerful UI Editor:**   
A user-friendly UI editor for all your card settings - no YAML required. Define additional entities, camera settings, map parameters, mower models or the individual colors
* **Localization:**   
Comes with English, German, Spanish and a broad selection of more languages - ready to grow even more


---

## 🔮 Planned Features

Ideas for future development - no guarantee, but candidates for upcoming features

* ~~Support for additional service-call parameters at the action buttons~~ ✅ (implemented in v0.10.0)
* ~~More than 3 custom actions~~ ✅ (implemented in v1.0.0)
* **Improved graphic** for the default mower graphic
* ~~Improved animations for the mower view~~ ✅ (implemented in v0.9.0)
* **Additional Mower Models / Graphics** - technically prepared with a modular file structure for models including an model selection within the UI editor
* **Support for more languages** if contributed by the community
* **A more advanced map view** with mowing paths, mower maps, no-go zones etc. (Need to validated with individual lawn mower integrations) - available for Mammotion, see [Mammotion Vector Map](#mammotion-vector-map)
* ~~More customization options like default map zoom levels and more~~ ✅ (implemented in v1.0.0)
* **...and more Ideas to come!**


---

## 🐞 Known Issues / Bugs

There are known issues / bugs that haven't been resolved yet

* In Map View, when using HA Map with more than 6 columns (Grid), the lawn mower marker is not centered correctly. (Google Maps works as expected.) Possibly caused by aspect ratio issues

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
map_image_entity: image.my_mower_map
map_source: gps
map_image_bg_auto: false
map_image_bg_color:
  - 216
  - 224
  - 232
progress_entity: sensor._my_mower_progress
battery_entity: sensor.my_mower_battery
charging_entity: binary_sensor.my_mower_charging
default_view: mower
enable_map: true
google_maps_api_key: YOUR_GOOGLE_API_KEY
use_google_maps: true
map_type: hybrid
mower_model: default
badge_text_color:
  - 0
  - 0
  - 0
badge_icon_color:
  - 0
  - 0
  - 0
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
state_map:
  edgecut: mowing
  rain_delayed: paused
custom_actions:
  # Action type: call-service (call any HA service)
  - name: Start Mowing
    icon: mdi:play
    action:
      action: call-service
      service: lawn_mower.start_mowing
      target:
        entity_id: lawn_mower.my_mower
      data:
        optional_param: value
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
  # Action type: toggle (toggle an entity)
  - name: Toggle Mower
    icon: mdi:robot-mower
    action:
      action: toggle
  # Action type: navigate (navigate within HA)
  - name: Mower Dashboard
    icon: mdi:view-dashboard
    action:
      action: navigate
      navigation_path: /lovelace/garden
  # Action type: more-info (open entity details popup)
  - name: Mower Info
    icon: mdi:information
    action:
      action: more-info
```

### Configuration Options

| Name                 | Type     | Required     | Description                                                                                  |
|----------------------|----------|--------------|----------------------------------------------------------------------------------------------|
| `entity`             | string   | Yes          | The main entity of your lawn mower                                                           |
| `camera_entity`      | string   | No           | Camera entity for the camera view                                                            |
| `camera_fit_mode`    | string   | No           | How to fit the camera image: `cover` or `contain`                                            |
| `map_entity`         | string   | No           | Device tracker entity for the GPS map view                                                   |
| `map_image_entity`   | string   | No           | Image or camera entity to display as a static map (supports zoom & pan)                      |
| `map_source`         | string   | No           | Active map source: `gps`, `image` or `mammotion` (vector map, Mammotion integration only)   |
| `map_image_bg_auto`  | boolean  | No           | Detect the background color of the map image automatically (Default: `true`)                 |
| `map_image_bg_color` | list     | No           | RGB value for the map image background, used when `map_image_bg_auto` is `false`             |
| `map_show_labels`    | boolean  | No           | Mammotion map: show zone names and sizes (Default: `true`)                                    |
| `map_show_path`      | boolean  | No           | Mammotion map: show the mown lanes while the mower is working (Default: `true`)              |
| `map_path_width`     | number   | No           | Mammotion map: width of the mown lanes in metres, i.e. the cutting width (Default: `0.2`)     |
| `map_rotation`       | number   | No           | Mammotion map: rotate the map clockwise in degrees, `-180` to `180` (Default: `0`)           |
| `map_show_rtk`       | boolean  | No           | Mammotion map: show the RTK base station (Default: `true`)                                    |
| `map_keep_view`      | boolean  | No           | Mammotion map: remember zoom and position, otherwise always start fitted (Default: `true`)   |
| `battery_entity`     | string   | No           | Optional sensor for battery level                                                            |
| `progress_entity`    | string   | No           | Optional sensor for mowing progress                                                          |
| `charging_entity`    | string   | No           | Optional binary sensor or sensor for charging status                                         |
| `task_area_entity`   | string   | No           | Sensor with the total area of the running job (m²); the progress badge shows the mown part of it; found on a Mammotion mower's device when empty |
| `remaining_time_entity` | string | No          | Sensor with the remaining job time in minutes, shown in the progress badge; found on a Mammotion mower's device when empty |
| `work_zone_entity`   | string   | No           | Sensor with the name of the zone being mown, used for the zone label and the tap-to-mow lock; found on a Mammotion mower's device when empty |
| `error_entity`       | string   | No           | Sensor with the mower's error message, shown on the Mammotion map; found on a Mammotion mower's device when empty |
| `zone_switches`      | list     | No           | Mammotion map: area switches the map may start a zone with; the switches on the mower's device when empty |
| `live_updates`       | boolean  | No           | Mammotion: keep the integration's report stream running while the card is visible, so state and position update within seconds (Default: `true`) |
| `default_view`       | string   | No           | Default view of the card: `mower`, `camera`, `map` (Default: `mower`)                        |
| `enable_map`         | boolean  | No           | Enable or disable the map view (Default: `true` if `map_entity` is set)                      |
| `use_google_maps`    | boolean  | No           | Use Google Maps instead of Home Assistant map (Google Maps API key is required)              |
| `google_maps_api_key`| string   | No           | Your Google Maps Static API key                                                              |
| `map_type`           | string   | No           | Map type for Google Maps: `roadmap`, `satellite`, `hybrid` (Default: `hybrid`)               |
| `mower_model`        | string   | No           | Select mower model graphic (Default: `default`)                                              |
| `badge_text_color`   | list     | No           | RGB value for the badge text color                                                           |
| `badge_icon_color`   | list     | No           | RGB value for the badge icon color                                                           |
| `sky_color_top`      | list     | No           | RGB value for the top sky color                                                              |
| `sky_color_bottom`   | list     | No           | RGB value for the bottom sky color                                                           |
| `grass_color_top`    | list     | No           | RGB value for the top grass color                                                            |
| `grass_color_bottom` | list     | No           | RGB value for the bottom grass color                                                         |
| `custom_actions`     | list     | No           | Define up to 6 custom action buttons (see action types below)                                |
| `state_map`          | map      | No           | Map custom integration states to a standard visual behavior (see state mapping below)        |

#### Mammotion Vector Map

With the [Mammotion integration](https://github.com/mikey0000/Mammotion-HA) the card can render the mower's own map without any image entity or map provider. It uses the integration's GeoJSON services (`mammotion.get_geojson`, `mammotion.get_mow_progress_geojson`) and shows

* mowing zones with name and size, obstacles / no-go zones, virtual walls and channels between zones
* charging dock and RTK base station
* the live mower position (the mower's `device_tracker` is detected automatically, or set `map_entity`)
* the mown lanes of the running job, drawn from the positions Home Assistant recorded since the job started

Tapping a zone offers to mow just that zone (through the integration's area switches), the crosshair button keeps the map centred on the mower, and the mower is flagged on the map when it reports an error or has not moved for a few minutes during a job. The progress badge shows the mown and total area of the job and the remaining time from the integration's sensors.

```yaml
type: custom:compact-lawn-mower-card
entity: lawn_mower.luba_xxxxxxxx
map_source: mammotion
map_rotation: 0
```

The zones are loaded when the map view is opened (cached for 30 minutes). Position offsets set in the integration (`Map offset latitude / longitude`) apply to all layers. The map must be synced once in the Mammotion app.

The mown lanes are the mower's recorded positions joined into lines, as wide as the cutting width (`map_path_width`). Two positions are only joined when they are a few seconds apart, so nothing is drawn where the mower was not seen. The integration reports a position every few seconds only while its report stream is running, so the lanes come out complete while the card is watched. To get dense positions while no dashboard is open too, let an automation call `mammotion.get_geojson` for the mower every 4 minutes while it is mowing.

#### Live Status (Mammotion)

Without its report stream the Mammotion integration only polls now and then, so a new state can take a while to show up in Home Assistant, unless the Mammotion app is open. While the card is visible it keeps the stream running (`mammotion.get_geojson` every 4 minutes) in every view. The integration streams only while a job runs; otherwise each call brings a single report. After a command from the card it asks again after 5, 15, 30 and 60 seconds, and a job started elsewhere gets its stream at once, so the new state shows up within seconds. It stops when the dashboard is left or the app goes to the background. Set `live_updates: false` to turn it off, e.g. on a wall tablet that shows the dashboard all day.

#### Custom Action Structure

Each entry in `custom_actions` has the following structure:

| Name   | Type   | Required | Description                     |
|--------|--------|----------|---------------------------------|
| `name` | string | Yes      | Display name for the button     |
| `icon` | string | Yes      | MDI icon (e.g. `mdi:play`)      |
| `action`| object | Yes     | Action configuration (see below)|

#### Supported Action Types

| Action Type     | Fields                                          | Description                                    |
|-----------------|-------------------------------------------------|------------------------------------------------|
| `call-service`  | `service`, `target` (optional), `data` (optional) | Call any Home Assistant service                |
| `toggle`        | `entity` (optional)                              | Toggle an entity (defaults to mower entity)    |
| `more-info`     | `entity` (optional)                              | Show entity details popup (defaults to mower entity) |
| `navigate`      | `navigation_path`                                | Navigate to a path within Home Assistant       |
| `url`           | `url_path`                                       | Open a URL in a new browser tab                |
| `none`          | —                                                | No action (placeholder)                        |

> **Note:** For `call-service`, `toggle` and `more-info`, the target defaults to the configured mower entity if no custom target is specified.

#### State Mapping (`state_map`)

Some mower integrations report states beyond the standard HA lawn mower states (e.g. `edgecut`, `rain_delayed`, `leaves`). Use `state_map` to map these custom states to one of the supported visual behaviors so the card displays the correct animation and badge.

**Supported behaviors:** `mowing`, `paused`, `returning`, `docked`, `error`

```yaml
state_map:
  edgecut: mowing
  rain_delayed: paused
  leaves: error
```

The key is the exact state string reported by your integration, the value is the behavior the card should use.

---

## 🌐 Localization

**Currently supported languages:**
* English
* German
* French
* Spanish
* Italian
* Dutch
* Polish
* Swedish

---

## 🤝 How to Contribute

Contributions are welcome! Whether it's new features, improvements to the mower design or animations, additional mower models / graphics, translations or bug reports - feel free to open an [issue](https://github.com/Tra1n84/compact-lawn-mower-card/issues) or submit a [pull request](https://github.com/Tra1n84/compact-lawn-mower-card/pulls).


---

## 📄 License

MIT License – see `LICENSE` for details.

## 💖 Support

☕🍺 If you enjoy my work, [buy me a coffee *or* a beer](https://www.buymeacoffee.com/tra1n84)!
