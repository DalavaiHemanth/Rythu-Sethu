<div align="center">

# 🌾 Rythu Sethu — రైతు సేతు — رائتھو سیتھو

**Farmer's Bridge** — A multilingual smart agricultural advisor for Telangana farmers

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)](https://vitejs.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5-orange?logo=google)](https://ai.google.dev)
[![Languages](https://img.shields.io/badge/Languages-English%20%7C%20Telugu%20%7C%20Urdu-brightgreen)](#-multilingual-support)

</div>

---

## 📖 About

**Rythu Sethu** ("Farmer's Bridge") is a full-stack, mobile-first agricultural platform designed specifically for farmers in **Telangana, India**. It brings together AI-driven conversational assistance, government scheme information, fertilizer calculators, crop market rates, and localized weather advisories — all accessible in **English, Telugu, and Urdu**.

Built for low-cost smartphones with poor connectivity in mind, the UI is high-contrast, text-scalable, and touch-optimized for use in direct sunlight.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chatbot** | Gemini 2.5-powered multilingual agricultural advisor with text-to-speech (Speakout) |
| 📍 **Rythu Vedika Finder** | Directory of agricultural centers with officer contacts, filterable by district |
| 📚 **Knowledge Base** | Telangana state G.O. (Government Order) circular database with search & categories |
| 🎯 **Farmer Quiz** | Eligibility checker for state schemes (Rythu Bandhu, crop insurance, etc.) |
| 🧪 **Fertilizer Calculator** | PJTSAU-compliant NPK (Urea/DAP/MOP) bag calculator by crop & acreage |
| 🌦️ **Agro-Weather Outlook** | Deterministic district-level micro-climate simulation with PJTSAU advisory alerts |
| 📈 **Mandi Rates** | Current crop market rates for Telangana mandis |
| 🔊 **Text-to-Speech** | Speakout engine supporting `te-IN` and `ur-IN` regional voice synthesis |

---

## 🌐 Multilingual Support

The entire application — UI labels, chatbot responses, tooltips, and advisories — is available in three languages:

| Language | Script | Code |
|---|---|---|
| English | Latin | `en` |
| Telugu | తెలుగు | `te` |
| Urdu | اردو | `ur` |

Regional font rendering is tuned for legibility on low-resolution screens:
- **Telugu**: `leading-[1.95] tracking-[0.035em]` to prevent glyph overlap
- **Urdu**: `leading-[1.95] tracking-[0.04em]` for Nastaliq-style readability

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | Express.js (Node.js), served via `server.ts` |
| **AI / LLM** | Google Gemini 2.5 via `@google/genai` SDK |
| **Build Tools** | Vite 6, esbuild, tsx |
| **Animations** | Motion (Framer Motion successor) |
| **Icons** | Lucide React |

The Gemini API key is **never exposed to the browser** — all AI requests are proxied securely through the Express backend at `/api/chat`.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd rythu-sethu

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY
```

### Running Locally

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

### Building for Production

```bash
# Build client + server bundles
npm run build

# Run production server
npm start
```

The production server is compiled to `dist/server.cjs` via esbuild and serves client assets from Express.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Your Google Gemini API key |
| `APP_URL` | Optional | Hosted URL (used for self-referential links) |

---

## 📁 Project Structure

```
rythu-sethu/
├── server.ts              # Express backend — API proxy & static file server
├── index.html             # Vite HTML entrypoint
├── src/
│   ├── main.tsx           # React mount root
│   ├── App.tsx            # Top-level layout: language state, tab navigation
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── index.css          # Global styles & regional font rules
│   ├── components/
│   │   ├── Chatbot.tsx        # AI chat interface with Speakout TTS
│   │   ├── CenterFinder.tsx   # Rythu Vedika center directory
│   │   ├── KnowledgeBase.tsx  # G.O. circular search & library
│   │   ├── FarmerQuiz.tsx     # Scheme eligibility engine
│   │   └── FarmerTools.tsx    # NPK calculator, weather, mandi rates
│   └── data/
│       ├── staticData.ts      # Rythu Vedika centers, crop data
│       └── translations.ts    # en / te / ur translation keys
├── ARCHITECTURE.md        # System design & algorithm docs
├── TECH_STACK.md          # Technology selection rationale
├── PROOF_OF_CONCEPT.md    # Validation scenarios & test results
├── CONTRIBUTING.md        # Contribution guidelines
├── USER_MANUAL.md         # End-user guide
└── AGENTS.md              # AI agent development rules
```

---

## 🔬 Key Algorithms

### NPK Fertilizer Calculator (PJTSAU-Compliant)
Calculates exact bag counts for Urea, DAP, and MOP based on crop type and acreage:
```
Urea (N source)    = Target_N × 2.17 × Acres
DAP (P source)     = Target_P × 6.25 × Acres
MOP (K source)     = Target_K × 1.67 × Acres
```

### Deterministic Micro-Climate Engine
Simulates district-level weather using a seed derived from the district name's character codes — ensuring consistent, offline-capable advisories without a live weather API.

---

## 🛡️ Security

- **API keys are server-side only** — never bundled into the client JavaScript
- All AI calls are routed through `/api/chat` on the Express backend
- Production server binds to `0.0.0.0:3000` for container compatibility

---

## 📚 Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture, component design, data structures |
| [TECH_STACK.md](TECH_STACK.md) | Technology choices and code flow diagrams |
| [PROOF_OF_CONCEPT.md](PROOF_OF_CONCEPT.md) | Validation tests and security proofs |
| [USER_MANUAL.md](USER_MANUAL.md) | End-user guide for farmers and field workers |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute to the project |
| [AGENTS.md](AGENTS.md) | AI agent development guidelines |

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests. All contributors must follow the design guidelines in [AGENTS.md](AGENTS.md), including multilingual translation coverage for all three supported languages.

---

## 📜 License

This project was built for the **Swecha Hackathon**. See [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ for Telangana farmers — రైతుల కోసం నిర్మించబడింది
</div>
