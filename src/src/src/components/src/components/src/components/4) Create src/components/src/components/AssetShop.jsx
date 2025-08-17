import React, { useEffect, useState } from 'react';

const CATALOG = [
  { id: 'item_boost1', name: 'Boost +20%', desc: 'Increase earnings by 20%', priceSC: 200 },
  { id: 'item_boost2', name: 'Boost +50%', desc: 'Increase earnings by 50%', priceSC: 500 },
];

export default function AssetShop({ entityId = 1 }) {
  const [msg, setMsg] = useState('');
  const [balance, setBalance] = useState({ SC: 0, USD: 0 });

  async function refreshBalance() {
    try {
      const r = await fetch(`/api/balances?entityId=${entityId}`);
      const b = await r.json();
      setBalance(b);
    } catch (e) {}
  }

  useEffect(() => { refreshBalance(); }, [entityId]);

  async function buy(assetId) {
    setMsg('');
    try {
      const r = await fetch('/api/purchaseAsset', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ entityId, assetId }),
      });
      const t = await r.text();
      setMsg(`Purchase: ${t}`);
      await refreshBalance();
    } catch (e) {
      setMsg('Purchase failed: ' + e);
    }
  }

  return (
    <div style={{background:'#151d2b',border:'1px solid #263145',borderRadius:14,padding:16,marginBottom:16}}>
      <h2 style={{marginTop:0}}>Asset Shop</h2>
      <div style={{marginBottom:8, color:'#9fb0c8'}}>Entity #{entityId} • Balance: {Number(balance.SC||0).toLocaleString()} SC</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:12}}>
        {CATALOG.map(item => (
          <div key={item.id} style={{background:'#0f1622',border:'1px solid #263145',borderRadius:12,padding:12}}>
            <div style={{fontWeight:'bold'}}>{item.name}</div>
            <div style={{fontSize:13, color:'#9fb0c8'}}>{item.desc}</div>
            <div style={{margin:'8px 0'}}>Price: {item.priceSC} SC</div>
            <button onClick={() => buy(item.id)}>Buy</button>
          </div>
        ))}
      </div>
      {msg && <div style={{marginTop:8, color:'#9fb0c8'}}>{msg}</div>}
    </div>
  );
}
