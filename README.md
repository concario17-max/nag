# nag reader

Codex I reader scaffold for the `nag` workspace.

## Run

```bash
node scripts/extract-codex-data.js
node tests/run-tests.js
npm run build
npm run dev
```

## Notes

- `src/data/codexData.js` is checked in and generated locally from the source files.
- The first implementation slice maps one subtitle to one page.
- ODT extraction is pure Node now; no PowerShell is needed for regeneration.
- The current feature layer is local-only and does not need network access.
