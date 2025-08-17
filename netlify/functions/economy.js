exports.handler = async function (event) {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    if (event.httpMethod === 'GET') {
      const rows = await sql`SELECT platform_fee_pct, sc_per_usd, updated_at FROM economy WHERE id=1;`;
      return { statusCode: 200, body: JSON.stringify(rows[0] || {}) };
    }

    if (event.httpMethod === 'POST') {
      const { platform_fee_pct, sc_per_usd } = JSON.parse(event.body || '{}');
      if (platform_fee_pct == null || sc_per_usd == null) return { statusCode: 400, body: 'platform_fee_pct and sc_per_usd required' };
      await sql`
        INSERT INTO economy (id, platform_fee_pct, sc_per_usd, updated_at)
        VALUES (1, ${platform_fee_pct}, ${sc_per_usd}, now())
        ON CONFLICT (id) DO UPDATE SET
          platform_fee_pct = EXCLUDED.platform_fee_pct,
          sc_per_usd = EXCLUDED.sc_per_usd,
          updated_at = now();
      `;
      const rows = await sql`SELECT platform_fee_pct, sc_per_usd, updated_at FROM economy WHERE id=1;`;
      return { statusCode: 200, body: JSON.stringify(rows[0]) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};
