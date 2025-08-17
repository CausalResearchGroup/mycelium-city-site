// netlify/functions/purchaseAsset.js
const { blobGet, blobSet } = require('./_blob');

function invKey(id) { return `inventory/${id}`; }

function effectivePrice(item) {
  const RARITY_MULT = { common: 1.0, uncommon: 1.2, rare: 1.6, epic: 2.2, legendary: 3.5 };
  const rarityMult = RARITY_MULT[item.rarity] || 1.0;
  const init = item.initialSupply || item.supply || 1;
  const remaining = Math.max(0, item.supply ?? 0);
  const scarcity = 1 - (remaining / init);
  const scarcityMult = Math.min(2.5, Math.max(0.75, 0.75 + scarcity * 1.5));
  return Math.round(item.basePriceSC * rarityMult * scarcityMult);
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}
  const entityId = Number(body.entityId || 0);
  const assetId  = String(body.assetId || '');

  if (!entityId || !assetId) return { statusCode: 400, body: 'entityId and assetId required' };

  // Load catalog & balances
  const catalog = await blobGet('catalog.json', null);
  if (!catalog) return { statusCode: 500, body: 'Catalog not initialized. POST /api/catalog {action:"seed"} first.' };
  const item = (catalog.items || []).find(i => i.id === assetId);
  if (!item) return { statusCode: 404, body: 'Unknown assetId' };
  if ((item.supply || 0) <= 0) return { statusCode: 409, body: 'Out of stock' };

  const balKey = `balances/${entityId}`;
  const bal = await blobGet(balKey, { SC: 0, USD: 0 });

  const price = effectivePrice(item);
  if ((bal.SC || 0) < price) return { statusCode: 402, body: 'Insufficient SC' };

  // Deduct SC, reduce supply, add to inventory
  bal.SC = +(Number(bal.SC) - price).toFixed(2);
  item.supply = Math.max(0, (item.supply || 0) - 1);
  const invKeyStr = invKey(entityId);
  const inv = await blobGet(invKeyStr, []);
  const existing = inv.find(x => x.id === item.id);
  if (existing) existing.qty += 1;
  else inv.push({ id: item.id, name: item.name, qty: 1, yieldPerHourSC: item.yieldPerHourSC || 0, additive: item.effects?.additive || 0 });

  await Promise.all([
    blobSet(balKey, bal),
    blobSet('catalog.json', catalog),
    blobSet(invKeyStr, inv),
  ]);

  return { statusCode: 200, body: JSON.stringify({ ok: true, id: item.id, priceSC: price, supply: item.supply }) };
};
