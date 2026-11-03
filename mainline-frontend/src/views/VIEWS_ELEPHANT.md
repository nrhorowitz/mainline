# VIEWS_ELEPHANT

Page view architecture, client-side routing hierarchy, route parameter contracts, and navigation flow for **Mainline**.

---

## 1. Views Architecture & Routing Map

All high-level screens reside in `src/views/`. Route matching is declared in `src/views/Router.jsx` via React Router v6.

```
src/views/
├── VIEWS_ELEPHANT.md           # Page view documentation (This file)
├── Router.jsx                  # createBrowserRouter declaration & route definitions
├── LandingView.jsx             # Home portal (/): Mode selection (Study vs. Trainer)
├── StudyViewCatalog.jsx        # Opening repertoire list (/study) with real-time search
├── StudyViewLineCatalog.jsx    # Specific opening variations list (/study/:path_opening)
├── StudyViewBoard.jsx          # Interactive board view (/study/:path_opening/:path_line)
└── TrainerView.jsx             # Repertoire drill arena (/trainer)
```

```
Route Hierarchy:
/
├── /study
│   └── /study/:path_opening
│       └── /study/:path_opening/:path_line
└── /trainer
```

---

## 2. Route View Details

### 1. `LandingView.jsx` (Route: `/`)
- **Purpose**: Executive portal presenting Mainline's two core modalities:
  - **Study Mode**: "Explore canonical opening lines move-by-move with Stockfish evaluations and branching catalogs." Features the emerald `SchoolIcon` (`#00AC8D` on `#1E1E1E`).
  - **Trainer Mode**: "Drill move orders against computer responses to lock opening theory into muscle memory." Features the cyan `SportsEsportsIcon` (`#23B5EF` on `#1E1E1E`).
- **Layout & Structure**:
  - Hero Brand Header with custom White Knight logo badge, bold typography, and tagline.
  - Interactive Mode Cards with subtle hover transforms, border glows, badges, and chevron buttons.
  - Repertoire Status Section with 3 telemetry metrics: Total Openings, Total Evaluated Plies, and Average Stockfish Evaluation.

### 2. `StudyViewCatalog.jsx` (Route: `/study`)
- **Purpose**: Displays the catalog of all available chess openings loaded into memory via `loadAllLines()`.
- **Features**:
  - Header bar with back button returning to `/`, opening counter badge, and `SchoolIcon`.
  - Modern pill Search Bar with instant real-time filtering by opening name, SAN move sequence, or path key, with one-click clear button.
  - Rich Opening Cards displaying:
    - Opening title (e.g. `Catalan`, `CaroKann`).
    - First move badge (`1. d4`, `1. e4`).
    - Monospace SAN moves preview string (`1. d4 Nf6 2. c4 e6 3. g3 d5`).
    - Variation counter badge and "Study Lines →" action trigger.
  - Zero-state fallback with "Clear Search" trigger.

### 3. `StudyViewLineCatalog.jsx` (Route: `/study/:path_opening`)
- **Params**: `:path_opening` (e.g., `catalan`, `carokann`).
- **Purpose**: Lists all curated variations and tactical branches for the chosen opening.
- **Features**:
  - Header: Breadcrumb-styled bar displaying the Opening Name and variation picker.
  - Search input box for filtering variations.
  - Variation cards displaying:
    - Formatted variation name (e.g., `Mainline Variation`).
    - Total plies badge (`26 Plies Total`).
    - "Start Study" button with `PlayArrowIcon`.

### 4. `StudyViewBoard.jsx` (Route: `/study/:path_opening/:path_line`)
- **Params**:
  - `:path_opening`: Key identifying the opening in `allLines`.
  - `:path_line`: Key identifying the variation line inside `opening.lines`.
- **State Management**:
  - `solutionBoardIndex`: Current ply index within the precomputed board stack (defaults to `openingIndex`, the branch point where the line begins).
  - `boardOrientation`: Default (White at bottom) or Reversed (Black at bottom). Toggleable via the `BoardTitle` flip button.
  - `boardRef`: Reference for triggering imperative board resets.
- **Data Flow**:
  - Calls `line.getBoardStackAndNotationStack()` to retrieve pre-computed 2D boards and algebraic notations.
  - Calls `line.getEvaluationStack()` to retrieve per-ply evaluation scores.
  - Synchronizes `Board`, `BoardControl`, `BoardNotation`, `BoardEvaluation`, and `BoardTitle` based on `solutionBoardIndex`.

### 5. `TrainerView.jsx` (Route: `/trainer`)
- **Purpose**: Dedicated practice arena where players select an opening to drill.
- **Features**:
  - Repertoire Sparring banner with cyan `BoltIcon`.
  - Drill cards for each available repertoire with one-click jump into the study sequence.
