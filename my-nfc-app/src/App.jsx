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
  // Get today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  
  const [academicLogs, setAcademicLogs] = useState([]);
  const [reminders, setReminders] = useState([]);
  
  // Form States
  const [period, setPeriod] = useState("1");
  const [subject, setSubject] = useState(SUBJECT_LIST[0]);
  const [teacher, setTeacher] = useState(SUBJECT_MAP[SUBJECT_LIST[0]][0]);
  const [note, setNote] = useState("");

  const isToday = selectedDate === todayStr;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id') === "321") {
      setScanResult({ id: "321", name: "Joyal Jose", college: "Kuriakose Elias College" });
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
    if (!isToday) return; // Strict lock
    
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
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  if (!scanResult) return (
    <div style={styles.viewPort}>
      <div style={styles.loginCard}>
        <div style={styles.nfcIcon}>🔵</div>
        <h2>KE Tracker</h2>
        <p>Tap ID Card to Sync</p>
      </div>
    </div>
  );

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.badge}>KE ACADEMIC TRACKER</div>
          <h1 style={styles.studentName}>{scanResult.name}</h1>
          
          <div style={styles.dateNav}>
            <button onClick={() => changeDate(-1)} style={styles.dateBtn}>◀</button>
            <div style={styles.dateDisplay}>
              <span style={styles.dateSub}>{isToday ? "TODAY" : "ARCHIVE"}</span>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                style={styles.dateInput}
              />
            </div>
            <button onClick={() => changeDate(1)} style={styles.dateBtn}>▶</button>
          </div>
        </header>

        <div style={styles.scrollArea}>
          {/* LOGGING FORM: Only visible if isToday is true */}
          {isToday ? (
            <section style={styles.section}>
              <p style={styles.sectionLabel}>NEW ENTRY FOR TODAY</p>
              <div style={styles.formCard}>
                <div style={styles.row}>
                  <div style={{flex: 1}}>
                    <label style={styles.fieldLabel}>Period</label>
                    <select style={styles.select} value={period} onChange={e => setPeriod(e.target.value)}>
                      {availablePeriods.map(p => <option key={p} value={p}>P {p}</option>)}
                      {availablePeriods.length === 0 && <option>Done</option>}
                    </select>
                  </div>
                  <div style={{flex: 2}}>
                    <label style={styles.fieldLabel}>Subject</label>
                    <select style={styles.select} value={subject} onChange={e => setSubject(e.target.value)}>
                      {SUBJECT_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{marginTop: '15px'}}>
                  <label style={styles.fieldLabel}>Faculty</label>
                  <select style={styles.select} value={teacher} onChange={e => setTeacher(e.target.value)}>
                    {SUBJECT_MAP[subject].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <textarea 
                  style={styles.textarea} 
                  placeholder="Type notes here... (Visible while typing)" 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
                <button onClick={handleAddLog} disabled={availablePeriods.length === 0} style={styles.mainBtn}>
                  {availablePeriods.length === 0 ? "DAY COMPLETED" : "SAVE TODAY'S LOG"}
                </button>
              </div>
            </section>
          ) : (
            <div style={styles.readOnlyBanner}>
              🔒 VIEWING MODE: {selectedDate} <br/>
              <span style={{fontSize: '11px'}}>You cannot edit historical or future data.</span>
            </div>
          )}

          {/* Timeline */}
          <section style={styles.section}>
            <p style={styles.sectionLabel}>TIMELINE: {selectedDate}</p>
            {academicLogs.length === 0 && <p style={styles.empty}>No entries for this date.</p>}
            {academicLogs.map(log => (
              <div key={log.id} style={styles.logCard}>
                <div style={styles.logSide}>P{log.period}</div>
                <div style={styles.logMain}>
                  <div style={styles.logHeader}>
                    <span style={styles.logSubject}>{log.subject}</span>
                    {isToday && <button onClick={() => setAcademicLogs(academicLogs.filter(l => l.id !== log.id))} style={styles.del}>✕</button>}
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
  viewPort: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', backgroundColor: '#e2e8f0', position: 'fixed', top: 0, left: 0, fontFamily: 'Inter, sans-serif' },
  container: { width: '100%', maxWidth: '420px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' },
  loginCard: { textAlign: 'center', marginTop: '45%' },
  nfcIcon: { fontSize: '60px', marginBottom: '10px' },
  
  header: { padding: '30px 20px', backgroundColor: '#1e3a8a', color: '#fff', textAlign: 'center', borderBottomLeftRadius: '25px', borderBottomRightRadius: '25px' },
  badge: { fontSize: '10px', fontWeight: 'bold', opacity: 0.8, letterSpacing: '1px' },
  studentName: { fontSize: '24px', margin: '8px 0 15px 0' },
  
  dateNav: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' },
  dateBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer' },
  dateDisplay: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  dateSub: { fontSize: '9px', fontWeight: 'bold', marginBottom: '2px' },
  dateInput: { backgroundColor: '#fff', border: 'none', padding: '6px 10px', borderRadius: '8px', color: '#1e3a8a', fontWeight: 'bold', fontSize: '14px' },

  scrollArea: { flex: 1, overflowY: 'auto', padding: '25px' },
  section: { marginBottom: '30px' },
  sectionLabel: { fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '1px', marginBottom: '12px' },
  
  readOnlyBanner: { backgroundColor: '#f1f5f9', color: '#475569', padding: '20px', borderRadius: '15px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #e2e8f0', marginBottom: '20px' },
  
  formCard: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' },
  row: { display: 'flex', gap: '10px' },
  fieldLabel: { fontSize: '11px', color: '#64748b', marginBottom: '5px', display: 'block', fontWeight: '600' },
  
  // FIX: Dark Text Visibility
  select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#1e293b', backgroundColor: '#fff', fontSize: '14px', outline: 'none' },
  textarea: { width: '100%', boxSizing: 'border-box', marginTop: '10px', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#1e293b', backgroundColor: '#fff', minHeight: '80px', fontSize: '14px' },
  
  mainBtn: { width: '100%', marginTop: '15px', padding: '15px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },

  logCard: { display: 'flex', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '15px', overflow: 'hidden', marginBottom: '12px' },
  logSide: { backgroundColor: '#f1f5f9', width: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1e3a8a', borderRight: '1px solid #e2e8f0' },
  logMain: { padding: '15px', flex: 1 },
  logHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logSubject: { fontWeight: '700', color: '#0f172a', fontSize: '16px' },
  del: { background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '16px' },
  logTeacher: { fontSize: '12px', color: '#64748b', margin: '4px 0' },
  logNote: { fontSize: '13px', color: '#334155', marginTop: '8px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #1e3a8a' },
  empty: { textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginTop: '30px' }
};

export default App;