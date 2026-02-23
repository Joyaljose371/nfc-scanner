import React, { useState, useEffect } from 'react';

const SUBJECT_MAP = {
  "AB": ["Fr. Dr. Johnson Joseph", "Julia Macholil"],
  "OB": ["Karthika Elizabeth", "Anjitha"],
  "CD": ["Chinchu Rani Vincent", "Haritha"],
  "Counselling": ["Jishnu"]
};

const SUBJECT_LIST = Object.keys(SUBJECT_MAP);

function App() {
  const [scanResult, setScanResult] = useState(null);
  const [view, setView] = useState("dashboard");
  const [greeting, setGreeting] = useState("");
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  
  const [academicLogs, setAcademicLogs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [reminderInput, setReminderInput] = useState("");
  
  const [note, setNote] = useState("");
  const [period, setPeriod] = useState("1");
  const [subject, setSubject] = useState(SUBJECT_LIST[0]);
  const [teacher, setTeacher] = useState(SUBJECT_MAP[SUBJECT_LIST[0]][0]);

  const [searchQuery, setSearchQuery] = useState("");

  const isToday = selectedDate === todayStr;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const params = new URLSearchParams(window.location.search);
    if (params.get('id') === "321") {
      setScanResult({ id: "321", name: "Joyal Jose" });
    }
  }, []);

  useEffect(() => {
    if (scanResult) {
      const savedLogs = localStorage.getItem(`logs_${scanResult.id}_${selectedDate}`);
      const savedRem = localStorage.getItem(`reminders_${scanResult.id}`);
      setAcademicLogs(savedLogs ? JSON.parse(savedLogs) : []);
      if (savedRem) setReminders(JSON.parse(savedRem));
    }
  }, [scanResult, selectedDate]);

  useEffect(() => {
    if (scanResult) {
      localStorage.setItem(`logs_${scanResult.id}_${selectedDate}`, JSON.stringify(academicLogs));
      localStorage.setItem(`reminders_${scanResult.id}`, JSON.stringify(reminders));
    }
  }, [academicLogs, reminders, scanResult, selectedDate]);

  const availablePeriods = [1,2,3,4,5,6,7].filter(p => 
    !academicLogs.some(log => parseInt(log.period) === p)
  );

  useEffect(() => {
    if (availablePeriods.length > 0) setPeriod(availablePeriods[0].toString());
    setTeacher(SUBJECT_MAP[subject][0]);
  }, [academicLogs, subject]);

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!isToday) return;
    const newLog = {
      id: Date.now(),
      period,
      subject,
      teacher,
      note,
      date: selectedDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAcademicLogs([...academicLogs, newLog].sort((a, b) => a.period - b.period));
    setNote("");
  };

  const addReminder = () => {
    if (!reminderInput.trim()) return;
    setReminders([...reminders, { id: Date.now(), text: reminderInput }]);
    setReminderInput("");
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? 
          <mark key={i} style={{backgroundColor: '#fef08a', color: '#1a202c', borderRadius: '2px', padding: '0 2px'}}>{part}</mark> : part
        )}
      </span>
    );
  };

  const getAnalyticsAndSearch = () => {
    if (!scanResult) return { subjectStats: [], teacherStats: [], searchResults: [] };
    let allLogs = [];
    let uniqueDates = new Set();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`logs_${scanResult.id}_`)) {
        const logs = JSON.parse(localStorage.getItem(key));
        const logDate = key.split('_')[2];
        allLogs = [...allLogs, ...logs.map(l => ({...l, logDate}))];
        uniqueDates.add(logDate);
      }
    }

    const totalDays = uniqueDates.size || 0;
    const subjectStats = SUBJECT_LIST.map(sub => {
      const count = allLogs.filter(l => l.subject === sub).length;
      const percentage = totalDays > 0 ? Math.round((count / (totalDays * 7)) * 100) : 0; 
      return { name: sub, percent: percentage };
    });

    const teacherMap = {};
    allLogs.forEach(log => { teacherMap[log.teacher] = (teacherMap[log.teacher] || 0) + 1; });
    const teacherStats = Object.keys(teacherMap).map(name => ({ name, count: teacherMap[name] })).sort((a, b) => b.count - a.count).slice(0, 3);

    const searchResults = searchQuery.trim() === "" ? [] : allLogs.filter(log => 
      log.note.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ).reverse();

    return { subjectStats, teacherStats, searchResults };
  };

  // --- IMPROVED LANDING / TAP ID PAGE ---
  if (!scanResult) {
    return (
      <div style={styles.viewPort}>
        <div style={{...styles.container, justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center'}}>
           <div style={styles.scanIconContainer}>
              <div style={styles.pulseRing}></div>
              <span style={{fontSize: '50px'}}>🪪</span>
           </div>
           <h2 style={{color: '#1e3a8a', fontSize: '24px', fontWeight: '800', marginBottom: '10px'}}>Ready to Scan</h2>
           <p style={{color: '#64748b', fontSize: '15px', lineHeight: '1.5'}}>Please tap your ID card to access your academic logs and reminders.</p>
           <div style={{marginTop: '40px', fontSize: '12px', color: '#cbd5e1', fontWeight: 'bold', letterSpacing: '1.5px'}}>AWAITING AUTHENTICATION</div>
        </div>
      </div>
    );
  }

  if (view === "home") {
    const { subjectStats, teacherStats, searchResults } = getAnalyticsAndSearch();
    return (
      <div style={styles.viewPort}>
        <div style={styles.container}>
          <header style={styles.header}>
            <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
               <button onClick={() => setView('dashboard')} style={styles.backBtn}>➔</button>
               <h1 style={{...styles.studentName, margin: 0}}>Search & Stats</h1>
            </div>
            <div style={styles.searchBoxContainer}>
               <input 
                 style={styles.searchInput} 
                 placeholder="Search in notes or subjects..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               {searchQuery && <button onClick={() => setSearchQuery("")} style={styles.clearSearch}>✕</button>}
            </div>
          </header>

          <div style={styles.scrollArea}>
            {searchQuery ? (
              <section style={styles.section}>
                <p style={styles.sectionLabel}>SEARCH RESULTS ({searchResults.length})</p>
                {searchResults.length === 0 ? <p style={styles.empty}>No matching notes found.</p> : 
                  searchResults.map(result => (
                    <div key={result.id} style={styles.logCard} onClick={() => { setSelectedDate(result.logDate); setView('dashboard'); }}>
                      <div style={styles.logSide}>{highlightText(result.subject, searchQuery)}</div>
                      <div style={styles.logMain}>
                        <div style={{fontSize: '10px', color: '#1e3a8a', fontWeight: 'bold'}}>{result.logDate}</div>
                        <p style={{...styles.logNote, marginTop: '5px'}}>{highlightText(result.note, searchQuery)}</p>
                      </div>
                    </div>
                  ))
                }
              </section>
            ) : (
              <>
                <section style={styles.section}>
                  <p style={styles.sectionLabel}>SUBJECT PERCENTILE</p>
                  <div style={styles.formCard}>
                    {subjectStats.map(stat => (
                      <div key={stat.name} style={{marginBottom: '20px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                          <span style={{fontWeight: 'bold', color: '#1e3a8a'}}>{stat.name}</span>
                          <span style={{fontSize: '12px', color: '#64748b'}}>{stat.percent}%</span>
                        </div>
                        <div style={styles.graphTrack}><div style={{...styles.graphFill, width: `${stat.percent}%`}}></div></div>
                      </div>
                    ))}
                  </div>
                </section>
                <section style={styles.section}>
                  <p style={styles.sectionLabel}>TOP FACULTY</p>
                  <div style={styles.formCard}>
                    {teacherStats.map((t, i) => (
                      <div key={t.name} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none'}}>
                        <span style={{fontSize: '14px', color: '#1e293b'}}>{t.name}</span>
                        <span style={{fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a'}}>{t.count} Classes</span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={styles.topInfo}><p style={styles.greetingText}>{greeting},</p><h1 style={styles.studentName}>{scanResult.name}</h1></div>
            <button onClick={() => setView('home')} style={styles.backIconBtn}>🔍</button>
          </div>
          <div style={styles.dateSelectorPill}>
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]); }} style={styles.pillBtn}>◀</button>
            <div style={styles.dateInfo}><span style={styles.pillLabel}>{isToday ? "TODAY" : "HISTORY"}</span><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={styles.pillInput}/></div>
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]); }} style={styles.pillBtn}>▶</button>
          </div>
        </header>
        <div style={styles.scrollArea}>
          {isToday && (
            <section style={styles.section}>
              <p style={styles.sectionLabel}>NEW ENTRY</p>
              <div style={styles.formCard}>
                <div style={styles.row}>
                  <div style={{flex: 1}}><label style={styles.fieldLabel}>Period</label>
                    <select style={styles.select} value={period} onChange={e => setPeriod(e.target.value)}>{availablePeriods.map(p => <option key={p} value={p}>P {p}</option>)}</select>
                  </div>
                  <div style={{flex: 2}}><label style={styles.fieldLabel}>Subject</label>
                    <select style={styles.select} value={subject} onChange={e => setSubject(e.target.value)}>{SUBJECT_LIST.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>
                </div>
                <div style={{marginTop: '15px'}}><label style={styles.fieldLabel}>Faculty</label>
                  <select style={styles.select} value={teacher} onChange={e => setTeacher(e.target.value)}>{SUBJECT_MAP[subject].map(t => <option key={t} value={t}>{t}</option>)}</select>
                </div>
                <textarea style={styles.textarea} placeholder="Enter notes..." value={note} onChange={e => setNote(e.target.value)}/>
                <button onClick={handleAddLog} style={styles.mainBtn}>SAVE ENTRY</button>
              </div>
            </section>
          )}

          {isToday && (
             <section style={styles.section}>
               <p style={styles.sectionLabel}>REMINDERS</p>
               <div style={styles.formCard}>
                 <textarea style={{...styles.textarea, marginTop: '0px', minHeight: '60px'}} placeholder="New reminder..." value={reminderInput} onChange={e => setReminderInput(e.target.value)}/>
                 <button onClick={addReminder} style={{...styles.mainBtn, backgroundColor: '#334155'}}>ADD REMINDER</button>
               </div>
               <div style={{marginTop: '15px'}}>
                 {reminders.map(r => (
                   <div key={r.id} style={styles.reminderItem}><span>📌 {r.text}</span><button style={styles.delBtn} onClick={() => setReminders(reminders.filter(i => i.id !== r.id))}>✕</button></div>
                 ))}
               </div>
             </section>
          )}

          {!isToday && <div style={styles.archiveBanner}>🕒 Archive: {selectedDate}</div>}
          <section style={styles.section}>
            <p style={styles.sectionLabel}>TIMELINE</p>
            {academicLogs.length === 0 ? <p style={styles.empty}>No logs for this date.</p> : 
              academicLogs.map(log => (
                <div key={log.id} style={styles.logCard}>
                  <div style={styles.logSide}>P{log.period}</div>
                  <div style={styles.logMain}>
                    <div style={styles.logHeader}><span style={styles.logSubject}>{log.subject}</span>{isToday && <button onClick={() => setAcademicLogs(academicLogs.filter(l => l.id !== log.id))} style={styles.del}>✕</button>}</div>
                    <p style={styles.logTeacher}>{log.teacher}</p>
                    {log.note && <p style={styles.logNote}>{log.note}</p>}
                  </div>
                </div>
              ))
            }
          </section>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(30, 58, 138, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(30, 58, 138, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(30, 58, 138, 0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  viewPort: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', backgroundColor: '#f0f4f8', position: 'fixed', top: 0, left: 0, fontFamily: 'Inter, sans-serif' },
  container: { width: '100%', maxWidth: '420px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' },
  scanIconContainer: { position: 'relative', width: '100px', height: '100px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' },
  pulseRing: { position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', animation: 'pulse 2s infinite' },
  header: { padding: '40px 25px 30px 25px', backgroundColor: '#1e3a8a', color: '#fff', borderBottomLeftRadius: '35px', borderBottomRightRadius: '35px' },
  topInfo: { textAlign: 'left' },
  greetingText: { fontSize: '14px', opacity: 0.8, margin: 0 },
  studentName: { fontSize: '28px', fontWeight: '800', margin: '5px 0 0 0' },
  backIconBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', padding: '10px', borderRadius: '12px', fontSize: '20px', cursor: 'pointer' },
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', transform: 'rotate(180deg)' },
  searchBoxContainer: { position: 'relative', marginTop: '10px' },
  searchInput: { width: '100%', padding: '12px 40px 12px 15px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#1a202c', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  clearSearch: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  graphTrack: { width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' },
  graphFill: { height: '100%', backgroundColor: '#1e3a8a', borderRadius: '10px' },
  dateSelectorPill: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50px', padding: '5px', marginTop: '20px' },
  pillBtn: { background: 'none', border: 'none', color: '#fff', padding: '10px 20px', cursor: 'pointer' },
  dateInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, textAlign: 'center' }, 
  pillLabel: { fontSize: '9px', fontWeight: 'bold', color: '#60a5fa' },
  pillInput: { background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', outline: 'none', width: '100%' },
  scrollArea: { flex: 1, overflowY: 'auto', padding: '25px' },
  section: { marginBottom: '35px' },
  sectionLabel: { fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '1px', marginBottom: '10px' },
  formCard: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' },
  fieldLabel: { fontSize: '11px', color: '#64748b', marginBottom: '5px', display: 'block' },
  row: { display: 'flex', gap: '10px' },
  select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#1a202c', backgroundColor: '#fff' },
  textarea: { width: '100%', boxSizing: 'border-box', marginTop: '15px', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#1a202c', backgroundColor: '#fff', minHeight: '90px', fontFamily: 'inherit' },
  mainBtn: { width: '100%', marginTop: '15px', padding: '16px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  reminderItem: { display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fffdf2', borderRadius: '10px', borderLeft: '4px solid #f1c40f', marginBottom: '8px', color: '#1a202c', fontSize: '14px' },
  delBtn: { background: 'none', border: 'none', color: '#e74c3c' },
  logCard: { display: 'flex', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '15px', overflow: 'hidden', marginBottom: '15px', cursor: 'pointer' },
  logSide: { backgroundColor: '#f8fafc', width: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1e3a8a', fontSize: '12px' },
  logMain: { padding: '15px', flex: 1 },
  logHeader: { display: 'flex', justifyContent: 'space-between' },
  logSubject: { fontWeight: 'bold', color: '#1a202c' },
  logTeacher: { fontSize: '12px', color: '#64748b' },
  logNote: { fontSize: '13px', color: '#334155', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #1e3a8a' },
  archiveBanner: { textAlign: 'center', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '10px', color: '#475569', fontWeight: 'bold', marginBottom: '20px' },
  empty: { textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
  del: { background: 'none', border: 'none', color: '#cbd5e1' }
};

export default App;