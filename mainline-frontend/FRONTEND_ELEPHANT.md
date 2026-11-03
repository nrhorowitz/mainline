# FRONTEND_ELEPHANT

Master frontend architecture, UI layout, design tokens, Vite configuration, and client-side lifecycle for the **Mainline** web application.

---

## 1. Architecture Overview

`mainline-frontend` is a high-performance Single-Page Application (SPA) built using **React 18** and bundled with **Vite 5**. It delivers an uncluttered, modern dark-themed interface inspired by professional chess tools, with instant client-side routing, SVG/PNG piece rendering, and zero-latency board state updates.

### Key Technology Stack
- **Framework**: React 18 (`react`, `react-dom`)
- **Routing**: React Router v6 (`react-router-dom`) with `createBrowserRouter` and `RouterProvider`
- **UI Components & Icons**: Material-UI v5 (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`)
- **Build Tool**: Vite 5 (`vite`, `@vitejs/plugin-react`)
- **Performance & Asset Delivery**: Base64 embedded vector/pixel chess assets, pre-computed move and evaluation stacks.

---

## 2. Directory Structure

```
mainline-frontend/
├── FRONTEND_ELEPHANT.md        # Master frontend documentation (This file)
├── package.json                # Dependencies, build scripts
├── vite.config.js              # Vite bundler options (port 3000, React plugin)
├── index.html                  # HTML5 entry with mobile responsive meta tags
├── public/
│   ├── favicon.ico             # App icon
│   ├── manifest.json           # PWA / web manifest
│   ├── robots.txt              # Search engine directives
│   └── w-knight.png            # White knight icon
└── src/
    ├── App.jsx                 # App root with MUI ThemeProvider
    ├── App.css                 # View layout, container styles
    ├── index.jsx               # React DOM createRoot entry
    ├── index.css               # Global CSS: Chessboard 8x8 grid, coordinates, squares
    ├── reportWebVitals.js      # Core Web Vitals telemetry
    ├── components/board/       # Board UI components (Board, Controls, Notation, Eval)
    ├── views/                  # Route views (Landing, Catalogs, Board)
    ├── data/                   # Opening line datasets (catalan.json, carokann.json)
    ├── util/                   # Chess engine, coordinate math, board models
    └── images/                 # Complete 12-piece chess image set + opening icons
```

---

## 3. Design Tokens & Theme Foundation

The application uses an obsidian dark palette with high-contrast emerald and cyan accents:

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `Dark Board Square` | `#779556` (Olive Green) / `#B58863` | Standard alternating chess square themes. |
| `Light Board Square`| `#EBECD0` (Off-White Cream) / `#F0D9B5` | Light chess square background. |
| `Selected Square`   | `rgba(255, 255, 0, 0.5)` | Highlight for currently focused square. |
| `Previous Move`     | `rgba(155, 199, 0, 0.41)` | Start and destination squares of the last move. |
| `Valid Move (Empty)`| Dot indicator | Targeted empty destination square. |
| `Valid Move (Piece)`| Ring indicator | Targeted capture square. |
| `Study Accent`      | `#00AC8D` | Emerald green branding for Study options. |
| `Trainer Accent`    | `#23B5EF` | Electric blue branding for Trainer options. |
| `Dark Surface`      | `#1E1E1E` | Card surface and navigation bar background. |
| `Primary Text`      | `#BABABA` / `#FFFFFF` | Readable typography over dark backgrounds. |

---

## 4. Mobile Layout & Phone Cutout Frame

Mainline is engineered as a mobile-first chess repertoire companion. To deliver a consistent experience across all devices:

1. **Desktop / Big Screens**:
   - The entire app renders within a polished, realistic **smartphone cutout frame** (`.phone-device-frame`), centered against a modern radial gradient obsidian backdrop (`#0c0d10`).
   - Includes physical phone details: top **Dynamic Island / Hardware notch** (`.phone-hardware-notch`), rounded corners (`border-radius: 48px`), subtle bezel shadows, and a floating **Home Indicator Bar** (`.phone-home-indicator`).
   - Sized to standard modern smartphone dimensions (`max-width: 414px`, `height: min(870px, 94vh)`).
2. **True Mobile Devices (`max-width: 500px`)**:
   - The phone cutout gracefully dissolves: borders and notches are hidden, expanding the app into a native edge-to-edge full-screen mobile UI (`100vw` by `100vh`).
3. **Responsive Chessboard Geometry**:
   - Uses CSS container queries (`container-type: inline-size` with `12.5cqw` per square, falling back to `calc(min(100vw, 392px) / 8)`).
   - This ensures the 8x8 chessboard is always exactly 100% of the mobile screen width, with zero awkward line-wrapping or viewport overflow.

---

## 5. Build & Development Workflow

### Dev Server
```bash
npm run dev
# Or from workspace root:
npm start
```
Starts the Vite dev server at `http://localhost:3000/` with instant Hot Module Replacement (HMR).

### Production Build
```bash
npm run build
```
Generates an optimized, minified bundle in `dist/` ready for Firebase Hosting deployment:
- Chunks split automatically for `@mui` and `react-router`.
- CSS minified with PostCSS and autoprefixer.
- Asset URLs resolved relative to project root.

