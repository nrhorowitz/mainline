import { Piece, BoardTurn, StartingBoard, numberMapComplement, letterMapComplement, numberMap, letterMap, Notation } from './board';
import { toggleBoardTurn, copyBoard, inBounds, nameToKey } from './util';
import Catalan from '../data/catalan.json';
import CaroKann from '../data/carokann.json';
import Sicilian from '../data/sicilian.json';

var linesData = {}

const KNIGHT_MOVES = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const BISHOP_MOVES = [];
for (let i = 1; i < 8; i += 1) {
    BISHOP_MOVES.push([i, i]);
    BISHOP_MOVES.push([-1 * i, i]);
    BISHOP_MOVES.push([i, -1 * i]);
    BISHOP_MOVES.push([-1 * i, -1 * i]);
}
const ROOK_MOVES = [];
for (let i = 1; i < 8; i += 1) {
    ROOK_MOVES.push([i, 0]);
    ROOK_MOVES.push([-1 * i, 0]);
    ROOK_MOVES.push([0, i]);
    ROOK_MOVES.push([0, -1 * i]);
}
const QUEEN_MOVES = [...BISHOP_MOVES, ...ROOK_MOVES];
const KING_MOVES = [];
for (let i = -1; i < 2; i += 1) {
    for (let j = -1; j < 2; j += 1) {
        KING_MOVES.push([i, j]);
    }
}

function getOrigin(board, piece, takes, destinationRow, destinationColumn, fileHint=null) {
    if ((piece === Piece.WPAWN) && (!takes)) {
        if (board[destinationRow + 1][destinationColumn] === Piece.WPAWN) {
            return [destinationRow + 1, destinationColumn];
        } else if (board[destinationRow + 2][destinationColumn] === Piece.WPAWN) {
            return [destinationRow + 2, destinationColumn];
        }
    } else if ((piece === Piece.WPAWN) && (takes)) {
        if (board[destinationRow + 1][fileHint] === Piece.WPAWN) {
            return [destinationRow + 1, fileHint];
        }
    } else if ((piece === Piece.BPAWN) && (!takes)) {
        if (board[destinationRow - 1][destinationColumn] === Piece.BPAWN) {
            return [destinationRow - 1, destinationColumn];
        } else if (board[destinationRow - 2][destinationColumn] === Piece.BPAWN) {
            return [destinationRow - 2, destinationColumn];
        }
    } else if ((piece === Piece.BPAWN) && (takes)) {
        if (board[destinationRow - 1][fileHint] === Piece.BPAWN) {
            return [destinationRow - 1, fileHint];
        }
    }
    let movesList = [];
    if ((piece === Piece.WKNIGHT) || (piece === Piece.BKNIGHT)) {
        movesList = KNIGHT_MOVES;
    } else if ((piece === Piece.WBISHOP) || (piece === Piece.BBISHOP)) {
        movesList = BISHOP_MOVES;
    } else if ((piece === Piece.WROOK) || (piece === Piece.BROOK)) {
        movesList = ROOK_MOVES;
    } else if ((piece === Piece.WQUEEN) || (piece === Piece.BQUEEN)) {
        movesList = QUEEN_MOVES;
    } else if ((piece === Piece.WKING) || (piece === Piece.BKING)) {
        movesList = KING_MOVES;
    }

    for (let i = 0; i < movesList.length; i += 1) {
        let originRow = destinationRow + movesList[i][0];
        let originColumn = destinationColumn + movesList[i][1];
        if (!inBounds(originRow, originColumn)) {
            continue;
        }
        if (board[originRow][originColumn] === piece) {
            if (fileHint === null) {
                return [originRow, originColumn];
            } else {
                if (fileHint === originColumn) {
                    return [originRow, originColumn];
                }
            }
        }
    }
}

