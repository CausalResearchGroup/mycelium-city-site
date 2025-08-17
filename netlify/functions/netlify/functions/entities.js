exports.handler = async function (event) {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    const q = event.queryStringParameters || {};
    const planet   = q.planet_id ? Number(q.planet_id) : null;
    const type     = q.type ? String(q.type) : null;
    const status   = q.status ? String(q.status) : null;

    // Cursor keyset (better than OFFSET at scale)
    const cursor   = q.cursor ? BigInt(q.cursor) : null;
    const pageSize = Math.min(Math.max(parseInt(q.pageSize || '200', 10), 1), 500);

    const where = [];
    if (planet) where.push(sql`planet_id = ${planet}`);
    if (type)   where.push(sql`lower(type) = lower(${type})`);
    if (status) where.push(sql`lower(status) = lower(${status})`);
    if (cursor) where.push(sql`id > ${cursor}`);
    const whereSql = where.length ? sql`WHERE ${sql.join(where, sql` AND `)}` : sql``;

    const rows = await sql`
      SELECT id, name, type, status, earnings, planet_id
      FROM entities
      ${whereSql}
      ORDER BY id
      LIMIT ${pageSize};
    `;

    // Total (filtered) for UI info (no cursor)
    const totalWhere = [];
    if (planet) totalWhere.push(sql`planet_id = ${planet}`);
    if (type)   totalWhere.push(sql`lower(type) = lower(${type})`);
    if (status) totalWhere.push(sql`lower(status) = lower(${status})`);
    const totalWhereSql = totalWhere.length ? sql`WHERE ${sql.join(totalWhere, sql` AND `)}` : sql``;
    const totalRes = await sql`SELECT COUNT(*)::bigint AS total FROM entities ${totalWhereSql};`;
    const total = String(totalRes[0].total);

    const nextCursor = rows.length ? String(rows[rows.length - 1].id) : null;

    return { statusCode: 200, body: JSON.stringify({ entities: rows, total, nextCursor }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};
