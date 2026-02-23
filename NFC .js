import React, { useState, useEffect } from 'react';

const NfcScanner = () => {
  const [status, setStatus] = useState('Idle');
  const [scannedData, setScannedData] = useState({ id: '---', message: [] });
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if the browser supports Web NFC
    if (!('NDEFReader' in window)) {
      setIsSupported(false);
      setStatus('NFC not supported on this browser.');
    }
  }, []);

  const startScanning = async () => {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      
      setStatus('Scanning... Place a tag near your phone.');

      ndef.onreadingerror = () => {
        setStatus('Reading error. Try again.');
      };

      ndef.onreading = ({ message, serialNumber }) => {
        setStatus('Scan Successful!');
        
        // Process records into a readable format
        const records = message.records.map(record => {
          const decoder = new TextDecoder(record.encoding || 'utf-8');
          return {
            type: record.recordType,
            data: decoder.decode(record.data)
          };
        });

        setScannedData({ id: serialNumber, message: records });
      };

    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error(error);
    }
  };

  if (!isSupported) {
    return <div style={{ color: 'red', padding: '20px' }}>{status}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>NFC ID Scanner</h2>
        <p style={{ color: status.includes('Ready') || status.includes('Scan') ? 'green' : 'gray' }}>
          ● {status}
        </p>

        <div style={styles.idBox}>
          <small>TAG ID</small>
          <div style={styles.serialNumber}>{scannedData.id}</div>
        </div>

        {scannedData.message.length > 0 && (
          <div style={styles.details}>
            <strong>Content:</strong>
            {scannedData.message.map((rec, i) => (
              <p key={i} style={styles.recordText}>
                [{rec.type}]: {rec.data}
              </p>
            ))}
          </div>
        )}

        <button onClick={startScanning} style={styles.button}>
          Start Scanning
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' },
  card: { padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', background: '#fff', width: '320px', textAlign: 'center' },
  idBox: { margin: '20px 0', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' },
  serialNumber: { fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff', marginTop: '5px' },
  details: { textAlign: 'left', fontSize: '0.9rem', borderTop: '1px solid #eee', paddingTop: '10px' },
  recordText: { margin: '5px 0', color: '#555' },
  button: { width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};

export default NfcScanner;