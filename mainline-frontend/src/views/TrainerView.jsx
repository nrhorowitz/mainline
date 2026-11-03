import React, { useState, useEffect, useRef, useCallback } from 'react';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ReplayIcon from '@mui/icons-material/Replay';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import IconButton from '@mui/material/IconButton';
import { Link, useParams, useNavigate } from "react-router-dom";

import { Board } from '../components/board/Board';
import { BoardEvaluation } from '../components/board/BoardEvaluation';
import {
    BoardOrientation,
    BoardTurn,
    Piece,
    numberMap,
    letterMap,
    numberMapReversed,
    letterMapReversed
} from '../util/board';
import { getPiece, getRowAndCol } from '../util/util';
import { trainerIconColor, iconSecondaryColor, studyIconColor } from "../util/icon";

function playSound(type) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const t = ctx.currentTime;
        if (type === 'move') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(320, t);
            osc.frequency.exponentialRampToValueAtTime(130, t + 0.08);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.start(t);
            osc.stop(t + 0.08);
        } else if (type === 'correct') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(587.33, t); // D5
            osc.frequency.setValueAtTime(880, t + 0.07); // A5
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.start(t);
            osc.stop(t + 0.22);
        } else if (type === 'wrong') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(220, t);
            osc.frequency.exponentialRampToValueAtTime(140, t + 0.22);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.start(t);
            osc.stop(t + 0.22);
        } else if (type === 'victory') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.connect(g);
                g.connect(ctx.destination);
                o.frequency.setValueAtTime(freq, t + idx * 0.09);
                g.gain.setValueAtTime(0.1, t + idx * 0.09);
                g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.24);
                o.start(t + idx * 0.09);
                o.stop(t + idx * 0.09 + 0.24);
            });
        }
    } catch (e) {
        // AudioContext ignored if blocked
    }
}

function getPieceReadableName(piece) {
    if (!piece) return 'Piece';
    if (piece.includes('pawn')) return 'Pawn';
    if (piece.includes('knight')) return 'Knight';
    if (piece.includes('bishop')) return 'Bishop';
    if (piece.includes('rook')) return 'Rook';
    if (piece.includes('queen')) return 'Queen';
    if (piece.includes('king')) return 'King';
    return 'Piece';
}

