const { getStore, getJSON } = require('./_blob');

exports.handler = async function (event, context) {
  const store = getStore(context);
  const entityId = event.queryStringParameters?.entityId;
  if (!entityId) return { statusCode: 400, body: 'entityId required' };

  const inventory = await getJSON(store, 'inventory.json', {});
  const inv = inventory[entityId] || [];
  return { statusCode: 200, body: JSON.stringify({ inventory: inv }) };
};
