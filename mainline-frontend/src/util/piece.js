import { BoardOrientation, Piece, BoardTurn, WhitePieces, BlackPieces, numberMap, letterMap, numberMapReversed, letterMapReversed, Notation } from './board';
import { getPiece, getRowAndCol, computeSelected, isOpponentPiece, inBounds, isPlayerPiece } from './util';

export const Condition = Object.freeze({
    DEFAULT: Symbol("default"),
    OPEN: Symbol("open"),
    OPEN_OR_OPPONENT_PATH: Symbol("openoropponentpath"),
    OPPONENT: Symbol("opponent"),
    OPEN_OR_OPPONENT: Symbol("openoropponent"),
});

function openOrOpponentHelper(board, r, c, increment, storeMoves, boardTurn) {
    let ri = r + increment[0];
    let ci = c + increment[1];
    while (inBounds(ri, ci)) {
        let currentPiece = getPiece(board, computeSelected(ri, ci));
        if (currentPiece === Piece.DEFAULT) {
            storeMoves.push([ri - r, ci - c]);
        } else if (isOpponentPiece(currentPiece, boardTurn)) {
            storeMoves.push([ri - r, ci - c]);
            break;
        } else if (isPlayerPiece(currentPiece, boardTurn)) {
            break;
        }
        ri += increment[0];
        ci += increment[1];
    }
}

export function computePossibleMoves(board, piece, r, c, boardTurn) {
    const possibleMoves = [];
    if ((piece === Piece.WBISHOP) || (piece === Piece.BBISHOP)) {
        let directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (let i = 0; i < directions.length; i += 1) {
            openOrOpponentHelper(board, r, c, directions[i], possibleMoves, boardTurn);
        }
    } else if ((piece === Piece.WROOK) || (piece === Piece.BROOK)) {
        let directions = [[0, 1], [1, 0], [-1, 0], [0, -1]];
        for (let i = 0; i < directions.length; i += 1) {
            openOrOpponentHelper(board, r, c, directions[i], possibleMoves, boardTurn);
        }
    } else if ((piece === Piece.WQUEEN) || (piece === Piece.BQUEEN)) {
        let directions = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (let i = 0; i < directions.length; i += 1) {
            openOrOpponentHelper(board, r, c, directions[i], possibleMoves, boardTurn);
        }
    } else if ((piece === Piece.WKING) || (piece === Piece.BKING)) {
        let directions = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (let i = 0; i < directions.length; i += 1) {
            let ri = r + directions[i][0];
            let ci = c + directions[i][1];
            let currentPiece = getPiece(board, computeSelected(ri, ci));
            if (currentPiece === Piece.DEFAULT) {
                possibleMoves.push([ri - r, ci - c]);
            } else if (isOpponentPiece(currentPiece, boardTurn)) {
                possibleMoves.push([ri - r, ci - c]);
            }
        }
    }
    return possibleMoves;
}

function computeValidMoves(board, selected, moves, storeValidMoves, condition, boardTurn) {
    let rowAndCol = getRowAndCol(selected);
    let r = rowAndCol[0];
    let c = rowAndCol[1];
    for (let i = 0; i < moves.length; i += 1) {
        let move = moves[i];
        let mr = r + move[0];
        let mc = c + move[1];
        if (!inBounds(mr, mc)) {
            continue
        }
        if (condition === Condition.OPEN) {
            if (getPiece(board, mr, mc) === Piece.DEFAULT) {
                storeValidMoves.push(computeSelected(mr, mc));
            }
        } else if (condition === Condition.OPPONENT) {
            if (isOpponentPiece(getPiece(board, mr, mc), boardTurn)) {
                storeValidMoves.push(computeSelected(mr, mc));
            }
        } else if (condition === Condition.OPEN_OR_OPPONENT) {
            if ((getPiece(board, mr, mc) === Piece.DEFAULT) || (isOpponentPiece(getPiece(board, mr, mc), boardTurn))) {
                storeValidMoves.push(computeSelected(mr, mc));
            }
        }
    }
}

const KNIGHT_MOVES = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

export function getValidMoves(board, selected, boardTurn) {
    let piece = getPiece(board, selected);
    let rowAndCol = getRowAndCol(selected);
    let r = rowAndCol[0];
    let c = rowAndCol[1];
    
    let validMoves = [];
    if (piece === Piece.WPAWN) {
        computeValidMoves(board, selected, [[-1, 0]], validMoves, Condition.OPEN, boardTurn)
        if (r === 6) {
            if ((getPiece(board, r - 1, c) === Piece.DEFAULT) && (getPiece(board, r - 2, c) === Piece.DEFAULT)) {
                validMoves.push(computeSelected(r - 2, c));
            }
        }
        computeValidMoves(board, selected, [[-1, -1], [-1, 1]], validMoves, Condition.OPPONENT, boardTurn);
    } else if ((piece === Piece.WKNIGHT) || (piece === Piece.BKNIGHT)) {
        computeValidMoves(board, selected, KNIGHT_MOVES, validMoves, Condition.OPEN_OR_OPPONENT, boardTurn);
    } else if ((piece === Piece.WBISHOP) || (piece === Piece.BBISHOP)
        || (piece === Piece.WROOK) || (piece === Piece.BROOK)
        || (piece === Piece.WQUEEN) || (piece === Piece.BQUEEN)
        || (piece === Piece.WKING) || (piece === Piece.BKING)) {
        const currentPossibleMoves = computePossibleMoves(board, piece, r, c, boardTurn);
        computeValidMoves(board, selected, currentPossibleMoves, validMoves, Condition.OPEN_OR_OPPONENT, boardTurn);
    } else if (piece === Piece.BPAWN) {
        computeValidMoves(board, selected, [[1, 0]], validMoves, Condition.OPEN, boardTurn)
        if (r === 1) {
            if ((getPiece(board, r + 1, c) === Piece.DEFAULT) && (getPiece(board, r + 2, c) === Piece.DEFAULT)) {
                validMoves.push(computeSelected(r + 2, c));
            }
        }
        computeValidMoves(board, selected, [[1, -1], [1, 1]], validMoves, Condition.OPPONENT, boardTurn);
    }

    let filteredValidMoves = [];
    for (let i = 0; i < validMoves.length; i += 1) {
        let move = validMoves[i];
        if ((move >= 0) && (move < 64)) {
            filteredValidMoves.push(move);
        }
    }

    return new Set(filteredValidMoves);
}