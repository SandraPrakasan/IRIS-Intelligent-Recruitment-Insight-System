import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopPerformersSection() {
    // 1. Toggle for the Configuration Panel
    const [showConfig, setShowConfig] = useState(true);

    // 2. State for Slider Values
    const [config, setConfig] = useState({
        skillsWeight: 2,
        experienceWeight: 5,
        certificationBonus: 15,
        referencesBonus: 10
    });

    const handleChange = (key, e) => {
        setConfig({ ...config, [key]: parseInt(e.target.value) });
    };

    // --- STYLES (Dark Theme + Red Accents) ---
    const containerStyle = {
        backgroundColor: '#0f172a', // Dark Navy Background
        padding: '2rem',
        borderRadius: '1.5rem',
        color: 'white',
        fontFamily: 'sans-serif',
        maxWidth: '800px',
        margin: '0 auto'
    };

    const headerStyle = {
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '1.5rem'
    };

    // The "Box" for the Configuration (Inset style)
    const configBoxStyle = {
        backgroundColor: '#1e293b', // Slightly lighter dark for contrast
        border: '1px solid #334155', // Subtle border
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '2rem', // Space between config and list
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)' // Inner shadow for depth
    };

    const labelRowStyle = {
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '0.5rem',
        fontSize: '0.85rem', 
        fontWeight: '500', 
        color: '#94A3B8' // Muted text
    };

    // Helper for Red Gradient Slider
    const getSliderStyle = (value, max) => {
        const percentage = (value / max) * 100;
        return {
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${percentage}%, #334155 ${percentage}%, #334155 100%)`,
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer'
        };
    };

    // Dummy Data for the List
    const candidates = [
        { name: "Elena Martinez", role: "Data Scientist", score: 87, img: "https://i.pravatar.cc/150?u=elena" },
        { name: "Sarah Johnson", role: "UX/UI Designer", score: 81, img: "https://i.pravatar.cc/150?u=sarah" },
        { name: "Iffah Fathima", role: "Student", score: 77, img: "https://i.pravatar.cc/150?u=iffah" },
        { name: "Rayaaan", role: "Senior Developer", score: 62, img: "https://i.pravatar.cc/150?u=rayaan" }
    ];

    return (
        <div style={containerStyle}>
            
            {/* --- 1. Header Section --- */}
            <div style={headerStyle}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#F8FAFC' }}>Top Performers</h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748B', fontSize: '0.9rem' }}>
                        Outstanding candidates by skills, experience and match
                    </p>
                </div>
                
                {/* Toggle Button */}
                <button 
                    onClick={() => setShowConfig(!showConfig)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', border: 'none', color: '#EF4444', 
                        cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>⚙</span>
                    {showConfig ? "Hide Config" : "Configure"}
                </button>
            </div>

            {/* --- 2. Collapsible Configuration Box --- */}
            <AnimatePresence>
                {showConfig && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={configBoxStyle}>
                            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', color: '#E2E8F0' }}>Scoring Configuration</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Slider Item 1 */}
                                <div>
                                    <div style={labelRowStyle}>
                                        <span>Skills Weight</span>
                                        <span style={{ color: '#EF4444', fontWeight: 'bold' }}>{config.skillsWeight}</span>
                                    </div>
                                    <input type="range" min="0" max="10" value={config.skillsWeight} onChange={(e) => handleChange('skillsWeight', e)} style={getSliderStyle(config.skillsWeight, 10)} className="custom-range" />
                                </div>
                                {/* Slider Item 2 */}
                                <div>
                                    <div style={labelRowStyle}>
                                        <span>Experience Weight</span>
                                        <span style={{ color: '#EF4444', fontWeight: 'bold' }}>{config.experienceWeight}</span>
                                    </div>
                                    <input type="range" min="0" max="10" value={config.experienceWeight} onChange={(e) => handleChange('experienceWeight', e)} style={getSliderStyle(config.experienceWeight, 10)} className="custom-range" />
                                </div>
                                {/* Slider Item 3 */}
                                <div>
                                    <div style={labelRowStyle}>
                                        <span>Certification Bonus</span>
                                        <span style={{ color: '#EF4444', fontWeight: 'bold' }}>{config.certificationBonus}</span>
                                    </div>
                                    <input type="range" min="0" max="30" value={config.certificationBonus} onChange={(e) => handleChange('certificationBonus', e)} style={getSliderStyle(config.certificationBonus, 30)} className="custom-range" />
                                </div>
                                {/* Slider Item 4 */}
                                <div>
                                    <div style={labelRowStyle}>
                                        <span>References Bonus</span>
                                        <span style={{ color: '#EF4444', fontWeight: 'bold' }}>{config.referencesBonus}</span>
                                    </div>
                                    <input type="range" min="0" max="20" value={config.referencesBonus} onChange={(e) => handleChange('referencesBonus', e)} style={getSliderStyle(config.referencesBonus, 20)} className="custom-range" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- 3. Candidates List --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {candidates.map((person, index) => (
                    <div key={index} style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        padding: '1rem', backgroundColor: '#1e293b', borderRadius: '1rem', border: '1px solid #334155'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={person.img} alt={person.name} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #EF4444' }} />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#F1F5F9' }}>{person.name}</h4>
                                    <span style={{ backgroundColor: '#334155', color: '#CBD5E1', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '99px' }}>
                                        Score: {person.score}
                                    </span>
                                </div>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>{person.role}</p>
                            </div>
                        </div>
                        <button style={{ 
                            padding: '0.5rem 1.25rem', border: '1px solid #475569', borderRadius: '2rem', 
                            background: 'transparent', color: '#F1F5F9', cursor: 'pointer', fontSize: '0.85rem' 
                        }}>
                            View
                        </button>
                    </div>
                ))}
            </div>

            {/* --- Global CSS for Sliders --- */}
            <style>{`
                .custom-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px; height: 16px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #EF4444;
                    cursor: pointer;
                    margin-top: -5px;
                }
            `}</style>
        </div>
    );
}