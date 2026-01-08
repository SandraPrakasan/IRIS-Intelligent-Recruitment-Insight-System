import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ThumbsUp, ThumbsDown, BrainCircuit } from 'lucide-react';

const CandidateDrawer = ({ isOpen, onClose, candidate }) => {
  if (!candidate) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 40
            }}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100%',
              width: '100%',
              maxWidth: '500px',
              
              // === 🎨 CSS-ONLY BACKGROUND (No Image Needed) ===
              backgroundColor: '#0f172a', // Base Dark Slate Color
              backgroundImage: `
                radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.25) 0px, transparent 50%), 
                radial-gradient(at 100% 100%, rgba(239, 68, 68, 0.25) 0px, transparent 50%),
                linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)
              `,
              // 1. Blue Glow (Top Left)
              // 2. Red Glow (Bottom Right)
              // 3. Subtle Diagonal Sheen
              
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              zIndex: 50,
              overflowY: 'auto',
              boxShadow: '-10px 0 25px rgba(0,0,0,0.5)'
            }}
          >
            {/* Content Container */}
            <div style={{ padding: '2rem' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>{candidate.name}</h2>
                  <p style={{ color: '#94a3b8' }}>{candidate.role} • {candidate.experience}</p>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              {/* Match Score Bar */}
              <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#EF4444' }}>AI Match Score</span>
                  <span style={{ fontWeight: 'bold', color: 'white' }}>{candidate.matchScore || 0}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${candidate.matchScore || 0}%` }} 
                    transition={{ delay: 0.2, duration: 1 }}
                    style={{ height: '100%', backgroundColor: '#EF4444', borderRadius: '3px', boxShadow: '0 0 10px rgba(239,68,68,0.5)' }} 
                  />
                </div>
              </div>

              {/* AI Insights Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                  <BrainCircuit size={18} color="#EF4444" /> AI Insights
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {candidate.insights?.strengths?.map((str, i) => (
                        <div key={`str-${i}`} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                            <ThumbsUp size={16} color="#34d399" style={{ marginTop: '3px', flexShrink: 0 }} />
                            <span>{str}</span>
                        </div>
                    ))}
                    {candidate.insights?.weaknesses?.map((wk, i) => (
                        <div key={`wk-${i}`} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                            <ThumbsDown size={16} color="#fb7185" style={{ marginTop: '3px', flexShrink: 0 }} />
                            <span>{wk}</span>
                        </div>
                    ))}
                </div>
              </div>

              {/* Resume Summary */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', marginBottom: '0.75rem' }}>Resume Summary</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {candidate.summary || "No summary available."}
                </p>
              </div>

              {/* Portfolio & Projects */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', marginBottom: '0.75rem' }}>Portfolio & Projects</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {candidate.projects?.map((project, i) => (
                    <a key={i} href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', transition: 'background-color 0.2s' }}>
                      {project} <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              </div>

               {/* Footer Actions */}
               <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1rem' }}>
                  <button style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#EF4444', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                    Full Profile
                  </button>
                  <button style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600', cursor: 'pointer' }}>
                    Download CV
                  </button>
               </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CandidateDrawer;