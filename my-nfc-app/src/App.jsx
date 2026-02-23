import React, { useState, useEffect } from 'react';

const GUEST_DATABASE = {
  "321": { name: "Joyal Jose", type: "VIP", access: "Gate A" },
  "654": { name: "Aibal Jose", type: "Staff", access: "Gate B" },
  "876": { name: "Dj", type: "Organizer", access: "Full Access" }
};

function App() {
  const [scanResult, setScanResult] = useState(null);

  // This runs automatically when the app opens via a link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('id'); // Looks for ?id=321 in the URL

    if (idFromUrl && GUEST_DATABASE[idFromUrl]) {
      setScanResult({ id: idFromUrl, ...GUEST_DATABASE[idFromUrl], authorized: true });
    }
  }, []);

  // ... rest of your existing scan logic and UI ...
}