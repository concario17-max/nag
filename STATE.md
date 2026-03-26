# Current Task
Fix the deployed Coptic rendering by widening the Antinoou fallback stack so missing glyphs stop showing as boxes.

# Route
Route A

# Writer Slot
main

# Contract Freeze
frozen

# Seed Path
SEED.yaml

# Write Sets
- `main`
  - `STATE.md`
  - `tailwind.config.js`

# Reviewer
none

# Active Phase
implementation

# Active Worker
worker_sidebar

# Reason
This is a single-file font-stack fix: the deployed site still has missing Coptic glyph boxes, and widening the Antinoou fallback stack in `tailwind.config.js` is the smallest safe slice.

# Last Update
2026-03-26
