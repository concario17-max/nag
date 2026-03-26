# Current Task
모든 콥트어에서 dot below 결합 부호를 제거한다. `ⲟ̣` 같은 표기를 `ⲟ`로 바꿔서 전역 Coptic 텍스트를 단순화한다.

# Route
Route A

# Writer Slot
main

# Contract Freeze
not required

# Seed Path
SEED.yaml

# Write Sets
- `main`
  - `STATE.md`
  - `scripts/extract-codex-data.js`
  - `src/lib/parseCodexCore.js`
  - `src/data/codexData.js`

# Reviewer
Sagan

# Active Phase
implementation

# Active Worker
main

# Reason
This is a narrow Coptic normalization tweak: only the dot-below combining mark needs to be stripped globally from generated Coptic text. The slice stays small enough for Route A.

# Last Update
2026-03-26
