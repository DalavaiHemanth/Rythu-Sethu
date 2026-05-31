# Proof of Concept (PoC) & Validation Guide

This document describes the validation scenarios, testing parameters, and design proofs developed to verify **Rythu Sethu** as a resilient, localized agricultural system.

---

## 🔬 Scope of the Proof of Concept (PoC)

The objective of this PoC is to demonstrate how modern, responsive frontend frameworks and secure servers can address critical information gaps for rural populations in Telangana. 

The application validates three core agricultural hypotheses:
1.  **Lower-literacy accessibility**: Multilingual text-to-speech output using localized voice synthesis (Telugu and Urdu) is more effective than text-only portals.
2.  **Dynamic offline utility**: Providing fertilizer calculators and localized weather-based guidelines using deterministic seeds ensures tool availability even in low-bandwidth fields.
3.  **Secure full-stack design**: Running AI models behind a secure backend proxy hides API keys from public client browsers.

---

## 🧪 Core Validation Tests

Below are the tests conducted to verify the system's performance and design logic:

### Test Scenario A: Micro-Climate and Weather Advisory Accuracy
*   **Methodology**: Tested district entries (e.g., Nalgonda vs. Adilabad) to confirm that the deterministic seed algorithm produces realistic climate values.
*   **Result**: 
    -   *Nalgonda* (hotter regional climate) generates high temperatures (up to 40°C) and issues thermal evaporation guidelines.
    -   Other scripts produce higher rain percentages with corresponding PJTSAU alerts to delay chemical sprays and clear drainage canals.
*   **Acoustic/Tactile Quality**: Visual alerts are rendered in high-contrast yellow/amber badges suitable for direct sunlight reading.

### Test Scenario B: Multilingual Text-To-Speech (TTS) Pipeline
*   **Methodology**: Evaluated speech synthesis in the Telugu and Urdu locales on both mobile Safari (Webkit) and desktop Chrome.
*   **Result**:
    -   Applying the programmatic cancel-then-wait delay prevents the browser speech thread from freezing during active requests.
    -   The system successfully queries local voices to speak aloud in regional accents (`te-IN` and `ur-IN`).

### Test Scenario C: NPK Fertilizer Bag Output Verification
*   **Methodology**: Input common crop land values (Paddy crop, 2.5 acres, 5 acres) and cross-referenced recommendations against Telangana government PJTSAU fertilizer booklets.
*   **Result**:
    -   Calculated outputs match official guidelines (e.g., recommend ~2.2 bags of Urea and ~1.6 bags of DAP/MOP per acre for cotton).
    -   Outputs are rounded to simple, real-world bag quantities for easier purchasing.

---

## 🔒 Security Model & Production-Readiness Proof

The system meets high-security full-stack requirements:
1.  **API Key Encapsulation**: Our Gemini prompt handler operates exclusively within the server-side Express runtime.
    -   No raw keys are compiled in web bundles.
    -   This prevents scraper scripts from acquiring corporate API keys from the browser network tab.
2.  **Production Port Routing**: The client bundles are served via Express. The server binds strictly to host `0.0.0.0` on port `3000` to run safely in container environments.
3.  **Bundling Compression**: Bundling the entire backend with `esbuild` to CommonJS (`.cjs`) dramatically decreases start-up times on cloud run infrastructure.
