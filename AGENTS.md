# AI Agent Development Guidelines for Rythu Sethu

Welcome! This document governs the rules, design guidelines, and technical bounds that must be followed by and injected into any AI Agent (including Gemini, Antigravity, or other local modules) modifying or extending this application.

## 🎯 Core Project Concept & Bounds
`Rythu Sethu` ("Farmer's Bridge") is a multi-lingual visual smart advisor designed for farmers in Telangana. It supports **English (en)**, **Telugu (te)**, and **Urdu (ur)**.
*   **The ceiling of functional scope is strict**: We target actual regional concerns (Telangana crops, fertilizer ratios, state-govt schemes, agricultural administrative circles, market rates, and weather).
*   **Never overload the layout**: Keep the screens visually clean, optimized for tactile, high-contrast, text-scalable mobile rendering.

## 👥 Targeted Design Goals (Low-Res Mobile Accessibility)
Many of our end-users utilize low-cost, low-resolution physical smartphones in the field under strong sunlight:
1.  **Strict Font Rules for Regional Fonts**:
    *   **Telugu (`te`)**: Increase line-height drastically (`leading-[1.95]`) and assign character-tracking (`tracking-[0.035em]`) on paragraphs to avoid vertical rendering overlaps.
    *   **Urdu (`ur`)**: Apply similar loose spacing (`leading-[1.95]` and `tracking-[0.04em]`) because Nastaliq-adjacent standard sans glyphs compress heavily on screen.
2.  **Explicit Touch Scales**: All buttons and interactive pills must exceed a minimum physical tap target boundary of `44px` on smaller screen viewports. Avoid packing touch targets adjacent to each other without spacing.
3.  **Color Constraints**: Do not employ faint, high-opacity yellow, light-green, or lavender backgrounds for crucial text. High contrast (deep charcoal gray `#1c1917` body text on crisp white backgrounds or rich green accents `#064e3b` on light cream) ensures high legibility under direct sunlight.

## 📂 System File Hierarchy & Separation Rules
*   **Avoid Mega-files**: Do not allow your components to exceed 500 lines. Split out sub-components into distinct, modular files (e.g., helper tools go in `src/components/`, static regional definitions in `src/data/`).
*   **Type Strategy**: Maintain all shared interface rules cleanly in `src/types.ts`. All `import` statements must be placed strictly at the top of the files.
*   **Localization Mapping**: Translative keys are kept inside `src/data/translations.ts`. If you add a feature, you **MUST** populate text mapping variants for all three languages: English, Telugu, and Urdu. Never leave un-translated strings hardcoded in component renders.

## 🎙️ Speech-Override (Speakout) Code Constraints
The "Speakout" text-to-speech feature must handle complex multi-lingual sentences:
To avoid the standard Webkit / Chrome legacy bug where speech synthesis gets locked or cut off after cancellation:
1.  Always call `window.speechSynthesis.cancel()` right before issuing a new speech instruction.
2.  Wrap the speak invocation inside a distinct `setTimeout(() => { ... }, 50)` block to allow the thread buffer to safely clear.
3.  Choose the matching voice profile dynamically by querying `window.speechSynthesis.getVoices()`, defaulting to local fallback regions `te-IN`, `ur-IN`, and `en-IN`.

## 🛠️ Compilation, Build & Linting Rules
Before marking a development task completed, the agent must run:
1.  `npm run lint` (using `tsc --noEmit`) to verify that no TypeScript implicit declarations or missing import paths exist.
2.  `npm run build` to verify custom bundle compilation with `esbuild`. The backend entrypoint `server.ts` compiles cleanly into `dist/server.cjs`.

Keep this codebase clean, simple, and aligned with its regional user base!
