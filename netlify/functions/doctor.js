// netlify/functions/doctor.js
const { blobGet, blobSet } = require('./_blob');

async function ensureBalances(id){
  const key = `balances/${id}`;
  const cur = await blobGet(key, null);
  if (!cur) { await blobSet(key, { SC: 0, USD: 0 }); return true; }
  return false;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const tre = await blobGet('treasury/config', null);
      const cat = await blobGet('catalog.json', null);
      const ents = await blobGet('entities.json', null);
      const bal1 = await blobGet('balances/1', null);

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          treasury: !!tre,
          catalog: !!cat,
          entitiesCount: Array.isArray(ents?.list) ? ents.list.length : 0,
          hasBalance1: !!bal1
        })
      };
    }

    if (event.httpMethod === 'POST') {
      const out = { actions: [] };

      // Ensure treasury
      let tre = await blobGet('treasury/config', null);
      if (!tre) {
        tre = { peg_sc_per_usd: 10, tax_pct: 30, donation_pct: 10 };
        await blobSet('treasury/config', tre);
        out.actions.push('init_treasury');
      }

      // Ensure catalog (seed via catalog function if missing)
      let cat = await blobGet('catalog.json', null);
      if (!cat) {
        const base = (process.env.URL || '').replace(/\/$/, '');
        try {
          const r = await fetch(base + '/api/catalog', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ action: 'seed' })
          });
          out.actions.push('seed_catalog:' + r.status);
        } catch (e) {
          out.actions.push('seed_catalog_error:' + e.message);
        }
      }

      // Ensure entities list
      let ents = await blobGet('entities.json', null);
      if (!ents || !Array.isArray(ents.list) || ents.list.length === 0) {
        ents = { list: [1], updated_at: new Date().toISOString() };
        await blobSet('entities.json', ents);
        out.actions.push('init_entities_1');
      }

      // Ensure balances/1
      const createdBal = await ensureBalances(1);
      if (createdBal) out.actions.push('init_balances_1');

      return { statusCode: 200, body: JSON.stringify({ ok: true, ...out }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
