import React, { useState, useMemo } from 'react';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import BoltIcon from '@mui/icons-material/Bolt';
import IconButton from '@mui/material/IconButton';
import { Link } from "react-router-dom";
import { iconSecondaryColor, trainerIconColor } from "../util/icon";

function formatLinePreview(movesData, maxPlies = 8) {
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

export function TrainerCatalogView(props) {
    const allLines = props.allLines || {};
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOpeningFilter, setSelectedOpeningFilter] = useState('all');

    // Flatten all lines into a searchable catalog
    const catalogItems = useMemo(() => {
        const items = [];
        const openingKeys = Object.keys(allLines);
        for (const opKey of openingKeys) {
            const opening = allLines[opKey];
            if (!opening || !opening.lines) continue;

            const variationKeys = Object.keys(opening.lines);
            for (const lineKey of variationKeys) {
                const line = opening.lines[lineKey];
                if (!line) continue;

                items.push({
                    openingKey: opKey,
                    openingName: opening.opening_name,
                    lineKey: lineKey,
                    lineName: line.line_name,
                    label: line.label || line.line_name,
                    deviation: line.getDeviationMove ? line.getDeviationMove() : (line.line_name === 'mainline' ? 'Mainline' : line.line_name),
                    movesPreview: formatLinePreview(line.line_data, 8),
                    totalPlies: line.getLineLength ? line.getLineLength() : (line.line_data ? line.line_data.length : 0),
                    movesCount: Math.ceil((line.getLineLength ? line.getLineLength() : (line.line_data ? line.line_data.length : 0)) / 2)
                });
            }
        }
        return items;
    }, [allLines]);

    // Available openings for filter pills
    const openingFilterOptions = useMemo(() => {
        const counts = {};
        for (const item of catalogItems) {
            counts[item.openingKey] = (counts[item.openingKey] || 0) + 1;
        }
        return Object.keys(counts).map(key => ({
            key,
            name: allLines[key]?.opening_name || key,
            count: counts[key]
        }));
    }, [catalogItems, allLines]);

    // Filter items based on search query and selected opening pill
    const filteredItems = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return catalogItems.filter(item => {
            // Opening filter
            if (selectedOpeningFilter !== 'all' && item.openingKey !== selectedOpeningFilter) {
                return false;
            }
            // Search query filter
            if (!query) return true;
            return (
                item.openingName.toLowerCase().includes(query) ||
                item.label.toLowerCase().includes(query) ||
                item.deviation.toLowerCase().includes(query) ||
                item.lineKey.toLowerCase().includes(query) ||
                item.movesPreview.toLowerCase().includes(query)
            );
        });
    }, [catalogItems, searchQuery, selectedOpeningFilter]);

    return (
        <div className="catalog-view-container">
            {/* Top Navigation Bar */}
            <div className="catalog-header-bar">
                <Link to="/" className="catalog-back-link">
                    <IconButton size="small" sx={{ color: '#BABABA', padding: '6px' }}>
                        <ArrowBackIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                </Link>
                <div className="catalog-header-title-box">
                    <div className="catalog-header-title">Opening Trainer</div>
                    <div className="catalog-header-subtitle">
                        Select a Line to Practice ({catalogItems.length} Variations)
                    </div>
                </div>
                <div className="catalog-header-badge" style={{ backgroundColor: trainerIconColor }}>
                    <SportsEsportsIcon sx={{ fontSize: 20, color: iconSecondaryColor }} />
                </div>
            </div>

            {/* Quick Sparring Hero Card */}
            <div className="trainer-hero-card">
                <div className="trainer-hero-tag" style={{ color: trainerIconColor }}>
                    <BoltIcon sx={{ fontSize: 16, marginRight: '4px' }} />
                    QUICK SPARRING
                </div>
                <div className="trainer-hero-title">Random Repertoire Drill</div>
                <div className="trainer-hero-desc">
                    Test your memory across all 14 master opening repertoires. The computer will play opponent replies while validating your line moves.
                </div>
                <div style={{ marginTop: '14px' }}>
                    <Link to="/trainer/random" style={{ textDecoration: 'none' }}>
                        <button
                            className="trainer-hero-cta-btn"
                            style={{
                                backgroundColor: trainerIconColor,
                                color: iconSecondaryColor,
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px 18px',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <ShuffleIcon sx={{ fontSize: 18 }} />
                            <span>Train Random Line</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Search Bar */}
            <div className="catalog-search-wrap">
                <div className="catalog-search-box">
                    <SearchIcon sx={{ fontSize: 20, color: '#6A6D75', marginRight: '8px' }} />
                    <input
                        type="text"
                        className="catalog-search-input"
                        placeholder="Search line (e.g. Najdorf, Catalan, c5, 5... a6)..."
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

            {/* Opening Filter Chips Bar */}
            <div className="trainer-chips-scroll">
                <button
                    className={`trainer-chip-btn ${selectedOpeningFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedOpeningFilter('all')}
                >
                    All Openings ({catalogItems.length})
                </button>
                {openingFilterOptions.map(op => (
                    <button
                        key={op.key}
                        className={`trainer-chip-btn ${selectedOpeningFilter === op.key ? 'active' : ''}`}
                        onClick={() => setSelectedOpeningFilter(op.key)}
                    >
                        {op.name} ({op.count})
                    </button>
                ))}
            </div>

            {/* Line Selection Cards List */}
            <div className="catalog-list" style={{ marginTop: '10px' }}>
                <div className="landing-stats-title" style={{ paddingLeft: '4px', marginBottom: '8px' }}>
                    {selectedOpeningFilter === 'all' ? 'ALL REPERTOIRE LINES' : `${allLines[selectedOpeningFilter]?.opening_name.toUpperCase()} LINES`} ({filteredItems.length})
                </div>

                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <Link
                            key={`${item.openingKey}-${item.lineKey}`}
                            to={`/trainer/${item.openingKey}/${item.lineKey}`}
                            className="catalog-card-link"
                        >
                            <div className="catalog-card trainer-drill-card">
                                <div className="catalog-card-header">
                                    <div className="catalog-card-title-group">
                                        <div className="catalog-card-title">
                                            {item.openingName}
                                        </div>
                                        <div className="trainer-tag-row" style={{ marginTop: '4px' }}>
                                            <span className="trainer-tag-green">
                                                {item.label}
                                            </span>
                                            <span className="trainer-tag-blue">
                                                {item.deviation}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className="trainer-play-pill"
                                        style={{ backgroundColor: trainerIconColor, color: iconSecondaryColor }}
                                    >
                                        <PlayArrowIcon sx={{ fontSize: 18 }} />
                                    </div>
                                </div>

                                <div className="catalog-card-preview" style={{ marginTop: '8px' }}>
                                    {item.movesPreview}
                                </div>

                                <div className="catalog-card-footer" style={{ marginTop: '10px' }}>
                                    <span className="catalog-card-pill">
                                        {item.movesCount} Moves
                                    </span>
                                    <span className="catalog-card-action" style={{ color: trainerIconColor }}>
                                        Train Line →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="catalog-empty-wrap">
                        <div className="catalog-empty-title">No lines found</div>
                        <div className="catalog-empty-desc">
                            No repertoire variation matches "{searchQuery}".
                        </div>
                        <button
                            className="catalog-reset-btn"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedOpeningFilter('all');
                            }}
                        >
                            Reset Filter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