function applyMove(board, notation, boardTurn) {
    let move = notation
    if (notation.slice(-1) === '+') {
        move = notation.substring(0, notation.length - 1);
    }

    if (move === 'O-O-O') {
        let newBoard = copyBoard(board);
        let movedPiece;
        let destinationRank;
        let destinationFile;
        let originRank;
        let originFile;
        if (boardTurn === BoardTurn.WHITE) {
            movedPiece = Piece.WKING;
            destinationRank = '1';
            destinationFile = 'c';
            originRank = '1';
            originFile = 'e';
            newBoard[7][0] = Piece.DEFAULT;
            newBoard[7][4] = Piece.DEFAULT;
            newBoard[7][2] = Piece.WKING;
            newBoard[7][3] = Piece.WROOK;
        } else {
            movedPiece = Piece.BKING;
            destinationRank = '8';
            destinationFile = 'c';
            originRank = '8';
            originFile = 'e';
            newBoard[0][0] = Piece.DEFAULT;
            newBoard[0][4] = Piece.DEFAULT;
            newBoard[0][2] = Piece.BKING;
            newBoard[0][3] = Piece.BROOK;
        }
        let castleNotationObject = new Notation(
            movedPiece, 
            destinationRank, 
            destinationFile, 
            false /* not read */, 
            originRank, 
            originFile,
            notation);
        return [newBoard, castleNotationObject];
    } else if (move === 'O-O') {
        let newBoard = copyBoard(board);
        let movedPiece;
        let destinationRank;
        let destinationFile;
        let originRank;
        let originFile;
        if (boardTurn === BoardTurn.WHITE) {
            movedPiece = Piece.WKING;
            destinationRank = '1';
            destinationFile = 'c';
            originRank = '1';
            originFile = 'e';
            newBoard[7][7] = Piece.DEFAULT;
            newBoard[7][4] = Piece.DEFAULT;
            newBoard[7][6] = Piece.WKING;
            newBoard[7][5] = Piece.WROOK;
        } else {
            movedPiece = Piece.BKING;
            destinationRank = '8';
            destinationFile = 'c';
            originRank = '8';
            originFile = 'e';
            newBoard[0][7] = Piece.DEFAULT;
            newBoard[0][4] = Piece.DEFAULT;
            newBoard[0][6] = Piece.BKING;
            newBoard[0][5] = Piece.BROOK;
        }
        let castleNotationObject = new Notation(
            movedPiece, 
            destinationRank, 
            destinationFile, 
            false /* not read */, 
            originRank, 
            originFile,
            notation);
        return [newBoard, castleNotationObject];
    }
    
    let destination = move.slice(-2);
    let destinationFile = destination[0];
    let destinationRank = destination[1];
    let destinationRow = numberMapComplement[destinationRank]
    let destinationColumn = letterMapComplement[destinationFile]

    let origin;
    let originRow;
    let originColumn;

    let piece;
    if (move.length === 2) {
        piece = (boardTurn === BoardTurn.WHITE) ? Piece.WPAWN : Piece.BPAWN;
        origin = getOrigin(board, piece, false, destinationRow, destinationColumn);
    }

    let pieceCharacter;
    let fileHint = null;
    pieceCharacter = move[0];

    if (move.includes('x')) {
        if (move.length === 5) {
            fileHint = move[1];
            let fileHintColumn = letterMapComplement[fileHint];
            if (pieceCharacter === 'N') {
                piece = (boardTurn === BoardTurn.WHITE) ? Piece.WKNIGHT : Piece.BKNIGHT;
            } else if (pieceCharacter === 'B') {
                piece = (boardTurn === BoardTurn.WHITE) ? Piece.WBISHOP : Piece.BBISHOP;
            } else if (pieceCharacter === 'R') {
                piece = (boardTurn === BoardTurn.WHITE) ? Piece.WROOK : Piece.BROOK;
            } else if (pieceCharacter === 'Q') {
                piece = (boardTurn === BoardTurn.WHITE) ? Piece.WQUEEN : Piece.BQUEEN;
            } else if (pieceCharacter === 'K') {
                piece = (boardTurn === BoardTurn.WHITE) ? Piece.WKING : Piece.BKING;
            }
            origin = getOrigin(board, piece, true, destinationRow, destinationColumn, fileHintColumn);
        } else if (move.length === 4) {
            if (pieceCharacter === pieceCharacter.toLowerCase()) {
                piece = (boardTurn === BoardTurn.WHITE) ? Piece.WPAWN : Piece.BPAWN;
                origin = getOrigin(board, piece, true, destinationRow, destinationColumn, letterMapComplement[pieceCharacter]);
            } else if (pieceCharacter === 'N') {
                piece = (boardTurn === BoardTurn.WHITE) ? Piece.WKNIGHT : Piece.BKNIGHT;
                origin = getOrigin(board, piece, true, destinationRow, destinationColumn);
            } else if (pieceCharacter === 'B') {
                piece = (boardTurn === BoardTurn.WHITE) ? Piece.WBISHOP : Piece.BBISHOP;
                origin = getOrigin(board, piece, true, destinationRow, destinationColumn);
            } else if (pieceCharacter === 'R') {
                piece = (boardTurn === BoardTurn.WHITE) ? Piece.WROOK : Piece.BROOK;
                origin = getOrigin(board, piece, true, destinationRow, destinationColumn);
            } else if (pieceCharacter === 'Q') {
                piece = (boardTurn === BoardTurn.WHITE) ? Piece.WQUEEN : Piece.BQUEEN;
                origin = getOrigin(board, piece, true, destinationRow, destinationColumn);
            } else if (pieceCharacter === 'K') {
                piece = (boardTurn === BoardTurn.WHITE) ? Piece.WKING : Piece.BKING;
                origin = getOrigin(board, piece, true, destinationRow, destinationColumn);
            }
        }
    } else if (move.length === 4) {
        fileHint = move[1];
        let fileHintColumn = letterMapComplement[fileHint];
        if (pieceCharacter === 'N') {
            piece = (boardTurn === BoardTurn.WHITE) ? Piece.WKNIGHT : Piece.BKNIGHT;
            origin = getOrigin(board, piece, false, destinationRow, destinationColumn, fileHintColumn);
        } else if (pieceCharacter === 'B') {
            piece = (boardTurn === BoardTurn.WHITE) ? Piece.WBISHOP : Piece.BBISHOP;
            origin = getOrigin(board, piece, false, destinationRow, destinationColumn, fileHintColumn);
        } else if (pieceCharacter === 'R') {
            piece = (boardTurn === BoardTurn.WHITE) ? Piece.WROOK : Piece.BROOK;
            origin = getOrigin(board, piece, false, destinationRow, destinationColumn, fileHintColumn);
        } else if (pieceCharacter === 'Q') {
            piece = (boardTurn === BoardTurn.WHITE) ? Piece.WQUEEN : Piece.BQUEEN;
            origin = getOrigin(board, piece, false, destinationRow, destinationColumn, fileHintColumn);
        } else if (pieceCharacter === 'K') {
            piece = (boardTurn === BoardTurn.WHITE) ? Piece.WKING : Piece.BKING;
            origin = getOrigin(board, piece, false, destinationRow, destinationColumn, fileHintColumn);
        }
    } else if (move.length === 3) {
        if (pieceCharacter === 'N') {
            piece = (boardTurn === BoardTurn.WHITE) ? Piece.WKNIGHT : Piece.BKNIGHT;
            origin = getOrigin(board, piece, false, destinationRow, destinationColumn);
        } else if (pieceCharacter === 'B') {
            piece = (boardTurn === BoardTurn.WHITE) ? Piece.WBISHOP : Piece.BBISHOP;
            origin = getOrigin(board, piece, false, destinationRow, destinationColumn);
        } else if (pieceCharacter === 'R') {
            piece = (boardTurn === BoardTurn.WHITE) ? Piece.WROOK : Piece.BROOK;
            origin = getOrigin(board, piece, false, destinationRow, destinationColumn);
        } else if (pieceCharacter === 'Q') {
            piece = (boardTurn === BoardTurn.WHITE) ? Piece.WQUEEN : Piece.BQUEEN;
            origin = getOrigin(board, piece, false, destinationRow, destinationColumn);
        } else if (pieceCharacter === 'K') {
            piece = (boardTurn === BoardTurn.WHITE) ? Piece.WKING : Piece.BKING;
            origin = getOrigin(board, piece, false, destinationRow, destinationColumn);
        }
    }

    originRow = origin[0];
    originColumn = origin[1];

    let newBoard = copyBoard(board);
    let movedPiece = newBoard[originRow][originColumn];
    newBoard[originRow][originColumn] = Piece.DEFAULT;
    newBoard[destinationRow][destinationColumn] = movedPiece;

    let notationObject = new Notation(
        movedPiece,
        Number(destinationRank),
        destinationFile,
        true /* not read */,
        numberMap[originRow],
        letterMap[originColumn],
        notation);

    return [newBoard, notationObject];
}

