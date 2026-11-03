# BOARD_ELEPHANT

Chessboard rendering engine, square selection, piece interactions, coordinate annotations, playback controls, evaluation telemetry, and algebraic notation stack components.

---

## 1. Component Overview

The `components/board/` module houses all presentation and control elements for the interactive chessboard.

```
components/board/
├── BOARD_ELEPHANT.md           # This specification document
├── Board.jsx                   # 8x8 Chessboard grid, square rendering, click/move handling
├── BoardControl.jsx            # Step buttons (|<, <, >, >|, Reset, Solution)
├── BoardEvaluation.jsx         # Engine evaluation bar and numerical readout
├── BoardNotation.jsx           # Algebraic move history list with active index tracker
└── BoardTitle.jsx              # Opening title, line name, and catalog breadcrumb navigation
```

---

## 2. Component Specifications

### 1. `Board.jsx`
- **Grid Architecture**: Renders an 8x8 grid composed of 8 `Row` elements, each containing 8 `Square` elements.
- **Coordinate System**:
  - File labels (`a`-`h`) rendered on the bottom edge (row 7).
  - Rank numbers (`1`-`8`) rendered on the right edge (col 7).
  - Automatically reverses coordinates when `orientation === BoardOrientation.REVERSED`.
- **Square Layering**:
  Each `Square` renders stacked layers:
  1. Base square background (`even` vs. `odd` alternating checker pattern).
  2. Selected square highlight (`board-square-selected`).
  3. Previous move highlight (`board-square-selected previous`).
  4. Valid move indicators (`board-square-selected empty` dot vs. `board-square-selected piece` ring).
  5. Chess piece image asset (`<img className="board-piece" />`).
- **Piece Map**:
  Maps `Piece` enum identifiers (`b-king`, `w-pawn`, etc.) to imported PNG asset images.
- **Imperative Handle**:
  Exposes `reset()` via `useImperativeHandle` to deselect squares and clear active highlights.

### 2. `BoardControl.jsx`
Provides the navigation toolbar for walking through the line:
- **`|<` (LEFT_DOUBLE)**: Jump to start of opening or line starting point.
- **`<` (LEFT)**: Step back one ply.
- **`>` (RIGHT)**: Step forward one ply.
- **`>|` (RIGHT_DOUBLE)**: Fast-forward to the end of the studied variation.
- **`Reset`**: Reset board back to the opening branch point.
- **Button Disabled States**: Buttons automatically disable at boundary conditions (`boardIndex === 0`, `boardIndex >= boardLength`).

### 3. `BoardEvaluation.jsx`
Visualizes computer analysis evaluation for the current board position:
- Takes numeric evaluation `e` (in pawn units / centipawns, e.g. `+0.17`, `-0.05`).
- Displays normalized vertical or horizontal evaluation indicator bar.
- Formats positive scores with explicit `+` (e.g. `+0.23`) and negative scores for Black advantage.

### 4. `BoardNotation.jsx`
Renders the complete move sequence in standard algebraic notation:
- Formats paired moves (White and Black) with move numbers: `1. d4 Nf6  2. c4 e6 ...`.
- Highlights the currently active ply corresponding to the board state displayed on screen (`.board-notation-text-selected`).
- **Interactive Move Navigation**: Clicking any move chip triggers `onSelectMove(index)`, jumping the board, evaluation metric, and notation tracker directly to the board state resulting from that move. Hover states and cursor pointers provide responsive feedback.

### 5. `BoardTitle.jsx`
Top navigation header providing:
- Back button to navigate to the parent Opening Line Catalog.
- Opening name (e.g. `Catalan`).
- Variation line name pill badge (e.g. `Mainline`).
- Interactive **Board Flip Button** (`SwapVertIcon`): Toggles White vs. Black board orientation on the fly.

