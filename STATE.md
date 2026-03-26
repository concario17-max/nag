# Current Task
Make CODEX 1 visibly appear as the desktop sidebar title and keep the chapter list readable without duplicating the header.

# Route
Route B

# Writer Slot
main

# Contract Freeze
frozen

# Seed Path
SEED.yaml

# Write Sets
- `worker_header`
  - `src/components/Sidebar/SidebarHeader.jsx`
- `worker_chapter_list`
  - `src/components/Sidebar/SidebarChapterList.jsx`

# Reviewer
worker_reviewer

# Active Phase
implementation

# Active Worker
main

# Reason
The visible fix now spans two sidebar files: the desktop header must surface `CODEX 1`, and the chapter list header must be reconciled so the title is not duplicated or hidden.

# Last Update
2026-03-26
