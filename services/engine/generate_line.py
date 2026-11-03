#!/usr/bin/env python3
"""
Mainline Repertoire Engine Service
-----------------------------------
Integrates with the Lichess API (Cloud Evaluation & Stockfish Analysis)
to automatically generate grandmaster opening lines and output structured
repertoire JSON files directly into `mainline-frontend/src/data/`.

Each generated line is ~18 moves long (36 individual plies) following Lichess's
top engine and master recommendations.
"""

import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request

try:
    import chess
except ImportError:
    print("Error: 'python-chess' is required. Run 'pip install python-chess' first.", file=sys.stderr)
    sys.exit(1)

LICHESS_CLOUD_EVAL_URL = "https://lichess.org/api/cloud-eval"
USER_AGENT = "MainlineChessEngine/1.0 (https://github.com/nrhorowitz/mainline)"


def query_lichess_eval(fen: str, timeout: float = 5.0) -> dict:
    """Query Lichess Cloud Evaluation API for a given FEN."""
    encoded_fen = urllib.parse.quote(fen)
    url = f"{LICHESS_CLOUD_EVAL_URL}?fen={encoded_fen}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                return json.loads(resp.read().decode("utf-8"))
    except Exception:
        pass
    return {}


def extract_eval_score(pvs_data: list, default: float = 0.0) -> float:
    """Extract and normalize evaluation score in pawns from Lichess PV."""
    if not pvs_data:
        return default
    top_pv = pvs_data[0]
    if "cp" in top_pv:
        # Centipawns to decimal pawns (e.g. 32 -> 0.32)
        return round(top_pv["cp"] / 100.0, 2)
    elif "mate" in top_pv:
        mate = top_pv["mate"]
        return 10.0 if mate > 0 else -10.0
    return default


