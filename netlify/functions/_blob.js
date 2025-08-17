const { createClient } = require('@netlify/blobs');

function getStore(context) {
  const client = createClient({ context });
  return client.blobStore('mesh-admin'); // a named bucket for your site
}

async function getJSON(store, key, fallback) {
  const v = await store.get(key, { type: 'json' });
  return v ?? fallback;
}

module.exports = { getStore, getJSON };