export class OpeningLine {
    constructor(line_data, line_name) {
        this.line_data = line_data;
        this.line_name = line_name;
    }

    getBoardNotationStack() {
        return this.line_data.map(l => l.m);
    }

    getBoardStackAndNotationStack() {
        const boardNotationStack = this.getBoardNotationStack();
        let boardTurn = BoardTurn.WHITE;
        let boardStack = [StartingBoard];
        let boardNotationObjectStack = [];
        for (let i = 0; i < boardNotationStack.length; i += 1) {
            let boardAndNotation = applyMove(boardStack[i], boardNotationStack[i], boardTurn)
            boardStack.push(boardAndNotation[0]);
            boardNotationObjectStack.push(boardAndNotation[1]);
            boardTurn = toggleBoardTurn(boardTurn);
        }
        return [boardStack, boardNotationObjectStack];
    }

    getEvaluationStack() {
        return [0].concat(this.line_data.map(l => l.e));
    }

    getLineLength() {
        return this.line_data.length;
    }
}

export class Opening {
    constructor(opening_data) {
      this.opening_name = opening_data.opening;
      this.opening_moves = opening_data.moves;
      this.lines = {};
      for (let i = 0; i < opening_data.lines.length; i += 1) {
        let line = opening_data.lines[i];
        this.lines[line.name] = new OpeningLine(opening_data.moves.concat(line.moves), line.name);
      }
    }

    getOpeningKey() {
        return this.opening_name;
    }

    getLine(line_name) {
        return this.lines[line_name];
    }
}

export function loadAllLines() {
    const jsons = [Catalan, CaroKann, Sicilian]; // TODO all jsons
    const allLines = {}
    for (let i = 0; i < jsons.length; i += 1) {
        let opening_json = jsons[i];
        let opening = new Opening(opening_json);
        allLines[nameToKey(opening.opening_name)] = opening;
    }
    return allLines;
}