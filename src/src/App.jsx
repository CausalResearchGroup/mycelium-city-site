import React from 'react';
import SetupWizard from './components/SetupWizard';

export default function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>🧠 Mycelium City – President Dashboard</h1>
      <SetupWizard />
    </div>
  );
}
