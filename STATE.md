# Current Task
`nag` 데이터 레이어 정리. `scripts/extract-codex-data.js`의 Windows PowerShell 의존을 제거한 상태에서, Tripartite Tractate의 3개 영어 파일을 모두 합치는 쪽으로 Codex I 매핑 규칙을 바로잡는다.

# Route
Route B

# Writer Slot
main

# Contract Freeze
frozen

# Seed Path
SEED.yaml

# Write Sets
- `worker_data`
  - `scripts/extract-codex-data.js`
  - `src/lib/parseCodexCore.js`
  - `src/lib/parseCodex.js`
  - `src/lib/readingState.js`
  - `src/data/codexData.js`
  - `tests/run-tests.js`
  - `README.md`
- `SEED.yaml`

# Reviewer
Sagan

# Active Phase
implementation

# Active Worker
main

# Reason
The request narrowed to two coupled data concerns: replace the Windows-only extraction path and tighten the Codex I mapping contract. Review found a concrete gap in the Tripartite Tractate mapping, so the data contract must now merge all three English part files instead of only Part One.

# Last Update
2026-03-26
