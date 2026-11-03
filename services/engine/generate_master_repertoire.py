#!/usr/bin/env python3
"""
Master Chess Repertoire Engine Generator
----------------------------------------
Generates comprehensive master-level opening repertoires using the Lichess
Cloud Evaluation API (Stockfish depth 50-70).

Outputs structured JSON opening lines directly into `mainline-frontend/src/data/`.
"""

import os
import sys
import time

script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

from generate_line import generate_opening_line

REPERTOIRE_SPECS = {
    "RuyLopez": {
        "opening": "Ruy Lopez",
        "root": ["e4", "e5", "Nf3", "Nc6", "Bb5"],
        "filename": "ruylopez.json",
        "lines": [
            {
                "line": "mainline",
                "label": "Closed Mainline",
                "deviation": "Mainline",
                "seed": ["a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6", "c3", "O-O", "h3"],
            },
            {
                "line": "3...Nf6",
                "label": "Berlin Defense",
                "deviation": "3...Nf6",
                "seed": ["Nf6", "O-O", "Nxe4", "d4", "Nd6", "Bxc6", "dxc6", "dxe5", "Nf5", "Qxd8+", "Kxd8"],
            },
            {
                "line": "5...Nxe4",
                "label": "Open Spanish",
                "deviation": "5...Nxe4",
                "seed": ["a6", "Ba4", "Nf6", "O-O", "Nxe4", "d4", "b5", "Bb3", "d5", "dxe5", "Be6"],
            },
            {
                "line": "4.Bxc6",
                "label": "Exchange Variation",
                "deviation": "4.Bxc6",
                "seed": ["a6", "Bxc6", "dxc6", "O-O", "f6", "d4", "exd4", "Nxd4", "c5"],
            },
            {
                "line": "8...d5",
                "label": "Marshall Attack",
                "deviation": "8...d5",
                "seed": ["a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "O-O", "c3", "d5", "exd5", "Nxd5"],
            },
            {
                "line": "3...f5",
                "label": "Schliemann Gambit",
                "deviation": "3...f5",
                "seed": ["f5", "Nc3", "fxe4", "Nxe4", "d5", "Nxe5", "dxe4", "Nxc6", "Qg5"],
            },
        ],
    },

    "French": {
        "opening": "French Defense",
        "root": ["e4", "e6", "d4", "d5"],
        "filename": "french.json",
        "lines": [
            {
                "line": "mainline",
                "label": "Winawer Variation",
                "deviation": "Mainline",
                "seed": ["Nc3", "Bb4", "e5", "c5", "a3", "Bxc3+", "bxc3", "Ne7", "Qg4", "O-O"],
            },
            {
                "line": "3...Nf6",
                "label": "Classical Steinitz",
                "deviation": "3...Nf6",
                "seed": ["Nc3", "Nf6", "e5", "Nfd7", "f4", "c5", "Nf3", "Nc6", "Be3"],
            },
            {
                "line": "3.Nd2",
                "label": "Tarrasch Variation",
                "deviation": "3.Nd2",
                "seed": ["Nd2", "c5", "exd5", "Qxd5", "Ngf3", "cxd4", "Bc4", "Qd6", "O-O", "Nf6"],
            },
            {
                "line": "3.e5",
                "label": "Advance Variation",
                "deviation": "3.e5",
                "seed": ["e5", "c5", "c3", "Nc6", "Nf3", "Qb6", "a3", "c4", "Be2", "Na5"],
            },
            {
                "line": "3.exd5",
                "label": "Exchange Variation",
                "deviation": "3.exd5",
                "seed": ["exd5", "exd5", "Bd3", "Bd6", "Ne2", "Nf6", "O-O", "O-O"],
            },
            {
                "line": "3...dxe4",
                "label": "Rubinstein Variation",
                "deviation": "3...dxe4",
                "seed": ["Nc3", "dxe4", "Nxe4", "Nd7", "Nf3", "Ngf6", "Bd3", "Be7"],
            },
        ],
    },

    "Italian": {
        "opening": "Italian Game",
        "root": ["e4", "e5", "Nf3", "Nc6", "Bc4"],
        "filename": "italian.json",
        "lines": [
            {
                "line": "mainline",
                "label": "Giuoco Pianissimo",
                "deviation": "Mainline",
                "seed": ["Bc5", "c3", "Nf6", "d3", "d6", "O-O", "a6", "a4", "Ba7", "Re1", "O-O"],
            },
            {
                "line": "4.b4",
                "label": "Evans Gambit",
                "deviation": "4.b4",
                "seed": ["Bc5", "b4", "Bxb4", "c3", "Ba5", "d4", "exd4", "O-O", "Nge7"],
            },
            {
                "line": "3...Nf6",
                "label": "Two Knights Defense",
                "deviation": "3...Nf6",
                "seed": ["Nf6", "Ng5", "d5", "exd5", "Na5", "Bb5+", "c6", "dxc6", "bxc6", "Bd3"],
            },
            {
                "line": "5...Nxd5",
                "label": "Fried Liver Attack",
                "deviation": "5...Nxd5",
                "seed": ["Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Ke6", "Nc3"],
            },
            {
                "line": "4.d4",
                "label": "Scotch Gambit",
                "deviation": "4.d4",
                "seed": ["Bc5", "d4", "exd4", "c3", "dxc3", "Bxf7+", "Kxf7", "Qd5+"],
            },
        ],
    },

    "QGD": {
        "opening": "Queen's Gambit Declined",
        "root": ["d4", "d5", "c4", "e6"],
        "filename": "qgd.json",
        "lines": [
            {
                "line": "mainline",
                "label": "Tartakower Variation",
                "deviation": "Mainline",
                "seed": ["Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O", "Nf3", "h6", "Bh4", "b6"],
            },
            {
                "line": "4.cxd5",
                "label": "Exchange Variation",
                "deviation": "4.cxd5",
                "seed": ["Nc3", "Nf6", "cxd5", "exd5", "Bg5", "c6", "Qc2", "Be7", "e3", "Nbd7"],
            },
            {
                "line": "4...Bb4",
                "label": "Ragozin Defense",
                "deviation": "4...Bb4",
                "seed": ["Nc3", "Nf6", "Nf3", "Bb4", "cxd5", "exd5", "Bg5", "h6", "Bh4", "c5"],
            },
            {
                "line": "6...Qa5",
                "label": "Cambridge Springs",
                "deviation": "6...Qa5",
                "seed": ["Nc3", "Nf6", "Bg5", "Nbd7", "e3", "c6", "Nf3", "Qa5", "Nd2", "Bb4"],
            },
            {
                "line": "4.Bf4",
                "label": "Harrwitz Attack",
                "deviation": "4.Bf4",
                "seed": ["Nc3", "Nf6", "Bf4", "Be7", "e3", "O-O", "Nf3", "c5", "dxc5"],
            },
        ],
    },

    "KingsIndian": {
        "opening": "King's Indian Defense",
        "root": ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6"],
        "filename": "kingsindian.json",
        "lines": [
            {
                "line": "mainline",
                "label": "Classical Mar del Plata",
                "deviation": "Mainline",
                "seed": ["Nf3", "O-O", "Be2", "e5", "O-O", "Nc6", "d5", "Ne7", "Ne1", "Nd7", "f3", "f5"],
            },
            {
                "line": "5.f3",
                "label": "Sämisch Variation",
                "deviation": "5.f3",
                "seed": ["f3", "O-O", "Be3", "e5", "d5", "c6", "Qd2", "cxd5", "cxd5", "a6", "Nge2"],
            },
            {
                "line": "5.Be2",
                "label": "Averbakh Variation",
                "deviation": "5.Be2",
                "seed": ["Be2", "O-O", "Bg5", "c5", "d5", "h6", "Bf4", "e6", "Qd2", "exd5"],
            },
            {
                "line": "5.f4",
                "label": "Four Pawns Attack",
                "deviation": "5.f4",
                "seed": ["f4", "O-O", "Nf3", "c5", "d5", "e6", "Be2", "exd5", "cxd5", "Re8"],
            },
            {
                "line": "5.Nf3",
                "label": "Fianchetto Variation",
                "deviation": "5.Nf3",
                "seed": ["Nf3", "O-O", "g3", "e5", "Bg2", "exd4", "Nxd4", "Re8", "O-O", "c6"],
            },
        ],
    },

    "NimzoIndian": {
        "opening": "Nimzo-Indian Defense",
        "root": ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
        "filename": "nimzoindian.json",
        "lines": [
            {
                "line": "mainline",
                "label": "Rubinstein Variation",
                "deviation": "Mainline",
                "seed": ["e3", "O-O", "Bd3", "d5", "Nf3", "c5", "O-O", "dxc4", "Bxc4", "Nbd7"],
            },
            {
                "line": "4.Qc2",
                "label": "Classical Capablanca",
                "deviation": "4.Qc2",
                "seed": ["Qc2", "O-O", "a3", "Bxc3+", "Qxc3", "b6", "Bg5", "Bb7", "f3", "h6"],
            },
            {
                "line": "4.Nf3",
                "label": "Kasparov Variation",
                "deviation": "4.Nf3",
                "seed": ["Nf3", "c5", "g3", "cxd4", "Nxd4", "O-O", "Bg2", "d5", "cxd5", "Nxd5"],
            },
            {
                "line": "4.a3",
                "label": "Sämisch Variation",
                "deviation": "4.a3",
                "seed": ["a3", "Bxc3+", "bxc3", "c5", "e3", "b6", "Bd3", "Bb7", "f3", "Nc6"],
            },
            {
                "line": "4.Bg5",
                "label": "Leningrad Variation",
                "deviation": "4.Bg5",
                "seed": ["Bg5", "h6", "Bh4", "c5", "d5", "d6", "e3", "Bxc3+", "bxc3", "e5"],
            },
        ],
    },

    "London": {
        "opening": "London System",
        "root": ["d4", "d5", "Bf4"],
        "filename": "london.json",
        "lines": [
            {
                "line": "mainline",
                "label": "Classical London",
                "deviation": "Mainline",
                "seed": ["Nf6", "e3", "c5", "c3", "Nc6", "Nd2", "e6", "Ngf3", "Bd6", "Bg3", "O-O"],
            },
            {
                "line": "2.Nc3",
                "label": "Jobava London",
                "deviation": "2.Nc3",
                "seed": ["Nf6", "Nc3", "c5", "e3", "Nc6", "Nf3", "Bf5", "dxc5", "e6"],
            },
            {
                "line": "2...c5",
                "label": "Steinitz Counter",
                "deviation": "2...c5",
                "seed": ["c5", "e3", "Qb6", "Nc3", "e6", "Nf3", "a6", "Rb1", "Nf6"],
            },
            {
                "line": "2...Nf6",
                "label": "vs Kings Indian Setup",
                "deviation": "2...Nf6",
                "seed": ["Nf6", "e3", "g6", "Nf3", "Bg7", "h3", "O-O", "Be2", "c5", "c3", "b6"],
            },
        ],
    },

    "English": {
        "opening": "English Opening",
        "root": ["c4"],
        "filename": "english.json",
        "lines": [
            {
                "line": "mainline",
                "label": "Four Knights English",
                "deviation": "Mainline",
                "seed": ["e5", "Nc3", "Nf6", "Nf3", "Nc6", "g3", "Bb4", "Bg2", "O-O", "O-O", "e4"],
            },
            {
                "line": "1...c5",
                "label": "Symmetrical English",
                "deviation": "1...c5",
                "seed": ["c5", "Nc3", "Nc6", "g3", "g6", "Bg2", "Bg7", "Nf3", "e6", "O-O", "Nge7"],
            },
            {
                "line": "1...e6",
                "label": "Agincourt Defense",
                "deviation": "1...e6",
                "seed": ["e6", "Nc3", "d5", "d4", "Nf6", "cxd5", "exd5", "Bg5", "c6", "e3", "Be7"],
            },
            {
                "line": "2...g6",
                "label": "Botvinnik System",
                "deviation": "2...g6",
                "seed": ["e5", "Nc3", "Nc6", "g3", "g6", "Bg2", "Bg7", "e4", "d6", "Nge2", "Nge7"],
            },
        ],
    },

    "Scandinavian": {
        "opening": "Scandinavian Defense",
        "root": ["e4", "d5", "exd5"],
        "filename": "scandinavian.json",
        "lines": [
            {
                "line": "mainline",
                "label": "Mainline 3...Qa5",
                "deviation": "Mainline",
                "seed": ["Qxd5", "Nc3", "Qa5", "d4", "Nf6", "Nf3", "c6", "Bc4", "Bf5", "Bd2", "e6"],
            },
            {
                "line": "3...Qd6",
                "label": "Gubinsky-Melts Qd6",
                "deviation": "3...Qd6",
                "seed": ["Qxd5", "Nc3", "Qd6", "d4", "Nf6", "Nf3", "c6", "g3", "Bg4", "Bg2", "e6"],
            },
            {
                "line": "2...Nf6",
                "label": "Modern 2...Nf6",
                "deviation": "2...Nf6",
                "seed": ["Nf6", "d4", "Nxd5", "Nf3", "g6", "Be2", "Bg7", "O-O", "O-O", "c4", "Nb6"],
            },
            {
                "line": "3...Bg4",
                "label": "Portuguese Gambit",
                "deviation": "3...Bg4",
                "seed": ["Nf6", "d4", "Bg4", "f3", "Bf5", "c4", "e6", "dxe6", "Nc6", "Be3", "fxe6"],
            },
        ],
    },

    "Grunfeld": {
        "opening": "Grünfeld Defense",
        "root": ["d4", "Nf6", "c4", "g6", "Nc3", "d5"],
        "filename": "grunfeld.json",
        "lines": [
            {
                "line": "mainline",
                "label": "Exchange Modern",
                "deviation": "Mainline",
                "seed": ["cxd5", "Nxd5", "e4", "Nxc3", "bxc3", "Bg7", "Nf3", "c5", "Rb1", "O-O", "Be2"],
            },
            {
                "line": "5.Qb3",
                "label": "Russian System",
                "deviation": "5.Qb3",
                "seed": ["Nf3", "Bg7", "Qb3", "dxc4", "Qxc4", "O-O", "e4", "a6", "Be2", "b5", "Qb3"],
            },
            {
                "line": "7.Bc4",
                "label": "Classical Exchange",
                "deviation": "7.Bc4",
                "seed": ["cxd5", "Nxd5", "e4", "Nxc3", "bxc3", "Bg7", "Bc4", "c5", "Ne2", "O-O", "Be3"],
            },
            {
                "line": "5.g3",
                "label": "Fianchetto Variation",
                "deviation": "5.g3",
                "seed": ["Nf3", "Bg7", "g3", "O-O", "Bg2", "dxc4", "O-O", "c6", "a4", "Na6"],
            },
        ],
    },

    "Slav": {
        "opening": "Slav Defense",
        "root": ["d4", "d5", "c4", "c6"],
        "filename": "slav.json",
        "lines": [
            {
                "line": "mainline",
                "label": "Classical Czech",
                "deviation": "Mainline",
                "seed": ["Nf3", "Nf6", "Nc3", "dxc4", "a4", "Bf5", "e3", "e6", "Bxc4", "Bb4", "O-O"],
            },
            {
                "line": "4...e6",
                "label": "Semi-Slav Defense",
                "deviation": "4...e6",
                "seed": ["Nf3", "Nf6", "Nc3", "e6", "e3", "Nbd7", "Bd3", "dxc4", "Bxc4", "b5", "Bd3", "a6"],
            },
            {
                "line": "4...a6",
                "label": "Chebanenko Slav",
                "deviation": "4...a6",
                "seed": ["Nf3", "Nf6", "Nc3", "a6", "e3", "b5", "b3", "Bg4", "Be2", "e6", "O-O"],
            },
            {
                "line": "3.cxd5",
                "label": "Exchange Slav",
                "deviation": "3.cxd5",
                "seed": ["cxd5", "cxd5", "Nc3", "Nf6", "Bf4", "Nc6", "e3", "a6", "Rc1", "Bf5", "Nf3"],
            },
        ],
    },
}


def run_master_generation(selected_openings=None):
    openings_to_run = selected_openings or list(REPERTOIRE_SPECS.keys())
    total_lines = sum(len(REPERTOIRE_SPECS[k]["lines"]) for k in openings_to_run)

    print(f"\n=======================================================")
    print(f"  Master Chess Repertoire Generator (Lichess Cloud Eval)")
    print(f"  Openings: {len(openings_to_run)} | Variations: {total_lines}")
    print(f"=======================================================\n")

    current_idx = 0
    for op_key in openings_to_run:
        op_data = REPERTOIRE_SPECS[op_key]
        op_name = op_data["opening"]
        root_moves = op_data["root"]
        filename = op_data["filename"]
        lines = op_data["lines"]

        print(f"\n>>> Starting Opening: {op_name} ({len(lines)} lines) -> {filename}")

        for l_spec in lines:
            current_idx += 1
            line_name = l_spec["line"]
            label = l_spec["label"]
            deviation = l_spec["deviation"]
            seed = l_spec.get("seed", [])

            print(f"\n[{current_idx}/{total_lines}] Generating '{op_name}' - {label} ({line_name})")
            generate_opening_line(
                opening_name=op_name,
                root_moves_san=root_moves,
                target_plies=36,
                line_name=line_name,
                output_filename=filename,
                seed_moves_san=seed,
                label=label,
                deviation=deviation,
            )

    print(f"\n=======================================================")
    print(f"  Successfully Generated All Repertoires ({current_idx} lines)!")
    print(f"=======================================================\n")


if __name__ == "__main__":
    args = sys.argv[1:]
    run_master_generation(args if args else None)

