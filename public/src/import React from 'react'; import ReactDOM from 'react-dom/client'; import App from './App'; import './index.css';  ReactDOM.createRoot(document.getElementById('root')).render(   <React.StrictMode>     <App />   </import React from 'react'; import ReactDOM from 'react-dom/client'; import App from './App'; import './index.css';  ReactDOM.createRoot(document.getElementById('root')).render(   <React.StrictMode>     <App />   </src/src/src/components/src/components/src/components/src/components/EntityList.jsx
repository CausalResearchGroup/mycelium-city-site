import React, { useState, useEffect } from 'react';
const pageSize = 50;

export default function EntityList() {
  const [entities, setEntities] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchEntities(page); }, [page]);

  async function fetchEntities(p) {
    const res = await fetch(`/api/entities?page=${p}&pageSize=${pageSize}`);
    const data = await res.json();
    setEntities(data.entities);
    setTotal(data.total);
  }

  return (
    <div>
      <h2>Entities (Page {page})</h2>
      <table style={{ width: '100%' }}>
        <thead style={{ background: '#004080', color: '#fff' }}>
          <tr><th>Name</th><th>Status</th><th>Earnings (USD)</th></tr>
        </thead>
        <tbody>
          {entities.map((ent) => (
            <tr key={ent.id}>
              <td>{ent.name}</td>
              <td>{ent.status}</td>
              <td>${ent.earnings.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ marginRight: '1rem' }}>Prev Page</button>
      <button disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>Next Page</button>
    </div>
  );
}
