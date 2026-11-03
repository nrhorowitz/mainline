export const BoardOrientation = Object.freeze({
    DEFAULT: Symbol("default"),
    REVERSED: Symbol("reversed"),
});

export const BoardTurn = Object.freeze({
    DEFAULT: Symbol("default"),
    WHITE: Symbol("white"),
    BLACK: Symbol("black"),
});

export const BoardControlOption = Object.freeze({
    DEFAULT: Symbol("default"),
    LEFT: Symbol("left"),
    RIGHT: Symbol("right"),
    LEFT_DOUBLE: Symbol("left_double"),
    RIGHT_DOUBLE: Symbol("right_double"),
    RESET: Symbol("reset"),
    TOGGLE_SOLUTION: Symbol("togglesolution"),
    TOGGLE_PRACTICE: Symbol("togglepractice"),
});

// TODO enum
export const Piece = Object.freeze({
    DEFAULT: "default",
    BKING: "b-king",
    BQUEEN: "b-queen",
    BROOK: "b-rook",
    BBISHOP: "b-bishop",
    BKNIGHT: "b-knight",
    BPAWN: "b-pawn",
    WKING: "w-king",
    WQUEEN: "w-queen",
    WROOK: "w-rook",
    WBISHOP: "w-bishop",
    WKNIGHT: "w-knight",
    WPAWN: "w-pawn",
});

const indexRange = [...Array(8).keys()];
const letterRange = 'abcdefgh'.split('');

// 0: "8"
export var numberMap = {};
indexRange.forEach(index => {
    numberMap[7 - index] = index + 1;
});

// 0: "a"
export var letterMap = {};
indexRange.forEach(index => {
    letterMap[index] = letterRange[index];
});

// 1: 7
export var numberMapComplement = {};
indexRange.forEach(index => {
    numberMapComplement[String(index + 1)] = 7 - index;
});

// a: 0
export var letterMapComplement = {};
indexRange.forEach(index => {
    letterMapComplement[letterRange[index]] = index;
});

// 0: 1
export var numberMapReversed = {};
indexRange.forEach(index => {
    numberMapReversed[index] = index + 1;
});

// 0: "h"
export var letterMapReversed = {};
indexRange.forEach(index => {
    letterMapReversed[7 - index] = letterRange[index];
});

export const WhitePieces = new Set([Piece.WKING, Piece.WQUEEN, Piece.WROOK, Piece.WBISHOP, Piece.WKNIGHT, Piece.WPAWN]);
export const BlackPieces = new Set([Piece.BKING, Piece.BQUEEN, Piece.BROOK, Piece.BBISHOP, Piece.BKNIGHT, Piece.BPAWN]);

export const StartingBoard = [
    [Piece.BROOK, Piece.BKNIGHT, Piece.BBISHOP, Piece.BQUEEN, Piece.BKING, Piece.BBISHOP, Piece.BKNIGHT, Piece.BROOK],
    [Piece.BPAWN, Piece.BPAWN, Piece.BPAWN, Piece.BPAWN, Piece.BPAWN, Piece.BPAWN, Piece.BPAWN, Piece.BPAWN],
    [Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT],
    [Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT],
    [Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT],
    [Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT, Piece.DEFAULT],
    [Piece.WPAWN, Piece.WPAWN, Piece.WPAWN, Piece.WPAWN, Piece.WPAWN, Piece.WPAWN, Piece.WPAWN, Piece.WPAWN],
    [Piece.WROOK, Piece.WKNIGHT, Piece.WBISHOP, Piece.WQUEEN, Piece.WKING, Piece.WBISHOP, Piece.WKNIGHT, Piece.WROOK],
]

var notationPieceMap = {};
const pieceEnums = [Piece.BKING, Piece.BQUEEN, Piece.BROOK, Piece.BBISHOP, Piece.BKNIGHT, Piece.BPAWN, Piece.WKING, Piece.WQUEEN, Piece.WROOK, Piece.WBISHOP, Piece.WKNIGHT, Piece.WPAWN];
const pieceNotations = ['K', 'Q', 'R', 'B', 'N', '', 'K', 'Q', 'R', 'B', 'N', ''];
for (let i = 0; i < pieceEnums.length; i += 1) {
    notationPieceMap[pieceEnums[i]] = pieceNotations[i];
}

export class Notation {
    constructor(piece, rankDestination, fileDestination, takes, rankOrigin, fileOrigin, alias) {
        this.piece = piece;
        this.rankDestination = rankDestination;
        this.fileDestination = fileDestination;
        this.takes = takes;
        this.rankOrigin = rankOrigin;
        this.fileOrigin = fileOrigin;
        this.alias = alias;
    }

    notationString() {
        if (this.alias !== null) {
            return this.alias;
        }
        let takesString = (this.takes) ? 'x' : '';
        let piece = (this.takes && ((this.piece === Piece.WPAWN) || (this.piece === Piece.BPAWN))) ? this.fileOrigin : notationPieceMap[this.piece];
        return piece + takesString + this.fileDestination + this.rankDestination;
    }
}