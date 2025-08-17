// netlify/functions/catalog.js
const { blobGet, blobSet } = require('./_blob');

// rarity multipliers for price
const RARITY_MULT = { common: 1.0, uncommon: 1.2, rare: 1.6, epic: 2.2, legendary: 3.5 };

function priceFor(item) {
  const rarityMult = RARITY_MULT[item.rarity] || 1.0;
  const init = item.initialSupply || item.supply || 1;
  const remaining = Math.max(0, item.supply ?? 0);
  const scarcity = 1 - (remaining / init); // 0..1 (scarcer → larger)
  const scarcityMult = Math.min(2.5, Math.max(0.75, 0.75 + scarcity * 1.5));
  return Math.round(item.basePriceSC * rarityMult * scarcityMult);
}

const SEED = {
  items: [
    // Minerals / Exotics
    { id: 'min_lunar_dust_1kg', name: 'Lunar Dust (1kg)', category: 'Mineral', rarity: 'rare',      basePriceSC: 50_000,  supply: 100, initialSupply: 100, effects: { additive: 0.10 } },
    { id: 'min_space_diamond',  name: 'Zero-G Diamond',    category: 'Mineral', rarity: 'epic',      basePriceSC: 120_000, supply: 50,  initialSupply: 50,  effects: { additive: 0.30 } },
    { id: 'min_europa_ice',     name: 'Europa Ice Core',   category: 'Mineral', rarity: 'rare',      basePriceSC: 80_000,  supply: 40,  initialSupply: 40,  effects: { additive: 0.20 } },
    { id: 'min_neutron_shard',  name: 'Neutron Shard',     category: 'Exotic',  rarity: 'legendary', basePriceSC: 1_000_000, supply: 3, initialSupply: 3,   effects: { additive: 1.50 } },

    // Claims / Rigs (with passive yield)
    { id: 'claim_asteroid_tiny', name: 'Asteroid Claim (Tiny Belt Rock)', category: 'Claim', rarity: 'epic', basePriceSC: 250_000, supply: 20, initialSupply: 20, effects: { additive: 0.50 }, yieldPerHourSC: 500 },
    { id: 'rig_mining_mk1',      name: 'Mining Rig Mk I',                 category: 'Rig',   rarity: 'uncommon', basePriceSC: 20_000, supply: 200, initialSupply: 200, effects: { additive: 0.05 }, yieldPerHourSC: 50 },

    // Licenses / Access
    { id: 'lic_mars_trade',      name: 'Mars Trade License', category: 'License', rarity: 'uncommon', basePriceSC: 5_000, supply: 500, initialSupply: 500, effects: { access: 'mars' } },
  ]
};

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    const cat = await blobGet('catalog.json', SEED);
    // add computed prices
    const withPrices = { items: (cat.items || []).map(it => ({ ...it, priceSC: priceFor(it) })) };
    return { statusCode: 200, body: JSON.stringify(withPrices) };
  }

  if (event.httpMethod === 'POST') {
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch {}
    const action = String(body.action || '');

    const cur = await blobGet('catalog.json', SEED);

    if (action === 'seed') {
      await blobSet('catalog.json', SEED);
      return { statusCode: 200, body: JSON.stringify({ ok: true, seeded: true }) };
    }

    if (action === 'restock') {
      const { id, add } = body;
      const it = (cur.items || []).find(x => x.id === id);
      if (!it) return { statusCode: 404, body: 'unknown item' };
      it.supply = Math.max(0, (it.supply || 0) + Number(add || 0));
      if (!it.initialSupply) it.initialSupply = it.supply;
      await blobSet('catalog.json', cur);
      return { statusCode: 200, body: JSON.stringify({ ok: true, id, supply: it.supply }) };
    }

    if (action === 'price') {
      const { id, basePriceSC } = body;
      const it = (cur.items || []).find(x => x.id === id);
      if (!it) return { statusCode: 404, body: 'unknown item' };
      it.basePriceSC = Number(basePriceSC || it.basePriceSC);
      await blobSet('catalog.json', cur);
      return { statusCode: 200, body: JSON.stringify({ ok: true, id, basePriceSC: it.basePriceSC }) };
    }

    return { statusCode: 400, body: 'unknown action' };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
