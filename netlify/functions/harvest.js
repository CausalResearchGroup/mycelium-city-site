// netlify/functions/harvest.js
const { blobGet, blobSet } = require('./_blob');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}
  const entityId = Number(body.entityId || 0);
  if (!entityId) return { statusCode: 400, body: 'entityId required' };

  const now = Date.now();
  const lastMap = await blobGet('harvest.json', {}); // { [entityId]: lastTs }
  const last = Number(lastMap[entityId] || 0);
  const hours = Math.max(0, (now - last) / (1000 * 60 * 60)); // fractional hours okay

  const inv = await blobGet(`inventory/${entityId}`, []);
  let ratePerHour = 0;
  for (const it of inv) {
    const y = Number(it.yieldPerHourSC || 0);
    const q = Number(it.qty || 0);
    ratePerHour += y * q;
  }

  const credit = +(ratePerHour * hours).toFixed(2);

  if (credit > 0) {
    const balKey = `balances/${entityId}`;
    const bal = await blobGet(balKey, { SC: 0, USD: 0 });
    bal.SC = +(Number(bal.SC) + credit).toFixed(2);
    await blobSet(balKey, bal);
  }

  lastMap[entityId] = now;
  await blobSet('harvest.json', lastMap);

  return { statusCode: 200, body: JSON.stringify({ ok: true, hours: +hours.toFixed(3), ratePerHourSC: ratePerHour, creditedSC: credit }) };
};
