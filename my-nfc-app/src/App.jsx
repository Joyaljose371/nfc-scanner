import React, { useState, useEffect } from 'react';

const GUEST_DATABASE = {
  "321": { name: "Joyal Jose", type: "VIP" },
  "654": { name: "Aibal Jose", type: "Staff" },
  "876": { name: "Dj", type: "Organizer" }
};

function App() {
  const [status, setStatus] = useState('READY');
  const [scanResult, setScanResult] = useState(null);
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // 1. AUTO-LOAD FROM URL (?id=321)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id');
    if (idFromUrl && GUEST_DATABASE[idFromUrl]) {
      setScanResult({ id: idFromUrl, ...GUEST_DATABASE[idFromUrl], authorized: true });
    }
  }, []);

  const addTodo = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setTodos([...todos, { text: inputValue, id: Date.now() }]);
    setInputValue('');
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        {!scanResult ? (
          <div style={styles.emptyState}>
            <div style={styles.icon}>📡</div>
            <h2>NFC Security Terminal</h2>
            <p style={{color: '#888'}}>Waiting for scan...</p>
          </div>
        ) : (
          <div style={styles.todoWrapper}>
            {/* Header with Guest Name */}
            <div style={styles.profileHeader}>
              <span style={styles.badge}>AUTHORIZED</span>
              <h1 style={styles.name}>{scanResult.name}</h1>
              <p style={styles.subText}>{scanResult.type} Checkpoint</p>
            </div>

            {/* Dynamic Todo List */}
            <div style={styles.todoSection}>
              <h3 style={styles.sectionTitle}>Checklist / Tasks</h3>
              
              <form onSubmit={addTodo} style={styles.form}>
                <input 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Add security note..."
                  style={styles.input}
                />
                <button type="submit" style={styles.addBtn}>+</button>
              </form>

              <div style={styles.list}>
                {todos.length === 0 ? (
                  <p style={styles.noData}>No tasks added yet.</p>
                ) : (
                  todos.map(todo => (
                    <div key={todo.id} style={styles.todoItem}>
                      <span>{todo.text}</span>
                      <button onClick={() => deleteTodo(todo.id)} style={styles.delBtn}>✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button onClick={() => setScanResult(null)} style={styles.reset}>Logout Session</button>
          </div>
        )}
        <p style={styles.statusLine}>[{status}]</p>
      </div>
    </div>
  );
}

const styles = {
  viewPort: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', position: 'fixed', top: 0, left: 0, fontFamily: '-apple-system, sans-serif' },
  container: { width: '90%', maxWidth: '400px', backgroundColor: '#fff', borderRadius: '24px', padding: '25px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', overflowY: 'auto', maxHeight: '90vh' },
  emptyState: { textAlign: 'center', padding: '40px 0' },
  icon: { fontSize: '60px', marginBottom: '20px' },
  profileHeader: { textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' },
  badge: { backgroundColor: '#2ecc71', color: '#fff', fontSize: '10px', padding: '4px 10px', borderRadius: '10px', fontWeight: 'bold' },
  name: { fontSize: '1.8rem', margin: '10px 0 0 0', color: '#2c3e50' },
  subText: { fontSize: '14px', color: '#95a5a6', margin: '5px 0' },
  todoSection: { textAlign: 'left' },
  sectionTitle: { fontSize: '16px', color: '#34495e', marginBottom: '15px' },
  form: { display: 'flex', gap: '10px', marginBottom: '20px' },
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  addBtn: { padding: '0 15px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '20px', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  todoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px', fontSize: '14px', borderLeft: '4px solid #3498db' },
  delBtn: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' },
  noData: { textAlign: 'center', color: '#bdc3c7', fontSize: '13px', fontStyle: 'italic' },
  reset: { width: '100%', background: 'none', border: 'none', color: '#95a5a6', marginTop: '20px', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' },
  statusLine: { textAlign: 'center', fontSize: '10px', color: '#bdc3c7', marginTop: '20px' }
};

export default App;