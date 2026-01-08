import React from 'react';

const ExperienceChart = ({ avgExperience = 0 }) => {
    // Calculate percentage for the gradient (assuming max 10 years for visual scale)
    const percentage = Math.min((avgExperience / 10) * 100, 100);
    
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '50%', 
                    background: `conic-gradient(#EF4444 0% ${percentage}%, #374151 ${percentage}% 100%)`,
                    transition: 'background 1s ease-in-out'
                }}></div>
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    width: '110px', 
                    height: '110px', 
                    backgroundColor: '#020617', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{Number(avgExperience).toFixed(1)}</p>
                    <p style={{ fontSize: '0.75rem', color: '#d1d5db', margin: 0 }}>Avg. Years</p>
                </div>
            </div>
        </div>
    );
};

export default ExperienceChart;