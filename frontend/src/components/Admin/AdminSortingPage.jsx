import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient'; 
import CandidateDrawer from '../CandidateDrawer'; 

// ✅ IMPORT ICONS FROM YOUR SEPARATE FILE
import { 
    FilterIcon, ScoringIcon, ClearIcon, ViewIcon, 
    ChevronDownIcon, SearchIcon, ChevronLeftIcon, 
    ChevronRightIcon, CheckSquareIcon, MailIcon, LoaderIcon 
} from '../../components/Icons'; 

// --- REUSABLE BUTTON COMPONENT ---
const BulkActionButton = ({ Icon, label, color, onClick }) => {
    const [hover, setHover] = useState(false);
    return (
        <motion.button
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            layout
            style={{
                display: 'flex', alignItems: 'center',
                backgroundColor: hover ? color : 'rgba(255,255,255,0.05)',
                border: `1px solid ${hover ? color : 'rgba(255,255,255,0.2)'}`,
                borderRadius: '20px', padding: '0.5rem',
                height: '40px', minWidth: '40px',
                cursor: 'pointer', color: hover ? 'white' : '#94a3b8',
                boxShadow: hover ? `0 0 15px ${color}66` : 'none',
                justifyContent: 'center', outline: 'none'
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
            <Icon /> 
            <AnimatePresence>
                {hover && (
                    <motion.span
                        initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                        animate={{ width: 'auto', opacity: 1, marginLeft: 8 }}
                        exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                        style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '600', fontSize: '0.85rem' }}
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

// --- FILTER PANEL COMPONENT ---
const FilterPanel = ({ filters, setFilters }) => {
    const languages = ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "React", "Go", "Rust", "Swift", "Kotlin", "PHP"];
    const positions = ["Frontend Developer", "Backend Developer", "Full Stack", "UI Designer", "UX Researcher", "Data Scientist", "DevOps", "Mobile Dev", "QA Engineer"];

    const toggleItem = (category, item) => {
        const current = filters[category] || [];
        const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
        setFilters({ ...filters, [category]: updated });
    };

    return (
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: '#e2e8f0' }}>
            <div style={{ height: '1px', backgroundColor: 'rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem' }}></div>
            
            {/* Status & Score Group */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: '600' }}>Status</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {['All', 'Pending', 'Accepted', 'Rejected'].map(status => (
                            <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="radio" name="status" checked={filters.status === status} onChange={() => setFilters({ ...filters, status })} style={{ accentColor: '#EF4444' }} />
                                {status}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: '600' }}>Min. Match Score</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input type="range" min="0" max="100" value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })} style={{ width: '100%', accentColor: '#EF4444', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                        <span style={{ fontWeight: 'bold', color: '#EF4444', minWidth: '3rem' }}>{filters.minScore}%</span>
                    </div>
                </div>
            </div>

            {/* List Group */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: '600' }}>Languages</h4>
                    <div className="hide-scrollbar" style={{ height: '150px', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {languages.map(lang => (
                                <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', padding: '4px', borderRadius: '4px', backgroundColor: (filters.languages || []).includes(lang) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                                    <input type="checkbox" checked={(filters.languages || []).includes(lang)} onChange={() => toggleItem('languages', lang)} style={{ accentColor: '#EF4444' }} />
                                    <span style={{ color: (filters.languages || []).includes(lang) ? '#EF4444' : 'inherit' }}>{lang}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: '600' }}>Job Positions</h4>
                    <div className="hide-scrollbar" style={{ height: '150px', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                            {positions.map(pos => (
                                <label key={pos} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', padding: '4px', borderRadius: '4px', backgroundColor: (filters.positions || []).includes(pos) ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                                    <input type="checkbox" checked={(filters.positions || []).includes(pos)} onChange={() => toggleItem('positions', pos)} style={{ accentColor: '#EF4444' }} />
                                    <span style={{ color: (filters.positions || []).includes(pos) ? '#EF4444' : 'inherit' }}>{pos}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SCORING PANEL COMPONENT ---
const ScoringPanel = ({ config, setConfig, onReset, onClose }) => {
    const handleChange = (key, value) => setConfig({ ...config, [key]: parseInt(value) });
    
    // Internal slider for this component
    const ConfigSlider = ({ label, value, min, max, onChangeKey }) => (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#e2e8f0' }}>{label}</span>
                <span style={{ fontWeight: 'bold', color: '#EF4444' }}>{value}</span>
            </div>
            <input type="range" min={min} max={max} value={value} onChange={(e) => handleChange(onChangeKey, e.target.value)} style={{ width: '100%', accentColor: '#EF4444', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
        </div>
    );

    return (
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
            <div style={{ height: '1px', backgroundColor: 'rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <ConfigSlider label="Skills Weight" value={config.skillsWeight} min={1} max={10} onChangeKey="skillsWeight" />
                    <ConfigSlider label="Experience Weight" value={config.experienceWeight} min={1} max={10} onChangeKey="experienceWeight" />
                </div>
                <div>
                    <ConfigSlider label="Certification Bonus" value={config.certBonus} min={0} max={50} onChangeKey="certBonus" />
                    <ConfigSlider label="Languages Weight" value={config.langWeight} min={1} max={10} onChangeKey="langWeight" />
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                 <button onClick={onReset} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Reset Default</button>
                 <button onClick={onClose} style={{ backgroundColor: '#EF4444', border: 'none', color: 'white', padding: '0.4rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Apply</button>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function AdminSortingPage() {
    const [applicants, setApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openPanel, setOpenPanel] = useState(null); 
    const [searchQuery, setSearchQuery] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerCandidate, setDrawerCandidate] = useState(null);
    
    // Pagination & Selection
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [selectedIds, setSelectedIds] = useState([]);

    // Filters
    const initialFilters = { sortBy: 'Match Score', status: 'All', minScore: 0, languages: [], positions: [] };
    const [filters, setFilters] = useState(initialFilters);

    // Scoring
    const defaultScoring = { skillsWeight: 2, experienceWeight: 5, certBonus: 15, langWeight: 1 };
    const [scoringConfig, setScoringConfig] = useState(defaultScoring);

    //candidate overview
    const handleViewCandidate = (candidate) => {
        setDrawerCandidate(candidate);
        setIsDrawerOpen(true);
    };

    // --- DATA FETCHING (Supabase) ---
    useEffect(() => {
        const fetchApplicants = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('applications')
                    .select(`
                    id, 
                    created_at, 
                    status, 
                    score: match_score, 
                    skills,
                    profiles ( full_name, email, avatar_url,experience_years ),
                    jobs ( title )
                    `);
                
                if (error) throw error;

                const formattedData = data.map(app => ({
                    id: app.id,
                    name: app.profiles?.full_name || 'Unknown Candidate',
                    email: app.profiles?.email || 'No Email',
                    img: app.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.profiles?.full_name || 'User')}&background=random`,
                    jobTitle: app.jobs?.title || app.profiles?.job_title || 'Applicant',
                    experience: parseInt(app.profiles?.experience_years) || 'Fresher',
                    skills: app.skills || [],
                    status: app.status,
                    score: app.score || 0
                }));
                
                setApplicants(formattedData);
            } catch (error) {
                console.error('Error fetching applicants:', error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplicants();
    }, []);

    // --- BULK ACTIONS ---
    const handleBulkReject = async () => {
        if (!confirm(`Are you sure you want to REJECT ${selectedIds.length} candidates?`)) return;

     try {
            const { error } = await supabase
                .from('applications')
                .update({ status: 'Rejected' }) // Update status to Rejected
                .in('id', selectedIds);
        if (error) throw error;

        // Update UI instantly
        setApplicants(prev => prev.map(app => 
            selectedIds.includes(app.id) ? { ...app, status: 'Rejected' } : app
        ));
        
        setSelectedIds([]); // Clear selection
        alert('Candidates Rejected.');
    } catch (error) {
            console.error('Error rejecting:', error.message);
            alert('Failed to reject.');
        }
    };



    const handleBulkApprove = async () => {
        if (!confirm(`Are you sure you want to approve ${selectedIds.length} candidates?`)) return;
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: 'Accepted' })
                .in('id', selectedIds);

            if (error) throw error;

            setApplicants(prev => prev.map(app => 
                selectedIds.includes(app.id) ? { ...app, status: 'Accepted' } : app
            ));
            setSelectedIds([]);
            alert('Approved Successfully!');
        } catch (error) {
            console.error('Error approving:', error.message);
            alert('Failed to update.');
        }
    };

    const handleBulkEmail = () => {
        const emails = applicants.filter(a => selectedIds.includes(a.id)).map(a => a.email).join(',');
        window.location.href = `mailto:?bcc=${emails}&subject=Interview Update`;
    };

    // --- SORTING & FILTERING ---
    const filteredApplicants = useMemo(() => {
        return applicants.filter(app => {
            const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || (app.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filters.status === 'All' || app.status === filters.status;
            const matchesScore = (app.score || 0) >= filters.minScore;
            
            const matchesLang = (filters.languages || []).length === 0 || (filters.languages || []).some(l => (app.skills || []).includes(l));
            const matchesPos = (filters.positions || []).length === 0 || (filters.positions || []).includes(app.jobTitle);

            return matchesSearch && matchesStatus && matchesScore && matchesLang && matchesPos;
        }).sort((a, b) => {
            if (filters.sortBy === 'Match Score') return (b.score || 0) - (a.score || 0);
            if (filters.sortBy === 'Experience') return (b.experience || 0) - (a.experience || 0);
            if (filters.sortBy === 'Name') return a.name.localeCompare(b.name);
            return 0; 
        });
    }, [searchQuery, filters, applicants]);

    // Check if every single selected person is already 'Accepted'
        const allSelectedAreApproved = selectedIds.length > 0 && selectedIds.every(id => {
        const applicant = applicants.find(app => app.id === id);
        return applicant?.status === 'Accepted'; // Make sure this matches your DB value ('Accepted' or 'Approved')
    });

    // --- PAGINATION & SELECTION UTILS ---
    const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
    const paginatedApplicants = filteredApplicants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedApplicants.length && paginatedApplicants.length > 0) {
            setSelectedIds([]); 
        } else {
            setSelectedIds(paginatedApplicants.map(a => a.id)); 
        }
    };

    const toggleSelectRow = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(sid => sid !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const togglePanel = (panelName) => {
        if (openPanel === panelName) setOpenPanel(null);
        else setOpenPanel(panelName);
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
             <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>

            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>CV Sorting</h1>
            </header>

            {/* Controls Bar */}
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flexGrow: 1 }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><SearchIcon /></div>
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }} />
                    </div>
                    <motion.button onClick={() => togglePanel('filter')} whileHover={{ scale: 1.02 }} style={{ backgroundColor: openPanel === 'filter' ? '#EF4444' : 'rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                        <FilterIcon /> Filters <ChevronDownIcon isOpen={openPanel === 'filter'} />
                    </motion.button>
                    <motion.button onClick={() => togglePanel('scoring')} whileHover={{ scale: 1.02 }} style={{ backgroundColor: openPanel === 'scoring' ? '#EF4444' : 'rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                        <ScoringIcon /> Scoring <ChevronDownIcon isOpen={openPanel === 'scoring'} />
                    </motion.button>
                     <motion.button onClick={() => { setSearchQuery(''); setFilters({ sortBy: 'Match Score', status: 'All', minScore: 0, languages: [], positions: [] }); }} whileHover={{ scale: 1.02 }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ClearIcon /> Clear
                    </motion.button>
                </div>
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort By</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['Match Score', 'Experience', 'Name', 'Date'].map(opt => (
                            <button key={opt} onClick={() => setFilters({ ...filters, sortBy: opt })} style={{ padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: filters.sortBy === opt ? '#EF4444' : 'transparent', color: 'white', border: filters.sortBy === opt ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.2)', fontWeight: filters.sortBy === opt ? '600' : 'normal', transition: 'all 0.2s' }}>{opt}</button>
                        ))}
                    </div>
                </div>
                <AnimatePresence>
                    {openPanel === 'filter' && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)' }}><FilterPanel filters={filters} setFilters={setFilters} /></motion.div>}
                    {openPanel === 'scoring' && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)' }}><ScoringPanel config={scoringConfig} setConfig={setScoringConfig} onReset={() => setScoringConfig(defaultScoring)} onClose={() => setOpenPanel(null)} /></motion.div>}
                </AnimatePresence>
            </div>

            {/* Results Table */}
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem', overflow: 'hidden', position: 'relative', minHeight: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Applications <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'normal' }}>({filteredApplicants.length})</span></h2>
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>{selectedIds.length} Selected</span>
                                <BulkActionButton 
                                    // IF everyone is approved, show 'Reject' icon/label. ELSE show 'Accept'.
                                    // ✅ FIXED: Uses the component names directly
                                    Icon={allSelectedAreApproved ? ClearIcon : CheckSquareIcon} 
                                    label={allSelectedAreApproved ? "Reject" : "Accept"} 
                                    color={allSelectedAreApproved ? "#ef4444" : "#10b981"} // Red if rejecting, Green if accepting
                                    onClick={allSelectedAreApproved ? handleBulkReject : handleBulkApprove} 
                                />
                                <BulkActionButton Icon={MailIcon} label="Email" color="#3b82f6" onClick={handleBulkEmail} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#EF4444' }}>
                        <LoaderIcon />
                    </div>
                ) : (
                    <>
                    <div className="hide-scrollbar" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ color: '#9ca3af', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '0 0 1rem 1rem', width: '40px' }}><input type="checkbox" checked={paginatedApplicants.length > 0 && selectedIds.length === paginatedApplicants.length} onChange={toggleSelectAll} style={{ accentColor: '#EF4444', cursor: 'pointer', width: '16px', height: '16px' }} /></th>
                                    <th style={{ padding: '0 1rem 1rem 0' }}>Applicant</th>
                                    <th style={{ padding: '0 1rem 1rem 1rem' }}>Experience</th>
                                    <th style={{ padding: '0 1rem 1rem 1rem' }}>Job Title</th>
                                    <th style={{ padding: '0 1rem 1rem 1rem' }}>Score</th>
                                    <th style={{ padding: '0 1rem 1rem 1rem' }}>Status</th>
                                    <th style={{ padding: '0 1rem 1rem 1rem', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {paginatedApplicants.map((app) => {
                                        const isSelected = selectedIds.includes(app.id);
                                        return (
                                            <motion.tr 
                                                key={app.id} 
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ scale: 1.005, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                                style={{ backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)', borderRadius: '8px', cursor: 'pointer', border: isSelected ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent' }}
                                                onClick={() => toggleSelectRow(app.id)}
                                            >
                                                <td style={{ padding: '1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                                                    <input type="checkbox" checked={isSelected} onChange={(e) => { e.stopPropagation(); toggleSelectRow(app.id); }} style={{ accentColor: '#EF4444', cursor: 'pointer', width: '16px', height: '16px' }} />
                                                </td>
                                                <td style={{ padding: '1rem 1rem 1rem 0' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <img src={app.img} alt={app.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                        <div><p style={{ fontWeight: 'bold', color: 'white' }}>{app.name}</p><p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{app.email}</p></div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#d1d5db' }}>{app.experience} years</td>
                                                <td style={{ padding: '1rem', color: '#d1d5db' }}>{app.jobTitle}</td>
                                                <td style={{ padding: '1rem' }}><span style={{ fontWeight: 'bold', color: (app.score || 0) > 80 ? '#34d399' : '#fbbf24' }}>{app.score || 0}</span></td>
                                                <td style={{ padding: '1rem' }}><span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', backgroundColor: app.status === 'Accepted' ? 'rgba(52, 211, 153, 0.2)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: app.status === 'Accepted' ? '#34d399' : app.status === 'Rejected' ? '#ef4444' : '#fbbf24' }}>{app.status}</span></td>
                                                <td style={{ padding: '1rem', textAlign: 'right', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleViewCandidate(app); }} 
                                                        style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                                                        title="View Details"
                                                    >
                                                        <ViewIcon />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredApplicants.length)} of {filteredApplicants.length}</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: 'none', color: currentPage === 1 ? '#525252' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}><ChevronLeftIcon /></button>
                                <span style={{ padding: '0.5rem 1rem', background: '#EF4444', borderRadius: '6px', fontSize: '0.85rem', color: 'white', fontWeight: 'bold' }}>{currentPage}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: 'none', color: currentPage === totalPages ? '#525252' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}><ChevronRightIcon /></button>
                            </div>
                        </div>
                    )}
                    </>
                )}
            </div>

            {/* Render the Drawer specifically for the sorting page */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <CandidateDrawer 
                        isOpen={isDrawerOpen} 
                        onClose={() => setIsDrawerOpen(false)} 
                        candidate={drawerCandidate} 
                    />
                )}
            </AnimatePresence>

        </div>
    );
}