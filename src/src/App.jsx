import React from 'react';
import SetupWizard from './components/SetupWizard';

export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>🧠 Mycelium City Dashboard</h1>
      <SetupWizard />
    </div>
  );
}
