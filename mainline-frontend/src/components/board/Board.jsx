import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';

import { BoardOrientation, Piece, BoardTurn, WhitePieces, BlackPieces, numberMap, letterMap, numberMapReversed, letterMapReversed, numberMapComplement, letterMapComplement } from '../../util/board';
import { isSelected, computeSelected, getRowAndCol, getPiece, flipBoard, isPlayerPiece, inPreviousMoves } from '../../util/util';
import { getValidMoves } from '../../util/piece';

import bking from '../../images/b-king.png';
import bqueen from '../../images/b-queen.png';
import brook from '../../images/b-rook.png';
import bbishop from '../../images/b-bishop.png';
import bknight from '../../images/b-knight.png';
import bpawn from '../../images/b-pawn.png';

import wking from '../../images/w-king.png';
import wqueen from '../../images/w-queen.png';
import wrook from '../../images/w-rook.png';
import wbishop from '../../images/w-bishop.png';
import wknight from '../../images/w-knight.png';
import wpawn from '../../images/w-pawn.png';

var pieceMap = {};
const pieceEnums = [Piece.BKING, Piece.BQUEEN, Piece.BROOK, Piece.BBISHOP, Piece.BKNIGHT, Piece.BPAWN, Piece.WKING, Piece.WQUEEN, Piece.WROOK, Piece.WBISHOP, Piece.WKNIGHT, Piece.WPAWN];
const pieceImages = [bking, bqueen, brook, bbishop, bknight, bpawn, wking, wqueen, wrook, wbishop, wknight, wpawn];
for (let i = 0; i < pieceEnums.length; i += 1) {
    pieceMap[pieceEnums[i]] = pieceImages[i];
}

function Square(props) {
    const squareIndex = computeSelected(props.row, props.col);
    const isPlayer = props.isCurrentBoard && isPlayerPiece(props.piece, props.boardTurn);

    const onClick = (e) => {
        console.log('Clicked: ', props.row, props.col);
        props.setSelectedCallback(squareIndex);
    }

    const onDragStart = (e) => {
        if (!isPlayer) return;
        e.dataTransfer.setData('text/plain', String(squareIndex));
        e.dataTransfer.effectAllowed = 'move';
        props.setSelectedCallback(squareIndex);
    };

    const onDragOver = (e) => {
        if (props.isCurrentBoard) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }
    };

    const onDrop = (e) => {
        if (!props.isCurrentBoard) return;
        e.preventDefault();
        const sourceStr = e.dataTransfer.getData('text/plain');
        if (sourceStr) {
            const sourceSquare = parseInt(sourceStr, 10);
            if (!isNaN(sourceSquare)) {
                props.onPieceDrop(sourceSquare, squareIndex);
            }
        }
    };

    const onTouchStart = (e) => {
        if (!isPlayer) return;
        props.onTouchDragStart(squareIndex, e);
    };

    const className = ((props.row % 2 === 0) ^ (props.col % 2 === 0)) ? "board-square even" : "board-square odd";
    const currentNumberMap = (props.orientation === BoardOrientation.DEFAULT) ? numberMap : numberMapReversed;
    const currentLetterMap = (props.orientation === BoardOrientation.DEFAULT) ? letterMap : letterMapReversed;
    let coordinateRank;
    if (props.col === 7) {
        const innerClassName = ((props.row % 2 === 0) ^ (props.col % 2 === 0)) ? "board-coordinate rank even" : "board-coordinate rank odd";
        coordinateRank = <div className={innerClassName}>{currentNumberMap[props.row]}</div>;
    }
    let coordinateFile;
    if (props.row === 7) {
        const innerClassName = ((props.row % 2 === 0) ^ (props.col % 2 === 0)) ? "board-coordinate file even" : "board-coordinate file odd";
        coordinateFile = <div className={innerClassName}>{currentLetterMap[props.col]}</div>;
    }
    let piece;
    if (props.piece !== Piece.DEFAULT) {
        piece = (
            <img
                src={pieceMap[props.piece]}
                className="board-piece"
                draggable={isPlayer}
                onDragStart={onDragStart}
                alt=""
            />
        );
    }
    let selected;
    if (isSelected(props.selected, props.row, props.col)) {
        selected = <div className="board-square-selected" />
    }
    let previousMove;
    if (inPreviousMoves(props.previousMoves, props.row, props.col)) {
        previousMove = <div className="board-square-selected previous" />
    }
    let validMove;
    if (props.validMoves.has(squareIndex)) {
        if (props.piece === Piece.DEFAULT) {
            validMove = <div className="board-square-selected empty" />
        } else {
            validMove = <div className="board-square-selected piece" />
        }
    }
    return (
        <div
            className={className}
            data-square={squareIndex}
            onClick={onClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onTouchStart={onTouchStart}
        >
            {coordinateRank}{coordinateFile}{selected}{previousMove}{validMove}{piece}
        </div>
    );
}

function Row(props) {
    return <div className="board-row">
        {[...Array(8)].map((e, i) => <Square 
            key={props.row + ":" + i}
            row={props.row}
            col={i}
            orientation={props.orientation}
            piece={props.boardRow[i]}
            setSelectedCallback={props.setSelectedCallback}
            selected={props.selected}
            validMoves={props.validMoves}
            previousMoves={props.previousMoves}
            isCurrentBoard={props.isCurrentBoard}
            boardTurn={props.boardTurn}
            onPieceDrop={props.onPieceDrop}
            onTouchDragStart={props.onTouchDragStart} />)}
    </div>;
}

