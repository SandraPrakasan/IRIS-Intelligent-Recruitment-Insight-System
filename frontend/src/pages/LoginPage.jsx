import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function LoginPage({ onNavigate }) {
  // A RoleCard component that accepts a 'tint' prop for different color schemes
  const RoleCard = ({ title, description, buttonText, role, tint }) => {
    
    const handleNavigationClick = () => {
        if (typeof onNavigate === 'function') {
            onNavigate(role);
        } else {
            console.error("Error: onNavigate prop is missing or not a function. Navigation is disabled.");
        }
    };

    const tintStyles = {
      yellow: {
        card: {
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        },
        button: {
          backgroundColor: '#FBBF24',
          color: '#1a202c',
        }
      },
      red: {
        card: {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        },
        button: {
          backgroundColor: '#EF4444',
          color: 'white',
        }
      },
    };

    const currentStyle = tintStyles[tint] || {};

    return (
      <div style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: '1rem',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          padding: '2.5rem',
          textAlign: 'center',
          zIndex: 10,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          ...currentStyle.card
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>{description}</p>
        <motion.button 
          onClick={handleNavigationClick} 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            fontWeight: 'bold',
            padding: '0.75rem 0',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            ...currentStyle.button
          }}
        >
          {buttonText}
        </motion.button>
      </div>
    );
  };

  // Animation variants for the main container to stagger its children
  const containerVariants = {
    hidden: { opacity: 1 }, // Parent is visible, children are not
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Time between each child animation
      }
    }
  };

  // Animation variant for the title (fades in from the left)
  const titleVariant = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  // Animation variant for the admin card (fades in from the top)
  const adminCardVariant = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Animation variant for the applicant card (fades in from the bottom)
  const applicantCardVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'hidden',
        backgroundColor: '#020617',
        color: 'white',
        fontFamily: "'Montserrat', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Orbitron:wght@700&display=swap');`}</style>
      
      {/* Background shapes updated to red and yellow */}
      <>
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, width: '400px', height: '400px', backgroundColor: '#EF4444', top: '-50px', left: '-100px' }}></div>
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, width: '400px', height: '400px', backgroundColor: '#FBBF24', bottom: '-80px', right: '-120px' }}></div>
      </>
      
      {/* Main animation container */}
      <motion.div 
        style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={titleVariant}
          style={{
            flex: '1 1 500px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            zIndex: 5,
          }}>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(3rem, 10vw, 5rem)', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>IRIS</h1>
            <p style={{ fontSize: '1.125rem', color: '#a8b2d1' }}>Intelligent Resume Shortlisting Platform</p>
        </motion.div>
        
        <div style={{
            flex: '1 1 500px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            gap: '2rem',
        }}>
          <motion.div variants={adminCardVariant} style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
              <RoleCard title="Admin" description="Manage CVs and requirements" buttonText="Continue as admin" role="admin" tint="red" />
          </motion.div>
          
          <motion.div variants={applicantCardVariant} style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
              <RoleCard title="Applicant" description="Submit your CV" buttonText="Continue as applicant" role="applicant" tint="yellow" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
