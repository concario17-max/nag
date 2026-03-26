# Current Task
Fix the left sidebar chapter/verse split so it matches the 3SIN navigation pattern and the data contract stays aligned.

# Route
Route B

# Writer Slot
main

# Contract Freeze
frozen

# Seed Path
SEED.yaml

# Write Sets
- `worker_sidebar`
  - `src/lib/parseCodexCore.js`
  - `src/pages/components/LeftSidebar.jsx`
  - `src/components/Sidebar/SidebarChapterList.jsx`
  - `src/components/Sidebar/ChapterGroup.jsx`
  - `src/components/Sidebar/SidebarVerseList.jsx`
  - `src/components/Sidebar/ChapterButton.jsx`
  - `src/components/Sidebar/SidebarHeader.jsx`
  - `src/components/Sidebar/SidebarSectionLabel.jsx`
- `main`
  - `STATE.md`

# Reviewer
Sagan

# Active Phase
implementation

# Active Worker
worker_sidebar

# Reason
The request now spans multiple sidebar components and the reading-data shape, so the work needs a frozen contract, explicit write sets, worker delegation, and reviewer coverage under Route B. The reviewer found a data-contract mismatch between grouped sidebar rendering and `createReadingData()`, so the write set now includes the parser too.

# Last Update
2026-03-26
