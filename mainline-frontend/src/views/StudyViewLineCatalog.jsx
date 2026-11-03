import React, { useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import { Link, useParams } from "react-router-dom";
import { iconSecondaryColor, studyIconColor } from "../util/icon";

function formatLinePreview(movesData, maxPlies = 10) {
    if (!movesData || movesData.length === 0) return '';
    let s = '';
    const sliceCount = Math.min(movesData.length, maxPlies);
    for (let i = 0; i < sliceCount; i += 1) {
        let moveSan = movesData[i].m;
        if (i % 2 === 0) {
            s += String(Math.floor(i / 2) + 1) + ". ";
        }
        s += moveSan + " ";
    }
    if (movesData.length > maxPlies) {
        s += "...";
    }
    return s.trim();
}

export function StudyViewLineCatalog(props) {
    const { path_opening } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const opening = props.allLines[path_opening];

    if (!opening) {
        return (
            <div className="catalog-view-container">
                <div className="catalog-header-bar">
                    <Link to="/study" className="catalog-back-link">
                        <IconButton size="small" sx={{ color: '#BABABA' }}>
                            <ArrowBackIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                    </Link>
                    <div className="catalog-header-title">Opening Not Found</div>
                </div>
            </div>
        );
    }

    const lineKeys = Object.keys(opening.lines);
    const filteredLines = lineKeys.filter((lineKey) => {
        const line = opening.lines[lineKey];
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        const nameMatch = lineKey.toLowerCase().includes(query);
        const labelMatch = line && line.label && line.label.toLowerCase().includes(query);
        const devMatch = line && line.getDeviationMove && line.getDeviationMove().toLowerCase().includes(query);
        return nameMatch || labelMatch || devMatch;
    });

    return (
        <div className="catalog-view-container">
            {/* Top Navigation Bar */}
            <div className="catalog-header-bar">
                <Link to="/study" className="catalog-back-link">
                    <IconButton size="small" sx={{ color: '#BABABA', padding: '6px' }}>
                        <ArrowBackIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                </Link>
                <div className="catalog-header-title-box">
                    <div className="catalog-header-title">{opening.opening_name}</div>
                    <div className="catalog-header-subtitle">
                        Select Variation Line
                    </div>
                </div>
                <div className="catalog-header-badge" style={{ backgroundColor: studyIconColor }}>
                    <SchoolIcon sx={{ fontSize: 20, color: iconSecondaryColor }} />
                </div>
            </div>

            {/* Search Input */}
            <div className="catalog-search-wrap">
                <div className="catalog-search-box">
                    <SearchIcon sx={{ fontSize: 20, color: '#6A6D75', marginRight: '8px' }} />
                    <input
                        type="text"
                        className="catalog-search-input"
                        placeholder="Search variations..."
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

            {/* Lines List */}
            <div className="catalog-list">
                {filteredLines.length > 0 ? (
                    filteredLines.map((lineKey) => {
                        const line = opening.lines[lineKey];
                        const lineLength = line ? line.getLineLength() : 0;
                        const greenTag = line ? line.label : null;
                        const blueTag = line && line.getDeviationMove ? line.getDeviationMove() : lineKey;
                        const cardTitle = greenTag
                            ? `${greenTag} Variation`
                            : (lineKey === 'mainline' ? 'Mainline Variation' : `${blueTag} Variation`);

                        return (
                            <Link
                                key={lineKey}
                                to={`/study/${path_opening}/${lineKey}`}
                                className="catalog-card-link"
                            >
                                <div className="catalog-card">
                                    <div className="catalog-card-header">
                                        <div className="catalog-card-title-group" style={{ flexWrap: 'wrap', gap: '8px' }}>
                                            <div className="catalog-card-title">{cardTitle}</div>
                                            <div className="catalog-tags-wrap">
                                                {greenTag && (
                                                    <span className="catalog-tag-green">{greenTag}</span>
                                                )}
                                                <span className="catalog-tag-blue">{blueTag}</span>
                                            </div>
                                        </div>
                                        <div className="catalog-card-arrow">
                                            <ChevronRightIcon sx={{ fontSize: 22, color: '#777' }} />
                                        </div>
                                    </div>

                                    {/* Line preview moves box */}
                                    <div className="catalog-card-moves-box">
                                        <span className="catalog-card-moves-text">
                                            {formatLinePreview(line ? line.line_data : [])}
                                        </span>
                                    </div>

                                    <div className="catalog-card-footer" style={{ marginTop: '12px' }}>
                                        <span className="catalog-card-pill">
                                            {lineLength} Plies Total
                                        </span>
                                        <span className="catalog-card-action" style={{ color: studyIconColor }}>
                                            <PlayArrowIcon sx={{ fontSize: 16, verticalAlign: 'middle', marginRight: '2px' }} />
                                            Start Study
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="catalog-empty-state">
                        <div className="catalog-empty-title">No Variations Found</div>
                        <div className="catalog-empty-desc">
                            No line matched "{searchQuery}".
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
