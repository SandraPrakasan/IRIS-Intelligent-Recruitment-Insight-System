import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient'; 
import { motion, AnimatePresence } from 'framer-motion';

export default function TopPerformers() {
    // --- STATE ---
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    
    // Slider Config State
    const [config, setConfig] = useState({
        skillsWeight: 2,
        experienceWeight: 5,
        certificationBonus: 15,
        referencesBonus: 10
    });

    const handleConfigChange = (key, e) => {
        setConfig({ ...config, [key]: parseInt(e.target.value) });
    };

    // --- DUMMY DATA (Fallback) ---
    const dummyCandidates = [
        { 
            id: 'd1', experience: 8, 
            profiles: { full_name: 'Elena Martinez', avatar_url: 'https://i.pravatar.cc/150?u=elena' }, 
            jobs: { title: 'Data Scientist' } 
        },
        { 
            id: 'd2', experience: 5, 
            profiles: { full_name: 'Sarah Johnson', avatar_url: 'https://i.pravatar.cc/150?u=sarah' }, 
            jobs: { title: 'UX/UI Designer' } 
        },
        { 
            id: 'd3', experience: 12, 
            profiles: { full_name: 'Rayyan Ali', avatar_url: 'https://i.pravatar.cc/150?u=rayyan' }, 
            jobs: { title: 'Senior Developer' } 
        },
        { 
            id: 'd4', experience: 3, 
            profiles: { full_name: 'Iffah Fathima', avatar_url: 'https://i.pravatar.cc/150?u=iffah' }, 
            jobs: { title: 'Frontend Intern' } 
        },
        { 
            id: 'd5', experience: 6, 
            profiles: { full_name: 'Varun Nair', avatar_url: null }, // Test no avatar
            jobs: { title: 'Product Manager' } 
        }
    ];

    // --- SUPABASE DATA FETCHING ---
    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const { data, error } = await supabase
                    .from('applications')
                    .select(`
                        id, experience,
                        profiles ( full_name, avatar_url ),
                        jobs ( title )
                    `)
                    .limit(7); 

                if (error) {
                    console.error("Supabase error, using dummy data:", error);
                    setCandidates(dummyCandidates); // Fallback on error
                } else if (data && data.length > 0) {
                    setCandidates(data);
                } else {
                    setCandidates(dummyCandidates); // Fallback if empty
                }
            } catch (error) {
                console.error('Fetch error, using dummy data:', error);
                setCandidates(dummyCandidates);
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, []);

    // --- STYLES ---
    const containerStyle = {
        backgroundColor: 'rgba(239, 68, 68, 0.05)', 
        border: '1px solid rgba(239, 68, 68, 0.2)', 
        borderRadius: '1rem',
        padding: '1.5rem',
        color: 'white',
        height: '100%',
        fontFamily: 'sans-serif'
    };

    const configBoxStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.3)', 
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        marginTop: '0.5rem'
    };

    const labelRowStyle = {
        display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem',
        fontSize: '0.85rem', fontWeight: '500', color: '#D1D5DB'
    };

    const getSliderStyle = (value, max) => {
        const percentage = (value / max) * 100;
        return {
            width: '100%', height: '6px', borderRadius: '3px',
            background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${percentage}%, #374151 ${percentage}%, #374151 100%)`,
            appearance: 'none', outline: 'none', cursor: 'pointer'
        };
    };

    return (
        <div style={containerStyle}>
            
            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Top Performers</h2>
                
                <button 
                    onClick={() => setShowConfig(!showConfig)}
                    style={{ 
                        background: 'none', border: 'none', 
                        color: showConfig ? '#EF4444' : '#9CA3AF', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.9rem', fontWeight: '500'
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>⚙</span>
                    {showConfig ? "Hide" : "Config"}
                </button>
            </div>
            
            <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '1.5rem', marginTop: '0.25rem' }}>
                Outstanding candidates by match score
            </p>

            {/* --- CONFIGURATION PANEL --- */}
            <AnimatePresence>
                {showConfig && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={configBoxStyle}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#F3F4F6' }}>Scoring Weights</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <div style={labelRowStyle}>
                                        <span>Skills</span> <span style={{ color: '#EF4444' }}>{config.skillsWeight}</span>
                                    </div>
                                    <input type="range" max="10" value={config.skillsWeight} onChange={(e) => handleConfigChange('skillsWeight', e)} style={getSliderStyle(config.skillsWeight, 10)} className="custom-range" />
                                </div>
                                <div>
                                    <div style={labelRowStyle}>
                                        <span>Experience</span> <span style={{ color: '#EF4444' }}>{config.experienceWeight}</span>
                                    </div>
                                    <input type="range" max="10" value={config.experienceWeight} onChange={(e) => handleConfigChange('experienceWeight', e)} style={getSliderStyle(config.experienceWeight, 10)} className="custom-range" />
                                </div>
                                <div>
                                    <div style={labelRowStyle}>
                                        <span>Certification</span> <span style={{ color: '#EF4444' }}>{config.certificationBonus}</span>
                                    </div>
                                    <input type="range" max="30" value={config.certificationBonus} onChange={(e) => handleConfigChange('certificationBonus', e)} style={getSliderStyle(config.certificationBonus, 30)} className="custom-range" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- CANDIDATES LIST --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading ? (
                    <p style={{ color: '#6B7280', textAlign: 'center' }}>Loading...</p>
                ) : candidates.map((item, index) => {
                    const name = item.profiles?.full_name || 'Candidate';
                    const role = item.jobs?.title || 'Applicant';
                    const exp = item.experience ? `${item.experience} yrs` : 'N/A';
                    const score = 90 - (index * 5); 

                    return (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {/* Avatar */}
                                {item.profiles?.avatar_url ? (
                                    <img src={item.profiles.avatar_url} alt={name} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #374151' }} />
                                ) : (
                                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                        {name.charAt(0)}
                                    </div>
                                )}
                                
                                {/* Text Info */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: '600', fontSize: '1rem' }}>{name}</span>
                                        <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', color: '#D1D5DB' }}>
                                            Score: {score}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '2px' }}>
                                        {role} • {exp} • <span style={{ color: '#34D399' }}>Certified</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button style={{ 
                                padding: '0.4rem 1rem', borderRadius: '2rem', 
                                border: '1px solid #EF4444', background: 'transparent', 
                                color: 'white', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '500',
                                transition: '0.2s'
                            }}>
                                View
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Slider CSS Injection */}
            <style>{`
                .custom-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 14px; height: 14px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #EF4444;
                    cursor: pointer;
                    margin-top: -4px;
                }
            `}</style>
        </div>
    );
}