import React from 'react';
import { motion } from 'framer-motion';

// --- Icons ---
const BuildingIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px'}}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line><path d="M5 12h14"></path><path d="M5 7h14"></path><path d="M5 17h14"></path></svg>);
const LocationIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>);
const MoneyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px'}}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>);
const CheckIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);
// ✅ NEW: Trash Icon
const TrashIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);

const JobCard = ({ id, title, company, logo, location, salary, type, postedAt, deadline, onViewDetails, onApply, onWithdraw, isApplied, isApplying }) => {
    return (
        <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column',
            gap: '1rem', height: '100%', position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {logo ? <img src={logo} alt={company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem' }}>🏢</span>}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', margin: 0, lineHeight: '1.4' }}>{title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#FBBF24', fontWeight: '600', marginTop: '0.25rem' }}><BuildingIcon /> {company}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#9ca3af' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}><LocationIcon /> {location}</span>
                <span style={{ display: 'flex', alignItems: 'center' }}><MoneyIcon /> {salary}</span>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', borderRadius: '999px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>{type}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '500' }}>Deadline: {deadline}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                    onClick={onViewDetails} 
                    style={{ flex: 1, padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid #4b5563', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}
                >
                    Details
                </button>
                
                {/* ✅ UPDATED: If applied, show "Withdraw" button instead of just "Applied" */}
                {isApplied ? (
                    <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                        <div style={{ flex: 1, padding: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#34D399', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Applied
                        </div>
                        <button 
                            onClick={() => onWithdraw(id)}
                            title="Withdraw Application"
                            style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <TrashIcon />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => onApply(id)} 
                        disabled={isApplying}
                        style={{ 
                            flex: 1, padding: '0.5rem', 
                            backgroundColor: isApplying ? '#4b5563' : '#FBBF24', 
                            border: 'none', 
                            color: isApplying ? '#d1d5db' : '#1a202c', 
                            borderRadius: '0.5rem', fontWeight: 'bold', 
                            cursor: isApplying ? 'not-allowed' : 'pointer' 
                        }}
                    >
                        {isApplying ? '...' : 'Apply'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default JobCard;