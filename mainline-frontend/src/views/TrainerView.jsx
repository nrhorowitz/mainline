import React from 'react';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BoltIcon from '@mui/icons-material/Bolt';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import IconButton from '@mui/material/IconButton';
import { Link } from "react-router-dom";
import { iconSecondaryColor, trainerIconColor } from "../util/icon";

export function TrainerView(props) {
    const openingKeys = Object.keys(props.allLines || {});

    return (
        <div className="catalog-view-container">
            {/* Header */}
            <div className="catalog-header-bar">
                <Link to="/" className="catalog-back-link">
                    <IconButton size="small" sx={{ color: '#BABABA', padding: '6px' }}>
                        <ArrowBackIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                </Link>
                <div className="catalog-header-title-box">
                    <div className="catalog-header-title">Opening Trainer</div>
                    <div className="catalog-header-subtitle">
                        Interactive Repertoire Drills
                    </div>
                </div>
                <div className="catalog-header-badge" style={{ backgroundColor: trainerIconColor }}>
                    <SportsEsportsIcon sx={{ fontSize: 20, color: iconSecondaryColor }} />
                </div>
            </div>

            {/* Trainer Feature Banner */}
            <div className="trainer-hero-card">
                <div className="trainer-hero-tag" style={{ color: trainerIconColor }}>
                    <BoltIcon sx={{ fontSize: 16, marginRight: '4px' }} />
                    REPERTOIRE SPARRING
                </div>
                <div className="trainer-hero-title">Practice Against the Engine</div>
                <div className="trainer-hero-desc">
                    Test your memory on key opening branches. The trainer plays opponent replies while testing your accuracy.
                </div>
            </div>

            {/* Available Training Drills */}
            <div className="catalog-list" style={{ marginTop: '14px' }}>
                <div className="landing-stats-title" style={{ paddingLeft: '4px', marginBottom: '8px' }}>
                    SELECT OPENING TO DRILL
                </div>
                {openingKeys.map((key) => {
                    const opening = props.allLines[key];
                    const firstLineKey = Object.keys(opening.lines)[0];
                    return (
                        <Link
                            key={key}
                            to={`/study/${key}/${firstLineKey}`}
                            className="catalog-card-link"
                        >
                            <div className="catalog-card trainer-drill-card">
                                <div className="catalog-card-header">
                                    <div className="catalog-card-title-group">
                                        <div className="catalog-card-title">{opening.opening_name} Drill</div>
                                    </div>
                                    <div className="trainer-play-pill" style={{ backgroundColor: trainerIconColor, color: iconSecondaryColor }}>
                                        <PlayArrowIcon sx={{ fontSize: 18 }} />
                                    </div>
                                </div>
                                <div className="catalog-card-footer" style={{ marginTop: '10px' }}>
                                    <span className="catalog-card-pill">
                                        {Object.keys(opening.lines).length} Variations
                                    </span>
                                    <span className="catalog-card-action" style={{ color: trainerIconColor }}>
                                        Start Drill →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

