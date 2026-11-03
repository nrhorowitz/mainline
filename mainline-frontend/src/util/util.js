import { BoardOrientation, Piece, BoardTurn, WhitePieces, BlackPieces, numberMap, letterMap, numberMapReversed, letterMapReversed, Notation } from './board';

export function nameToKey(s) {
    return s.toLowerCase();
}

export function inBounds(r, c) {
    return !((r < 0) || (r > 7 || (c < 0) || (c > 7)));
}

export function isSelected(selected, row, col) {
    return (((row * 8) + col) === selected);
}

export function computeSelected(row, col) {
    return ((row * 8) + col);
}

export function getRowAndCol(selected) {
    let row = Math.floor(selected / 8);
    let col = selected % 8;
    return [row, col];
}

export function getPiece(board, selected, col=null) {
    if (col === null) {
        if ((selected < 0) || (selected > 63)) {
            return Piece.DEFAULT;
        }
        let rowAndCol = getRowAndCol(selected);
        return board[rowAndCol[0]][rowAndCol[1]];
    }
    if (!inBounds(selected, col)) {
        return Piece.DEFAULT;
    } 
    return board[selected][col];
}

export function isPlayerPiece(piece, boardTurn) {
    let playerPieces = (boardTurn === BoardTurn.WHITE) ? WhitePieces : BlackPieces;
    return playerPieces.has(piece);
}

export function isOpponentPiece(piece, boardTurn) {
    let playerPieces = (boardTurn === BoardTurn.BLACK) ? WhitePieces : BlackPieces;
    return playerPieces.has(piece);
}

export function flipBoard(board) {
    let boardReturn = [];
    for (let i = 7; i >= 0; i -= 1) {
        let boardRowReturn = [];
        for (let j = 7; j >= 0; j -= 1) {
            boardRowReturn.push(board[i][j]);
        }
        boardReturn.push(boardRowReturn);
    }
    return boardReturn;
}

export function copyBoard(board) {
    let boardReturn = [];
    for (let i = 0; i < board.length; i += 1) {
        let boardRowReturn = [];
        for (let j = 0; j < board[i].length; j += 1) {
            boardRowReturn.push(board[i][j]);
        }
        boardReturn.push(boardRowReturn);
    }
    return boardReturn;
}

export function moveBoard(board, selected, selectedValue) {
    let piece = getPiece(board, selected);
    let newBoard = [];
    for (let i = 0; i < board.length; i += 1) {
        let newBoardRow = [];
        for (let j = 0; j < board[0].length; j += 1) {
            let computedSelected = computeSelected(i, j);
            if (computedSelected === selected) {
                newBoardRow.push(Piece.DEFAULT);
            } else if (computedSelected === selectedValue) {
                newBoardRow.push(piece);
            } else {
                newBoardRow.push(board[i][j]);
            }
        }
        newBoard.push(newBoardRow);
    }
    return newBoard;
}

export function moveBoardNotation(board, selected, selectedValue, orientation) {
    let piece = getPiece(board, selected);
    // todo knight bd7 case
    let originRowAndCol = getRowAndCol(selected);
    let destinationRowAndCol = getRowAndCol(selectedValue);
    let takes = true;
    if (getPiece(board, selectedValue) === Piece.DEFAULT) {
        takes = false;
    }

    const currentNumberMap = (orientation === BoardOrientation.DEFAULT) ? numberMap : numberMapReversed;
    const currentLetterMap = (orientation === BoardOrientation.DEFAULT) ? letterMap : letterMapReversed;
    return new Notation(piece, currentNumberMap[destinationRowAndCol[0]], currentLetterMap[destinationRowAndCol[1]], takes, currentNumberMap[originRowAndCol[0]], currentLetterMap[originRowAndCol[1]], null);
}

export function toggleBoardTurn(boardTurn) {
    if (boardTurn === BoardTurn.WHITE) {
        return BoardTurn.BLACK;
    } else {
        return BoardTurn.WHITE;
    }
}

export function inPreviousMoves(previousMoves, row, col) {
    for (let i = 0; i < previousMoves.length; i += 1) {
        let pmove = previousMoves[i];
        if ((pmove[0] === row) && (pmove[1] === col)) {
            return true;
        }
    }
    return false;
}