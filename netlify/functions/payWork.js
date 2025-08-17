// netlify/functions/payWork.js
import { blobGet, blobSet } from './_blob.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { entityId, usd_amount = 0, ref = '' } = JSON.parse(event.body || '{}');
    if (!entityId || usd_amount <= 0) {
      return { statusCode: 400, body: 'Missing entityId or usd_amount' };
    }

    const id = String(entityId);
    const key = `balances/${id}`;
    let bal = await blobGet(key) || { SC: 0, USD: 0 };

    // Treasury config
    const treasury = await blobGet('treasury/config') || { peg_sc_per_usd: 10, tax_pct: 30, donation_pct: 10 };

    const scFromUsd = usd_amount * treasury.peg_sc_per_usd;

    // Apply tax split
    const taxCut = (usd_amount * treasury.tax_pct) / 100;
    const donationCut = (usd_amount * treasury.donation_pct) / 100;
    const netUsd = usd_amount - taxCut - donationCut;

    // Credit entity (simulated USD + SC)
    bal.USD = (bal.USD || 0) + netUsd;
    bal.SC = (bal.SC || 0) + scFromUsd;

    await blobSet(key, bal);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        entityId,
        usd_amount,
        credited: netUsd,
        scFromUsd,
        ref
      })
    };
  } catch (e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
}
