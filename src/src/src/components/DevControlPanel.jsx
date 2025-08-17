import React, { useEffect, useState } from 'react';

export default function DevControlPanel() {
  const [entityId, setEntityId] = useState(1);
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const [log, setLog] = useState('');

  const append = (msg) => setLog(l => (l ? l + '\n' : '') + msg);

  async function refresh() {
    try {
      const [s, b] = await Promise.all([
        fetch(`/api/stats?entityId=${entityId}`).then(r=>r.json()).catch(()=>null),
        fetch(`/api/balances?entityId=${entityId}`).then(r=>r.json()).catch(()=>null),
      ]);
      setStats(s);
      setBalance(b);
    } catch (e) { append('Refresh error: ' + e); }
  }
  useEffect(() => { refresh(); }, [entityId]);

  async function startRush() {
    const r = await fetch('/api/rush_v2', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ entityId: Number(entityId) })
    });
    const d = await r.json();
    append('Rush: ' + JSON.stringify(d));
    await refresh();
  }

  async function grantSC(delta=1000) {
    const r = await fetch('/api/balances', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ entityId: Number(entityId), currency:'SC', delta })
    });
    const d = await r.json();
    append('Grant: ' + JSON.stringify(d));
    await refresh();
  }

  async function payWork(usd=10) {
    const r = await fetch('/api/payWork', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ entityId: Number(entityId), usd_amount: Number(usd), ref:'devpanel' })
    });
    const d = await r.json();
    append('PayWork: ' + JSON.stringify(d));
    await refresh();
  }

  return (
    <div style={{background:'#151d2b',border:'1px solid #263145',borderRadius:14,padding:16,marginBottom:16}}>
      <h2 style={{marginTop:0}}>Dev / Test Panel</h2>
      <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
        <label>Entity&nbsp;
          <input type="number" min="1" value={entityId} onChange={e=>setEntityId(e.target.value)} style={{width:100,padding:8}}/>
        </label>
        <button onClick={startRush}>Start Rush</button>
        <button onClick={()=>grantSC(1000)}>Grant +1000 SC</button>
        <button onClick={()=>payWork(10)}>Credit $10</button>
        <button onClick={refresh}>Refresh</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12,marginTop:12}}>
        <Card title="Stats">
          {stats ? (
            <>
              <div><b>Multiplier:</b> × {stats.multiplier?.toFixed?.(2) ?? '1.00'}</div>
              <div><b>Inventory Add:</b> +{((stats.inventoryAdditive||0)*100).toFixed(1)}%</div>
              <div><b>Rush:</b> {stats.rushActive ? `×${(stats.rushMult||1).toFixed(2)}` : 'inactive'}</div>
            </>
          ) : <div>—</div>}
        </Card>
        <Card title="Balance">
          {balance ? (
            <>
              <div><b>SC:</b> {Number(balance.SC||0).toLocaleString()}</div>
              <div><b>USD (sim):</b> {Number(balance.USD||0).toLocaleString()}</div>
            </>
          ) : <div>—</div>}
        </Card>
        <Card title="Log">
          <pre style={{whiteSpace:'pre-wrap',margin:0,maxHeight:180,overflow:'auto'}}>{log || '—'}</pre>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{background:'#0f1622',border:'1px solid #263145',borderRadius:12,padding:12}}>
      <h3 style={{marginTop:0}}>{title}</h3>
      {children}
    </div>
  );
}
