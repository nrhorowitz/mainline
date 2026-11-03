#!/usr/bin/env python3
"""
Batch Opening Generator
-----------------------
Runs the Lichess Cloud Evaluation Engine to generate full repertoire lines
and tactical deviations for Catalan, Caro-Kann, and Sicilian Defense.
"""

import sys
import os

# Ensure services/engine is in python path
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

from generate_line import generate_opening_line


def run_batch():
    tasks = [
        # --- SICILIAN VARIATIONS ---
        {
            "opening_name": "Sicilian",
            "root_moves": ["e4", "c5"],
            "seed_moves": ["Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"],
            "line_name": "5...g6",
            "label": "Dragon",
            "deviation": "5...g6",
            "output_filename": "sicilian.json",
            "moves": 18,
        },
        {
            "opening_name": "Sicilian",
            "root_moves": ["e4", "c5"],
            "seed_moves": ["Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e5"],
            "line_name": "5...e5",
            "label": "Sveshnikov",
            "deviation": "2...Nc6",
            "output_filename": "sicilian.json",
            "moves": 18,
        },
        {
            "opening_name": "Sicilian",
            "root_moves": ["e4", "c5"],
            "seed_moves": ["Nf3", "e6", "d4", "cxd4", "Nxd4", "Nc6"],
            "line_name": "2...e6",
            "label": "Taimanov",
            "deviation": "2...e6",
            "output_filename": "sicilian.json",
            "moves": 18,
        },
        {
            "opening_name": "Sicilian",
            "root_moves": ["e4", "c5"],
            "seed_moves": ["c3", "d5", "exd5", "Qxd5", "d4"],
            "line_name": "2.c3",
            "label": "Alapin",
            "deviation": "2.c3",
            "output_filename": "sicilian.json",
            "moves": 18,
        },
        {
            "opening_name": "Sicilian",
            "root_moves": ["e4", "c5"],
            "seed_moves": ["Nc3", "Nc6", "g3", "g6", "Bg2", "Bg7", "d3"],
            "line_name": "2.Nc3",
            "label": "Closed",
            "deviation": "2.Nc3",
            "output_filename": "sicilian.json",
            "moves": 18,
        },

        # --- CARO-KANN VARIATIONS ---
        {
            "opening_name": "CaroKann",
            "root_moves": ["e4", "c6", "d4", "d5"],
            "seed_moves": ["Nc3", "dxe4", "Nxe4", "Bf5"],
            "line_name": "3.Nc3",
            "label": "Classical",
            "deviation": "3.Nc3",
            "output_filename": "carokann.json",
            "moves": 18,
        },
        {
            "opening_name": "CaroKann",
            "root_moves": ["e4", "c6", "d4", "d5"],
            "seed_moves": ["exd5", "cxd5", "c4", "Nf6", "Nc3"],
            "line_name": "3.exd5",
            "label": "Panov",
            "deviation": "3.exd5",
            "output_filename": "carokann.json",
            "moves": 18,
        },
        {
            "opening_name": "CaroKann",
            "root_moves": ["e4", "c6", "d4", "d5"],
            "seed_moves": ["e5", "c5", "dxc5", "e6"],
            "line_name": "3...c5",
            "label": "Advance c5",
            "deviation": "3...c5",
            "output_filename": "carokann.json",
            "moves": 18,
        },
        {
            "opening_name": "CaroKann",
            "root_moves": ["e4", "c6", "d4", "d5"],
            "seed_moves": ["f3", "dxe4", "fxe4", "e5", "Nf3"],
            "line_name": "3.f3",
            "label": "Fantasy",
            "deviation": "3.f3",
            "output_filename": "carokann.json",
            "moves": 18,
        },

        # --- CATALAN VARIATIONS ---
        {
            "opening_name": "Catalan",
            "root_moves": ["d4", "Nf6", "c4", "e6", "Nf3", "d5", "g3"],
            "seed_moves": ["Be7", "Bg2", "O-O", "O-O", "dxc4"],
            "line_name": "4...Be7",
            "label": "Classical",
            "deviation": "4...Be7",
            "output_filename": "catalan.json",
            "moves": 18,
        },
        {
            "opening_name": "Catalan",
            "root_moves": ["d4", "Nf6", "c4", "e6", "Nf3", "d5", "g3"],
            "seed_moves": ["Bb4+", "Bd2", "a5", "Bg2", "O-O", "O-O"],
            "line_name": "5...a5",
            "label": "Bogo a5",
            "deviation": "5...a5",
            "output_filename": "catalan.json",
            "moves": 18,
        },
    ]

    total_tasks = len(tasks)
    print(f"\n=======================================================")
    print(f"  Starting Batch Generation of {total_tasks} Opening Variations")
    print(f"=======================================================\n")

    for idx, t in enumerate(tasks, start=1):
        print(f"\n>>> Running [{idx}/{total_tasks}]: {t['opening_name']} - {t['label']} ({t['line_name']})")
        generate_opening_line(
            opening_name=t["opening_name"],
            root_moves_san=t["root_moves"],
            target_plies=t["moves"] * 2,
            line_name=t["line_name"],
            output_filename=t["output_filename"],
            seed_moves_san=t["seed_moves"],
            label=t["label"],
            deviation=t["deviation"],
        )

    print(f"\n=======================================================")
    print(f"  Successfully Generated All {total_tasks} Opening Variations!")
    print(f"=======================================================\n")


if __name__ == "__main__":
    run_batch()

