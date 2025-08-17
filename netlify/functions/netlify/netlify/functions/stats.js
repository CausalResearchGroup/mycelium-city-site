// netlify/functions/stats.js
const { blobGet } = require('./_blob');

exports.handler = async function (event) {
  const entityId = Number(event.queryStringParameters?.entityId || 0);
  const now = Date.now();

  // Inventory-based additive (old + new)
  const inv = await blobGet(`inventory/${entityId}`, []);
  let additive = 0;
  for (const it of inv) {
    // new items carry 'additive' on inventory rows; fallback for old ids
    if (typeof it.additive === 'number') additive += it.additive * (Number(it.qty)||1);
    else {
      if (it.id === 'item_boost1') additive += 0.20 * (Number(it.qty)||1);
      if (it.id === 'item_boost2') additive += 0.50 * (Number(it.qty)||1);
      if (it.id === 'item_boost3') additive += 1.00 * (Number(it.qty)||1);
    }
  }

  // Rush multiplier
  const rushMap = await blobGet('rush.json', {});
  const rush = rushMap[entityId];
  const rushActive = !!(rush && rush.endsAt && rush.endsAt > now);
  const rushMult = rushActive ? Number(rush.multiplier || 1) : 1;

  const multiplier = +(((1 + additive) * rushMult)).toFixed(4);

  const breakdown = [];
  if (additive) breakdown.push({ source: 'Inventory', type: 'additive', add: additive });
  if (rushActive) breakdown.push({ source: 'Rush', type: 'mult', mult: rushMult });

  return {
    statusCode: 200,
    body: JSON.stringify({ entityId, multiplier, inventoryAdditive: additive, rushActive, rushMult, breakdown })
  };
};
