import React from 'react';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { Link } from "react-router-dom";

export function BoardTitle(props) {
    const formattedLineName = props.lineName
        ? props.lineName.charAt(0).toUpperCase() + props.lineName.slice(1)
        : '';

    return (
        <div className="board-title-bar">
            <Link to={`/study/${props.pathOpening}`} className="board-title-back-link">
                <IconButton size="small" sx={{ color: '#BABABA', padding: '6px' }} title="Back to Variations">
                    <ArrowBackIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </Link>

            <div className="board-title-content">
                <span className="board-title-opening">{props.openingName}</span>
                <span className="board-title-separator">•</span>
                <span className="board-title-line-badge">{formattedLineName}</span>
            </div>

            {props.onToggleOrientation && (
                <IconButton
                    size="small"
                    onClick={props.onToggleOrientation}
                    title="Flip Board Orientation"
                    sx={{
                        color: '#BABABA',
                        padding: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                    }}
                >
                    <SwapVertIcon sx={{ fontSize: 20 }} />
                </IconButton>
            )}
        </div>
    );
}