export function TrainerView(props) {
    const { path_opening, path_line } = useParams();
    const navigate = useNavigate();
    const allLines = props.allLines || {};
    const openingKeys = Object.keys(allLines);

    // Color mode: 'white' | 'black' | 'random'
    const [colorChoice, setColorChoice] = useState('white');
    // Active assigned side for current drill: 'white' | 'black'
    const [assignedSide, setAssignedSide] = useState('white');
    // Board orientation: DEFAULT (White on bottom) | REVERSED (Black on bottom)
    const [orientation, setOrientation] = useState(BoardOrientation.DEFAULT);

    // Selected Opening & Line keys ('all' means random selection)
    const [selectedOpeningKey, setSelectedOpeningKey] = useState(path_opening || 'all');
    const [selectedLineKey, setSelectedLineKey] = useState(path_line || 'all');

    // Active line reference & computed stacks
    const [activeOpeningKey, setActiveOpeningKey] = useState(null);
    const [activeLineKey, setActiveLineKey] = useState(null);
    const [activeLine, setActiveLine] = useState(null);
    const [boardStack, setBoardStack] = useState([]);
    const [notationStack, setNotationStack] = useState([]);
    const [evaluationStack, setEvaluationStack] = useState([]);

    // Drill game state
    const [currentPly, setCurrentPly] = useState(0);
    const [status, setStatus] = useState('init'); // 'player_turn' | 'computer_thinking' | 'correct' | 'wrong' | 'completed'
    const [feedback, setFeedback] = useState({ type: 'info', message: '' });
    const [mistakes, setMistakes] = useState(0);
    const [streak, setStreak] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [hintText, setHintText] = useState(null);

    const boardRef = useRef();
    const computerTimeoutRef = useRef(null);

    // Pick a line and initialize state
    const setupDrill = useCallback((opKeyChoice, lineKeyChoice, colChoice) => {
        if (computerTimeoutRef.current) {
            clearTimeout(computerTimeoutRef.current);
            computerTimeoutRef.current = null;
        }

        const keys = Object.keys(allLines);
        if (keys.length === 0) return;

        // 1. Determine opening
        let chosenOpKey = opKeyChoice;
        if (!chosenOpKey || chosenOpKey === 'all' || !allLines[chosenOpKey]) {
            chosenOpKey = keys[Math.floor(Math.random() * keys.length)];
        }
        const op = allLines[chosenOpKey];
        if (!op || !op.lines) return;

        // 2. Determine variation / line
        const variationKeys = Object.keys(op.lines);
        if (variationKeys.length === 0) return;

        let chosenLineKey = lineKeyChoice;
        if (!chosenLineKey || chosenLineKey === 'all' || !op.lines[chosenLineKey]) {
            chosenLineKey = variationKeys[Math.floor(Math.random() * variationKeys.length)];
        }
        const line = (op.getLine ? op.getLine(chosenLineKey) : op.lines[chosenLineKey]) || op.lines[chosenLineKey];
        if (!line) return;

        // 3. Determine player side
        let playerSide = colChoice;
        if (playerSide === 'random') {
            playerSide = Math.random() < 0.5 ? 'white' : 'black';
        }
        setAssignedSide(playerSide);

        // 4. Orientation: Black plays with flipped board
        const newOrientation = (playerSide === 'black') ? BoardOrientation.REVERSED : BoardOrientation.DEFAULT;
        setOrientation(newOrientation);

        // 5. Precompute stacks
        const [bStack, nStack] = line.getBoardStackAndNotationStack();
        const evalStack = line.getEvaluationStack ? line.getEvaluationStack() : [];

        setActiveOpeningKey(chosenOpKey);
        setActiveLineKey(chosenLineKey);
        setActiveLine(line);
        setBoardStack(bStack);
        setNotationStack(nStack);
        setEvaluationStack(evalStack);
        setCurrentPly(0);
        setMistakes(0);
        setHintText(null);

        if (boardRef.current && boardRef.current.reset) {
            boardRef.current.reset();
        }

        // 6. First move handling
        if (playerSide === 'white') {
            setStatus('player_turn');
            setFeedback({
                type: 'info',
                message: `Your turn as White! Find the opening move for the ${line.label || line.line_name}.`
            });
        } else {
            // Player is Black: Computer plays White's first move (ply 0)
            setStatus('computer_thinking');
            setFeedback({
                type: 'thinking',
                message: 'Computer is making the opening move as White...'
            });
            computerTimeoutRef.current = setTimeout(() => {
                setCurrentPly(1);
                playSound('move');
                const firstMoveStr = (nStack[0] && nStack[0].moveNotation) || 'move';
                setStatus('player_turn');
                setFeedback({
                    type: 'info',
                    message: `Computer played 1. ${firstMoveStr}. Your turn as Black!`
                });
            }, 550);
        }
    }, [allLines]);

    // Initial load
    useEffect(() => {
        setupDrill(selectedOpeningKey, selectedLineKey, colorChoice);
        return () => {
            if (computerTimeoutRef.current) {
                clearTimeout(computerTimeoutRef.current);
            }
        };
    }, []);

    // Change Opening handler
    const handleOpeningChange = (newOpKey) => {
        setSelectedOpeningKey(newOpKey);
        setSelectedLineKey('all');
        setupDrill(newOpKey, 'all', colorChoice);
    };

    // Change Line handler
    const handleLineChange = (newLineKey) => {
        setSelectedLineKey(newLineKey);
        setupDrill(selectedOpeningKey, newLineKey, colorChoice);
    };

    // Change Color choice handler
    const handleColorChoiceChange = (newColor) => {
        setColorChoice(newColor);
        setupDrill(selectedOpeningKey, selectedLineKey, newColor);
    };

    // Reset current line
    const handleRestartLine = () => {
        setupDrill(activeOpeningKey, activeLineKey, colorChoice);
    };

    // Next line
    const handleNextLine = () => {
        setupDrill(selectedOpeningKey, 'all', colorChoice);
    };

    // Toggle board orientation manually
    const handleToggleOrientation = () => {
        setOrientation(prev => prev === BoardOrientation.DEFAULT ? BoardOrientation.REVERSED : BoardOrientation.DEFAULT);
    };

    // Hint requested
    const handleShowHint = () => {
        if (!notationStack[currentPly]) return;
        const exp = notationStack[currentPly];
        const pieceName = getPieceReadableName(exp.piece);
        const dest = `${exp.fileDestination}${exp.rankDestination}`;
        if (!hintText) {
            setHintText(`💡 Move your ${pieceName}.`);
        } else {
            const orig = (exp.fileOrigin && exp.rankOrigin) ? `${exp.fileOrigin}${exp.rankOrigin} to ` : '';
            setHintText(`💡 Play ${orig}${dest} (${exp.moveNotation}).`);
        }
    };

    // Player move submission
    const handlePlayerMove = (selected, selectedValue) => {
        if (status !== 'player_turn' || currentPly >= notationStack.length) {
            return;
        }

        const totalPlies = notationStack.length;
        const expectedNotation = notationStack[currentPly];

        const originRow = Math.floor(selected / 8);
        const originCol = selected % 8;
        const destRow = Math.floor(selectedValue / 8);
        const destCol = selectedValue % 8;

        const currentNumberMap = (orientation === BoardOrientation.DEFAULT) ? numberMap : numberMapReversed;
        const currentLetterMap = (orientation === BoardOrientation.DEFAULT) ? letterMap : letterMapReversed;

        const origRank = String(currentNumberMap[originRow]);
        const origFile = currentLetterMap[originCol];
        const destRank = String(currentNumberMap[destRow]);
        const destFile = currentLetterMap[destCol];

        // Validate move
        let isCorrect = false;

        if (expectedNotation.moveNotation === 'O-O') {
            // Kingside castling
            if (assignedSide === 'white') {
                isCorrect = (origFile === 'e' && origRank === '1' && destFile === 'g' && destRank === '1');
            } else {
                isCorrect = (origFile === 'e' && origRank === '8' && destFile === 'g' && destRank === '8');
            }
        } else if (expectedNotation.moveNotation === 'O-O-O') {
            // Queenside castling
            if (assignedSide === 'white') {
                isCorrect = (origFile === 'e' && origRank === '1' && destFile === 'c' && destRank === '1');
            } else {
                isCorrect = (origFile === 'e' && origRank === '8' && destFile === 'c' && destRank === '8');
            }
        } else {
            // Standard move validation
            const destMatches = (destFile === expectedNotation.fileDestination &&
                destRank === String(expectedNotation.rankDestination));

            let origMatches = true;
            if (expectedNotation.fileOrigin) {
                origMatches = origMatches && (origFile === expectedNotation.fileOrigin);
            }
            if (expectedNotation.rankOrigin) {
                origMatches = origMatches && (origRank === String(expectedNotation.rankOrigin));
            }

            isCorrect = destMatches && origMatches;
        }

        if (isCorrect) {
            // Correct move!
            playSound('correct');
            setHintText(null);
            setStreak(prev => prev + 1);

            const nextPly = currentPly + 1;
            setCurrentPly(nextPly);

            if (nextPly >= totalPlies) {
                // Line Completed!
                playSound('victory');
                setStatus('completed');
                setCompletedCount(prev => prev + 1);
                setFeedback({
                    type: 'success',
                    message: `🏆 Line Mastered! All ${Math.ceil(totalPlies / 2)} moves played with precision!`
                });
            } else {
                // Computer's turn to respond
                setStatus('computer_thinking');
                setFeedback({
                    type: 'thinking',
                    message: `Correct (${expectedNotation.moveNotation})! Opponent is thinking...`
                });

                computerTimeoutRef.current = setTimeout(() => {
                    const compPly = nextPly + 1;
                    setCurrentPly(compPly);
                    playSound('move');

                    const compNotation = notationStack[nextPly];
                    const compMoveStr = compNotation ? compNotation.moveNotation : 'their move';

                    if (compPly >= totalPlies) {
                        playSound('victory');
                        setStatus('completed');
                        setCompletedCount(prev => prev + 1);
                        setFeedback({
                            type: 'success',
                            message: `🏆 Line Mastered! Completed all ${Math.ceil(totalPlies / 2)} moves in the variation!`
                        });
                    } else {
                        setStatus('player_turn');
                        setFeedback({
                            type: 'info',
                            message: `Opponent played ${compMoveStr}. Your turn!`
                        });
                    }
                }, 450);
            }
        } else {
            // Incorrect move
            playSound('wrong');
            setMistakes(prev => prev + 1);
            setStatus('wrong');
            const expectedMove = expectedNotation.moveNotation;
            setFeedback({
                type: 'error',
                message: `❌ Not on line (${origFile}${origRank} to ${destFile}${destRank}). The repertoire line plays ${expectedMove}. Try again!`
            });

            if (boardRef.current && boardRef.current.reset) {
                boardRef.current.reset();
            }

            // Return to player_turn after brief animation
            setTimeout(() => {
                setStatus(prev => prev === 'wrong' ? 'player_turn' : prev);
            }, 800);
        }
    };

    const activeOpening = (activeOpeningKey && allLines[activeOpeningKey]) ? allLines[activeOpeningKey] : null;
    const currentBoard = (boardStack.length > currentPly) ? boardStack[currentPly] : null;
    const currentNotation = (currentPly > 0 && notationStack.length >= currentPly) ? notationStack[currentPly - 1] : null;
    const currentEvaluation = (evaluationStack.length > currentPly) ? evaluationStack[currentPly] : 0;

    const totalPlies = notationStack.length;
    const currentMoveNumber = Math.floor(currentPly / 2) + 1;
    const totalMoves = Math.ceil(totalPlies / 2);
    const progressPercent = totalPlies > 0 ? Math.min(100, Math.round((currentPly / totalPlies) * 100)) : 0;

    const isPlayerTurn = (status === 'player_turn' || status === 'wrong');
    const playerTurnColor = (assignedSide === 'white') ? BoardTurn.WHITE : BoardTurn.BLACK;

    return (
        <div className="catalog-view-container trainer-page-wrap">
            {/* Top Navigation Bar */}
            <div className="catalog-header-bar trainer-nav-bar">
                <Link to="/" className="catalog-back-link">
                    <IconButton size="small" sx={{ color: '#BABABA', padding: '6px' }}>
                        <ArrowBackIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                </Link>
                <div className="catalog-header-title-box">
                    <div className="catalog-header-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Opening Trainer
                    </div>
                    <div className="catalog-header-subtitle">
                        Interactive Repertoire Sparring
                    </div>
                </div>
                <div className="trainer-nav-stats">
                    <span className="trainer-stat-pill" title="Completed variations">
                        <EmojiEventsIcon sx={{ fontSize: 16, color: '#F0D9B5' }} />
                        <span>{completedCount}</span>
                    </span>
                    <span className="trainer-stat-pill" title="Consecutive correct moves">
                        <span style={{ fontSize: '13px' }}>🔥</span>
                        <span>{streak}</span>
                    </span>
                </div>
            </div>

            {/* Drill Configuration Toolbar */}
            <div className="trainer-toolbar-card">
                {/* Side Selection: White / Black / Random */}
                <div className="trainer-side-selector-group">
                    <span className="trainer-control-label">SIDE:</span>
                    <div className="trainer-side-pills">
                        <button
                            className={`trainer-side-btn ${colorChoice === 'white' ? 'active' : ''}`}
                            onClick={() => handleColorChoiceChange('white')}
                        >
                            ⚪ White
                        </button>
                        <button
                            className={`trainer-side-btn ${colorChoice === 'black' ? 'active' : ''}`}
                            onClick={() => handleColorChoiceChange('black')}
                        >
                            ⚫ Black
                        </button>
                        <button
                            className={`trainer-side-btn ${colorChoice === 'random' ? 'active' : ''}`}
                            onClick={() => handleColorChoiceChange('random')}
                        >
                            🔀 Random
                        </button>
                    </div>
                </div>

                {/* Dropdowns for Opening & Variation */}
                <div className="trainer-selectors-row">
                    <div className="trainer-select-wrap">
                        <label className="trainer-select-label">OPENING</label>
                        <select
                            className="trainer-dropdown"
                            value={selectedOpeningKey}
                            onChange={(e) => handleOpeningChange(e.target.value)}
                        >
                            <option value="all">🔀 All Openings (Shuffle)</option>
                            {openingKeys.map(k => (
                                <option key={k} value={k}>
                                    {allLines[k].opening_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="trainer-select-wrap">
                        <label className="trainer-select-label">VARIATION</label>
                        <select
                            className="trainer-dropdown"
                            value={selectedLineKey}
                            onChange={(e) => handleLineChange(e.target.value)}
                            disabled={selectedOpeningKey === 'all'}
                        >
                            <option value="all">🔀 Random Variation</option>
                            {activeOpening && Object.keys(activeOpening.lines).map(lk => {
                                const l = activeOpening.lines[lk];
                                return (
                                    <option key={lk} value={lk}>
                                        {l.label || l.line_name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
            </div>

            {/* Board Title Header */}
            {activeOpening && activeLine && (
                <div className="trainer-line-header-card">
                    <div className="trainer-line-title-row">
                        <div className="trainer-line-info">
                            <span className="trainer-line-opening-name">{activeOpening.opening_name}</span>
                            <div className="trainer-tag-row">
                                {activeLine.label && (
                                    <span className="trainer-tag-green">{activeLine.label}</span>
                                )}
                                <span className="trainer-tag-blue">
                                    {activeLine.getDeviationMove ? activeLine.getDeviationMove() : activeLine.line_name}
                                </span>
                                <span className="trainer-playing-as-badge">
                                    Playing {assignedSide === 'white' ? '⚪ White' : '⚫ Black'}
                                </span>
                            </div>
                        </div>
                        <IconButton
                            size="small"
                            onClick={handleToggleOrientation}
                            title="Flip Board"
                            sx={{ color: '#BABABA', background: 'rgba(255,255,255,0.05)', padding: '6px' }}
                        >
                            <SwapVertIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </div>

                    {/* Progress Bar */}
                    <div className="trainer-progress-container">
                        <div className="trainer-progress-labels">
                            <span>Move {Math.min(currentMoveNumber, totalMoves)} of {totalMoves}</span>
                            <span>{progressPercent}% Complete</span>
                        </div>
                        <div className="trainer-progress-track">
                            <div
                                className="trainer-progress-fill"
                                style={{
                                    width: `${progressPercent}%`,
                                    backgroundColor: status === 'completed' ? '#00AC8D' : trainerIconColor
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Status / Feedback Alert */}
            <div className={`trainer-feedback-card ${feedback.type} ${status === 'wrong' ? 'shake-anim' : ''}`}>
                <div className="trainer-feedback-icon">
                    {feedback.type === 'success' && <CheckCircleOutlineIcon sx={{ fontSize: 20, color: '#00AC8D' }} />}
                    {feedback.type === 'error' && <ErrorOutlineIcon sx={{ fontSize: 20, color: '#FF5252' }} />}
                    {feedback.type === 'thinking' && <span className="trainer-thinking-dot" />}
                    {feedback.type === 'info' && <span className="trainer-turn-dot" />}
                </div>
                <div className="trainer-feedback-text">{feedback.message}</div>
            </div>

            {/* Hint Banner (if requested) */}
            {hintText && (
                <div className="trainer-hint-banner">
                    {hintText}
                </div>
            )}

            {/* Stockfish Engine Evaluation Bar */}
            <BoardEvaluation evaluation={currentEvaluation} />

            {/* The Interactive Chess Board */}
            {currentBoard && (
                <div className="trainer-board-wrapper">
                    <Board
                        ref={boardRef}
                        orientation={orientation}
                        board={currentBoard}
                        isCurrentBoard={isPlayerTurn && status !== 'completed'}
                        boardTurn={playerTurnColor}
                        currentBoardNotation={currentNotation}
                        submitMoveCallback={handlePlayerMove}
                    />
                </div>
            )}

            {/* Trainer Action Controls */}
            <div className="trainer-actions-bar">
                <button
                    className="trainer-action-btn hint-btn"
                    onClick={handleShowHint}
                    disabled={status === 'completed' || !isPlayerTurn}
                    title="Get a hint for the next move"
                >
                    <LightbulbIcon sx={{ fontSize: 18 }} />
                    <span>Hint</span>
                </button>

                <button
                    className="trainer-action-btn restart-btn"
                    onClick={handleRestartLine}
                    title="Restart this line from move 1"
                >
                    <ReplayIcon sx={{ fontSize: 18 }} />
                    <span>Retry</span>
                </button>

                <button
                    className="trainer-action-btn next-btn"
                    onClick={handleNextLine}
                    style={{ backgroundColor: trainerIconColor, color: iconSecondaryColor }}
                    title="Practice next variation"
                >
                    <SkipNextIcon sx={{ fontSize: 20 }} />
                    <span>Next Line</span>
                </button>
            </div>

            {/* Compact Move History Strip */}
            {notationStack.length > 0 && (
                <div className="trainer-history-card">
                    <div className="trainer-history-title">REPERTOIRE MOVES</div>
                    <div className="trainer-history-moves-list">
                        {notationStack.map((notObj, idx) => {
                            const moveNum = Math.floor(idx / 2) + 1;
                            const isWhiteMove = (idx % 2 === 0);
                            const isPast = idx < currentPly;
                            const isCurrent = idx === currentPly;
                            return (
                                <span
                                    key={idx}
                                    className={`trainer-history-move ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''}`}
                                >
                                    {isWhiteMove && <span className="trainer-history-number">{moveNum}.</span>}
                                    {notObj.moveNotation}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
