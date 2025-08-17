const { getStore, getJSON } = require('./_blob');

// same catalog definition as assets.js (duplicate small list for simplicity)
const CATALOG = {
  shell_1: { id:'shell_1', kind:'shell', name:'Titan Shell Mk I',  costSC:250  },
  shell_2: { id:'shell_2', kind:'shell', name:'Titan Shell Mk II', costSC:800  },
  shell_3: { id:'shell_3', kind:'shell', name:'Aegis Frame',       costSC:2400 },
  mind_1:  { id:'mind_1',  kind:'mind',  name:'NeuroFlux Core',    costSC:300  },
  mind_2:  { id:'mind_2',  kind:'mind',  name:'Logic Lattice',     costSC:1200 },
  mind_3:  { id:'mind_3',  kind:'mind',  name:'Aurora Matrix',     costSC:3600 },
  item_boost1:{ id:'item_boost1', kind:'item', name:'Pulse Crystal', costSC:150 },
  item_boost2:{ id:'item_boost2', kind:'item', name:'Void Serum',    costSC:400 },
};

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const store = getStore(context);
  const balances = await getJSON(store, 'balances.json', {});
  const inventory = await getJSON(store, 'inventory.json', {}); // { [entityId]: [{id, qty}] }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}
  const { entityId, assetId } = body;

  if (!entityId || !assetId) return { statusCode: 400, body: 'entityId and assetId required' };
  const asset = CATALOG[assetId];
  if (!asset) return { statusCode: 404, body: 'asset not found' };

  const b = balances[entityId] || { SC: 0, USD: 0 };
  if ((b.SC || 0) < asset.costSC) return { statusCode: 400, body: 'insufficient SC' };

  // debit SC
  b.SC = Number((b.SC - asset.costSC).toFixed(2));
  balances[entityId] = b;

  // credit inventory
  const inv = inventory[entityId] || [];
  const idx = inv.findIndex(i => i.id === assetId);
  if (idx >= 0) inv[idx].qty += 1; else inv.push({ id: assetId, qty: 1, name: asset.name, kind: asset.kind });
  inventory[entityId] = inv;

  await store.setJSON('balances.json', balances);
  await store.setJSON('inventory.json', inventory);

  return {
    statusCode: 200,
    body: JSON.stringify({ ok:true, newBalance:b, item:{ id: assetId, name: asset.name }, inventory: inv })
  };
};
