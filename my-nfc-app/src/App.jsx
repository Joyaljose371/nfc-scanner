import React, { useState, useEffect } from 'react';

// Your Specific Guest Database
const GUEST_DATABASE = {
  "321": { name: "Joyal Jose", type: "VIP", access: "Gate A" },
  "654": { name: "Aibal Jose", type: "Staff", access: "Gate B" },
  "876": { name: "Dj", type: "Organizer", access: "Full Access" }
};

function App() {
  const [status, setStatus] = useState('SYSTEM READY');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // 1. AUTO-LOAD DATA FROM URL (Detects ?id=321)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id');

    if (idFromUrl && GUEST_DATABASE[idFromUrl]) {
      setScanResult({ id: idFromUrl, ...GUEST_DATABASE[idFromUrl], authorized: true });
      setStatus('MATCH FOUND VIA LINK');
    }
  }, []);

  // 2. NFC SCAN LOGIC
  const startScan = async () => {
    if (!('NDEFReader' in window)) {
      setStatus('NFC NOT SUPPORTED');
      return;
    }
    try {
      setIsScanning(true);
      const ndef = new NDEFReader();
      await ndef.scan();
      setStatus('TAP TAG NOW');
      
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
          setStatus('VERIFIED');
        } else {
          setScanResult({ id: cleanID || "Empty", name: "Unknown", type: "Invalid", authorized: false });
          setStatus('DENIED');
        }
        setIsScanning(false);
      };
    } catch (error) {
      setStatus(`ERROR: ${error.message}`);
      setIsScanning(false);
    }
  };

  return (
    <div style={styles.viewPort}>
      <div style={styles.container}>
        <div style={styles.cardArea}>
          {!scanResult ? (
            <div style={styles.emptyContent}>
              <div style={styles.icon}>📡</div>
              <h2 style={{margin: '10px 0'}}>Security Terminal</h2>
              <p style={{color: '#888', fontSize: '14px'}}>Scan a tag or use an ID link</p>
            </div>
          ) : (
            <div style={{...styles.idCard, borderColor: scanResult.authorized ? '#2ecc71' : '#e74c3c'}}>
              <div style={{...styles.badge, backgroundColor: scanResult.authorized ? '#2ecc71' : '#e74c3c'}}>
                {scanResult.authorized ? 'SCANNED SUCCESSFULLY' : 'INVALID ENTRY'}
              </div>
              <h1 style={styles.name}>{scanResult.name}</h1>
              <p style={styles.type}>{scanResult.type} • {scanResult.access || 'No Access'}</p>
              <button onClick={() => setScanResult(null)} style={styles.clear}>Try Another</button>
            </div>
          )}
        </div>
        
        {!scanResult && (
          <button onClick={startScan} disabled={isScanning} style={styles.btn}>
            {isScanning ? 'SCANNER ACTIVE...' : 'START SECURITY CHECK'}
          </button>
        )}
        <p style={styles.status}>[{status}]</p>
      </div>
    </div>
  );
}

const styles = {
  viewPort: { 
    width: '100vw', 
    height: '100vh', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f0f2f5', 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    fontFamily: '-apple-system, sans-serif' 
  },
  container: { 
    width: '90%', 
    maxWidth: '400px', 
    backgroundColor: '#fff', 
    borderRadius: '24px', 
    padding: '30px', 
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)', 
    textAlign: 'center' 
  },
  cardArea: { minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyContent: { textAlign: 'center' },
  icon: { fontSize: '60px', marginBottom: '10px' },
  idCard: { width: '100%', border: '3px solid', padding: '30px 10px', borderRadius: '20px' },
  badge: { color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '5px 15px', borderRadius: '10px', display: 'inline-block', marginBottom: '15px' },
  name: { fontSize: '2.2rem', margin: '10px 0', color: '#2c3e50', letterSpacing: '-1px' },
  type: { fontWeight: 'bold', color: '#7f8c8d', marginBottom: '20px' },
  btn: { width: '100%', padding: '18px', borderRadius: '12px', border: 'none', backgroundColor: '#3498db', color: '#fff', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
  status: { fontSize: '11px', marginTop: '15px', color: '#3498db', letterSpacing: '1px', fontWeight: 'bold' },
  clear: { background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }
};

export default App;