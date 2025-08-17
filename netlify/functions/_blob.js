// netlify/functions/_blob.js
// Simple JSON get/set using Netlify Blobs (CommonJS so all functions can require it)
const blobs = require('@netlify/blobs');

/** Read a JSON value from a blob key. Returns fallback if missing. */
async function blobGet(key, fallback = null) {
  const data = await blobs.get(key, { type: 'json' });
  return data ?? fallback;
}

/** Write a JSON value to a blob key. */
async function blobSet(key, value) {
  await blobs.set(key, JSON.stringify(value), { contentType: 'application/json' });
}

/** Convenience: read JSON or {} */
async function getJSON(key, fallback = {}) {
  return blobGet(key, fallback);
}

module.exports = { blobGet, blobSet, getJSON };
