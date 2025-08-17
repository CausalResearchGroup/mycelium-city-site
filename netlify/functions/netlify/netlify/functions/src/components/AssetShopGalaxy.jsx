// src/components/AssetShopGalaxy.jsx
import React, { useEffect, useState } from 'react';

export default function AssetShopGalaxy({ entityId = 1 }) {
  const [cat, setCat] = useState({ items: [] });
  const [bal, setBal] = useState({ SC: 0, USD: 0 });
  const [msg, setMsg] = useState('');

  async function load() {
    setMsg('');
    const [c, b] = await Promise.all([
      fetch('/api/catalog').then(r=>r.json()).catch(()=>({items:[]})),
      fetch(`/api/balances?entityId=${entityId}`).then(r=>r.json()).catch(()=>({SC:0,USD:0}))
    ]);
    setCat(c); setBal(b);
  }

  useEffect(()=>{ load(); }, [entityId]);

  async function buy(id) {
    setMsg('');
    const r = await fetch('/api/purchaseAsset', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ entityId, assetId: id })
    });
    const t = await r.text();
    if (r.ok) { setMsg('Purchased ✓'); await load(); }
    else setMsg('Buy failed: ' + t);
  }

  async function claim() {
    setMsg('');
    const r = await fetch('/api/harvest', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ entityId })
    });
    const d = await r.json();
    if (r.ok) { setMsg(`Claimed ${d.creditedSC} SC (rate ${d.ratePerHourSC}/hr for ${d.hours}h)`); await load(); }
    else setMsg('Claim failed');
  }

  const byCat = cat.items.reduce((m,it)=>{
    (m[it.category] = m[it.category] || []).push(it);
    return m;
  }, {});

  const pretty = v => Number(v||0).toLocaleString();

  return (
    <div style={{background:'#151d2b',border:'1px solid #263145',borderRadius:14,padding:16,marginBottom:16}}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <h2 style={{marginTop:0, marginBottom:0}}>Galactic Asset Exchange</h2>
        <div style={{marginLeft:'auto', color:'#9fb0c8'}}>Entity #{entityId} • Balance: {pretty(bal.SC)} SC</div>
        <button onClick={claim}>Claim Yield</button>
        <button onClick={load}>Refresh</button>
      </div>

      {Object.keys(byCat).sort().map(catName => (
        <div key={catName} style={{marginTop:12}}>
          <h3 style={{margin:'8px 0'}}>{catName}</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:12}}>
            {byCat[catName].map(it => (
              <div key={it.id} style={{background:'#0f1622', border:'1px solid #263145', borderRadius:12, padding:12}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <strong>{it.name}</strong>
                  <span style={{opacity:0.8}}>{it.rarity}</span>
                </div>
                <div style={{fontSize:13, color:'#9fb0c8'}}>{it.effects?.additive ? `Boost +${(it.effects.additive*100).toFixed(0)}%` : it.yieldPerHourSC ? `Yield ${it.yieldPerHourSC} SC/hr` : '—'}</div>
                <div style={{margin:'8px 0'}}>Price: {pretty(it.priceSC)} SC</div>
                <div style={{margin:'4px 0', color:'#9fb0c8'}}>Supply: {it.supply ?? 0}</div>
                <button disabled={(it.supply||0) <= 0} onClick={()=>buy(it.id)}>
                  {(it.supply||0) > 0 ? 'Buy' : 'Sold Out'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {msg && <div style={{marginTop:10, color:'#9fb0c8'}}>{msg}</div>}
    </div>
  );
}
