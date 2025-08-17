exports.handler = async function () {
  const dates = [];
  const dailyEarnings = [];
  const totalEarnings = [];
  let total = 0;

  for (let i = 14; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    const val = Math.round((Math.random() * 200 + 50) * 100) / 100;
    total += val;
    dates.push(label);
    dailyEarnings.push(val);
    totalEarnings.push(Math.round(total * 100) / 100);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ dates, dailyEarnings, totalEarnings }),
  };
};
