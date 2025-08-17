const { getStore, getJSON } = require('./_blob');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const body = JSON.parse(event.body || '{}');
  const ts = body.timestamp;
  if (!ts || isNaN(new Date(ts).getTime())) {
    return { statusCode: 400, body: 'Invalid timestamp' };
  }

  const store = getStore(context);
  const state = await getJSON(store, 'state.json', {
    paused: false,
    scheduledShutdownTime: null
  });
  state.scheduledShutdownTime = ts;
  await store.setJSON('state.json', state);
  return { statusCode: 200, body: JSON.stringify({ ok: true, state }) };
};
