// netlify/functions/balances.js
const { blobGet, blobSet } = require('./_blob');

// We store per-entity balances at key: balances/<entityId>
// Shape: { SC: number, USD: number }
function keyFor(id) {
  return `balances/${id}`;
}

exports.handler = async function (event) {
  try {
    if (event.httpMethod === 'GET') {
      const entityId = Number(event.queryStringParameters?.entityId || 0);
      if (!entityId) return { statusCode: 400, body: 'entityId required' };

      const bal = await blobGet(keyFor(entityId), { SC: 0, USD: 0 });
      return { statusCode: 200, body: JSON.stringify(bal) };
    }

    if (event.httpMethod === 'POST') {
      let body = {};
      try { body = JSON.parse(event.body || '{}'); } catch {}
      const entityId = Number(body.entityId || 0);
      const currency = String(body.currency || 'SC').toUpperCase();
      const delta = Number(body.delta || 0);

      if (!entityId)  return { statusCode: 400, body: 'entityId required' };
      if (!['SC','USD'].includes(currency)) return { statusCode: 400, body: 'currency must be SC or USD' };

      const key = keyFor(entityId);
      const cur = await blobGet(key, { SC: 0, USD: 0 });

      cur[currency] = +(Number(cur[currency] || 0) + delta).toFixed(2);

      await blobSet(key, cur);
      return { statusCode: 200, body: JSON.stringify(cur) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
