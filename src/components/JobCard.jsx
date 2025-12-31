import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SpinnerIcon } from './Icons';

const JobCard = ({ title, company, location, salary, type, description }) => {
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    const handleApply = () => {
        setIsApplying(true);
        setTimeout(() => {
            setIsApplying(false);
            setHasApplied(true);
        }, 1500);
    };
    
    const tags = [company, type].filter(Boolean);

    return (
    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
             {tags.map(tag => (<span key={tag} style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#FCD34D', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500' }}>{tag}</span>))}
        </div>
        <p style={{ color: '#d1d5db' }}><strong>Location:</strong> {location}</p>
        <p style={{ color: '#d1d5db' }}><strong>Salary:</strong> {salary}</p>
        <p style={{ color: '#d1d5db', borderLeft: '2px solid #FBBF24', paddingLeft: '1rem', fontStyle: 'italic' }}>{description ? description.substring(0, 100) + '...' : 'No description available.'}</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid #FBBF24', color: '#FCD34D', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>View Details</motion.button>
            <motion.button onClick={handleApply} disabled={isApplying || hasApplied} whileHover={{ scale: hasApplied ? 1 : 1.03 }} whileTap={{ scale: hasApplied ? 1 : 0.98 }} style={{ flex: 1, backgroundColor: hasApplied ? '#10B981' : '#FBBF24', color: hasApplied ? 'white' : '#1a202c', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: hasApplied ? 'not-allowed' : 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isApplying && <SpinnerIcon />}
                {isApplying ? 'Applying...' : hasApplied ? 'Applied' : 'Apply Now'}
            </motion.button>
        </div>
    </div>
)};

export default JobCard;


