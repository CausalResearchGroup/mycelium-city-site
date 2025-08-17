import React, { useState, useEffect } from 'react';

export default function MeshControls() {
  const [status, setStatus] = useState({ paused: false, scheduledShutdownTime: null });

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const manualShutdown = async () => {
    await fetch('/api/shutdown', { method: 'POST' });
    fetchStatus();
  };

  const manualResume = async () => {
    await fetch('/api/resume', { method: 'POST' });
    fetchStatus();
  };

  const scheduleShutdown = async () => {
    const dateStr = prompt('Enter shutdown date/time (e.g. 2025-08-24T03:00:00):');
    if (!dateStr) return;
    const timestamp = new Date(dateStr);
    if (isNaN(timestamp.getTime())) { alert('Invalid date/time format.'); return; }
    await fetch('/api/scheduleShutdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: timestamp.toISOString() }),
    });
    fetchStatus();
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <p><strong>Status: </strong>{status.paused ? 'Paused' : 'Running'}</p>
      <p><strong>Scheduled Shutdown: </strong>
        {status.scheduledShutdownTime ? new Date(status.scheduledShutdownTime).toLocaleString() : 'None'}
      </p>
      {!status.paused ? (
        <button onClick={manualShutdown} style={{ marginRight: '1rem' }}>Manual Shutdown</button>
      ) : (
        <button onClick={manualResume} style={{ marginRight: '1rem' }}>Resume Mesh</button>
      )}
      <button onClick={scheduleShutdown}>Schedule Shutdown</button>
    </div>
  );
}
