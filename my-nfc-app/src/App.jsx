import React, { useState, useEffect } from 'react';

const GUEST_DATABASE = {
  "321": { 
    name: "Joyal Jose", 
    classNo: "233734", 
    college: "Kuriakose Elias College",
    department: "Computer Science",
    validUntil: "2027",
    color: "#800000" // College Maroon
  },
  "654": { 
    name: "Aibal Jose", 
    classNo: "233735", 
    college: "Kuriakose Elias College",
    department: "Physics",
    validUntil: "2027",
    color: "#003366" 
  }
};

function App() {
  const [scanResult, setScanResult] = useState(null);
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id');
    if (idFromUrl && GUEST_DATABASE[idFromUrl]) {
      setScanResult({ id: idFromUrl, ...GUEST_DATABASE[idFromUrl] });
    }
  }, []);

  useEffect(() => {
    if (scanResult) {
      const savedData = localStorage.getItem(`logs_${scanResult.id}`);
      setTodos(savedData ? JSON.parse(savedData) : []);
    }
  }, [scanResult]);

  useEffect(() => {
    if (scanResult) {
      localStorage.setItem(`logs_${scanResult.id}`, JSON.stringify(todos));
    }
  }, [todos, scanResult]);

  const addEntry = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (navigator.vibrate) navigator.vibrate(40);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry = { text: inputValue, id: Date.now(), time: time };
    setTodos([newEntry, ...todos]);
    setInputValue('');
  };

  const deleteEntry = (id) => setTodos(todos.filter(t => t.id !== id));

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        {!scanResult ? (
          <div style={styles.emptyState}>
            <div style={styles.collegeLogoPlaceholder}>KE</div>
            <h2 style={styles.mainTitle}>KE College Security</h2>
            <p style={styles.subTitle}>Scan ID Card to Verify Access</p>
          </div>
        ) : (
          <div style={styles.wrapper}>
            {/* Academic ID Header */}
            <header style={{...styles.header, backgroundColor: scanResult.color}}>
              <p style={styles.collegeName}>{scanResult.college.toUpperCase()}</p>
              <div style={styles.idCardContent}>
                <div style={styles.avatarLarge}>👤</div>
                <div style={styles.idInfo}>
                  <h1 style={styles.studentName}>{scanResult.name}</h1>
                  <p style={styles.classText}>Class No: <b>{scanResult.classNo}</b></p>
                  <p style={styles.deptText}>{scanResult.department}</p>
                </div>
              </div>
              <div style={styles.validBadge}>VALID UNTIL {scanResult.validUntil}</div>
            </header>

            {/* Security Log Section */}
            <div style={styles.content}>
               <p style={styles.label}>GATE ENTRY LOGS</p>
               <form onSubmit={addEntry} style={styles.form}>
                  <input 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Add entry note (e.g. Late Entry)..."
                    style={styles.input}
                  />
                  <button type="submit" style={{...styles.addBtn, backgroundColor: scanResult.color}}>+</button>
               </form>

               <div style={styles.list}>
                  {todos.map(todo => (
                    <div key={todo.id} style={styles.todoItem}>
                      <div style={{...styles.itemColorBar, backgroundColor: scanResult.color}}></div>
                      <div style={styles.itemMain}>
                        <span style={styles.itemText}>{todo.text}</span>
                        <span style={styles.itemTime}>{todo.time}</span>
                      </div>
                      <button onClick={() => deleteEntry(todo.id)} style={styles.delBtn}>✕</button>
                    </div>
                  ))}
                  {todos.length === 0 && <p style={styles.emptyMsg}>No recent logs found.</p>}
               </div>
            </div>

            <footer style={styles.footer}>
                <button onClick={() => { setScanResult(null); window.history.pushState({}, '', '/'); }} style={styles.exitBtn}>
                  CLOSE STUDENT PROFILE
                </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  viewPort: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', position: 'fixed', top: 0, left: 0, fontFamily: 'system-ui, -apple-system, sans-serif' },
  container: { width: '100%', maxWidth: '420px', height: '100%', maxHeight: '850px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' },
  
  // Login Styles
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  collegeLogoPlaceholder: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#800000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', boxShadow: '0 8px 16px rgba(128,0,0,0.2)' },
  mainTitle: { color: '#1a1a1a', marginBottom: '8px' },
  subTitle: { color: '#666', fontSize: '14px' },

  // ID View Styles
  wrapper: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' },
  header: { padding: '30px 20px', color: '#fff', textAlign: 'center', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  collegeName: { fontSize: '12px', letterSpacing: '2px', fontWeight: '700', opacity: 0.9, marginBottom: '20px' },
  idCardContent: { display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'left', marginBottom: '20px' },
  avatarLarge: { width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
  idInfo: { flex: 1 },
  studentName: { fontSize: '22px', margin: '0 0 4px 0', fontWeight: 'bold' },
  classText: { fontSize: '14px', margin: 0, opacity: 0.9 },
  deptText: { fontSize: '12px', margin: '4px 0 0 0', opacity: 0.8 },
  validBadge: { display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' },

  content: { padding: '25px 20px', flex: 1, overflowY: 'auto' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#888', marginBottom: '15px', letterSpacing: '1px' },
  form: { display: 'flex', gap: '8px', marginBottom: '25px' },
  input: { flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  addBtn: { width: '50px', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '24px', cursor: 'pointer' },

  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  todoItem: { display: 'flex', backgroundColor: '#fff', padding: '14px', borderRadius: '15px', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
  itemColorBar: { width: '4px', height: '35px', borderRadius: '2px', marginRight: '15px' },
  itemMain: { flex: 1, display: 'flex', flexDirection: 'column' },
  itemText: { fontSize: '15px', color: '#2c3e50', fontWeight: '500' },
  itemTime: { fontSize: '10px', color: '#999', marginTop: '4px' },
  delBtn: { background: 'none', border: 'none', color: '#ff4d4d', fontSize: '18px', cursor: 'pointer' },
  emptyMsg: { textAlign: 'center', color: '#aaa', fontSize: '13px', marginTop: '30px' },

  footer: { padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#fff' },
  exitBtn: { width: '100%', padding: '15px', background: 'none', border: '1px solid #ddd', borderRadius: '12px', color: '#666', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }
};

export default App;