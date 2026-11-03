# GRANDFATHER_ELEPHANT

Master architectural overview, system vision, directory inventory, multi-environment design (Local Dev vs. Firebase Hosting), and chess study engine specifications for the **Mainline** platform.

---

## 1. System Vision: Interactive Opening Theory & Repertoire Engine

**Mainline** is a modern chess opening repertoire and study platform designed to help competitive chess players learn, drill, and master complex opening theory. Rather than requiring players to memorize dry chess books or navigate cluttered tree interfaces, Mainline presents clean, curated opening lines with:

- **Move-by-Move Study Navigation**: Step forward and backward through canonical opening lines with granular board control and move-level evaluation metrics.
- **Dynamic Board State & Move Stacks**: Pre-computed board states and algebraic notation stacks (`Notation`), guaranteeing instant responsive transitions without runtime calculation lag.
- **Multi-Level Line Catalog**: Hierarchical navigation from top-level opening catalog (e.g., Catalan, Caro-Kann) down to specific tactical and positional variations (e.g., Catalan Mainline, Open Catalan, Closed Catalan).
- **Stockfish-Calibrated Engine Evaluations**: Real-time evaluation bar displaying position evaluation at each ply (e.g., `+0.17`, `+0.04`, `-0.05`).
- **Interactive Practice & Trainer Mode (Roadmap)**: Active testing where players play against the engine or solve opening puzzles to build muscle memory.

```
+-------------------------------------------------------------------------------+
|                                Mainline Platform                              |
|                                                                               |
|   +-----------------------------------------------------------------------+   |
|   |                        Landing View (Route: /)                        |   |
|   |   - Study Mode: Study any opening line                                |   |
|   |   - Trainer Mode: Practice opening lines against engine               |   |
|   +-----------------------------------+-----------------------------------+   |
|                                       |                                       |
|                                       v                                       |
|   +-----------------------------------------------------------------------+   |
|   |                  Study Catalog View (Route: /study)                   |   |
|   |   - Lists all openings (Catalan, Caro-Kann, etc.)                     |   |
|   |   - Formats opening preview moves: "1. d4 Nf6 2. c4 e6 3. Nf3 d5..."   |   |
|   +-----------------------------------+-----------------------------------+   |
|                                       |                                       |
|                                       v                                       |
|   +-----------------------------------------------------------------------+   |
|   |            Study Line Catalog View (Route: /study/:opening)           |   |
|   |   - Displays all studied variations for the selected opening          |   |
|   +-----------------------------------+-----------------------------------+   |
|                                       |                                       |
|                                       v                                       |
|   +-----------------------------------------------------------------------+   |
|   |          Study Board View (Route: /study/:opening/:line)              |   |
|   |   - Interactive 8x8 Chessboard with Custom Vector Piece Assets       |   |
|   |   - Step Controls: [|<] Prev Stage, [<] Prev Move, [>] Next Move,     |   |
|   |                    [>|] End Line, [Reset] Return to Start             |   |
|   |   - Move Evaluation Bar: Centipawn advantage metric per ply           |   |
|   |   - Full Algebraic Move History Stack with Active Highlighting        |   |
|   +-----------------------------------------------------------------------+   |
+-------------------------------------------------------------------------------+
```

---

## 2. Repository Anatomy & Directory Structure

