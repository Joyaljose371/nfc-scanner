import React, { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('Idle');
  const [scannedId, setScannedId] = useState('---');

  const startScan = async () => {
    if (!('NDEFReader' in window)) {
      setStatus('NFC not supported on this device/browser.');
      return;
    }

    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      setStatus('Scanning... Tap a tag!');

      ndef.onreading = (event) => {
        setScannedId(event.serialNumber);
        setStatus('Scan successful!');
      };
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>NFC ID Reader</h1>
      <div style={{ 
        margin: '20px auto', 
        padding: '20px', 
        border: '2px solid #007bff', 
        borderRadius: '15px', 
        width: '280px' 
      }}>
        <p style={{ fontSize: '0.8rem', color: '#666' }}>STATUS: {status}</p>
        <h2 style={{ color: '#007bff' }}>{scannedId}</h2>
      </div>
      <button 
        onClick={startScan}
        style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer' }}
      >
        Start NFC Scanner
      </button>
    </div>
  );
}

export default App;