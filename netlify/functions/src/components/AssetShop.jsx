import React, { useEffect, useState } from 'react';

export default function AssetShop({ entityId = 1 }) {
  const [balance, setBalance] = useState({ SC: 0, USD: 0 });
  const [catalog, setCatalog] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [msg, setMsg] = useState('');

  async function loadAll() {
    setMsg('');
    const [b, c, inv] = await Promise.all([
      fetch(`/api/balances?entityId=${entityId}`).then(r=>r.json()),
      fetch('/api/assets').then(r=>r.json()),
      fetch(`/api/inventory?entityId=${entityId}`).then(r=>r.json())
    ]);
    setBalance(b);
    setCatalog(c.catalog || []);
    setInventory(inv.inventory || []);
  }

  useEffect(() => { loadAll(); }, [entityId]);

  async function buy(assetId) {
    setMsg('');
    const r = await fetch('/api/purchaseAsset', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ entityId, assetId })
    });
    if (!r.ok) { setMsg(await r.text()); return; }
    const data = await r.json();
    setBalance(data.newBalance);
    setInventory(data.inventory);
    setMsg(`Purchased ${data.item.name} ✅`);
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Asset Shop</h2>
      <div style={{marginBottom:8}}>Balance: <strong>{balance.SC}</strong> SC</div>
      {msg && <div style={{marginBottom:8,color:'#9fb0c8'}}>{msg}</div>}

      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead style={{background:'#004080',color:'#fff'}}>
          <tr><th>Name</th><th>Kind</th><th>Cost (SC)</th><th>Action</th></tr>
        </thead>
        <tbody>
          {catalog.map(a => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.kind}</td>
              <td>{a.costSC}</td>
              <td><button onClick={() => buy(a.id)}>Buy</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{marginTop:16}}>Inventory</h3>
      {inventory.length === 0 ? <div>None yet.</div> : (
        <ul>
          {inventory.map(i => <li key={i.id}>{i.name} ×{i.qty}</li>)}
        </ul>
      )}
    </div>
  );
}
