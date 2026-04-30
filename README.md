<img width="1918" height="857" alt="Screenshot 2026-04-30 053906" src="https://github.com/user-attachments/assets/86b581f4-3861-4502-8e42-9e52ff1f91cf" />
# charge.ma

A prototype web app that help EV (Electric-Vehicles) drivers in Morocco find charging stations along a trip.

## What this app does

- Shows Morocco charging stations on an interactive map
- Helps plan a trip between two points
- Highlights stations close to your route (Within the range of <= 5KM)
- Lets users check station details and send quick status feedback

## How to launch

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open the local URL shown in the terminal (usually `http://localhost:5173`).

## How the app works (user flow)

1. **First launch**
   - Default map mode is **Satellite**.
   - You can switch map mode anytime (Standard / Satellite / Dark / Topo).
   - The app remembers your selected map mode for next sessions.

2. **Allow location (recommended)**
   - If you allow location access, the map centers on your current position.
   - If not allowed, it starts from Casablanca by default.

3. **Choose your trip**
   - You can select **predefined cities** from the start/destination dropdowns.
   - Or click the pin button and choose start/end points directly on the map.

4. **Display route**
   - Click `Afficher le trajet` to draw the route.
   - Route summary and useful travel metrics are shown.

5. **Explore stations**
   - Charging stations appear on the map.
   - Click a station marker to open its info card (power, connector, status, address, distance from departure).

6. **Send quick station feedback**
   - Use `Signaler panne` if a station has issues.
   - Use `Ca marche` if the station is working.
   - Feedback is stored locally in your browser for this prototype.

## Data refresh (optional)

If you want to refresh station data:

```bash
npm run data:refresh
```

## Notes for review

- This is a prototype focused on route + charging visibility
- No backend or user account system
- Station reports are stored locally in the browser
