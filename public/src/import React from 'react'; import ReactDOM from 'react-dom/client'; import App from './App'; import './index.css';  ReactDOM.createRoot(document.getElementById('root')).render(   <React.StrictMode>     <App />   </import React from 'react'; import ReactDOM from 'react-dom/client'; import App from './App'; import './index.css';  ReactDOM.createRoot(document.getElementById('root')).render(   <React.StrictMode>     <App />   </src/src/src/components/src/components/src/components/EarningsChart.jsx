import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip } from 'chart.js';
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

export default function EarningsChart() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/earningsHistory');
      const data = await res.json();
      setChartData({
        labels: data.dates,
        datasets: [
          { label: 'Daily Earnings (USD)', data: data.dailyEarnings, borderColor: '#004080', fill: false },
          { label: 'Total Earnings (USD)', data: data.totalEarnings, borderColor: '#008000', fill: false }
        ],
      });
    })();
  }, []);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2>Earnings Overview</h2>
      <Line data={chartData} />
    </div>
  );
}