```
Mainline/
├── GRANDFATHER_ELEPHANT.md                 # Master system overview & architecture (This file)
├── package.json                            # Root convenience scripts (start, dev, build)
├── firebase.json                           # Firebase hosting rules & SPA URL rewrites
├── .firebaserc                             # Firebase project binding (mainline-chess)
├── .gitignore                              # Git exclusion rules
└── mainline-frontend/
    ├── FRONTEND_ELEPHANT.md                # Master frontend architecture & Vite config
    ├── package.json                        # Frontend dependencies & scripts
    ├── vite.config.js                      # Vite bundler configuration (Port 3000)
    ├── index.html                          # Single-page application entry point
    ├── public/
    │   ├── favicon.ico                     # App favicon
    │   ├── manifest.json                   # Web app manifest
    │   ├── robots.txt                      # Crawler instructions
    │   └── w-knight.png                    # Brand icon (White Knight)
    └── src/
        ├── App.jsx                         # MUI ThemeProvider and root application entry
        ├── App.css                         # App-level styling & layout classes
        ├── index.jsx                       # React DOM root render
        ├── index.css                       # Global CSS resets, board grid, coordinates, and controls
        ├── reportWebVitals.js              # Performance metric collection
        ├── data/
        │   ├── REPERTOIRE_ELEPHANT.md      # Repertoire schemas & line definitions
        │   ├── catalan.json                # Catalan opening data & variations
        │   └── carokann.json               # Caro-Kann opening data & variations
        ├── components/
        │   └── board/
        │       ├── BOARD_ELEPHANT.md       # Chessboard component documentation
        │       ├── Board.jsx               # 8x8 grid rendering, square highlights, piece drag/click
        │       ├── BoardControl.jsx        # Navigation controls (Step forward/backward, reset)
        │       ├── BoardEvaluation.jsx     # Centipawn evaluation bar & numeric score
        │       ├── BoardNotation.jsx       # Algebraic move history list with active step tracker
        │       └── BoardTitle.jsx          # Header with breadcrumbs and opening/line titles
        ├── views/
        │   ├── VIEWS_ELEPHANT.md           # Page route views documentation
        │   ├── LandingView.jsx             # Main portal (Study vs. Trainer)
        │   ├── StudyViewCatalog.jsx        # Top-level opening repertoire catalog
        │   ├── StudyViewLineCatalog.jsx    # Specific opening line selection catalog
        │   ├── StudyViewBoard.jsx          # Interactive board view for studying a line
        │   └── Router.jsx                  # React Router v6 browser router definitions
        ├── util/
        │   ├── ENGINE_ELEPHANT.md          # Chess engine logic & notation parsing docs
        │   ├── board.js                    # Board orientations, pieces, turns, coordinate maps
        │   ├── icon.js                     # Icon themes and board icon mappings
        │   ├── line.js                     # Opening & OpeningLine classes, move stack generator
        │   ├── piece.js                    # Legal move generation algorithms for each piece
        │   └── util.js                     # Coordinate indexing, 2D array helpers, board flips
        └── images/
            ├── b-bishop.png                # Black Bishop asset
            ├── b-king.png                  # Black King asset
            ├── b-knight.png                # Black Knight asset
            ├── b-pawn.png                  # Black Pawn asset
            ├── b-queen.png                 # Black Queen asset
            ├── b-rook.png                  # Black Rook asset
            ├── w-bishop.png                # White Bishop asset
            ├── w-king.png                  # White King asset
            ├── w-knight.png                # White Knight asset
            ├── w-pawn.png                  # White Pawn asset
            ├── w-queen.png                 # White Queen asset
            ├── w-rook.png                  # White Rook asset
            └── catalan.png                 # Catalan opening thumbnail
```

---

## 3. Sub-Elephant Documentation Inventory

Each functional subsystem contains a dedicated `*_ELEPHANT.md` specification detailing its responsibilities, internal APIs, and component contracts:

| Document | Location | Scope & Purpose |
| :--- | :--- | :--- |
| **GRANDFATHER_ELEPHANT** | `/GRANDFATHER_ELEPHANT.md` | Master platform architecture, system vision, and project index. |
| **FRONTEND_ELEPHANT** | `/mainline-frontend/FRONTEND_ELEPHANT.md` | Single-page application structure, Vite build, MUI styling, and layout. |
| **BOARD_ELEPHANT** | `/mainline-frontend/src/components/board/BOARD_ELEPHANT.md` | 8x8 Chessboard engine, square highlights, controls, eval bar, and notation. |
| **VIEWS_ELEPHANT** | `/mainline-frontend/src/views/VIEWS_ELEPHANT.md` | Page views, router configuration, URL route params, and navigation. |
| **ENGINE_ELEPHANT** | `/mainline-frontend/src/util/ENGINE_ELEPHANT.md` | Chess logic, legal move generation, notation parsing, and board matrices. |
| **REPERTOIRE_ELEPHANT** | `/mainline-frontend/src/data/REPERTOIRE_ELEPHANT.md` | Opening JSON repertoire schemas, move trees, and evaluation stacks. |

---

## 4. Multi-Environment & Deployment Architecture

### 1. Local Development
- Built with **Vite 5** on **Node 26**, offering instantaneous hot-module replacement (HMR) and sub-100ms startup times.
- Accessible at `http://localhost:3000/`.
- Features an adaptive **Mobile Viewport Cutout**: large screens display the application within a realistic smartphone frame with a Dynamic Island notch and home bar indicator, while mobile devices automatically render native full-screen.
- Root `npm start` or `npm run dev` forwards execution directly to `mainline-frontend`.

### 2. Cloud Staging / Production
- **Platform**: Firebase Hosting (`mainline-chess.web.app` / `mainline-chess.firebaseapp.com`).
- **Build Target**: Single-page application (SPA) output in `mainline-frontend/dist/`.
- **SPA Rewrites**: All incoming requests redirect to `/index.html` to preserve client-side React Router navigation.
- **Config**: Defined in `firebase.json` and `.firebaserc`.

