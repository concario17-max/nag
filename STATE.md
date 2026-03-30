# Current Task
Rebuild the Codex I baseline starting from `THE_PRAYER_OF_THE_APOSTLE_PAUL` using `codex/codex 1-1.odt` and `CODEX ENG/THE_PRAYER_OF_THE_APOSTLE_PAUL.txt`, with both Coptic and English centered in the renderer.

# Route
Route B

# Writer Slot
main

# Contract Freeze
Prayer-first Codex I rebuild: use `codex/codex 1-1.odt` plus `CODEX ENG/THE_PRAYER_OF_THE_APOSTLE_PAUL.txt` to regenerate the prayer slice, keep Coptic centered, center English rendering, and verify with build/typecheck/tests.

# Seed Path
SEED.yaml

# Write Sets
- `main`
  - `STATE.md`
- `worker-data`
  - `scripts/extract-codex-data.js`
  - `src/data/codexData.js`
- `worker-ui`
  - `src/components/Reading/TranslationSection.jsx`
# Reviewer
reviewer-ui

# Active Phase
implementation

# Active Worker
main

# Reason
The user explicitly switched back to Codex I and asked to implement the first three steps in order, which affects data generation and UI rendering across multiple files, so this is a Route B implementation with a frozen prayer-first contract.

# Last Update
2026-03-30
