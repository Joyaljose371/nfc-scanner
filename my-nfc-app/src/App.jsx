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
  const [greeting, setGreeting] = useState("");
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  
  const [academicLogs, setAcademicLogs] = useState([]);
  const [note, setNote] = useState("");
  const [period, setPeriod] = useState("1");
  const [subject, setSubject] = useState(SUBJECT_LIST[0]);
  const [teacher, setTeacher] = useState(SUBJECT_MAP[SUBJECT_LIST[0]][0]);

  const isToday = selectedDate === todayStr;

  // 1. Dynamic Greeting Logic
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // 2. Auth & Persistence
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id') === "321") {
      setScanResult({ id: "321", name: "Joyal Jose" });
    }
  }, []);

  useEffect(() => {
    if (scanResult) {
      const savedLogs = localStorage.getItem(`logs_${scanResult.id}_${selectedDate}`);
      setAcademicLogs(savedLogs ? JSON.parse(savedLogs) : []);
    }
  }, [scanResult, selectedDate]);

  useEffect(() => {
    if (scanResult) {
      localStorage.setItem(`logs_${scanResult.id}_${selectedDate}`, JSON.stringify(academicLogs));
    }
  }, [academicLogs, scanResult, selectedDate]);

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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAcademicLogs([...academicLogs, newLog].sort((a, b) => a.period - b.period));
    setNote("");
  };

  if (!scanResult) return <div style={styles.viewPort}><h2>Tap ID Card</h2></div>;

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        {/* Creative Dynamic Header */}
        <header style={styles.header}>
          <div style={styles.topInfo}>
            <p style={styles.greetingText}>{greeting},</p>
            <h1 style={styles.studentName}>{scanResult.name}</h1>
          </div>
          
          <div style={styles.dateSelectorPill}>
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }} style={styles.pillBtn}>◀</button>
            
            <div style={styles.dateInfo}>
                <span style={styles.pillLabel}>{isToday ? "TODAY" : "HISTORY"}</span>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  style={styles.pillInput}
                />
            </div>

            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }} style={styles.pillBtn}>▶</button>
          </div>
        </header>

        <div style={styles.scrollArea}>
          {isToday ? (
            <section style={styles.section}>
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
                  <label style={styles.fieldLabel}>Teaching Faculty</label>
                  <select style={styles.select} value={teacher} onChange={e => setTeacher(e.target.value)}>
                    {SUBJECT_MAP[subject].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <textarea 
                  style={styles.textarea} 
                  placeholder="What was discussed in class?" 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
                <button onClick={handleAddLog} disabled={availablePeriods.length === 0} style={styles.mainBtn}>
                  {availablePeriods.length === 0 ? "DAY LOGGED" : "SAVE ENTRY"}
                </button>
              </div>
            </section>
          ) : (
            <div style={styles.archiveBanner}>
              🕒 Viewing Archive for {selectedDate}
            </div>
          )}

          <section style={styles.section}>
            <p style={styles.sectionLabel}>TIMELINE</p>
            {academicLogs.length === 0 && <p style={styles.empty}>No logs for this date.</p>}
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
  viewPort: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', backgroundColor: '#f0f4f8', position: 'fixed', top: 0, left: 0, fontFamily: 'Inter, sans-serif' },
  container: { width: '100%', maxWidth: '420px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' },
  
  // Header Design
  header: { padding: '40px 25px 30px 25px', backgroundColor: '#1e3a8a', color: '#fff', borderBottomLeftRadius: '35px', borderBottomRightRadius: '35px', boxShadow: '0 10px 20px rgba(30,58,138,0.2)' },
  topInfo: { textAlign: 'left', marginBottom: '25px' },
  greetingText: { fontSize: '14px', opacity: 0.8, margin: 0, letterSpacing: '0.5px' },
  studentName: { fontSize: '28px', fontWeight: '800', margin: '5px 0 0 0' },
  
  // Pill Selector
  dateSelectorPill: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50px', padding: '5px', backdropFilter: 'blur(10px)' },
  pillBtn: { background: 'none', border: 'none', color: '#fff', padding: '10px 20px', cursor: 'pointer', fontSize: '16px' },
  dateInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  pillLabel: { fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px', color: '#60a5fa' },
  pillInput: { background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', outline: 'none' },

  scrollArea: { flex: 1, overflowY: 'auto', padding: '25px' },
  section: { marginBottom: '35px' },
  sectionLabel: { fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '1px', marginBottom: '15px' },
  
  formCard: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '24px', border: '1px solid #e2e8f0' },
  fieldLabel: { fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', fontWeight: '600' },
  row: { display: 'flex', gap: '12px' },
  
  // VISIBILITY FIX
  select: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', color: '#1e293b', backgroundColor: '#fff', fontSize: '14px' },
  textarea: { width: '100%', boxSizing: 'border-box', marginTop: '15px', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', color: '#1e293b', minHeight: '90px', fontSize: '14px' },
  mainBtn: { width: '100%', marginTop: '15px', padding: '16px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px' },

  archiveBanner: { textAlign: 'center', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '15px', color: '#475569', fontWeight: 'bold', fontSize: '13px', marginBottom: '20px' },

  logCard: { display: 'flex', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', marginBottom: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  logSide: { backgroundColor: '#f8fafc', width: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#1e3a8a', borderRight: '1px solid #e2e8f0' },
  logMain: { padding: '15px', flex: 1 },
  logHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logSubject: { fontWeight: '700', color: '#0f172a', fontSize: '16px' },
  del: { background: 'none', border: 'none', color: '#cbd5e1', fontSize: '16px' },
  logTeacher: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  logNote: { fontSize: '13px', color: '#334155', marginTop: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #1e3a8a' },
  empty: { textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginTop: '30px' }
};

export default App;