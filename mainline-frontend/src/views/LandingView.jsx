import React from 'react';
import SchoolIcon from '@mui/icons-material/School';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SpeedIcon from '@mui/icons-material/Speed';
import { Link } from "react-router-dom";
import { iconSecondaryColor, studyIconColor, trainerIconColor } from "../util/icon";

export function LandingView(props) {
    const allLines = props.allLines || {};
    const openingKeys = Object.keys(allLines);
    const openingCount = openingKeys.length;
    
    let totalPlies = 0;
    for (const opKey of openingKeys) {
        const op = allLines[opKey];
        if (op && op.lines) {
            for (const lk of Object.keys(op.lines)) {
                totalPlies += op.lines[lk].getLineLength();
            }
        }
    }

    const openingPills = openingKeys.length > 0
        ? openingKeys.map(k => allLines[k].opening_name)
        : ['Catalan', 'Caro-Kann', 'Sicilian'];

    return (
        <div className="landing-view-container">
            {/* Top Brand Banner */}
            <div className="landing-brand-header">
                <div className="landing-brand-badge">
                    <img src="/w-knight.png" alt="Mainline Logo" className="landing-brand-logo" />
                </div>
                <div className="landing-brand-title">Mainline</div>
                <div className="landing-brand-subtitle">
                    Master Opening Theory & Repertoire
                </div>
            </div>

            {/* Core Action Cards */}
            <div className="landing-cards-container">
                {/* Study Card */}
                <Link to="/study" className="landing-card-link">
                    <div className="landing-card landing-card-study">
                        <div className="landing-card-top">
                            <div className="landing-card-icon-wrap" style={{ backgroundColor: studyIconColor }}>
                                <SchoolIcon sx={{ fontSize: 32, color: iconSecondaryColor }} />
                            </div>
                            <div className="landing-card-header-info">
                                <div className="landing-card-title">Study Mode</div>
                                <div className="landing-card-tag" style={{ color: studyIconColor, borderColor: 'rgba(0, 172, 141, 0.3)' }}>
                                    Recommended
                                </div>
                            </div>
                            <div className="landing-card-chevron">
                                <ChevronRightIcon sx={{ fontSize: 22, color: '#888' }} />
                            </div>
                        </div>
                        <div className="landing-card-desc">
                            Explore canonical opening lines move-by-move with Stockfish evaluations and branching catalogs.
                        </div>
                        <div className="landing-card-pill-row">
                            {openingPills.map((name) => (
                                <span key={name} className="landing-pill">{name}</span>
                            ))}
                            <span className="landing-pill">Full Lines</span>
                        </div>
                    </div>
                </Link>

                {/* Trainer Card */}
                <Link to="/trainer" className="landing-card-link">
                    <div className="landing-card landing-card-trainer">
                        <div className="landing-card-top">
                            <div className="landing-card-icon-wrap" style={{ backgroundColor: trainerIconColor }}>
                                <SportsEsportsIcon sx={{ fontSize: 32, color: iconSecondaryColor }} />
                            </div>
                            <div className="landing-card-header-info">
                                <div className="landing-card-title">Trainer Mode</div>
                                <div className="landing-card-tag" style={{ color: trainerIconColor, borderColor: 'rgba(35, 181, 239, 0.3)' }}>
                                    Practice
                                </div>
                            </div>
                            <div className="landing-card-chevron">
                                <ChevronRightIcon sx={{ fontSize: 22, color: '#888' }} />
                            </div>
                        </div>
                        <div className="landing-card-desc">
                            Drill move orders against computer responses to lock opening theory into muscle memory.
                        </div>
                        <div className="landing-card-pill-row">
                            <span className="landing-pill">Interactive</span>
                            <span className="landing-pill">Instant Feedback</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Quick Stats Summary Footer */}
            <div className="landing-stats-section">
                <div className="landing-stats-title">REPERTOIRE STATUS</div>
                <div className="landing-stats-grid">
                    <div className="landing-stat-box">
                        <div className="landing-stat-icon">
                            <MenuBookIcon sx={{ fontSize: 18, color: studyIconColor }} />
                        </div>
                        <div className="landing-stat-value">{openingCount || 3}</div>
                        <div className="landing-stat-label">Openings</div>
                    </div>
                    <div className="landing-stat-box">
                        <div className="landing-stat-icon">
                            <AutoGraphIcon sx={{ fontSize: 18, color: '#F0D9B5' }} />
                        </div>
                        <div className="landing-stat-value">{totalPlies || 157}</div>
                        <div className="landing-stat-label">Total Plies</div>
                    </div>
                    <div className="landing-stat-box">
                        <div className="landing-stat-icon">
                            <SpeedIcon sx={{ fontSize: 18, color: trainerIconColor }} />
                        </div>
                        <div className="landing-stat-value">+0.22</div>
                        <div className="landing-stat-label">Avg Stockfish</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
