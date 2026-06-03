# Rythu Sethu — Project Constitution

This document governs all architectural and development activities in the Rythu Sethu repository. It defines coding styles, design policies, and processes that all contributors (including automated agents) must follow.

---

## 1. Principles of Spec-Driven Development (SDD)

All new features and major refactoring efforts must follow Spec-Driven Development:
1. **Write Specs First**: Before writing any implementation code, write a comprehensive markdown spec under the `specs/` directory using the standard feature spec template.
2. **Review & Iterate**: Align on requirements, API inputs/outputs, edge cases, and accessibility goals within the spec.
3. **Execute and Verify**: Implement changes precisely as specified, updating the spec if assumptions change.

---

## 2. Core Technical Guidelines

- **File Length & Modularity**: No React component or file should exceed 500 lines. Refactor shared business logic, data models, and complex UI layouts into distinct helper files under `src/components/`, `src/utils/`, or `src/data/`.
- **Imports**: All `import` statements must reside strictly at the top of files.
- **Type Strategy**: Share and maintain common TypeScript interfaces in `src/types.ts`. Avoid implicit `any` types.

---

## 3. Localization & Accessibility Constraints

- **Zero Hardcoded Text**: All interactive user interface text must map through `src/data/translations.ts`.
- **Three-Language Rule**: Every key added to translations must support **English (en)**, **Telugu (te)**, and **Urdu (ur)**.
- **Glyph Rendering Spacing**:
  - **Telugu (`te`)**: Apply `leading-[1.95]` and `tracking-[0.035em]` to paragraphs to prevent vertical overlap.
  - **Urdu (`ur`)**: Apply `leading-[1.95]` and `tracking-[0.04em]` for high legibility.
- **Physical Touch Boundaries**: Interactive elements must maintain a minimum physical target of `44px` for mobile field accessibility.
- **High Contrast**: Ensure text uses high contrast (e.g. charcoal `#1c1917` on white or deep green `#064e3b` on cream) to remain readable in direct outdoor sunlight.

---

## 4. Voice Override (Speakout) Code Rules

The Text-to-Speech (TTS) subsystem must manage thread buffers correctly to prevent Webkit/Chrome lockups:
1. Call `window.speechSynthesis.cancel()` immediately prior to initiating any new speech request.
2. Wrap the utterance within a `setTimeout(() => { ... }, 50)` block to safely clear the audio queue.
3. Match voice profiles dynamically by querying `window.speechSynthesis.getVoices()`, falling back to regional codes `te-IN`, `ur-IN`, and `en-IN`.
