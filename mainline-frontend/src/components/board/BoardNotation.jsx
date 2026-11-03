import React from 'react';
import { Notation } from '../../util/board';

function NotationMove(notation, index, boardIndex, onSelectMove) {
    let numberRender;
    if (index % 2 === 0) {
        let number = ((index / 2) + 1) + '.';
        numberRender = (
            <div className="board-notation-text-number">
                {number}
            </div>
        );
    }
    let boardNotationClassName = (boardIndex - 1 === index) ? "board-notation-text-selected" : "board-notation-text";
    let displayNotation = ((typeof notation) === "string") ? notation : notation.notationString();
    
    return (
        <div
            key={index}
            className={boardNotationClassName}
            onClick={() => onSelectMove && onSelectMove(index)}
            title={`Jump to move ${index + 1}: ${displayNotation}`}
        >
            {numberRender}
            {displayNotation}
        </div>
    );
}

export function BoardNotation(props) {
    return (
        <div className="board-notation">
            {props.boardNotationStack.map((e, i) =>
                NotationMove(e, i, props.boardIndex, props.onSelectMove)
            )}
        </div>
    );
}
