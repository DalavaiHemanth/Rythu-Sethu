# Feature Spec: PJTSAU-Compliant NPK Fertilizer Calculator

## 1. Overview
The NPK Fertilizer Calculator computes recommended fertilizer bag amounts (Urea, DAP, MOP) based on crop type, land size (in acres), and agricultural season (Kharif/Yasangi) to optimize soil nutrient intake.

## 2. User Stories
- **As a farmer**, I want to input my crop, season, and land size in acres so that I can buy exactly the right amount of Urea, DAP, and MOP bags.
- **As a farmer in Telangana**, I want to see the application stages (basal dose and top-dressings) in my native language (Telugu or Urdu) to avoid crop burns.

## 3. Technical Design
- **Dosage Calculations (Bags per acre)**:
  - **Paddy**: Urea = `2.4 * acres`, DAP = `1.0 * acres`, MOP = `0.8 * acres`
  - **Cotton**: Urea = `3.2 * acres`, DAP = `1.3 * acres`, MOP = `1.2 * acres`
  - **Chilli**: Urea = `6.4 * acres`, DAP = `2.6 * acres`, MOP = `2.4 * acres`
  - **Maize**: Urea = `4.2 * acres`, DAP = `1.7 * acres`, MOP = `1.1 * acres`
  - **Seasonal Adjustment**: Yasangi (Rabi) season applies a `0.95` discount multiplier to Urea.
- **Data output**: Round bag counts to the nearest one decimal place.

## 4. Localization & Spacing
- Mappings defined in `src/data/translations.ts`.
- Multilingual schedules displayed in English, Telugu (`leading-[1.95] tracking-[0.035em]`), and Urdu (`leading-[1.95] tracking-[0.04em]`).

## 5. Accessibility & Responsive Targets
- Input sliders must be large and easily draggable (touch target height >= 44px).
- Results displayed in high-contrast blocks inside a deep green container (`bg-crop-900` with white text).

## 6. Verification & Test Scenarios
- Unit test `getNPKAdvice` function:
  - Verify calculations for Paddy, Cotton, Chilli, and Maize.
  - Verify Rabi season 5% discount on Urea.
  - Verify rounding behavior to 1 decimal place.
