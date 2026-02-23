import React, { useState, useEffect } from 'react';

const GUEST_DATABASE = {
  "321": { name: "Joyal Jose", type: "VIP", color: "#2ecc71" },
  "654": { name: "Aibal Jose", type: "Staff", color: "#3498db" },
  "876": { name: "Dj", type: "Organizer", color: "#9b59b6" }
};

function App() {
  const [scanResult, setScanResult] = useState(null);
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // 1. URL Detection & Session Management
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id');
    if (idFromUrl && GUEST_DATABASE[idFromUrl]) {
      setScanResult({ id: idFromUrl, ...GUEST_DATABASE[idFromUrl] });
    }
  }, []);

  // 2. Persistent Storage (Load)
  useEffect(() => {
    if (scanResult) {
      const savedData = localStorage.getItem(`tasks_${scanResult.id}`);
      setTodos(savedData ? JSON.parse(savedData) : []);
    }
  }, [scanResult]);

  // 3. Persistent Storage (Save)
  useEffect(() => {
    if (scanResult) {
      localStorage.setItem(`tasks_${scanResult.id}`, JSON.stringify(todos));
    }
  }, [todos, scanResult]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Interaction: Haptic feedback if supported
    if (navigator.vibrate) navigator.vibrate(50);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTodo = { text: inputValue, id: Date.now(), time: time };
    setTodos([newTodo, ...todos]); // Newest at top
    setInputValue('');
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        {!scanResult ? (
          <div style={styles.emptyState}>
            <div style={styles.iconCircle}>((( )))</div>
            <h2 style={styles.mainTitle}>NFC Security Terminal</h2>
            <p style={styles.subTitle}>Tap Tag to View Checklist</p>
            <div style={styles.bottomButtons}>
                <button style={styles.secondaryBtn}>Exit User</button>
                <button style={styles.secondaryBtn}>Exit User</button>
            </div>
          </div>
        ) : (
          <div style={styles.wrapper}>
            {/* Header Section */}
            <header style={styles.header}>
              <div style={styles.topRow}>
                <div style={styles.avatar}>👤</div>
                <div style={styles.headerText}>
                   <p style={styles.dbLabel}>GUEST DATABASE</p>
                   <p style={styles.dbDetails}>{scanResult.type} • {scanResult.name}</p>
                </div>
              </div>
              
              <div style={styles.card}>
                <span style={styles.activeBadge}>HISTORY ACTIVE</span>
                <h1 style={styles.guestName}>{scanResult.name}</h1>
                <p style={styles.idSub}>ID: {scanResult.id} • Registered</p>
              </div>
            </header>

            {/* Input Section */}
            <div style={styles.content}>
               <p style={styles.label}>Todo Wrapper</p>
               <form onSubmit={addTodo} style={styles.form}>
                  <input 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="New security note..."
                    style={styles.input}
                  />
                  <button type="submit" style={styles.addBtn}>+</button>
               </form>

               {/* Checklist */}
               <div style={styles.list}>
                  <p style={styles.label}>List</p>
                  {todos.map(todo => (
                    <div key={todo.id} style={styles.todoItem}>
                      <div style={styles.itemColorBar}></div>
                      <div style={styles.itemMain}>
                        <span style={styles.itemText}>{todo.text}</span>
                        <span style={styles.itemTime}>{todo.time}</span>
                      </div>
                      <button onClick={() => deleteTodo(todo.id)} style={styles.delBtn}>✕</button>
                    </div>
                  ))}
                  {todos.length === 0 && <p style={styles.emptyMsg}>No history found.</p>}
               </div>
            </div>

            <footer style={styles.footer}>
                <button onClick={() => { setScanResult(null); window.history.pushState({}, '', '/'); }} style={styles.exportBtn}>
                  Exit & Clear Session
                </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  viewPort: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#eef2f5', position: 'fixed', top: 0, left: 0, fontFamily: '-apple-system, sans-serif' },
  container: { width: '100%', maxWidth: '420px', height: '100%', maxHeight: '850px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  
  // Empty State Styles
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  iconCircle: { width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#8e8e93', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' },
  mainTitle: { color: '#1c1c1e', margin: '0 0 10px 0' },
  subTitle: { color: '#8e8e93', fontSize: '16px' },
  bottomButtons: { position: 'absolute', bottom: '40px', display: 'flex', gap: '15px' },
  secondaryBtn: { padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#f2f2f7', color: '#1c1c1e', fontWeight: '600' },

  // Active State Styles
  wrapper: { flex: 1, backgroundColor: '#f2f2f7', display: 'flex', flexDirection: 'column' },
  header: { backgroundColor: '#2c3e50', padding: '20px', borderBottomLeftRadius: '25px', borderBottomRightRadius: '25px' },
  topRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  avatar: { width: '45px', height: '45px', backgroundColor: '#e74c3c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  dbLabel: { color: '#bdc3c7', fontSize: '10px', margin: 0, fontWeight: 'bold' },
  dbDetails: { color: '#fff', fontSize: '13px', margin: 0 },
  
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', textAlign: 'left', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  activeBadge: { color: '#2ecc71', fontSize: '10px', fontWeight: 'bold', border: '1px solid #2ecc71', padding: '2px 8px', borderRadius: '5px' },
  guestName: { fontSize: '24px', margin: '10px 0 0 0', color: '#1c1c1e' },
  idSub: { fontSize: '12px', color: '#8e8e93', margin: '5px 0 0 0' },

  content: { padding: '20px', flex: 1, overflowY: 'auto' },
  label: { fontSize: '12px', color: '#8e8e93', marginBottom: '10px', fontWeight: '600' },
  form: { display: 'flex', gap: '10px', marginBottom: '25px' },
  input: { flex: 1, padding: '15px', borderRadius: '12px', border: 'none', boxShadow: 'inset 0 0 0 1px #ddd', fontSize: '14px' },
  addBtn: { width: '50px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '24px', cursor: 'pointer' },

  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  todoItem: { display: 'flex', backgroundColor: '#fff', padding: '12px', borderRadius: '12px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  itemColorBar: { width: '4px', height: '30px', backgroundColor: '#3498db', borderRadius: '2px', marginRight: '12px' },
  itemMain: { flex: 1, display: 'flex', flexDirection: 'column' },
  itemText: { fontSize: '15px', color: '#1c1c1e', fontWeight: '500' }, // FIXED: Dark text on white bg
  itemTime: { fontSize: '10px', color: '#8e8e93', marginTop: '4px' },
  delBtn: { backgroundColor: '#fff', border: 'none', color: '#ff3b30', fontSize: '18px', cursor: 'pointer', padding: '0 10px' },
  emptyMsg: { textAlign: 'center', color: '#8e8e93', fontSize: '13px', marginTop: '20px' },

  footer: { padding: '20px', textAlign: 'center' },
  exportBtn: { background: 'none', border: 'none', color: '#3498db', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }
};

export default App;