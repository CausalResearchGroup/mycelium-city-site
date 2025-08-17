import React, { useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import LoginForm from './components/LoginForm';
import MeshControls from './components/MeshControls';
import EarningsChart from './components/EarningsChart';
import EntityList from './components/EntityList';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    netlifyIdentity.init();
    netlifyIdentity.on('login', u => { setUser(u); netlifyIdentity.close(); });
    netlifyIdentity.on('logout', () => setUser(null));
    setUser(netlifyIdentity.currentUser());
  }, []);

  if (!user) return <LoginForm />;

  return (
    <div style={{ padding: '2rem', maxWidth: 960, margin: 'auto' }}>
      <button onClick={() => netlifyIdentity.logout()}>Logout</button>
      <h1>Mesh Admin Dashboard</h1>
      <MeshControls />
      <EarningsChart />
      <EntityList />
    </div>
  );
}
