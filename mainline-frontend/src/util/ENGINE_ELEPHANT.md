# ENGINE_ELEPHANT

Chess rules engine, 2D matrix representations, legal move generator, coordinate geometry, algebraic notation parsing, and board stack pre-computation.

---

## 1. Engine Module Inventory

The `src/util/` directory contains all domain models, coordinate transforms, and chess calculation algorithms:

```
src/util/
├── ENGINE_ELEPHANT.md          # Chess engine documentation (This file)
├── board.js                    # Board enums (Turn, Orientation, Piece), StartingBoard matrix, Notation class
├── piece.js                    # Ray-tracing & hop-based legal move generation for all piece types
├── line.js                     # Opening & OpeningLine classes, move pre-computation, SAN applyMove engine
├── util.js                     # 2D array indexing, board flip, copy, bounds checking, selection math
└── icon.js                     # Icon colors and thumbnail mappings
```

---

## 2. Core Data Models (`board.js`)

### 1. Board Orientation & Turn Enums
- `BoardOrientation`: `DEFAULT` (White bottom) and `REVERSED` (Black bottom).
- `BoardTurn`: `WHITE` and `BLACK`. Toggled after each valid ply via `toggleBoardTurn()`.
- `BoardControlOption`: `LEFT`, `RIGHT`, `LEFT_DOUBLE`, `RIGHT_DOUBLE`, `RESET`, `TOGGLE_SOLUTION`, `TOGGLE_PRACTICE`.

### 2. Piece Representation
Pieces are represented as unique strings:
- White: `w-king`, `w-queen`, `w-rook`, `w-bishop`, `w-knight`, `w-pawn`.
- Black: `b-king`, `b-queen`, `b-rook`, `b-bishop`, `b-knight`, `b-pawn`.
- Empty: `default`.
Grouped into `WhitePieces` and `BlackPieces` sets for constant-time ownership checks (`isPlayerPiece`, `isOpponentPiece`).

### 3. Coordinate Maps
Mainline provides bi-directional 0-indexed to algebraic rank/file translation:
- `numberMap`: `0 -> 8`, `7 -> 1` (Row to Rank).
- `letterMap`: `0 -> 'a'`, `7 -> 'h'` (Col to File).
- `numberMapComplement` / `letterMapComplement`: Reverse lookups.
- `numberMapReversed` / `letterMapReversed`: Flipped lookups for Black orientation.

### 4. Board Matrix
The board is an 8x8 2D array of `Piece` strings:
```javascript
StartingBoard = [
  [b-rook, b-knight, b-bishop, b-queen, b-king, b-bishop, b-knight, b-rook],
  [b-pawn, ...],
  [default, ...],
  ...,
  [w-pawn, ...],
  [w-rook, w-knight, w-bishop, w-queen, w-king, w-bishop, w-knight, w-rook]
]
```

### 5. `Notation` Class
Encapsulates a played chess move:
```javascript
class Notation {
  constructor(piece, rankDestination, fileDestination, takes, rankOrigin, fileOrigin, alias) { ... }
  notationString() { ... }
}
```
Generates standard algebraic notation strings (e.g. `e4`, `Nf3`, `Bxb7`, `O-O`, `O-O-O`).

---

## 3. Legal Move Generation (`piece.js`)

Move validation computes valid destination squares given a selected piece and board state:

1. **Pawns**:
   - Single step forward into empty squares.
   - Initial two-square leap if on starting rank (rank 2 for White, rank 7 for Black) and path is unobstructed.
   - Diagonal captures against opponent pieces.
2. **Knights**:
   - 8 fixed L-shape offsets: `(±2, ±1)`, `(±1, ±2)`.
   - Immune to blocking (jumps over intermediate squares).
3. **Bishops**:
   - Diagonal ray-casting in 4 directions: `(+k, +k)`, `(+k, -k)`, `(-k, +k)`, `(-k, -k)`.
   - Ray stops upon encountering any piece; captures if opponent, blocks if friendly.
4. **Rooks**:
   - Orthogonal ray-casting in 4 directions: `(±k, 0)`, `(0, ±k)`.
5. **Queens**:
   - Combined Bishop and Rook ray-casting (all 8 directions).
6. **Kings**:
   - Single-step in all 8 directions.
   - Kingside (`O-O`) and Queenside (`O-O-O`) castling verification when paths are clear.

---

## 4. Repertoire Compilation & Pre-computation (`line.js`)

When the application boots:
1. `loadAllLines()` parses all opening JSON files (`catalan.json`, `carokann.json`).
2. Instantiates `Opening` and `OpeningLine` objects.
3. For each variation, `getBoardStackAndNotationStack()`:
   - Starts with `copyBoard(StartingBoard)`.
   - Iterates through every move notation (e.g., `["d4", "Nf6", "c4", "e6", "g3", ...]`).
   - Resolves piece origin via `getOrigin()` by matching destination, piece type, and disambiguation hints.
   - Applies the move to generate a new cloned 2D board matrix.
   - Generates the matching `Notation` instance.
   - Records all intermediate boards into `boardStack` and notations into `notationStack`.
4. As a result, stepping through lines in the UI is an instantaneous $O(1)$ array lookup with zero calculation overhead during user navigation.

