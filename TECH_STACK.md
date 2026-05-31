# Technological Stack Selection & Code Explanations

This document outlines the technologies selected for the **Rythu Sethu** platform, explaining why each is used and how the system's files interact.

---

## 🛠️ The Tech Stack Selection

To support a reliable application accessible on entry-level mobile devices in areas with poor internet connectivity, our stack focuses on speed and performance:

| Technical Module | Selected Technology | Technical Justification |
| :--- | :--- | :--- |
| **User Interface** | **React 19** | Features high-performance virtual-DOM diffing, clean declarative state management, and lightweight rendering with low memory usage. |
| **Bundling & Dev Engine** | **Vite / tsx** | Provides efficient, rapid module replacement for fast development reloading without stalling or generating bulky assets. |
| **Server Engine** | **Express API** | Simple backend router with low overhead, ideal for managing secure Gemini AI API proxies and serving static assets. |
| **Styling Framework** | **Tailwind CSS v4** | Compiles all styles into a single, cohesive file, improving performance and ensuring fast loads over weak 2G or 3G networks. |
| **Compilation** | **esbuild** | Easily bundles multiple TypeScript files into a single distribution module, helping minimize server startup times. |
| **Layout Animations** | **Motion** | Provides smooth, Hardware-Accelerated hardware transitions that render beautifully on mobile screens. |
| **Icons Library** | **Lucide React** | Offers a lightweight, tree-shakeable collection of SVG icons to help reduce bundle sizes. |
| **Large Language Models** | **@google/genai SDK** | Features streamlined, modern interfaces for secure server-side interactions with Gemini. |

---

## 🗂️ Code Flow & File Explanations

Here is how the main files interact during execution:

```
                  ┌──────────────────────┐
                  │      server.ts       │ ◄─── (esbuild compiles to dist/server.cjs)
                  └──────────┬───────────┘
                             │
            [HTTP API Proxies & Static Assets]
                             │
                             ▼
                  ┌──────────────────────┐
                  │      index.html      │ ◄─── (Vite entrypoint mount)
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │     src/main.tsx     │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │     src/App.tsx      │ ◄─── (Coordinates translation states & tab views)
                  └────┬───┬───┬───┬───┬─┘
                       │   │   │   │   │
     ┌─────────────────┘   │   │   │   └────────────────┐
     ▼                     ▼   ▼   ▼                    ▼
┌──────────────┐ ┌───────────────┐ ┌──────────────┐ ┌───────────────┐ ┌────────────────┐
│   Chatbot    │ │  CenterFinder │ │ KnowledgeBase│ │  FarmerQuiz   │ │  FarmerTools   │
│ (Chat space) │ │ (Rythu Vedika)│ │ (G.O. Library│ │ (Eligibility) │ │ (Fertilizers/  │
└──────────────┘ └───────────────┘ └──────────────┘ └───────────────┘ │ Weather/Rates) │
                                                                      └────────────────┘
```

### Key Technical Implementations

#### 1. Secure AI Execution Behind Backend Proxy
We route queries through a secure backend endpoint `/api/chat` inside `server.ts` to keep API keys hidden and protected:
*   The browser client makes a standard POST request with the user's message and language parameters to our backend.
*   The backend retrieves the private `process.env.GEMINI_API_KEY`, interacts securely with the Google GenAI SDK, and returns the response. This ensures API keys are never exposed in the client's network requests.

#### 2. Fluent Motion-React Micro-Animations
The tab navigation uses `AnimatePresence` and `motion` animation wrappers:
*   **Transition Duration**: Set to `0.15` seconds to ensure menus feel quick and responsive, even on budget physical devices.
*   **Fade Transitions**: The application applies gradual, elegant fade transitions on route switches, enhancing user experience.

#### 3. High-Contrast Typography & Mobile Layouts
All layouts prioritize high accessibility:
*   **Scale Controls**: Users can adjust the text scale to improve legibility.
*   **Readable Typographic Rules**:
    *   **Telugu (`te`)**: Styled using `font-telugu tracking-[0.035em] leading-[1.95]` to make complex glyph combinations more readable.
    *   **Urdu (`ur`)**: Styled using `font-sans tracking-[0.04em] leading-[1.95]` to improve character legibility and spacing.
*   **High Contrast**: Designed to look clean and highly readable, even under direct sunlight at the farm site.
