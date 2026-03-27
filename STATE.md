# Current Task
Move the CODEX 1 title into the desktop sidebar layout so it is always visible above the chapter list.

# Route
Route B

# Writer Slot
main

# Contract Freeze
frozen

# Seed Path
SEED.yaml

# Write Sets
- `worker_layout`
  - `src/components/ui/SidebarLayout.jsx`
  - `src/pages/components/LeftSidebar.jsx`
- `worker_header`
  - `src/components/Sidebar/SidebarHeader.jsx`

# Reviewer
worker_reviewer

# Active Phase
implementation

# Active Worker
main

# Reason
The layout root owns the sidebar shell, and the mobile-only header needs to stay separate so desktop can show the root `CODEX 1` title without duplication.

# Last Update
2026-03-26
