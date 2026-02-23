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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [academicLogs, setAcademicLogs] = useState([]);
  const [reminders, setReminders] = useState([]);
  
  // Form States
  const [period, setPeriod] = useState("1");
  const [subject, setSubject] = useState(SUBJECT_LIST[0]);
  const [teacher, setTeacher] = useState(SUBJECT_MAP[SUBJECT_LIST[0]][0]);
  const [note, setNote] = useState("");

  // 1. Initial Scan
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id') === "321") {
      setScanResult({ id: "321", name: "Joyal Jose", college: "Kuriakose Elias College" });
    }
  }, []);

  // 2. Load Data for the SELECTED DATE
  useEffect(() => {
    if (scanResult) {
      const savedLogs = localStorage.getItem(`logs_${scanResult.id}_${selectedDate}`);
      const savedRem = localStorage.getItem(`reminders_${scanResult.id}`); // Reminders stay global
      setAcademicLogs(savedLogs ? JSON.parse(savedLogs) : []);
      if (savedRem) setReminders(JSON.parse(savedRem));
    }
  }, [scanResult, selectedDate]);

  // 3. Save Data for the SELECTED DATE
  useEffect(() => {
    if (scanResult) {
      localStorage.setItem(`logs_${scanResult.id}_${selectedDate}`, JSON.stringify(academicLogs));
      localStorage.setItem(`reminders_${scanResult.id}`, JSON.stringify(reminders));
    }
  }, [academicLogs, reminders, scanResult, selectedDate]);

  // Helper for Date Nav
  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const availablePeriods = [1,2,3,4,5,6,7].filter(p => 
    !academicLogs.some(log => parseInt(log.period) === p)
  );

  useEffect(() => {
    if (availablePeriods.length > 0) setPeriod(availablePeriods[0].toString());
    setTeacher(SUBJECT_MAP[subject][0]);
  }, [academicLogs, subject]);

  const handleAddLog = (e) => {
    e.preventDefault();
    const newLog = {
      id: Date.now(),
      period,
      subject,
      teacher,
      note,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAcademicLogs([...academicLogs, newLog].sort((a, b) => a.period - b.period));
    setNote("");
  };

  if (!scanResult) return <div style={styles.viewPort}><h2>Tap ID Card</h2></div>;

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.badge}>ACADEMIC YEAR 2026</div>
          <h1 style={styles.studentName}>{scanResult.name}</h1>
          
          {/* Calendar Navigation Bar */}
          <div style={styles.dateNav}>
            <button onClick={() => changeDate(-1)} style={styles.dateBtn}>◀</button>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              style={styles.dateInput}
            />
            <button onClick={() => changeDate(1)} style={styles.dateBtn}>▶</button>
          </div>
        </header>

        <div style={styles.scrollArea}>
          {/* New Entry Form - Only shows if it's not a future date (optional) */}
          <section style={styles.section}>
            <p style={styles.sectionLabel}>LOG PERIOD FOR {selectedDate === new Date().toISOString().split('T')[0] ? "TODAY" : selectedDate}</p>
            <div style={styles.formCard}>
              <div style={styles.row}>
                <div style={{flex: 1}}>
                  <select style={styles.select} value={period} onChange={e => setPeriod(e.target.value)}>
                    {availablePeriods.map(p => <option key={p} value={p}>P {p}</option>)}
                    {availablePeriods.length === 0 && <option>Done</option>}
                  </select>
                </div>
                <div style={{flex: 2}}>
                  <select style={styles.select} value={subject} onChange={e => setSubject(e.target.value)}>
                    {SUBJECT_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <select style={{...styles.select, marginTop: '10px'}} value={teacher} onChange={e => setTeacher(e.target.value)}>
                {SUBJECT_MAP[subject].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea 
                style={styles.textarea} 
                placeholder="Session notes (Visible while typing)..." 
                value={note}
                onChange={e => setNote(e.target.value)}
              />
              <button onClick={handleAddLog} disabled={availablePeriods.length === 0} style={styles.mainBtn}>
                SAVE TO {selectedDate}
              </button>
            </div>
          </section>

          {/* Daily Timeline */}
          <section style={styles.section}>
            <p style={styles.sectionLabel}>TIMELINE FOR {selectedDate}</p>
            {academicLogs.length === 0 && <p style={styles.empty}>No data for this date.</p>}
            {academicLogs.map(log => (
              <div key={log.id} style={styles.logCard}>
                <div style={styles.logSide}>P{log.period}</div>
                <div style={styles.logMain}>
                   <div style={styles.logHeader}>
                    <span style={styles.logSubject}>{log.subject}</span>
                    <button onClick={() => setAcademicLogs(academicLogs.filter(l => l.id !== log.id))} style={styles.del}>✕</button>
                   </div>
                   <p style={styles.logTeacher}>{log.teacher}</p>
                   {log.note && <p style={styles.logNote}>{log.note}</p>}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  viewPort: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', backgroundColor: '#e2e8f0', position: 'fixed', top: 0, left: 0, fontFamily: 'sans-serif' },
  container: { width: '100%', maxWidth: '420px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' },
  header: { padding: '25px', backgroundColor: '#1e3a8a', color: '#fff', textAlign: 'center' },
  badge: { fontSize: '10px', fontWeight: 'bold', opacity: 0.7, letterSpacing: '1px' },
  studentName: { fontSize: '22px', margin: '10px 0' },
  
  // Date Nav Styles
  dateNav: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '15px' },
  dateBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '10px', borderRadius: '8px', cursor: 'pointer' },
  dateInput: { backgroundColor: '#fff', border: 'none', padding: '8px', borderRadius: '8px', color: '#1e3a8a', fontWeight: 'bold', fontFamily: 'inherit' },

  scrollArea: { flex: 1, overflowY: 'auto', padding: '20px' },
  section: { marginBottom: '30px' },
  sectionLabel: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px' },
  formCard: { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0' },
  row: { display: 'flex', gap: '10px' },
  
  // VISIBILITY FIXES
  select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#1a202c', backgroundColor: '#fff' },
  textarea: { width: '100%', boxSizing: 'border-box', marginTop: '10px', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#1a202c', minHeight: '80px' },
  mainBtn: { width: '100%', marginTop: '10px', padding: '14px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },

  logCard: { display: 'flex', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' },
  logSide: { backgroundColor: '#f1f5f9', width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1e3a8a' },
  logMain: { padding: '12px', flex: 1 },
  logHeader: { display: 'flex', justifyContent: 'space-between' },
  logSubject: { fontWeight: 'bold', color: '#1a202c' },
  del: { background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' },
  logTeacher: { fontSize: '12px', color: '#64748b', margin: '2px 0' },
  logNote: { fontSize: '13px', color: '#1a202c', marginTop: '8px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' },
  empty: { textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginTop: '20px' }
};

export default App;