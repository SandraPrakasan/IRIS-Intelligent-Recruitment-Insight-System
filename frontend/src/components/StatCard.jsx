import React from 'react';

const StatCard = ({ icon, value, label, tint }) => (
    <div style={{ 
        backgroundColor: `rgba(${tint}, 0.1)`, 
        border: `1px solid rgba(${tint}, 0.3)`, 
        borderRadius: '1rem', 
        padding: '1.5rem', 
        textAlign: 'center' 
    }}>
        <div style={{ color: `rgb(${tint})`, display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            {icon}
        </div>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{value}</p>
        <p style={{ color: '#d1d5db' }}>{label}</p>
    </div>
);

export default StatCard;