def generate_opening_line(
    opening_name: str,
    root_moves_san: list,
    target_plies: int = 36,
    line_name: str = "mainline",
    output_filename: str = None,
    seed_moves_san: list = None,
    label: str = None,
    deviation: str = None,
) -> dict:
    """
    Generate an opening repertoire structure using Lichess cloud evaluations.
    Takes root moves and optional line seed moves, then walks up to `target_plies`
    choosing Lichess's top engine move at each ply.
    """
    board = chess.Board()
    seed_moves_san = seed_moves_san or []
    print(f"\n[Engine] Initializing generation for '{opening_name}' ({line_name})")
    print(f"[Engine] Target length: {target_plies // 2} full moves ({target_plies} individual plies)")
    print(f"[Engine] Root moves: {' '.join(root_moves_san)}")
    if seed_moves_san:
        print(f"[Engine] Line seed moves: {' '.join(seed_moves_san)}")

    # 1. Process root moves
    root_items = []
    for move_san in root_moves_san:
        move_obj = board.parse_san(move_san)
        board.push(move_obj)
        fen = board.fen()
        data = query_lichess_eval(fen)
        eval_score = extract_eval_score(data.get("pvs", []), default=0.1)
        root_items.append({"m": move_san, "e": eval_score})
        print(f"  Root ply {len(root_items):2d}: {move_san:7s} (eval: {eval_score:+.2f})")
        time.sleep(0.08)

    # 2. Process line seed moves (if any)
    continuation_items = []
    for move_san in seed_moves_san:
        move_obj = board.parse_san(move_san)
        board.push(move_obj)
        fen = board.fen()
        data = query_lichess_eval(fen)
        eval_score = extract_eval_score(data.get("pvs", []), default=0.2)
        continuation_items.append({"m": move_san, "e": eval_score})
        total_plies = len(root_items) + len(continuation_items)
        move_num = (total_plies + 1) // 2
        turn_str = f"{move_num}." if total_plies % 2 == 1 else f"{move_num}..."
        print(f"  Seed ply {total_plies:2d} ({turn_str:6s}): {move_san:7s} | Eval: {eval_score:+.2f}")
        time.sleep(0.08)

    # 3. Generate line continuation up to target_plies via Lichess Cloud Eval
    cached_pv_uci = []

    while (len(root_items) + len(continuation_items)) < target_plies:
        total_plies = len(root_items) + len(continuation_items)
        fen = board.fen()
        data = query_lichess_eval(fen)
        pvs = data.get("pvs", [])

        top_move_uci = None
        eval_score = continuation_items[-1]["e"] if continuation_items else root_items[-1]["e"]

        if pvs and "moves" in pvs[0]:
            pv_tokens = pvs[0]["moves"].split()
            if pv_tokens:
                top_move_uci = pv_tokens[0]
                cached_pv_uci = pv_tokens[1:]
            eval_score = extract_eval_score(pvs, default=eval_score)
        elif cached_pv_uci:
            # Consume from previous principal variation buffer
            top_move_uci = cached_pv_uci.pop(0)
        else:
            # Fallback to legal moves if position is completely unanalyzed
            legal_moves = list(board.legal_moves)
            if not legal_moves:
                print("  [Notice] Position reached checkmate or stalemate.")
                break
            top_move_uci = legal_moves[0].uci()

        if not top_move_uci:
            break

        uci_obj = chess.Move.from_uci(top_move_uci)
        if uci_obj not in board.legal_moves:
            legal_moves = list(board.legal_moves)
            if not legal_moves:
                break
            uci_obj = legal_moves[0]

        san_str = board.san(uci_obj)
        board.push(uci_obj)
        continuation_items.append({"m": san_str, "e": eval_score})
        ply_num = total_plies + 1
        move_num = (ply_num + 1) // 2
        turn_str = f"{move_num}." if ply_num % 2 == 1 else f"{move_num}..."
        print(f"  Ply {ply_num:2d} ({turn_str:6s}): {san_str:7s} | Eval: {eval_score:+.2f}")
        time.sleep(0.08)

    # 4. Save/Merge into target data directory
    if not output_filename:
        output_filename = f"{opening_name.lower().replace(' ', '')}.json"

    # Base path resolution to mainline-frontend/src/data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))
    data_dir = os.path.join(project_root, "mainline-frontend", "src", "data")
    os.makedirs(data_dir, exist_ok=True)
    output_path = os.path.join(data_dir, output_filename)

    repertoire_data = None
    if os.path.exists(output_path):
        try:
            with open(output_path, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
            if isinstance(existing_data, dict) and "lines" in existing_data:
                repertoire_data = existing_data
                # Update root moves if provided or empty
                if not repertoire_data.get("moves"):
                    repertoire_data["moves"] = root_items
                # Replace line if existing, or append new line
                lines_list = repertoire_data.get("lines", [])
                line_idx = next((i for i, l in enumerate(lines_list) if l.get("name") == line_name), -1)
                new_line_entry = {"name": line_name, "moves": continuation_items}
                if label:
                    new_line_entry["label"] = label
                if deviation:
                    new_line_entry["deviation"] = deviation
                if line_idx >= 0:
                    lines_list[line_idx] = new_line_entry
                else:
                    lines_list.append(new_line_entry)
                repertoire_data["lines"] = lines_list
        except Exception as e:
            print(f"  [Notice] Could not read existing file: {e}")

    if not repertoire_data:
        first_line = {"name": line_name, "moves": continuation_items}
        if label:
            first_line["label"] = label
        if deviation:
            first_line["deviation"] = deviation
        repertoire_data = {
            "opening": opening_name,
            "moves": root_items,
            "lines": [first_line],
        }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(repertoire_data, f, indent=2)

    total_count = len(repertoire_data["moves"]) + len(continuation_items)
    print(f"\n[Engine] Successfully generated '{opening_name}' ({line_name}: {total_count} plies total).")
    print(f"[Engine] File written to: {output_path}")

    return repertoire_data


def main():
    parser = argparse.ArgumentParser(
        description="Mainline Chess Repertoire Engine Service: Generate opening lines via Lichess Cloud Eval API."
    )
    parser.add_argument(
        "--opening",
        type=str,
        default="Sicilian",
        help="Display name of opening (e.g. 'Sicilian', 'French', 'RuyLopez')",
    )
    parser.add_argument(
        "--root",
        type=str,
        default="e4 c5",
        help="Space-separated root moves in SAN (e.g. 'e4 c5' or 'e4 e6')",
    )
    parser.add_argument(
        "--seed",
        type=str,
        default="",
        help="Space-separated seed moves to start the variation line before engine continuation (e.g. 'Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3')",
    )
    parser.add_argument(
        "--moves",
        type=int,
        default=18,
        help="Number of full moves (~36 individual plies). Default is 18.",
    )
    parser.add_argument(
        "--line",
        type=str,
        default="mainline",
        help="Variation line name/key (e.g. 'mainline', '2...Nc6', '4...dxc4'). Default is 'mainline'.",
    )
    parser.add_argument(
        "--label",
        type=str,
        default=None,
        help="Optional human-readable name of variation (e.g. 'Rossolimo', 'Open', 'Closed'). Stored in separate 'label' field.",
    )
    parser.add_argument(
        "--deviation",
        type=str,
        default=None,
        help="Optional explicit first deviating move string (e.g. '2...Nc6', '5...g6').",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Custom output filename (e.g. 'sicilian.json'). Defaults to '{opening}.json'.",
    )

    args = parser.parse_args()
    root_moves_list = args.root.strip().split() if args.root.strip() else []
    seed_moves_list = args.seed.strip().split() if args.seed.strip() else []
    target_plies = args.moves * 2

    generate_opening_line(
        opening_name=args.opening,
        root_moves_san=root_moves_list,
        target_plies=target_plies,
        line_name=args.line,
        output_filename=args.output,
        seed_moves_san=seed_moves_list,
        label=args.label,
        deviation=args.deviation,
    )


if __name__ == "__main__":
    main()

