exports.handler = async function () {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    // 1) Entities table (planet sharding built in)
    await sql`
      CREATE TABLE IF NOT EXISTS entities (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Draft',
        earnings NUMERIC(14,2) NOT NULL DEFAULT 0,
        planet_id INT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_entities_planet     ON entities (planet_id, id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_entities_type_planet ON entities (planet_id, lower(type), id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_entities_status_planet ON entities (planet_id, lower(status), id);`;

    // 2) Seed a reasonable test population for a normal computer
    // Use SEED_COUNT env (default 100000). This inserts quickly using generate_series.
    const SEED_COUNT = Number(process.env.SEED_COUNT || 100000);
    const [{ c }] = await sql`SELECT COUNT(*)::int AS c FROM entities;`;
    if (c === 0 && SEED_COUNT > 0) {
      // choose from these types/statuses
      await sql`
        WITH t AS (
          SELECT
            gs AS id_hint,
            ('Entity ' || gs)::text AS name,
            (ARRAY['Worker','Vendor','Steward','Alien','Human'])[1 + (random()*4)::int] AS type,
            (ARRAY['Draft','Released','Paused'])[1 + (random()*2)::int] AS status,
            round((random()*2000)::numeric, 2) AS earnings,
            (1 + (random()*3)::int) AS planet_id
          FROM generate_series(1, ${SEED_COUNT}) AS gs
        )
        INSERT INTO entities (name, type, status, earnings, planet_id)
        SELECT name, type, status, earnings, planet_id FROM t;
      `;
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, seeded: c === 0 }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};
