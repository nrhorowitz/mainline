# REPERTOIRE_ELEPHANT

Repertoire dataset schemas, move evaluation metrics, line branching specifications, and expansion format for opening theory files in **Mainline**.

---

## 1. Overview & Location

Opening repertoire datasets are stored as structured JSON documents under `src/data/`:

```
src/data/
├── REPERTOIRE_ELEPHANT.md      # Repertoire documentation (This file)
├── catalan.json                # Catalan Opening (5 variations, 164 plies)
├── carokann.json               # Caro-Kann Defense (5 variations, 171 plies)
├── sicilian.json               # Sicilian Defense (7 variations, 252 plies)
├── ruylopez.json               # Ruy Lopez / Spanish (6 variations, 216 plies)
├── french.json                 # French Defense (6 variations, 216 plies)
├── italian.json                # Italian Game (5 variations, 180 plies)
├── qgd.json                    # Queen's Gambit Declined (5 variations, 180 plies)
├── kingsindian.json            # King's Indian Defense (5 variations, 180 plies)
├── nimzoindian.json            # Nimzo-Indian Defense (5 variations, 180 plies)
├── london.json                 # London System (4 variations, 144 plies)
├── english.json                # English Opening (4 variations, 144 plies)
├── scandinavian.json           # Scandinavian Defense (4 variations, 144 plies)
├── grunfeld.json               # Grünfeld Defense (4 variations, 144 plies)
└── slav.json                   # Slav Defense (4 variations, 144 plies)
```

**Total Scope**: 14 Openings • 69 Canonical Variations • 2,459 Total Plies (each ~18 moves / 36 plies long with deep Stockfish cloud evaluations).

---

## 2. Repertoire JSON Schema

Each opening file adheres to the following JSON structure:

```json
{
  "opening": "OpeningName",
  "moves": [
    { "m": "MoveInSAN", "e": 0.00 }
  ],
  "lines": [
    {
      "name": "LineVariationKey",
      "label": "HumanReadableName",
      "moves": [
        { "m": "MoveInSAN", "e": 0.00 }
      ]
    }
  ]
}
```

### Field Definitions

| Field | Type | Description |
| :--- | :--- | :--- |
| `opening` | `string` | Display name of the opening (e.g., `"Catalan"`, `"CaroKann"`, `"Sicilian"`). |
| `moves` | `Array<Move>` | Base move sequence that defines the root opening before branching into specific lines. |
| `lines` | `Array<Line>` | Array of specific sub-variations branching off the base moves. |
| `line.name` | `string` | Identifier/key for the variation (e.g., `"mainline"`, `"2...Nc6"`, `"4...dxc4"`). Used for URL routing. |
| `line.label` | `string` *(optional)* | Separate human-readable name of the variation (e.g., `"Rossolimo"`, `"Open"`, `"Closed"`, `"Advance"`). Displayed as a **green tag** in the UI. |
| `line.deviation` | `string` *(optional)* | First move that deviates from the mainline. If omitted, computed automatically against the mainline. Displayed as a **blue tag** in the UI. |
| `line.moves` | `Array<Move>` | Additional move sequence continuing from the end of root `moves`. |
| `move.m` | `string` | Move string in Standard Algebraic Notation (SAN), e.g. `"Nf6"`, `"cxd5"`, `"Bb4+"`, `"O-O"`. |
| `move.e` | `number` | Position evaluation in pawn units after this move (positive for White advantage, negative for Black advantage). |

---

## 3. Included Datasets

### 1. `catalan.json`
- **Root Moves (7 plies)**:
  `1. d4` (+0.17), `1... Nf6` (+0.04), `2. c4` (+0.06), `2... e6` (+0.05), `3. Nf3` (+0.05), `3... d5` (+0.06), `4. g3` (+0.17)
- **Mainline Variation (26 additional plies)**:
  `4... Bb4+`, `5. Bd2`, `5... Be7`, `6. Bg2`, `6... O-O`, `7. O-O`, `7... c6`, `8. Qc2`, `8... b6`, `9. Rd1`, `9... Nbd7`, `10. Bf4`, `10... Bb7`, `11. Ne5`, `11... Nh5`, `12. Be3`, `12... Nhf6`, `13. cxd5`, `13... cxd5`, `14. Nc6`, `14... Bxc6`, `15. Qxc6`, `15... a6`, `16. Rc1`, `16... Rc8`, `17. Qa4`

### 2. `carokann.json`
- **Root Moves (4 plies)**:
  `1. e4` (+0.07), `1... c6` (+0.20), `2. d4` (+0.23), `2... d5` (+0.18)
- **Mainline Variation (22 additional plies)**:
  `3. Nc3`, `3... dxe4`, `4. Nxe4`, `4... Bf5`, `5. Ng3`, `5... Bg6`, `6. h4`, `6... h6`, `7. Nf3`, `7... Nd7`, `8. h5`, `8... Bh7`, `9. Bd3`, `9... Bxd3`, `10. Qxd3`, `10... e6`, `11. Bd2`, `11... Ngf6`, `12. O-O-O`, `12... Be7`, `13. Kb1`, `13... O-O`

---

## 4. How to Add a New Opening Repertoire

To add a new opening (e.g., `sicilian.json`):

1. **Create the Data File**: Create `src/data/sicilian.json` matching the schema above.
2. **Register in `line.js`**:
   ```javascript
   import Sicilian from '../data/sicilian.json';
   // In loadAllLines():
   const jsons = [Catalan, CaroKann, Sicilian];
   ```
3. **Automatic Compilation**: `loadAllLines()` automatically registers the new opening under its key (`sicilian`). It immediately appears in the `/study` catalog, formats the preview string, and compiles the variation board stacks.

