=== FILE: netlify/functions/entities.js ===
const entities = [
  { id: 1, name: 'Entity One', status: 'Active', earnings: 123.45 },
  { id: 2, name: 'Entity Two', status: 'Paused', earnings: 67.89 },
];

exports.handler = async function (event) {
  const page = Number(event.queryStringParameters?.page) || 1;
  const pageSize = Number(event.queryStringParameters?.pageSize) || 50;
  const start = (page - 1) * pageSize;
  const paged = entities.slice(start, start + pageSize);

  return {
    statusCode: 200,
    body: JSON.stringify({
      entities: paged,
      total: entities.length,
    }),
  };
};

=== FILE: netlify/functions/earnings.js ===
exports.handler = async function () {
  return {
    statusCode: 200,
    body: JSON.stringify({
      totalUSD: 10000,
      todayUSD: 500,
    }),
  };
};

=== FILE: netlify/functions/status.js ===
exports.handler = async function () {
  return {
    statusCode: 200,
    body: JSON.stringify({
      paused: false,
      scheduledShutdownTime: null,
    }),
  };
};

=== FILE: netlify/functions/shutdown.js ===
exports.handler = async function () {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Mesh shutdown triggered" }),
  };
};

=== FILE: netlify/functions/resume.js ===
exports.handler = async function () {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Mesh resumed" }),
  };
};

=== FILE: netlify/functions/scheduleShutdown.js ===
exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body);
    const { timestamp } = body;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Shutdown scheduled at ${timestamp}`,
      }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request" }),
    };
  }
};
