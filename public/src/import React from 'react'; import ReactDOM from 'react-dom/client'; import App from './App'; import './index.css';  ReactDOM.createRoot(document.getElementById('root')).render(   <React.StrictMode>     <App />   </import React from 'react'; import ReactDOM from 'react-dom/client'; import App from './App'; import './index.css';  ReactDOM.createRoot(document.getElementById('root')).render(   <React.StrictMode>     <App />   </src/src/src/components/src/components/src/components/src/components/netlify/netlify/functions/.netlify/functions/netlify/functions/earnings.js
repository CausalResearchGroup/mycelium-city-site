exports.handler = async function () {
  return {
    statusCode: 200,
    body: JSON.stringify({
      totalUSD: 10000,
      todayUSD: 500,
    }),
  };
};