export const Board = forwardRef((props, ref) => {
    const [selected, setSelected] = useState(-1);
    const touchDragRef = useRef(null);

    useImperativeHandle(ref, () => ({
        reset() {
          setSelected(-1);
        }
      }));

    var boardData = props.board;
    if (props.orientation === BoardOrientation.REVERSED) {
        boardData = flipBoard(props.board);
    }

    var validMoves = new Set();
    if (selected !== -1) {
        validMoves = getValidMoves(boardData, selected, props.boardTurn, props.orientation, props.additionalValidMoves);
    }

    const setSelectedCallback = (selectedValue) => {
        if (!props.isCurrentBoard) {
            return;
        }
        const selectedPiece = getPiece(boardData, selected);
        const selectedValuePiece = getPiece(boardData, selectedValue);
        if (selected === -1) {
            if (isPlayerPiece(selectedValuePiece, props.boardTurn)) {
                setSelected(selectedValue);
            }
        } else if (selected === selectedValue) {
            setSelected(-1);
        } else if (isPlayerPiece(selectedPiece, props.boardTurn) && isPlayerPiece(selectedValuePiece, props.boardTurn)) {
            setSelected(selectedValue);
        } else {
            if (isPlayerPiece(selectedPiece, props.boardTurn)) {
                if (validMoves.has(selectedValue)) {
                    props.submitMoveCallback(selected, selectedValue);
                }
                setSelected(-1);
            }
        }
    }

    const handlePieceDrop = (fromSquare, toSquare) => {
        if (!props.isCurrentBoard) return;
        const fromPiece = getPiece(boardData, fromSquare);
        if (!isPlayerPiece(fromPiece, props.boardTurn)) return;

        const moves = getValidMoves(boardData, fromSquare, props.boardTurn, props.orientation, props.additionalValidMoves);
        if (moves.has(toSquare)) {
            props.submitMoveCallback(fromSquare, toSquare);
            setSelected(-1);
        } else {
            const toPiece = getPiece(boardData, toSquare);
            if (isPlayerPiece(toPiece, props.boardTurn)) {
                setSelected(toSquare);
            } else {
                setSelected(-1);
            }
        }
    };

    const onTouchDragStart = (square, e) => {
        if (!props.isCurrentBoard) return;
        const t = e.touches[0];
        touchDragRef.current = {
            square,
            startX: t.clientX,
            startY: t.clientY,
            hasMoved: false
        };
        setSelected(square);
    };

    const handleTouchMove = (e) => {
        if (!touchDragRef.current) return;
        const t = e.touches[0];
        const dist = Math.hypot(t.clientX - touchDragRef.current.startX, t.clientY - touchDragRef.current.startY);
        if (dist > 8) {
            touchDragRef.current.hasMoved = true;
        }
    };

    const handleTouchEnd = (e) => {
        if (!touchDragRef.current) return;
        if (touchDragRef.current.hasMoved) {
            const t = e.changedTouches[0];
            const targetEl = document.elementFromPoint(t.clientX, t.clientY);
            const squareEl = targetEl ? targetEl.closest('.board-square') : null;
            if (squareEl) {
                const targetSquare = parseInt(squareEl.getAttribute('data-square'), 10);
                if (!isNaN(targetSquare) && targetSquare !== touchDragRef.current.square) {
                    handlePieceDrop(touchDragRef.current.square, targetSquare);
                }
            }
        }
        touchDragRef.current = null;
    };

    const previousMoves = [];
    if (props.currentBoardNotation !== null && props.currentBoardNotation !== undefined) {
        const destRow = numberMapComplement[String(props.currentBoardNotation.rankDestination)];
        const destCol = letterMapComplement[props.currentBoardNotation.fileDestination];
        const origRow = numberMapComplement[String(props.currentBoardNotation.rankOrigin)];
        const origCol = letterMapComplement[props.currentBoardNotation.fileOrigin];
        if (destRow !== undefined && destCol !== undefined) {
            if (props.orientation === BoardOrientation.REVERSED) {
                previousMoves.push([7 - destRow, 7 - destCol]);
            } else {
                previousMoves.push([destRow, destCol]);
            }
        }
        if (origRow !== undefined && origCol !== undefined) {
            if (props.orientation === BoardOrientation.REVERSED) {
                previousMoves.push([7 - origRow, 7 - origCol]);
            } else {
                previousMoves.push([origRow, origCol]);
            }
        }
    }

    return (
        <div
            className="board"
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchDragRef.current = null; }}
        >
            {[...Array(8)].map((e, i) => <Row 
                key={i}
                row={i}
                orientation={props.orientation}
                boardRow={boardData[i]}
                setSelectedCallback={setSelectedCallback}
                selected={selected}
                validMoves={validMoves}
                previousMoves={previousMoves}
                isCurrentBoard={props.isCurrentBoard}
                boardTurn={props.boardTurn}
                onPieceDrop={handlePieceDrop}
                onTouchDragStart={onTouchDragStart}
            />)}
        </div>
    );
});