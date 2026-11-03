import React, { useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import { Link } from "react-router-dom";
import { iconSecondaryColor, studyIconColor } from "../util/icon";

function formatMovesPreview(opening_moves) {
    let s = '';
    for (let i = 0; i < opening_moves.length; i += 1) {
        let opening_move = opening_moves[i].m;
        if (i % 2 === 0) {
            s += String((i / 2) + 1) + ". ";
        }
        s += opening_move + " ";
    }
    return s.trim();
}

function getOpeningList(allLines) {
    const list = [];
    for (let path_opening of Object.keys(allLines)) {
        let opening = allLines[path_opening];
        let lineCount = Object.keys(opening.lines).length;
        list.push({
            path_opening: path_opening,
            opening_name: opening.opening_name,
            opening_moves_preview: formatMovesPreview(opening.opening_moves),
            first_move: opening.opening_moves[0]?.m || '1. ?',
            line_count: lineCount,
        });
    }
    return list;
}

export function StudyViewCatalog(props) {
    const [searchQuery, setSearchQuery] = useState('');
    const openingList = getOpeningList(props.allLines);

    const filteredOpenings = openingList.filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            item.opening_name.toLowerCase().includes(query) ||
            item.opening_moves_preview.toLowerCase().includes(query) ||
            item.path_opening.toLowerCase().includes(query)
        );
    });

    return (
        <div className="catalog-view-container">
            {/* Top Navigation Header */}
            <div className="catalog-header-bar">
                <Link to="/" className="catalog-back-link">
                    <IconButton size="small" sx={{ color: '#BABABA', padding: '6px' }}>
                        <ArrowBackIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                </Link>
                <div className="catalog-header-title-box">
                    <div className="catalog-header-title">Study Openings</div>
                    <div className="catalog-header-subtitle">
                        {openingList.length} Repertoires Available
                    </div>
                </div>
                <div className="catalog-header-badge" style={{ backgroundColor: studyIconColor }}>
                    <SchoolIcon sx={{ fontSize: 20, color: iconSecondaryColor }} />
                </div>
            </div>

            {/* Modern Search Input Bar */}
            <div className="catalog-search-wrap">
                <div className="catalog-search-box">
                    <SearchIcon sx={{ fontSize: 20, color: '#6A6D75', marginRight: '8px' }} />
                    <input
                        type="text"
                        className="catalog-search-input"
                        placeholder="Search opening or moves (e.g. d4, Catalan)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="catalog-search-clear"
                            onClick={() => setSearchQuery('')}
                            title="Clear search"
                        >
                            <CloseIcon sx={{ fontSize: 16, color: '#888' }} />
                        </button>
                    )}
                </div>
            </div>

            {/* Opening List Items */}
            <div className="catalog-list">
                {filteredOpenings.length > 0 ? (
                    filteredOpenings.map((opening) => (
                        <Link
                            key={opening.path_opening}
                            to={`/study/${opening.path_opening}`}
                            className="catalog-card-link"
                        >
                            <div className="catalog-card">
                                <div className="catalog-card-header">
                                    <div className="catalog-card-title-group">
                                        <div className="catalog-card-title">{opening.opening_name}</div>
                                        <span className="catalog-card-first-move">{opening.first_move}</span>
                                    </div>
                                    <div className="catalog-card-arrow">
                                        <ChevronRightIcon sx={{ fontSize: 22, color: '#777' }} />
                                    </div>
                                </div>
                                
                                <div className="catalog-card-moves-box">
                                    <span className="catalog-card-moves-text">
                                        {opening.opening_moves_preview}
                                    </span>
                                </div>

                                <div className="catalog-card-footer">
                                    <span className="catalog-card-pill">
                                        {opening.line_count} {opening.line_count === 1 ? 'Variation' : 'Variations'}
                                    </span>
                                    <span className="catalog-card-action" style={{ color: studyIconColor }}>
                                        Study Lines →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="catalog-empty-state">
                        <div className="catalog-empty-title">No Openings Found</div>
                        <div className="catalog-empty-desc">
                            No opening matched "{searchQuery}".
                        </div>
                        <button
                            className="catalog-reset-btn"
                            onClick={() => setSearchQuery('')}
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
