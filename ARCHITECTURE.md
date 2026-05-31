# System Architecture - Rythu Sethu

This document explains the software architecture, system flow, component design patterns, and internal data structures of the **Rythu Sethu** agricultural platform.

---

## 🧭 Overarching Concept

Rythu Sethu is designed as an accessible, localized Full-Stack application. It bridges complex agricultural databases, state guidelines, and AI-driven conversational insights with touch-first client controls suitable for rural farmers in Telangana.

```
                  ┌──────────────────────────────────────────────┐
                  │              Web Browser / Mobile            │
                  │  (React 19 View, Lucide, Motion Animations)  │
                  └──────┬────────────────────────────────▲──────┘
                         │                                │
                 HTTP REST Calls (JSON)             Assets & Pages
                         │                                │
                  ┌──────▼────────────────────────────────┴──────┐
                  │         Vite Middleware (Dev Router)         │
                  ├──────────────────────────────────────────────┤
                  │          Express Node.js Web Server          │
                  │   (/api/chat Proxy, Environment Safety)    │
                  └──────┬────────────────────────────────▲──────┘
                         │                                │
             Secure SDK Call (No Keys Exposed)       Contextual Output
                         │                                │
                  ┌──────▼────────────────────────────────┴──────┐
                  │      Google GenAI Client (Gemini 2.5 API)    │
                  └──────────────────────────────────────────────┘
```

---

## 🏛️ Component Architecture & File Layout

Visual screens and computational layers are segregated cleanly into distinct responsibilities:

### 1. Root Level & Server Configuration
*   `/package.json`: Configures client and build steps. Compiles both client React static pages and the Express backend server into a single distribution set.
*   `/server.ts`: The production Express entry point. It serves dynamic asset files, registers proxy routers, mounts Vite middleware during development, and intercepts Gemini AI requests server-side.
*   `/index.html` & `/src/main.tsx`: Client-side mount orchestration.

### 2. Client Application Layout (`/src/`)
*   `src/App.tsx`: Central component coordinating top navigation header, language choosing state, and active tab containers.
*   `src/types.ts`: Domain models describing Messages, Districts, centers, and fertilizer results.
*   `src/index.css`: Global tailwind import. Registers custom, high-contrast, scalable display fonts optimized for regional Indic glyphs.

### 3. Component Modules (`src/components/`)
*   `src/components/Chatbot.tsx`: High-contrast conversational interface. Contains integrated visual attachment options, real-time input status indicators, quick suggestion prompts, and speech-synthesis (Speakout) override engines.
*   `src/components/CenterFinder.tsx`: Interactive center directory locator. Filters Rythu Vedika zones, details, and coordinators by district with localized contact shortcuts.
*   `src/components/KnowledgeBase.tsx`: Localized State G.O. (Government Order) circular database. Empowers users with categorization tags, search queries, and reading modes.
*   `src/components/FarmerQuiz.tsx`: Dynamic scheme eligibility matching engine. Takes input answers and verifies conditions for state programs like Rythu Bandhu or crop insurance plans.
*   `src/components/FarmerTools.tsx`: Core agricultural calculator module. Houses NPK fertilizer requirements, crop-specific guides, current Mandi crop rates, and the deterministic Agro-Weather Outlook widget.

---

## 🗄️ Core Data Schemes & Structures

Our static resources are strictly modeled in `src/data/staticData.ts` and `src/data/translations.ts` to ensure stability:

### 1. Localized Translations Mapping (`src/data/translations.ts`)
Structure mapping for absolute translation density across three languages without missing keys:
```typescript
export interface TranslationSet {
  quizTab: string;
  mapTab: string;
  ragTab: string;
  toolsTab: string;
  welTitle: string;
  // ... core components dictionary mapped to 'te', 'ur', and 'en'
}
```

### 2. Rythu Vedika & Agricultural Circles (`src/data/staticData.ts`)
Structures keeping agricultural coordinator directory coordinates:
```typescript
export interface RythuVedikaCenter {
  id: number;
  nameEn: string;
  nameTe: string;
  nameUr: string;
  district: string;
  mandal: string;
  officer: string;
  contact: string;
  addressEn: string;
  addressTe: string;
}
```

---

## 🧠 Core Engineering Algorithms

### A. PJTSAU-Compliant NPK Fertilizer Advisory Calculator
Determines the precise weight of Nitrogen (N), Phosphorus (P), and Potassium (K) bags required based on crop selections and acreage.
*   **Formula logic**:
    ```
    Required Urea (N source) = Target_N * 2.17 * Acres
    Required DAP (contains N & P) or Single Super Phosphate (P source) = Target_P * 6.25 * Acres
    Required MOP (K source) = Target_K * 1.67 * Acres
    ```
This allows farmers to procure exact bags to prevent heavy chemical over-spraying.

### B. Deterministic Agricultural Micro-Climate Weather Engine
Simulates real-time, highly granular micro-climatic situations (temperature, rain probabilities, relative humidity, wind speed, soil moisture) matching the chosen Telangana districts using a deterministic seed algorithm based on district name-strings:
1.  Computes seed dynamically: `seed = CharCodeSum(District_Name)`
2.  Maps fields parameters (such as `humidity` and `rainProb`) using unique offset modulos.
3.  Injects regional **Prof. Jayashankar Telangana State Agricultural University (PJTSAU)** guidelines based on extreme thresholds (e.g. wet weather vs. thermal cracks warning).
