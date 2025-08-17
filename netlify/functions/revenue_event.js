exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    const { entity_id, amount_usd, ref } = JSON.parse(event.body || '{}');
    if (!entity_id || !amount_usd) return { statusCode: 400, body: 'entity_id and amount_usd required' };

    const s = await sql`SELECT platform_fee_pct, sc_per_usd FROM economy WHERE id=1;`;
    if (!s.length) return { statusCode: 500, body: 'economy not configured' };
    const feePct = Number(s[0].platform_fee_pct);
    const peg = Number(s[0].sc_per_usd);

    const feeUSD = +(amount_usd * (feePct/100)).toFixed(2);
    const workerUSD = +(amount_usd - feeUSD).toFixed(2);
    const workerSC = +(workerUSD * peg).toFixed(2);

    await sql`BEGIN`;
    await sql`INSERT INTO ledger_entries (entity_id,currency,amount,kind,ref,created_at) VALUES (0,'USD',${feeUSD},'PLATFORM_FEE',${ref||'rev'},now())`;
    await sql`INSERT INTO balances (entity_id,currency,balance) VALUES (0,'USD',${feeUSD}) ON CONFLICT (entity_id,currency) DO UPDATE SET balance = balances.balance + EXCLUDED.balance`;
    await sql`INSERT INTO ledger_entries (entity_id,currency,amount,kind,ref,created_at) VALUES (${entity_id},'SC',${workerSC},'WORKER_EARN',${ref||'rev'},now())`;
    await sql`INSERT INTO balances (entity_id,currency,balance) VALUES (${entity_id},'SC',${workerSC}) ON CONFLICT (entity_id,currency) DO UPDATE SET balance = balances.balance + EXCLUDED.balance`;
    await sql`COMMIT`;

    return { statusCode: 200, body: JSON.stringify({ ok:true, fee_usd:feeUSD, worker_sc:workerSC, peg_sc_per_usd:peg, platform_fee_pct:feePct }) };
  } catch (e) {
    try { const { neon } = await import('@neondatabase/serverless'); const sql = neon(process.env.DATABASE_URL); await sql`ROLLBACK`; } catch {}
    return { statusCode: 500, body: String(e) };
  }
};
