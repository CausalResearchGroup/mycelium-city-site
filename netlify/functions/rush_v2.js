// netlify/functions/rush_v2.js
// Self-contained: no DB; uses Netlify Blobs via a tiny helper.
const helper = {
  store: null,
  getStore(context) {
    if (this.store) return this.store;
    const blobs = require('@netlify/blobs');
    this.store = blobs;
    return blobs;
  },
  async getJSON(store, key, fallback) {
    const data = await store.get(key, { type: 'json' });
    return data ?? fallback;
  }
};

const RUSH_DURATION_SEC = 300;   // 5 minutes
const RUSH_COOLDOWN_SEC = 1800;  // 30 minutes
const RUSH_MULTIPLIER   = 2.0;   // x2 earnings while active

exports.handler = async function (event, context) {
  const store = helper.getStore(context);
  const now = Date.now();
  const state = await helper.getJSON(store, 'rush.json', {}); // { [entityId]: { endsAt, cooldownEndsAt, multiplier } }

  if (event.httpMethod === 'GET') {
    const id = event.queryStringParameters?.entityId;
    if (!id) return { statusCode: 400, body: 'entityId required' };
    const entry = state[id] || {};
    return {
      statusCode: 200,
      body: JSON.stringify({
        active: !!entry.endsAt && entry.endsAt > now,
        endsAt: entry.endsAt || null,
        cooldownEndsAt: entry.cooldownEndsAt || null,
        multiplier: entry.multiplier || RUSH_MULTIPLIER
      })
    };
  }

  if (event.httpMethod === 'POST') {
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch {}
    const id = body.entityId;
    if (!id) return { statusCode: 400, body: 'entityId required' };

    const entry = state[id] || {};
    const alreadyActive = entry.endsAt && entry.endsAt > now;
    const inCooldown   = entry.cooldownEndsAt && entry.cooldownEndsAt > now;

    if (alreadyActive) {
      return { statusCode: 200, body: JSON.stringify({
        ok: true, alreadyActive: true,
        endsAt: entry.endsAt, cooldownEndsAt: entry.cooldownEndsAt,
        multiplier: entry.multiplier || RUSH_MULTIPLIER
      })};
    }
    if (inCooldown) {
      return { statusCode: 429, body: JSON.stringify({
        ok: false, reason: 'cooldown',
        cooldownEndsAt: entry.cooldownEndsAt
      })};
    }

    const endsAt = now + RUSH_DURATION_SEC * 1000;
    const cooldownEndsAt = now + RUSH_COOLDOWN_SEC * 1000;
    state[id] = { endsAt, cooldownEndsAt, multiplier: RUSH_MULTIPLIER };
    await store.set('rush.json', JSON.stringify(state), { contentType: 'application/json' });

    return { statusCode: 200, body: JSON.stringify({
      ok: true, active: true, endsAt, cooldownEndsAt, multiplier: RUSH_MULTIPLIER
    })};
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
