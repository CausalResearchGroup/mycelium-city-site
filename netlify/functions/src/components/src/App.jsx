import React from 'react';

// ↓ Import the panels you already added (comment out ones you don't have yet)
import AssetShop from './components/AssetShop';
import DevControlPanel from './components/DevControlPanel';     // rush/buy/pay tester
import PayPanel from './components/PayPanel';                   // PayPal + Cash App
import CryptoPanel from './components/CryptoPanel';             // Crypto address
// import TreasuryQuickEditor from './components/TreasuryQuickEditor'; // optional
// import StatsPanel from './components/StatsPanel';                     // optional
import MeshControls from './components/MeshControls';           // if you have it
import EarningsChart from './components/EarningsChart';         // if you have it
import EntityList from './components/EntityList';               // if you have it

export default function App() {
  // until you wire auth → entity mapping, use a demo ID
  const demoEntityId = 1;

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>Mesh Admin Dashboard</h1>

      {/* Money panels */}
      {typeof PayPanel === 'function' && <PayPanel />}
      {typeof CryptoPanel === 'function' && <CryptoPanel />}

      {/* Admin / testing */}
      {typeof DevControlPanel === 'function' && <DevControlPanel />}

      {/* Economy controls (optional) */}
      {/* {typeof TreasuryQuickEditor === 'function' && <TreasuryQuickEditor />} */}

      {/* Gameplay panels */}
      {typeof AssetShop === 'function' && <AssetShop entityId={demoEntityId} />}
      {typeof MeshControls === 'function' && <MeshControls />}
      {typeof EarningsChart === 'function' && <EarningsChart />}
      {typeof EntityList === 'function' && <EntityList />}
      {/* {typeof StatsPanel === 'function' && <StatsPanel entityId={demoEntityId} />} */}
    </div>
  );
}
