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
  const [view, setView] = useState("dashboard"); // dashboard, home, goals
  const [greeting, setGreeting] = useState("");
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  
  const [academicLogs, setAcademicLogs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [reminderInput, setReminderInput] = useState("");
  
  // --- GOAL TRACKER STATES ---
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('user_goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [goalInput, setGoalInput] = useState("");
  const [goalType, setGoalType] = useState("daily");

  const [note, setNote] = useState("");
  const [period, setPeriod] = useState("1");
  const [subject, setSubject] = useState(SUBJECT_LIST[0]);
  const [teacher, setTeacher] = useState(SUBJECT_MAP[SUBJECT_LIST[0]][0]);
  const [searchQuery, setSearchQuery] = useState("");

  const isToday = selectedDate === todayStr;

  // Sync Goals to LocalStorage
  useEffect(() => {
    localStorage.setItem('user_goals', JSON.stringify(goals));
  }, [goals]);

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

  // --- NOTIFICATION LOGIC ---
  const triggerOfflineNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { 
        body, 
        icon: 'https://cdn-icons-png.flaticon.com/512/190/190411.png' 
      });
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  const requestNotify = () => {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        triggerOfflineNotification("Notifications Active!", "You will now get goal alerts.");
      }
    });
  };

  // --- GOAL HANDLERS ---
  const addGoal = () => {
    if (!goalInput.trim()) return;
    const newGoal = { id: Date.now(), text: goalInput, type: goalType, status: 'undone' };
    setGoals([...goals, newGoal]);
    setGoalInput("");
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const newStatus = g.status === 'done' ? 'undone' : 'done';
        if (newStatus === 'done') triggerOfflineNotification("Goal Completed!", `Great job on: ${g.text}`);
        return { ...g, status: newStatus };
      }
      return g;
    }));
  };

  // Rest of your existing logic (AddLog, Analytics, etc.)
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

  const availablePeriods = [1,2,3,4,5,6,7].filter(p => 
    !academicLogs.some(log => parseInt(log.period) === p)
  );

  const { subjectStats, teacherStats, searchResults } = getAnalyticsAndSearch();

  function getAnalyticsAndSearch() {
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
  }

  // --- RENDER LOGIC ---
 // --- BYPASS / DEMO MODE ---
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
           
           {/* --- TEST BYPASS BUTTON --- */}
           <button 
             onClick={() => setScanResult({ id: "321", name: "Joyal Jose" })}
             style={{
               marginTop: '50px',
               background: 'none',
               border: '1px dashed #cbd5e1',
               color: '#cbd5e1',
               padding: '8px 15px',
               borderRadius: '8px',
               fontSize: '11px',
               cursor: 'pointer'
             }}
           >
             TEST: BYPASS SCAN
           </button>
           
           <div style={{marginTop: '20px', fontSize: '12px', color: '#cbd5e1', fontWeight: 'bold', letterSpacing: '1.5px'}}>AWAITING AUTHENTICATION</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={styles.topInfo}>
              <p style={styles.greetingText}>{greeting},</p>
              <h1 style={styles.studentName}>{scanResult.name}</h1>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
               <button onClick={() => setView(view === 'goals' ? 'dashboard' : 'goals')} style={styles.backIconBtn}>
                 {view === 'goals' ? '📚' : '🎯'}
               </button>
               <button onClick={() => setView('home')} style={styles.backIconBtn}>🔍</button>
            </div>
          </div>

          {view !== 'goals' && (
            <div style={styles.dateSelectorPill}>
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]); }} style={styles.pillBtn}>◀</button>
              <div style={styles.dateInfo}><span style={styles.pillLabel}>{isToday ? "TODAY" : "HISTORY"}</span><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={styles.pillInput}/></div>
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]); }} style={styles.pillBtn}>▶</button>
            </div>
          )}
        </header>

        <div style={styles.scrollArea}>
          {/* VIEW: GOAL TRACKER */}
          {view === 'goals' && (
            <section style={styles.section}>
              <p style={styles.sectionLabel}>GOAL TRACKER</p>
              <div style={styles.formCard}>
                <input 
                  style={styles.searchInput} 
                  placeholder="What is your goal?" 
                  value={goalInput} 
                  onChange={e => setGoalInput(e.target.value)} 
                />
                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                  <select style={{...styles.select, flex: 1}} value={goalType} onChange={e => setGoalType(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="long-term">Long Term</option>
                  </select>
                  <button onClick={addGoal} style={{...styles.mainBtn, marginTop: 0, flex: 1}}>ADD</button>
                </div>
                <button onClick={requestNotify} style={{background: 'none', border: 'none', color: '#1e3a8a', fontSize: '12px', marginTop: '10px', cursor: 'pointer'}}>🔔 Enable Offline Alerts</button>
              </div>

              {['daily', 'long-term'].map(type => (
                <div key={type} style={{marginTop: '25px'}}>
                  <p style={styles.sectionLabel}>{type.toUpperCase()} GOALS</p>
                  {goals.filter(g => g.type === type).length === 0 ? <p style={styles.empty}>No {type} goals yet.</p> : 
                    goals.filter(g => g.type === type).map(g => (
                      <div key={g.id} style={{...styles.reminderItem, backgroundColor: g.status === 'done' ? '#f0fdf4' : '#fffdf2', borderLeftColor: g.status === 'done' ? '#22c55e' : '#f1c40f'}}>
                        <span style={{textDecoration: g.status === 'done' ? 'line-through' : 'none'}}>{g.status === 'done' ? '✅' : '⏳'} {g.text}</span>
                        <div>
                          <button style={{...styles.delBtn, color: '#1e3a8a', marginRight: '10px'}} onClick={() => toggleGoal(g.id)}>Done</button>
                          <button style={styles.delBtn} onClick={() => setGoals(goals.filter(item => item.id !== g.id))}>✕</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ))}
            </section>
          )}

          {/* VIEW: DASHBOARD (Your existing logic) */}
          {view === 'dashboard' && (
            <>
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
              {/* Timeline Section */}
              <section style={styles.section}>
                <p style={styles.sectionLabel}>TIMELINE</p>
                {academicLogs.map(log => (
                   <div key={log.id} style={styles.logCard}>
                     <div style={styles.logSide}>P{log.period}</div>
                     <div style={styles.logMain}>
                       <div style={styles.logHeader}><span style={styles.logSubject}>{log.subject}</span></div>
                       <p style={styles.logTeacher}>{log.teacher}</p>
                       {log.note && <p style={styles.logNote}>{log.note}</p>}
                     </div>
                   </div>
                ))}
              </section>
            </>
          )}

          {/* VIEW: SEARCH (home) */}
          {view === 'home' && (
            <section style={styles.section}>
               <p style={styles.sectionLabel}>SEARCH RESULTS ({searchResults.length})</p>
               {/* Search rendering from your original code */}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// Keep your existing styles object
const styles = {
  // ... (All your existing styles from the prompt)
  viewPort: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', backgroundColor: '#f0f4f8', position: 'fixed', top: 0, left: 0, fontFamily: 'Inter, sans-serif' },
  container: { width: '100%', maxWidth: '420px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' },
  scanIconContainer: { position: 'relative', width: '100px', height: '100px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' },
  pulseRing: { position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', animation: 'pulse 2s infinite' },
  header: { padding: '40px 25px 30px 25px', backgroundColor: '#1e3a8a', color: '#fff', borderBottomLeftRadius: '35px', borderBottomRightRadius: '35px' },
  topInfo: { textAlign: 'left' },
  greetingText: { fontSize: '14px', opacity: 0.8, margin: 0 },
  studentName: { fontSize: '28px', fontWeight: '800', margin: '5px 0 0 0' },
  backIconBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', padding: '10px', borderRadius: '12px', fontSize: '20px', cursor: 'pointer' },
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
  empty: { textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
  searchInput: { width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#1a202c', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
};

export default App;