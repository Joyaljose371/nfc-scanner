import React, { useState, useEffect } from 'react';

// Your Specific College Data
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

  // Update teacher list when subject changes
  useEffect(() => {
    setTeacher(SUBJECT_MAP[subject][0]);
  }, [subject]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id === "321") {
      setScanResult({ id, name: "Joyal Jose", college: "Kuriakose Elias College" });
    }
  }, []);

  useEffect(() => {
    if (scanResult) {
      const savedLogs = localStorage.getItem(`academic_logs_${scanResult.id}`);
      const savedRem = localStorage.getItem(`academic_rem_${scanResult.id}`);
      if (savedLogs) setAcademicLogs(JSON.parse(savedLogs));
      if (savedRem) setReminders(JSON.parse(savedRem));
    }
  }, [scanResult]);

  useEffect(() => {
    if (scanResult) {
      localStorage.setItem(`academic_logs_${scanResult.id}`, JSON.stringify(academicLogs));
      localStorage.setItem(`academic_rem_${scanResult.id}`, JSON.stringify(reminders));
    }
  }, [academicLogs, reminders, scanResult]);

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
    setAcademicLogs([newLog, ...academicLogs]);
    setNote("");
    if (navigator.vibrate) navigator.vibrate(50);
  };

  if (!scanResult) return (
    <div style={styles.viewPort}>
      <div style={styles.loginCard}>
        <div style={styles.nfcIcon}>🪪</div>
        <h2 style={{color: '#1a1a1a'}}>KE College Tracker</h2>
        <p style={{color: '#666'}}>Tap ID Card to Sync</p>
      </div>
    </div>
  );

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.badge}>ACADEMIC LOG ACTIVE</div>
          <h1 style={styles.studentName}>{scanResult.name}</h1>
          <p style={styles.collegeName}>{scanResult.college}</p>
        </header>

        <div style={styles.scrollArea}>
          {/* Period Tracker Form */}
          <section style={styles.section}>
            <p style={styles.sectionLabel}>CURRENT PERIOD UPDATE</p>
            <div style={styles.formCard}>
              <div style={styles.row}>
                <div style={{flex: 1}}>
                  <label style={styles.fieldLabel}>Period</label>
                  <select style={styles.select} value={period} onChange={e => setPeriod(e.target.value)}>
                    {[1,2,3,4,5,6,7].map(p => <option key={p} value={p}>Period {p}</option>)}
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
                <label style={styles.fieldLabel}>Teaching Faculty</label>
                <select style={styles.select} value={teacher} onChange={e => setTeacher(e.target.value)}>
                  {SUBJECT_MAP[subject].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <textarea 
                style={styles.textarea} 
                placeholder="Key topics or class notes..." 
                value={note}
                onChange={e => setNote(e.target.value)}
              />
              <button onClick={handleAddLog} style={styles.mainBtn}>UPDATE LOG</button>
            </div>
          </section>

          {/* Quick Reminders */}
          <section style={styles.section}>
            <p style={styles.sectionLabel}>REMINDERS & TASKS</p>
            <div style={styles.reminderInputGroup}>
              <input 
                style={styles.remInput} 
                placeholder="Next test, assignment..." 
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
                <span style={{color: '#2c3e50'}}>📌 {r.text}</span>
                <button style={styles.delBtn} onClick={() => setReminders(reminders.filter(i => i.id !== r.id))}>✕</button>
              </div>
            ))}
          </section>

          {/* Activity Timeline */}
          <section style={styles.section}>
            <p style={styles.sectionLabel}>TODAY'S TIMELINE</p>
            {academicLogs.length === 0 && <p style={styles.emptyMsg}>No periods logged yet today.</p>}
            {academicLogs.map(log => (
              <div key={log.id} style={styles.logCard}>
                <div style={styles.logSide}>P{log.period}</div>
                <div style={styles.logMain}>
                  <div style={styles.logHeader}>
                    <span style={styles.logSubject}>{log.subject}</span>
                    <span style={styles.logTime}>{log.time}</span>
                  </div>
                  <p style={styles.logTeacher}>by {log.teacher}</p>
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
  viewPort: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', backgroundColor: '#eef2f3', position: 'fixed', top: 0, left: 0, fontFamily: 'system-ui, -apple-system, sans-serif' },
  container: { width: '100%', maxWidth: '420px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' },
  loginCard: { textAlign: 'center', marginTop: '45%' },
  nfcIcon: { fontSize: '60px', marginBottom: '10px' },
  
  header: { padding: '35px 25px', backgroundColor: '#800000', color: '#fff', textAlign: 'left', borderBottomLeftRadius: '25px', borderBottomRightRadius: '25px' },
  badge: { fontSize: '10px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.15)', padding: '5px 10px', borderRadius: '6px', color: '#fff', letterSpacing: '1px' },
  studentName: { fontSize: '26px', margin: '12px 0 4px 0', letterSpacing: '-0.5px' },
  collegeName: { fontSize: '12px', opacity: 0.85, margin: 0, textTransform: 'uppercase' },
  
  scrollArea: { flex: 1, overflowY: 'auto', padding: '25px' },
  section: { marginBottom: '35px' },
  sectionLabel: { fontSize: '11px', fontWeight: 'bold', color: '#a0a0a0', letterSpacing: '1.2px', marginBottom: '15px' },
  
  fieldLabel: { fontSize: '12px', color: '#666', marginBottom: '6px', display: 'block', fontWeight: '500' },
  formCard: { backgroundColor: '#fff', border: '1px solid #edf2f7', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  row: { display: 'flex', gap: '12px' },
  select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', color: '#2d3748' },
  textarea: { width: '100%', boxSizing: 'border-box', marginTop: '15px', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '90px', fontFamily: 'inherit', fontSize: '14px', backgroundColor: '#f8fafc' },
  mainBtn: { width: '100%', marginTop: '15px', padding: '15px', backgroundColor: '#800000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' },

  reminderInputGroup: { display: 'flex', gap: '10px', marginBottom: '15px' },
  remInput: { flex: 1, padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#f1f5f9', fontSize: '14px', outline: 'none' },
  addBtn: { width: '50px', backgroundColor: '#2d3748', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '22px', cursor: 'pointer' },
  reminderItem: { display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#fffdf2', borderRadius: '12px', borderLeft: '5px solid #ecc94b', marginBottom: '10px', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' },
  delBtn: { background: 'none', border: 'none', color: '#cbd5e0', cursor: 'pointer', fontSize: '18px' },

  logCard: { display: 'flex', backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  logSide: { backgroundColor: '#f8fafc', padding: '18px', display: 'flex', alignItems: 'center', fontWeight: '800', borderRight: '1px solid #f1f5f9', color: '#800000', fontSize: '16px' },
  logMain: { padding: '15px', flex: 1 },
  logHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' },
  logSubject: { fontWeight: '700', fontSize: '16px', color: '#1a202c' },
  logTime: { fontSize: '11px', color: '#a0aec0', fontWeight: '500' },
  logTeacher: { fontSize: '12px', color: '#718096', margin: 0, fontWeight: '500' },
  logNote: { fontSize: '13px', color: '#4a5568', marginTop: '10px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', lineHeight: '1.5', border: '1px dashed #e2e8f0' },
  emptyMsg: { textAlign: 'center', color: '#cbd5e0', fontSize: '14px', marginTop: '20px' }
};

export default App;