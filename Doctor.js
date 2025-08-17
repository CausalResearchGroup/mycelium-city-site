const { blobGet, blobSet } = require('./_blob');

async function repairSystem() {
  // Your self-repair logic (e.g., check entities, catalog, etc.)
  const entities = await blobGet('entities', []);
  if (entities.length === 0) {
    // Adding default entity if missing
    await blobSet('entities', [1]);
  }
  // Add more repair actions as needed
  return { message: "System repaired" };
}

exports.handler = async function (event) {
  try {
    const action = event.queryStringParameters?.action;

    if (action === 'repair') {
      const result = await repairSystem();
      return { statusCode: 200, body: JSON.stringify(result) };
    }

    return { statusCode: 400, body: 'Unknown action' };
  } catch (e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
