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
  const [academicLogs, setAcademicLogs] = useState([]);
  const [reminders, setReminders] = useState([]);
  
  // Form States
  const [period, setPeriod] = useState("1");
  const [subject, setSubject] = useState(SUBJECT_LIST[0]);
  const [teacher, setTeacher] = useState(SUBJECT_MAP[SUBJECT_LIST[0]][0]);
  const [note, setNote] = useState("");
  const [reminderInput, setReminderInput] = useState("");

  // Auto-update teacher when subject changes
  useEffect(() => {
    setTeacher(SUBJECT_MAP[subject][0]);
  }, [subject]);

  // Initial Auth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id') === "321") {
      setScanResult({ id: "321", name: "Joyal Jose", college: "Kuriakose Elias College" });
    }
  }, []);

  // Load Persistence
  useEffect(() => {
    if (scanResult) {
      const savedLogs = localStorage.getItem(`ac_logs_${scanResult.id}`);
      const savedRem = localStorage.getItem(`ac_rem_${scanResult.id}`);
      if (savedLogs) setAcademicLogs(JSON.parse(savedLogs));
      if (savedRem) setReminders(JSON.parse(savedRem));
    }
  }, [scanResult]);

  // Save Persistence
  useEffect(() => {
    if (scanResult) {
      localStorage.setItem(`ac_logs_${scanResult.id}`, JSON.stringify(academicLogs));
      localStorage.setItem(`ac_rem_${scanResult.id}`, JSON.stringify(reminders));
    }
  }, [academicLogs, reminders, scanResult]);

  const handleAddLog = (e) => {
    e.preventDefault();
    
    // VALIDATION: Prevent duplicate periods
    const alreadyExists = academicLogs.some(log => log.period === period);
    if (alreadyExists) {
      alert(`Period ${period} has already been logged for today!`);
      return;
    }

    const newLog = {
      id: Date.now(),
      period,
      subject,
      teacher,
      note,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setAcademicLogs([newLog, ...academicLogs]);
    setNote("");
    if (navigator.vibrate) navigator.vibrate(50);
  };

  if (!scanResult) return (
    <div style={styles.viewPort}>
      <div style={styles.loginCard}>
        <div style={styles.nfcIcon}>🔵</div>
        <h2 style={{color: '#003366'}}>KE Academic Tracker</h2>
        <p style={{color: '#666'}}>Tap ID Card to Access Profile</p>
      </div>
    </div>
  );

  // Filter out already logged periods for the dropdown
  const availablePeriods = [1,2,3,4,5,6,7].filter(p => 
    !academicLogs.some(log => parseInt(log.period) === p)
  );

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.badge}>STUDENT DASHBOARD</div>
          <h1 style={styles.studentName}>{scanResult.name}</h1>
          <p style={styles.collegeName}>{scanResult.college}</p>
        </header>

        <div style={styles.scrollArea}>
          {/* Form Section */}
          <section style={styles.section}>
            <p style={styles.sectionLabel}>NEW ENTRY</p>
            <div style={styles.formCard}>
              <div style={styles.row}>
                <div style={{flex: 1}}>
                  <label style={styles.fieldLabel}>Period</label>
                  <select style={styles.select} value={period} onChange={e => setPeriod(e.target.value)}>
                    {availablePeriods.length > 0 ? (
                      availablePeriods.map(p => <option key={p} value={p}>P {p}</option>)
                    ) : (
                      <option disabled>All Logged</option>
                    )}
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

              <div style={{marginTop: '15px'}}>
                <label style={styles.fieldLabel}>Session Notes</label>
                <textarea 
                  style={styles.textarea} 
                  placeholder="Type notes here..." 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
              <button 
                onClick={handleAddLog} 
                disabled={availablePeriods.length === 0}
                style={{...styles.mainBtn, opacity: availablePeriods.length === 0 ? 0.5 : 1}}
              >
                {availablePeriods.length === 0 ? "DAY COMPLETED" : "SAVE LOG"}
              </button>
            </div>
          </section>

          {/* Reminders */}
          <section style={styles.section}>
            <p style={styles.sectionLabel}>PENDING TASKS</p>
            <div style={styles.reminderInputGroup}>
              <input 
                style={styles.remInput} 
                placeholder="New reminder..." 
                value={reminderInput}
                onChange={e => setReminderInput(e.target.value)}
              />
              <button onClick={() => {
                if(!reminderInput) return;
                setReminders([...reminders, {id: Date.now(), text: reminderInput}]);
                setReminderInput("");
              }} style={styles.addBtn}>+</button>
            </div>
            {reminders.map(r => (
              <div key={r.id} style={styles.reminderItem}>
                <span style={{color: '#1a202c'}}>📍 {r.text}</span>
                <button style={styles.delBtn} onClick={() => setReminders(reminders.filter(i => i.id !== r.id))}>✕</button>
              </div>
            ))}
          </section>

          {/* Timeline */}
          <section style={styles.section}>
            <p style={styles.sectionLabel}>TODAY'S TIMELINE</p>
            {academicLogs.map(log => (
              <div key={log.id} style={styles.logCard}>
                <div style={styles.logSide}>P{log.period}</div>
                <div style={styles.logMain}>
                  <div style={styles.logHeader}>
                    <span style={styles.logSubject}>{log.subject}</span>
                    <span style={styles.logTime}>{log.time}</span>
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
  viewPort: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', backgroundColor: '#e2e8f0', position: 'fixed', top: 0, left: 0, fontFamily: 'Inter, system-ui, sans-serif' },
  container: { width: '100%', maxWidth: '420px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' },
  loginCard: { textAlign: 'center', marginTop: '45%' },
  nfcIcon: { fontSize: '60px', marginBottom: '10px' },
  
  header: { padding: '35px 25px', backgroundColor: '#1e3a8a', color: '#fff', textAlign: 'left', borderBottomLeftRadius: '25px', borderBottomRightRadius: '25px' },
  badge: { fontSize: '10px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.15)', padding: '5px 10px', borderRadius: '6px', letterSpacing: '1px' },
  studentName: { fontSize: '26px', margin: '12px 0 4px 0', fontWeight: '700' },
  collegeName: { fontSize: '12px', opacity: 0.85, margin: 0, textTransform: 'uppercase' },
  
  scrollArea: { flex: 1, overflowY: 'auto', padding: '25px' },
  section: { marginBottom: '35px' },
  sectionLabel: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', letterSpacing: '1.2px', marginBottom: '15px' },
  
  fieldLabel: { fontSize: '12px', color: '#475569', marginBottom: '6px', display: 'block', fontWeight: '600' },
  formCard: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px' },
  row: { display: 'flex', gap: '12px' },
  
  // TEXT VISIBILITY FIXES
  select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '14px', color: '#1a202c', outline: 'none' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', minHeight: '90px', fontFamily: 'inherit', fontSize: '14px', color: '#1a202c', backgroundColor: '#fff' },
  remInput: { flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '14px', color: '#1a202c', outline: 'none' },
  
  mainBtn: { width: '100%', marginTop: '15px', padding: '15px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' },
  reminderInputGroup: { display: 'flex', gap: '10px', marginBottom: '15px' },
  addBtn: { width: '50px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '22px' },
  
  reminderItem: { display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#fff', borderRadius: '12px', borderLeft: '5px solid #3b82f6', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  delBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px' },

  logCard: { display: 'flex', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '15px' },
  logSide: { backgroundColor: '#f1f5f9', padding: '18px', display: 'flex', alignItems: 'center', fontWeight: '800', borderRight: '1px solid #e2e8f0', color: '#1e3a8a' },
  logMain: { padding: '15px', flex: 1 },
  logHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
  logSubject: { fontWeight: '700', fontSize: '16px', color: '#0f172a' },
  logTime: { fontSize: '11px', color: '#64748b' },
  logTeacher: { fontSize: '12px', color: '#475569', margin: 0 },
  logNote: { fontSize: '13px', color: '#334155', marginTop: '10px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }
};

export default App;