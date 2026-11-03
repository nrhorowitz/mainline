import React, { useState, useRef } from 'react';

import { Board } from '../components/board/Board';
import { BoardNotation } from '../components/board/BoardNotation';
import { BoardControl } from '../components/board/BoardControl';
import { BoardEvaluation } from '../components/board/BoardEvaluation';
import { BoardTitle } from '../components/board/BoardTitle';
import { BoardOrientation, BoardControlOption } from '../util/board';
import { useParams } from 'react-router-dom';

export function StudyViewBoard(props) {
    const { path_opening, path_line } = useParams();
    const opening = props.allLines[path_opening];
    const openingIndex = opening.opening_moves.length;
    const line = (opening.getLine ? opening.getLine(path_line) : opening.lines[path_line]) || opening.lines[path_line];

    const [boardOrientation, setBoardOrientation] = useState(BoardOrientation.DEFAULT);
    const [solutionBoardIndex, setSolutionBoardIndex] = useState(openingIndex);

    const boardRef = useRef();

    const toggleOrientation = () => {
        setBoardOrientation((prev) =>
            prev === BoardOrientation.DEFAULT ? BoardOrientation.REVERSED : BoardOrientation.DEFAULT
        );
    };

    const boardControlOptionCallback = (boardControlOption) => {
        if (boardControlOption === BoardControlOption.LEFT) {
            setSolutionBoardIndex(solutionBoardIndex - 1);
        } else if (boardControlOption === BoardControlOption.RIGHT) {
            setSolutionBoardIndex(solutionBoardIndex + 1);
        } else if (boardControlOption === BoardControlOption.LEFT_DOUBLE) {
            if (solutionBoardIndex <= openingIndex) {
                setSolutionBoardIndex(0);
            } else {
                setSolutionBoardIndex(openingIndex);
            }
        } else if (boardControlOption === BoardControlOption.RIGHT_DOUBLE) {
            if (solutionBoardIndex < openingIndex) {
                setSolutionBoardIndex(openingIndex);
            } else {
                setSolutionBoardIndex(line.getLineLength());
            }
        } else if (boardControlOption === BoardControlOption.RESET) {
            setSolutionBoardIndex(openingIndex);
            if (boardRef.current && boardRef.current.reset) {
                boardRef.current.reset();
            }
        }
    };

    const handleSelectMove = (moveIndex) => {
        setSolutionBoardIndex(moveIndex + 1);
        if (boardRef.current && boardRef.current.reset) {
            boardRef.current.reset();
        }
    };

    let openingLineBoardStackAndNotationStack = line.getBoardStackAndNotationStack();
    let openingLineBoardStack = openingLineBoardStackAndNotationStack[0];
    let openingLineNotationStack = openingLineBoardStackAndNotationStack[1];
    let openingLineEvaluationStack = line.getEvaluationStack();

    let currentIndex = solutionBoardIndex;
    let currentBoard = openingLineBoardStack[currentIndex];
    let currentBoardNotation = (currentIndex === 0) ? null : openingLineNotationStack[currentIndex - 1];
    let currentBoardEvaluation = openingLineEvaluationStack[currentIndex];

    return (
        <div className="study-board-view">
            <BoardTitle
                openingName={opening.opening_name}
                lineName={line.line_name}
                greenTag={line.label}
                blueTag={line.getDeviationMove ? line.getDeviationMove() : line.line_name}
                pathOpening={path_opening}
                pathLine={path_line}
                onToggleOrientation={toggleOrientation}
                boardOrientation={boardOrientation}
            />
            <BoardEvaluation evaluation={currentBoardEvaluation} />
            <Board
                ref={boardRef}
                orientation={boardOrientation}
                board={currentBoard}
                isCurrentBoard={false}
                currentBoardNotation={currentBoardNotation}
            />
            <BoardControl
                boardControlOptionCallback={boardControlOptionCallback}
                boardIndex={currentIndex}
                boardLength={openingLineBoardStack.length}
                showSolutionBoard={true}
            />
            <BoardNotation
                boardNotationStack={openingLineNotationStack}
                boardIndex={currentIndex}
                isCurrentBoard={false}
                onSelectMove={handleSelectMove}
            />
        </div>
    );
}
