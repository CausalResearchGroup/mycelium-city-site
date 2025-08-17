import React from 'react';
import DevControlPanel from './components/DevControlPanel';
import AssetShop from './components/AssetShop';

export default function App() {
  const demoEntityId = 1; // swap to real entity later
  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>🧠 Mycelium City – President Dashboard</h1>
      {/* Admin/test panel: Rush, Grant SC, Credit $ */}
      <DevControlPanel />
      {/* Simple shop with +20% / +50% boosters */}
      <AssetShop entityId={demoEntityId} />
    </div>
  );
}
import React from 'react';
import DevControlPanel from './components/DevControlPanel';
import AssetShopGalaxy from './components/AssetShopGalaxy';

export default function App() {
  const demoEntityId = 1;
  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>🧠 Mycelium City – President Dashboard</h1>
      <DevControlPanel />
      <AssetShopGalaxy entityId={demoEntityId} />
    </div>
  );
}
