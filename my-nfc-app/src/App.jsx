import React, { useState } from 'react';

// Database matches the TEXT written on the tags
const GUEST_DATABASE = {
  "321": { name: "Joyal Jose", type: "VIP", access: "Gate A" },
  "654": { name: "Aibal Jose", type: "Staff", access: "Gate B" },
  "876": { name: "Dj", type: "Organizer", access: "Full Access" }
};

function App() {
  const [status, setStatus] = useState('SYSTEM READY');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScan = async () => {
    if (!('NDEFReader' in window)) {
      setStatus('HARDWARE NOT SUPPORTED');
      return;
    }

    try {
      setIsScanning(true);
      const ndef = new NDEFReader();
      await ndef.scan();
      setStatus('APPROACH TAG TO SENSOR...');

      ndef.onreading = (event) => {
        const { message } = event;
        let writtenText = "";

        // Decode the written text from the NDEF records
        for (const record of message.records) {
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder(record.encoding);
            writtenText = textDecoder.decode(record.data);
          }
        }

        // Clean the text (remove spaces/newlines)
        const cleanID = writtenText.trim();
        const guest = GUEST_DATABASE[cleanID];

        if (guest) {
          setScanResult({ id: cleanID, ...guest, authorized: true });
          setStatus('VERIFIED');
        } else {
          setScanResult({ 
            id: cleanID || "Empty Tag", 
            name: "UNKNOWN", 
            type: "WARNING", 
            authorized: false 
          });
          setStatus('ACCESS DENIED');
        }
      };

    } catch (error) {
      setStatus(`ERROR: ${error.message}`);
      setIsScanning(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.branding}>EVENT SECURITY PRO</div>
        <div style={{...styles.statusDot, backgroundColor: isScanning ? '#00ff00' : '#ff0000'}}></div>
      </header>

      <div style={styles.main}>
        {scanResult ? (
          <div style={{
            ...styles.idCard, 
            boxShadow: scanResult.authorized ? '0 0 20px rgba(0,255,0,0.2)' : '0 0 20px rgba(255,0,0,0.2)',
            borderColor: scanResult.authorized ? '#00ff00' : '#ff0000'
          }}>
            <div style={styles.cardHeader}>IDENTITY VERIFICATION</div>
            
            <div style={styles.idSection}>
              <span style={styles.label}>TAG CONTENT (WRITTEN ID)</span>
              <span style={styles.idValue}>{scanResult.id}</span>
            </div>

            <div style={styles.nameSection}>
              <h1 style={styles.name}>{scanResult.name}</h1>
              <p style={{...styles.type, color: scanResult.authorized ? '#00ff00' : '#ff4444'}}>
                {scanResult.type.toUpperCase()}
              </p>
            </div>

            {scanResult.authorized && (
              <div style={styles.accessZone}>
                <span style={styles.label}>PERMITTED ZONE</span>
                <div style={styles.zoneName}>{scanResult.access}</div>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>STANDING BY FOR INPUT</p>
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.consoleText}>[{new Date().toLocaleTimeString()}] {status}</p>
          <button 
            onClick={startScan} 
            disabled={isScanning}
            style={{...styles.scanBtn, backgroundColor: isScanning ? '#333' : '#fff', color: isScanning ? '#666' : '#000'}}
          >
            {isScanning ? 'SCANNER ACTIVE...' : 'START SECURITY CHECK'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' },
  header: { padding: '15px 20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  branding: { letterSpacing: '3px', fontWeight: 'bold', fontSize: '0.9rem' },
  statusDot: { width: '10px', height: '10px', borderRadius: '50%', boxShadow: '0 0 10px currentColor' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  idCard: { backgroundColor: '#111', width: '100%', maxWidth: '340px', borderRadius: '4px', border: '1px solid #333', padding: '20px' },
  cardHeader: { fontSize: '0.6rem', color: '#666', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '5px' },
  idSection: { marginBottom: '20px' },
  label: { fontSize: '0.6rem', color: '#555', display: 'block', marginBottom: '5px' },
  idValue: { fontSize: '1.2rem', color: '#00ccff', fontWeight: 'bold' },
  nameSection: { textAlign: 'center', padding: '20px 0', borderTop: '1px solid #222', borderBottom: '1px solid #222' },
  name: { fontSize: '2rem', margin: '0 0 5px 0', letterSpacing: '-1px' },
  type: { margin: 0, fontSize: '0.9rem', fontWeight: 'bold' },
  accessZone: { marginTop: '15px', textAlign: 'left' },
  zoneName: { fontSize: '1.1rem', color: '#fff' },
  emptyState: { textAlign: 'center', color: '#333' },
  footer: { width: '100%', maxWidth: '340px', marginTop: '40px' },
  consoleText: { fontSize: '0.7rem', color: '#00ccff', marginBottom: '10px' },
  scanBtn: { width: '100%', padding: '18px', border: 'none', borderRadius: '2px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }
};

export default App;