# ENGINE_ELEPHANT

Architecture, Lichess API protocol, CLI operations, and data generation pipeline for the standalone **Mainline Repertoire Engine Service** (`services/engine`).

---

## 1. Overview & Role

The **Engine Service** is an independent local service decoupled from the React/Vite UI. Its primary purpose is to:
1. Automate generation of grandmaster opening lines by querying cloud-calculated evaluations.
2. Select Lichess's top engine move at every ply up to ~18 full moves (36 individual plies).
3. Output valid JSON repertoire files directly into `mainline-frontend/src/data/` ready for consumption by `line.js`.

```
services/engine/
├── ENGINE_ELEPHANT.md    # Engine service specification & operations (This file)
├── generate_line.py      # Core CLI generator script
└── requirements.txt      # Python dependencies (python-chess)
```

---

## 2. Lichess API Integration

### Protocol & Endpoint
The service queries the official, publicly available **Lichess Cloud Evaluation API**:
```
GET https://lichess.org/api/cloud-eval?fen={FEN}
```

- **Authentication**: Unauthenticated / Public API (avoids 401 token requirements on explorer endpoints).
- **Depth**: Accesses deep Stockfish analyses (depth 50–70) precomputed by Lichess distributed computing.
- **Payload Structure**:
  ```json
  {
    "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    "knodes": 234120,
    "depth": 52,
    "pvs": [
      {
        "moves": "g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 ...",
        "cp": 32
      }
    ]
  }
  ```

### Evaluation Parsing & Normalization
- **Centipawn (`cp`)**: Divided by 100 to yield a decimal evaluation in pawns (e.g., `+32` centipawns becomes `+0.32`).
- **Mate Scores (`mate`)**: Converted into signed maximum evaluations (`+10.0` or `-10.0`).
- **Principal Variation (`pvs[0]['moves']`)**: Space-separated UCI moves (e.g. `g1f3`). Converted to Standard Algebraic Notation (SAN) using `python-chess`.

---

## 3. Line Generation Mechanics

1. **Board Initialization**: Starts from starting position `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`.
2. **Root Move Execution**:
   - Parses the user-provided root moves (e.g. `e4 c5`).
   - Pushes each move to the internal `chess.Board()` state.
   - Evaluates each ply and stores under `repertoire.moves`.
3. **Continuation Loop (Up to Target Plies)**:
   - Queries `https://lichess.org/api/cloud-eval` for the current FEN.
   - Takes the top move (`pvs[0]`).
   - If a position has no instant cloud eval, the engine consumes remaining moves from the buffered principal variation (PV) chain.
   - If the line reaches a rare unanalyzed branch, it falls back to legal board moves without crashing.
   - Advances by 1 ply and records the evaluation score.
   - Default target length: **18 moves = 36 individual plies**.
4. **JSON Export**: Formats the result according to `REPERTOIRE_ELEPHANT.md` and writes it to `mainline-frontend/src/data/{opening}.json`.

---

## 4. CLI Usage & Operations

### Prerequisites
Install Python dependencies:
```bash
pip install -r services/engine/requirements.txt
```

### Running the Generator

You can run the script directly with Python or via npm:

```bash
# Using Python directly:
python3 services/engine/generate_line.py --opening Sicilian --root "e4 c5" --seed "Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3" --line mainline --moves 18

# Or using the root npm alias:
npm run generate:line -- --opening Sicilian --root "e4 c5" --seed "Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3" --line mainline --moves 18
```

### Command Line Arguments

| Flag | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--opening` | `str` | `Sicilian` | Display name of the opening (e.g., `Sicilian`, `RuyLopez`, `French`). |
| `--root` | `str` | `e4 c5` | Space-separated root moves in SAN notation (e.g., `e4 c5` or `d4 Nf6 c4`). |
| `--seed` | `str` | `""` | Optional initial moves to seed the variation line before Lichess engine continuation (e.g. `Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3`). |
| `--moves` | `int` | `18` | Number of full moves (~36 individual plies). |
| `--line` | `str` | `mainline` | Sub-variation name (default is `mainline`). Replaces or appends to existing variations. |
| `--output` | `str` | `None` | Custom output filename (defaults to `{opening_name.lower()}.json`). |

---

## 5. Generated Data Verification

Generated files are placed in `mainline-frontend/src/data/`:
```
mainline-frontend/src/data/sicilian.json
```

Example output format (Sicilian Mainline - Najdorf English Attack):
```json
{
  "opening": "Sicilian",
  "moves": [
    { "m": "e4", "e": 0.18 },
    { "m": "c5", "e": 0.32 }
  ],
  "lines": [
    {
      "name": "mainline",
      "moves": [
        { "m": "Nf3", "e": 0.20 },
        { "m": "d6", "e": 0.31 },
        { "m": "d4", "e": 0.22 },
        { "m": "cxd4", "e": 0.19 },
        { "m": "Nxd4", "e": 0.18 },
        { "m": "Nf6", "e": 0.31 },
        { "m": "Nc3", "e": 0.32 },
        { "m": "a6", "e": 0.32 },
        { "m": "Be3", "e": 0.25 },
        ...
        { "m": "Rad1", "e": 0.05 },
        { "m": "Re8", "e": 0.00 }
      ]
    },
    {
      "name": "rossolimo",
      "moves": [
        { "m": "Nf3", "e": 0.32 },
        { "m": "Nc6", "e": 0.20 },
        { "m": "Bb5", "e": 0.30 },
        ...
      ]
    }
  ]
}
```
  ]
}
```

---

## 6. Frontend Registration

To make newly generated datasets available in the app:
1. Open `mainline-frontend/src/util/line.js`.
2. Import the JSON:
   ```javascript
   import Sicilian from '../data/sicilian.json';
   ```
3. Add it to `loadAllLines()`:
   ```javascript
   export function loadAllLines() {
       const jsons = [Catalan, CaroKann, Sicilian];
       ...
   }
   ```
4. The opening will immediately appear in the **Study Repertoire Catalog** and the **Trainer Selector**.

