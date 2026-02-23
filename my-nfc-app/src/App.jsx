import React, { useState } from 'react';

const GUEST_DATABASE = {
  "321": { name: "Joyal Jose", type: "VIP", access: "Gate A" },
  "654": { name: "Aibal Jose", type: "Staff", access: "Gate B" },
  "876": { name: "Dj", type: "Organizer", access: "Full Access" }
};

function App() {
  const [status, setStatus] = useState('READY TO SCAN');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScan = async () => {
    if (!('NDEFReader' in window)) {
      setStatus('NFC NOT SUPPORTED');
      return;
    }
    try {
      setIsScanning(true);
      const ndef = new NDEFReader();
      await ndef.scan();
      setStatus('HOLD TAG TO PHONE');
      ndef.onreading = (event) => {
        const { message } = event;
        let writtenText = "";
        for (const record of message.records) {
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder(record.encoding);
            writtenText = textDecoder.decode(record.data);
          }
        }
        const cleanID = writtenText.trim();
        const guest = GUEST_DATABASE[cleanID];
        if (guest) {
          setScanResult({ id: cleanID, ...guest, authorized: true });
          setStatus('MATCH FOUND');
        } else {
          setScanResult({ id: cleanID || "Empty", name: "Unknown", type: "Invalid", authorized: false });
          setStatus('NO MATCH');
        }
        setIsScanning(false);
      };
    } catch (error) {
      setStatus(`ERROR: ${error.message}`);
      setIsScanning(false);
    }
  };

  return (
    /* This outer div is the key to centering */
    <div style={styles.viewPort}>
      <div style={styles.container}>
        <header style={styles.header}>
          <span style={styles.brand}>EVENT SECURITY</span>
          <div style={{...styles.dot, backgroundColor: isScanning ? '#2ecc71' : '#e74c3c'}}></div>
        </header>

        <div style={styles.cardSection}>
          {!scanResult ? (
            <div style={styles.emptyContent}>
              <div style={styles.circleIcon}>📡</div>
              <h2 style={styles.infoTitle}>Tap to scan card</h2>
              <p style={styles.infoSub}>Hold the NFC tag to your device</p>
            </div>
          ) : (
            <div style={{...styles.idCard, borderColor: scanResult.authorized ? '#2ecc71' : '#e74c3c'}}>
               <div style={{...styles.badge, backgroundColor: scanResult.authorized ? '#2ecc71' : '#e74c3c'}}>
                {scanResult.authorized ? 'SCANNED SUCCESSFULLY' : 'INVALID ENTRY'}
              </div>
              <div style={styles.avatar}>👤</div>
              <h1 style={styles.nameText}>{scanResult.name}</h1>
              <p style={styles.typeText}>{scanResult.type.toUpperCase()}</p>
              <p style={styles.idLabel}>ID: {scanResult.id}</p>
              <button onClick={() => setScanResult(null)} style={styles.retryBtn}>Clear Result</button>
            </div>
          )}
        </div>

        <footer style={styles.footer}>
          <p style={styles.statusLine}>{status}</p>
          {!scanResult && (
            <button onClick={startScan} disabled={isScanning} style={styles.actionBtn}>
              {isScanning ? 'ACTIVE...' : 'START CHECK'}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

const styles = {
  // THIS DIV FIXES THE LEFT-SIDE ISSUE
  viewPort: {
    width: '100vw',        // Full width of browser
    height: '100vh',       // Full height of browser
    display: 'flex',       // Enables Flexbox
    justifyContent: 'center', // Centers horizontally
    alignItems: 'center',     // Centers vertically
    backgroundColor: '#f0f2f5',
    margin: 0,
    padding: 0,
    position: 'fixed',     // Forces it to stay in place
    top: 0,
    left: 0
  },
  container: {
    width: '90%',
    maxWidth: '400px',     // Prevents desktop stretching
    height: '90%',
    maxHeight: '700px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    boxSizing: 'border-box'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  brand: { fontSize: '12px', fontWeight: 'bold', color: '#bdc3c7', letterSpacing: '1px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%' },
  cardSection: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyContent: { textAlign: 'center' },
  circleIcon: { fontSize: '50px', marginBottom: '15px' },
  infoTitle: { fontSize: '20px', color: '#2c3e50', margin: '0' },
  infoSub: { fontSize: '14px', color: '#95a5a6', marginTop: '8px' },
  idCard: { width: '100%', border: '2px solid', borderRadius: '20px', padding: '20px', textAlign: 'center' },
  badge: { color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '10px', display: 'inline-block', marginBottom: '15px' },
  avatar: { fontSize: '40px', background: '#f8f9fa', width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  nameText: { fontSize: '24px', margin: '0', color: '#2c3e50' },
  typeText: { fontSize: '14px', fontWeight: 'bold', margin: '5px 0', color: '#7f8c8d' },
  idLabel: { fontSize: '12px', color: '#bdc3c7' },
  retryBtn: { background: 'none', border: 'none', color: '#3498db', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold' },
  footer: { marginTop: 'auto' },
  statusLine: { textAlign: 'center', fontSize: '12px', color: '#3498db', fontWeight: 'bold', marginBottom: '12px' },
  actionBtn: { width: '100%', padding: '16px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
};

export default App;