const { getStore, getJSON } = require('./_blob');

exports.handler = async function (_event, context) {
  const store = getStore(context);
  const state = await getJSON(store, 'state.json', {
    paused: false,
    scheduledShutdownTime: null
  });
  return { statusCode: 200, body: JSON.stringify(state) };
};
