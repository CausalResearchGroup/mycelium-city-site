// netlify/functions/treasury.js
const { blobGet, blobSet } = require('./_blob');

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const cfg = await blobGet('treasury/config', { peg_sc_per_usd: 10, tax_pct: 30, donation_pct: 10 });
      return { statusCode: 200, body: JSON.stringify(cfg) };
    }
    if (event.httpMethod === 'POST') {
      let body = {}; try { body = JSON.parse(event.body || '{}'); } catch {}
      if (String(body.action || '') !== 'config') return { statusCode: 400, body: 'unknown action' };

      const cfg = {
        peg_sc_per_usd: Number(body.peg_sc_per_usd ?? 10),
        tax_pct: Number(body.tax_pct ?? 30),
        donation_pct: Number(body.donation_pct ?? 10),
      };
      await blobSet('treasury/config', cfg);
      return { statusCode: 200, body: JSON.stringify({ ok: true, cfg }) };
    }
    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
