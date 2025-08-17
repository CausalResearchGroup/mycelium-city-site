const { blobGet, blobSet } = require('./_blob');

async function getTreasury() {
  const treasury = await blobGet('treasury', { balance: 0, lastUpdated: Date.now() });
  return treasury;
}

async function updateTreasury(newTreasury) {
  await blobSet('treasury', newTreasury);
  return newTreasury;
}

exports.handler = async function (event) {
  try {
    const action = event.queryStringParameters?.action;

    if (action === 'getTreasury') {
      const treasury = await getTreasury();
      return { statusCode: 200, body: JSON.stringify(treasury) };
    }

    if (action === 'updateTreasury') {
      const newTreasury = await getTreasury();
      newTreasury.balance += 1000; // Add 1000 SC as example
      await updateTreasury(newTreasury);
      return { statusCode: 200, body: JSON.stringify({ message: "Treasury updated" }) };
    }

    return { statusCode: 400, body: 'Unknown action' };
  } catch (e) {
    return { statusCode: 500, body: 'Error: ' + e.message };
  }
};
