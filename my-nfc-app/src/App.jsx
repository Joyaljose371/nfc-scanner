import React, { useState } from 'react';

function App() {
  const [status, setStatus] = useState('Idle');
  const [scannedId, setScannedId] = useState('---');
  const [tagContent, setTagContent] = useState(''); // New state for written content

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
        const { message, serialNumber } = event;
        setScannedId(serialNumber);
        
        // 1. Loop through the records on the tag
        let content = "";
        for (const record of message.records) {
          // 2. Decode text records
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder(record.encoding);
            content += textDecoder.decode(record.data);
          } 
          // 3. Decode URL records
          else if (record.recordType === "url") {
            const textDecoder = new TextDecoder();
            content += textDecoder.decode(record.data);
          }
        }

        setTagContent(content || "Empty or unknown data");
        setStatus('Scan successful!');
      };

      ndef.onreadingerror = () => {
        setStatus("Cannot read tag. Try again.");
      };

    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>NFC Reader</h1>
      <div style={{ 
        margin: '20px auto', 
        padding: '20px', 
        border: '2px solid #007bff', 
        borderRadius: '15px', 
        width: '300px',
        backgroundColor: '#f8f9fa'
      }}>
        <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>STATUS: {status}</p>
        <p style={{ margin: '0', fontSize: '0.8rem' }}>Serial: {scannedId}</p>
        <hr />
        <h3 style={{ color: '#007bff', wordWrap: 'break-word' }}>
          {tagContent || "Waiting for data..."}
        </h3>
      </div>
      <button 
        onClick={startScan}
        style={{ 
          padding: '12px 24px', 
          fontSize: '1rem', 
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        Start Scanner
      </button>
    </div>
  );
}

export default App;