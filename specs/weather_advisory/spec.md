# Feature Spec: Deterministic Micro-Climate Weather Advisory Engine

## 1. Overview
The Agro-Weather Outlook Engine provides localized weather forecasts and crop management guidelines for Telangana districts deterministically, without requiring live internet network queries.

## 2. User Stories
- **As a farmer in a remote area**, I want to get real-time climate forecasts and PJTSAU agricultural advisories even when my connection is poor or offline.
- **As a Telugu or Urdu speaker**, I want the advisories and forecasts translated cleanly to understand weather hazards (like sudden heavy rains or extreme heat).

## 3. Technical Design
- **Deterministic Weather Generator**:
  - Computes a stable seed based on the character code sum of the district name:
    ```typescript
    let seed = 0;
    for (let i = 0; i < district.length; i++) {
      seed += district.charCodeAt(i);
    }
    ```
  - Calculates temperature (`28 + seed % 14`), humidity (`42 + (seed * 3) % 49`), rain probability (`(seed * 7) % 101`), wind speed (`7 + seed % 16`), and soil moisture (`15 + (seed + 19) % 66`).
  - Condition thresholds:
    - `rainProb > 72`: Thunderstorms
    - `rainProb > 42`: Light Showers
    - `temp > 37`: Severe Sunny Spell
    - `humidity > 78`: Humid & Overcast
  - Generates a 3-day forecast progression.

## 4. Localization & Spacing
- Muted condition text and advisory scripts in English, Telugu, and Urdu.
- Spacing rules strictly apply (Telugu `leading-[1.95] tracking-[0.035em]`, Urdu `leading-[1.95] tracking-[0.04em]`).

## 5. Accessibility & Responsive Targets
- District selector dropdown must have a touch height of at least 44px.
- Weather cards display distinct background gradient colors matching the weather type (e.g. orange for extreme heat, blue for thunderstorms).

## 6. Verification & Test Scenarios
- Unit test `getWeatherDetails` function:
  - Verify same district name always returns the exact same weather metrics (determinism).
  - Verify advisory strings contain warning icons for rain warnings (`rainProb > 55`) and temperature alerts (`temp > 38`).
