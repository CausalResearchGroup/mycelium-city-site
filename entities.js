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
