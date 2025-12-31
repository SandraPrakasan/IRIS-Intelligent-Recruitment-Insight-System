import React from 'react';

const PlaceholderContent = ({ title, message, icon }) => (
    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '1rem', padding: '4rem', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{title}</h2>
        <p style={{ color: '#d1d5db', marginTop: '0.5rem' }}>{message}</p>
    </div>
);

export default PlaceholderContent;


