import React, { useState, useEffect, useRef, useCallback } from 'react';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ReplayIcon from '@mui/icons-material/Replay';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
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
import { trainerIconColor, iconSecondaryColor } from "../util/icon";

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

export function TrainerBoardView(props) {
    const { id, variation_id } = useParams();
    const navigate = useNavigate();
    const allLines = props.allLines || {};
    const openingKeys = Object.keys(allLines);

    // Color mode: 'white' | 'black' | 'random'
    const [colorChoice, setColorChoice] = useState('white');
    // Active assigned side for current drill: 'white' | 'black'
    const [assignedSide, setAssignedSide] = useState('white');
    // Board orientation: DEFAULT (White on bottom) | REVERSED (Black on bottom)
    const [orientation, setOrientation] = useState(BoardOrientation.DEFAULT);

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

    // Resolve :id and :variation_id into opening and line
    const resolveOpeningAndLine = useCallback((paramId, paramVariationId) => {
        const keys = Object.keys(allLines);
        if (keys.length === 0) return { opKey: null, lineKey: null };

        // 1. Random mode
        if (!paramId || paramId === 'random') {
            const randomOp = keys[Math.floor(Math.random() * keys.length)];
            const op = allLines[randomOp];
            const vKeys = Object.keys(op.lines);
            const randomLine = vKeys[Math.floor(Math.random() * vKeys.length)];
            return { opKey: randomOp, lineKey: randomLine };
        }

        // 2. Direct opening key match
        const lowerId = paramId.toLowerCase();
        let matchedOpKey = keys.find(k => k.toLowerCase() === lowerId);
        if (!matchedOpKey) {
            // Check if id contains opening and variation combined e.g. sicilian-najdorf
            for (const k of keys) {
                if (lowerId.startsWith(k.toLowerCase())) {
                    matchedOpKey = k;
                    break;
                }
            }
        }

        if (matchedOpKey) {
            const op = allLines[matchedOpKey];
            const vKeys = Object.keys(op.lines);
            let matchedLineKey = null;

            if (paramVariationId) {
                const lowerVar = paramVariationId.toLowerCase();
                matchedLineKey = vKeys.find(vk => vk.toLowerCase() === lowerVar);
                if (!matchedLineKey && op.getLine) {
                    const found = op.getLine(paramVariationId);
                    if (found) matchedLineKey = found.line_name;
                }
            }

            if (!matchedLineKey) {
                matchedLineKey = vKeys[0];
            }

            return { opKey: matchedOpKey, lineKey: matchedLineKey };
        }

        // 3. Fallback to first opening
        const firstOp = keys[0];
        const firstLine = Object.keys(allLines[firstOp].lines)[0];
        return { opKey: firstOp, lineKey: firstLine };
    }, [allLines]);

    // Setup drill with selected opening, line, and color choice
    const setupDrill = useCallback((opKey, lineKey, colChoice) => {
        if (computerTimeoutRef.current) {
            clearTimeout(computerTimeoutRef.current);
            computerTimeoutRef.current = null;
        }

        const op = allLines[opKey];
        if (!op || !op.lines) return;

        const line = (op.getLine ? op.getLine(lineKey) : op.lines[lineKey]) || op.lines[lineKey];
        if (!line) return;

        // Determine player side
        let playerSide = colChoice;
        if (playerSide === 'random') {
            playerSide = Math.random() < 0.5 ? 'white' : 'black';
        }
        setAssignedSide(playerSide);

        // Black plays with flipped board
        const newOrientation = (playerSide === 'black') ? BoardOrientation.REVERSED : BoardOrientation.DEFAULT;
        setOrientation(newOrientation);

        // Precompute stacks
        const [bStack, nStack] = line.getBoardStackAndNotationStack();
        const evalStack = line.getEvaluationStack ? line.getEvaluationStack() : [];

        setActiveOpeningKey(opKey);
        setActiveLineKey(lineKey);
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

    // Initialize drill on route param change
    useEffect(() => {
        const { opKey, lineKey } = resolveOpeningAndLine(id, variation_id);
        if (opKey && lineKey) {
            setupDrill(opKey, lineKey, colorChoice);
        }
        return () => {
            if (computerTimeoutRef.current) {
                clearTimeout(computerTimeoutRef.current);
            }
        };
    }, [id, variation_id, resolveOpeningAndLine]);

    // Options Modal state
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [modalColorChoice, setModalColorChoice] = useState('white');
    const [modalOpeningKey, setModalOpeningKey] = useState('');
    const [modalLineKey, setModalLineKey] = useState('');

    // Repertoire Moves Modal state
    const [isMovesModalOpen, setIsMovesModalOpen] = useState(false);

    const openOptionsModal = () => {
        setModalColorChoice(colorChoice);
        setModalOpeningKey(activeOpeningKey || '');
        setModalLineKey(activeLineKey || '');
        setIsOptionsOpen(true);
    };

    const closeOptionsModal = () => {
        setIsOptionsOpen(false);
    };

    const handleModalOpeningChange = (newOp) => {
        setModalOpeningKey(newOp);
        const op = allLines[newOp];
        if (op && op.lines) {
            const firstLineKey = Object.keys(op.lines)[0];
            setModalLineKey(firstLineKey);
        }
    };

    const handleSaveOptions = () => {
        setIsOptionsOpen(false);
        setColorChoice(modalColorChoice);
        if (modalOpeningKey && modalLineKey) {
            if (modalOpeningKey !== activeOpeningKey || modalLineKey !== activeLineKey) {
                navigate(`/trainer/${modalOpeningKey}/${modalLineKey}`);
            } else {
                setupDrill(modalOpeningKey, modalLineKey, modalColorChoice);
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isOptionsOpen) setIsOptionsOpen(false);
                if (isMovesModalOpen) setIsMovesModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOptionsOpen, isMovesModalOpen]);

    // Reset current line
    const handleRestartLine = () => {
        setupDrill(activeOpeningKey, activeLineKey, colorChoice);
    };

    // Next line (load next variation in current opening, or random line)
    const handleNextLine = () => {
        if (!activeOpeningKey || id === 'random') {
            const { opKey, lineKey } = resolveOpeningAndLine('random', null);
            setupDrill(opKey, lineKey, colorChoice);
            return;
        }

        const op = allLines[activeOpeningKey];
        if (op && op.lines) {
            const vKeys = Object.keys(op.lines);
            const currentIdx = vKeys.indexOf(activeLineKey);
            const nextIdx = (currentIdx + 1) % vKeys.length;
            const nextLineKey = vKeys[nextIdx];
            navigate(`/trainer/${activeOpeningKey}/${nextLineKey}`);
        }
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
            {/* Ultra-compact Header Bar */}
            <div className="trainer-header-compact">
                <Link to="/trainer" className="catalog-back-link">
                    <IconButton size="small" sx={{ color: '#BABABA', padding: '4px' }}>
                        <ArrowBackIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Link>

                <div className="trainer-compact-info">
                    <div className="trainer-compact-name-row">
                        <span className="trainer-compact-op-title">
                            {activeOpening ? activeOpening.opening_name : 'Trainer'}
                        </span>
                        {activeLine?.label && (
                            <span className="trainer-compact-tag-green">{activeLine.label}</span>
                        )}
                        <span className="trainer-compact-tag-blue">
                            {activeLine?.getDeviationMove ? activeLine.getDeviationMove() : (activeLine?.line_name || 'Mainline')}
                        </span>
                    </div>
                    <div className="trainer-compact-sub-row">
                        <span className="trainer-compact-side-badge">
                            {assignedSide === 'white' ? '⚪ You: White' : '⚫ You: Black'}
                        </span>
                        <span className="trainer-compact-move-counter">
                            Move {Math.min(currentMoveNumber, totalMoves)}/{totalMoves}
                        </span>
                        {streak > 0 && (
                            <span className="trainer-compact-streak-badge">
                                🔥 {streak}
                            </span>
                        )}
                    </div>
                </div>

                <div className="trainer-compact-header-actions">
                    <IconButton
                        size="small"
                        onClick={handleToggleOrientation}
                        title="Flip Board"
                        sx={{ color: '#BABABA', padding: '5px' }}
                    >
                        <SwapVertIcon sx={{ fontSize: 19 }} />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={openOptionsModal}
                        title="Trainer Settings"
                        sx={{ color: '#BABABA', padding: '5px' }}
                    >
                        <SettingsIcon sx={{ fontSize: 19 }} />
                    </IconButton>
                </div>
            </div>

            {/* 2px Slim Progress Line Flush Under Header */}
            <div className="trainer-progress-slim-track">
                <div
                    className="trainer-progress-slim-fill"
                    style={{
                        width: `${progressPercent}%`,
                        backgroundColor: status === 'completed' ? '#00AC8D' : trainerIconColor
                    }}
                />
            </div>

            {/* Compact Turn & Feedback Status Bar */}
            <div className={`trainer-status-slim ${feedback.type} ${status === 'wrong' ? 'shake-anim' : ''}`}>
                <div className="trainer-status-slim-left">
                    {feedback.type === 'thinking' && <span className="trainer-thinking-dot-slim" />}
                    {feedback.type === 'info' && <span className="trainer-turn-dot-slim" />}
                    {feedback.type === 'success' && <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#00AC8D' }} />}
                    {feedback.type === 'error' && <ErrorOutlineIcon sx={{ fontSize: 15, color: '#FF5252' }} />}
                    <span className="trainer-status-slim-msg">{feedback.message}</span>
                </div>
                {hintText && (
                    <span className="trainer-status-slim-hint-badge">{hintText}</span>
                )}
            </div>

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

            {/* Compact Action Controls Bar */}
            <div className="trainer-actions-compact">
                <button
                    className="trainer-compact-action-btn"
                    onClick={handleShowHint}
                    disabled={status === 'completed' || !isPlayerTurn}
                    title="Get a hint"
                >
                    <LightbulbIcon sx={{ fontSize: 16 }} />
                    <span>Hint</span>
                </button>

                <button
                    className="trainer-compact-action-btn"
                    onClick={handleRestartLine}
                    title="Restart line"
                >
                    <ReplayIcon sx={{ fontSize: 16 }} />
                    <span>Retry</span>
                </button>

                <button
                    className="trainer-compact-action-btn"
                    onClick={() => setIsMovesModalOpen(true)}
                    title="View all line moves"
                >
                    <MenuBookIcon sx={{ fontSize: 16 }} />
                    <span>Moves</span>
                </button>

                <button
                    className="trainer-compact-action-btn next-primary"
                    onClick={handleNextLine}
                    style={{ backgroundColor: trainerIconColor, color: iconSecondaryColor }}
                    title="Practice next variation"
                >
                    <SkipNextIcon sx={{ fontSize: 18 }} />
                    <span>Next</span>
                </button>
            </div>

            {/* Repertoire Moves Modal */}
            {isMovesModalOpen && (
                <div className="trainer-modal-overlay" onClick={() => setIsMovesModalOpen(false)}>
                    <div className="trainer-modal-card trainer-moves-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="trainer-modal-header">
                            <div className="trainer-modal-title">
                                <MenuBookIcon sx={{ fontSize: 20, color: trainerIconColor }} />
                                <span>Repertoire Moves</span>
                            </div>
                            <IconButton
                                size="small"
                                onClick={() => setIsMovesModalOpen(false)}
                                sx={{ color: '#BABABA', padding: '4px' }}
                            >
                                <CloseIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </div>

                        <div className="trainer-modal-body" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                <span className="trainer-compact-op-title" style={{ fontSize: '13px' }}>
                                    {activeOpening ? activeOpening.opening_name : ''}
                                </span>
                                {activeLine?.label && (
                                    <span className="trainer-tag-green">{activeLine.label}</span>
                                )}
                                <span className="trainer-tag-blue">
                                    {activeLine?.getDeviationMove ? activeLine.getDeviationMove() : activeLine?.line_name}
                                </span>
                            </div>
                            <div className="trainer-history-moves-list" style={{ lineHeight: '1.8' }}>
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

                        <div className="trainer-modal-footer">
                            <button
                                type="button"
                                className="trainer-modal-save-btn"
                                style={{ width: '100%' }}
                                onClick={() => setIsMovesModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Trainer Options Modal */}
            {isOptionsOpen && (
                <div className="trainer-modal-overlay" onClick={closeOptionsModal}>
                    <div className="trainer-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="trainer-modal-header">
                            <div className="trainer-modal-title">
                                <SettingsIcon sx={{ fontSize: 20, color: trainerIconColor }} />
                                <span>Trainer Options</span>
                            </div>
                            <IconButton
                                size="small"
                                onClick={closeOptionsModal}
                                sx={{ color: '#BABABA', padding: '4px' }}
                            >
                                <CloseIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </div>

                        <div className="trainer-modal-body">
                            {/* Side Selection: White / Black / Random */}
                            <div className="trainer-modal-field">
                                <label className="trainer-modal-label">SIDE TO PLAY</label>
                                <div className="trainer-side-pills">
                                    <button
                                        type="button"
                                        className={`trainer-side-btn ${modalColorChoice === 'white' ? 'active' : ''}`}
                                        onClick={() => setModalColorChoice('white')}
                                    >
                                        ⚪ White
                                    </button>
                                    <button
                                        type="button"
                                        className={`trainer-side-btn ${modalColorChoice === 'black' ? 'active' : ''}`}
                                        onClick={() => setModalColorChoice('black')}
                                    >
                                        ⚫ Black
                                    </button>
                                    <button
                                        type="button"
                                        className={`trainer-side-btn ${modalColorChoice === 'random' ? 'active' : ''}`}
                                        onClick={() => setModalColorChoice('random')}
                                    >
                                        🔀 Random
                                    </button>
                                </div>
                            </div>

                            {/* Opening Select */}
                            <div className="trainer-modal-field">
                                <label className="trainer-modal-label">OPENING</label>
                                <select
                                    className="trainer-dropdown"
                                    value={modalOpeningKey}
                                    onChange={(e) => handleModalOpeningChange(e.target.value)}
                                >
                                    {openingKeys.map(k => (
                                        <option key={k} value={k}>
                                            {allLines[k].opening_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Variation Select */}
                            <div className="trainer-modal-field">
                                <label className="trainer-modal-label">VARIATION</label>
                                <select
                                    className="trainer-dropdown"
                                    value={modalLineKey}
                                    onChange={(e) => setModalLineKey(e.target.value)}
                                >
                                    {modalOpeningKey && allLines[modalOpeningKey] && Object.keys(allLines[modalOpeningKey].lines).map(lk => {
                                        const l = allLines[modalOpeningKey].lines[lk];
                                        return (
                                            <option key={lk} value={lk}>
                                                {l.label || l.line_name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="trainer-modal-footer">
                            <button
                                type="button"
                                className="trainer-modal-cancel-btn"
                                onClick={closeOptionsModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="trainer-modal-save-btn"
                                onClick={handleSaveOptions}
                            >
                                Save Options
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

