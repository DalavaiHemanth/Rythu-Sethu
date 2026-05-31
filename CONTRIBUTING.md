# Contributing to Rythu Sethu

Thank you for your interest in contributing to Rythu Sethu! This document outlines local development steps, standard code styles, testing guidelines, and documentation policies to help you contribute effectively.

---

## 🛠️ Sandbox Setup

Rythu Sethu runs as a fully integrated, sandboxed Full-Stack web application. Since Node.js native ES modules can be strict at runtime, we bundle the entire backend server cleanly for production.

### Prerequisites
*   **Node.js**: Version 18.x or above (Node 20+ strongly recommended)
*   **npm**: Version 9.x or above

### Installation
Clone the repository and install all required agricultural calculation and styling dependencies:
```bash
npm install
```

### Environment Variables
Configure your regional system API keys inside `.env` (use `.env.example` as a starting template):
```bash
# Web application configuration
GEMINI_API_KEY=your_actual_google_genai_api_key
```

---

## 🖥️ Local Development Commands

Our workflow supports rapid client-side iteration and type checking:

1.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    This launches `tsx server.ts` instantly on port `3000`. Any edits to backend APIs or frontend client styles will trigger instant hot rebuilds.

2.  **Lint / Type-Check**:
    ```bash
    npm run lint
    ```
    Runs global TypeScript verification compile rules (`tsc --noEmit`). Ensure this passes completely before pushing code!

3.  **Production Compilation Bundle**:
    ```bash
    npm run build
    ```
    This invokes both client-side Vite static file assembly (`vite build`) and serverside esbuild packaging to bundle `server.ts` into a self-contained CJS bundle inside `dist/server.cjs`.

4.  **Execute Production Build**:
    ```bash
    npm run start
    ```
    launches the fast, lightweight production assembly locally.

---

## 🎨 Creative Code Standards

To keep the system highly maintainable, please align with these patterns:

### 1. Localization (L10n)
All buttons, labels, lists, and advice panels must be translation-aware. If you implement a visual block, map it inside `/src/data/translations.ts`:
*   Ensure text reads naturally in Telugu, Urdu, and English.
*   Avoid adding raw English content without Telugu/Urdu fallback buffers.

### 2. High-Contrast Styles
*   Always use high-ratio accessible Tailwind classes (e.g. text contrast of at least 4.5:1).
*   Avoid decorative gradients behind small pieces of critical numbers or instructions.
*   Keep mobile target sizes above `44px` with spacious margin buffers.

### 3. Speech-to-text / Audio Speakout fallbacks
When editing the chatbot speech components, ensure any user actions explicitly guard against silent environments by updating state variables natively, handling speech errors gracefully, and using consistent delays to resolve thread locking.

---

## 📬 Step-by-Step Pull Request Checklist
Before making a pull request, ensure you:
1.  Verify localization mappings for English, Telugu, and Urdu.
2.  Run `npm run lint` and verify there are no dangling type errors.
3.  Run `npm run build` to confirm the code compiles cleanly.
4.  Write comprehensive code descriptions and functional outcomes in your commit messages.
