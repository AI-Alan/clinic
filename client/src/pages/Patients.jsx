import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { format } from 'date-fns';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get('/patients', {
          params: { search: search || undefined, page, limit: 20 },
        });
        setPatients(data.patients ?? []);
        setTotal(data.total ?? 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, page]);

  return (
    <div className="page patients-page">
      <div className="page-header">
        <h1>Patients</h1>
        <Link to="/patients/new" className="btn btn-primary">Add Patient</Link>
      </div>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Search by name or card number…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="search-input"
        />
      </div>
      {loading ? (
        <div className="loading-screen">Loading…</div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table table-classy">
              <thead>
                <tr>
                  <th>Patient name</th>
                  <th>Card number</th>
                  <th>Age</th>
                  <th>Issue</th>
                  <th>Registered</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/patients/${p.id}`} className="table-link">
                        {p.firstName} {p.lastName}
                      </Link>
                    </td>
                    <td>{p.cardNumber || '—'}</td>
                    <td>{p.age != null ? p.age : '—'}</td>
                    <td className="table-issue">{p.issue || '—'}</td>
                    <td>{p.createdAt ? format(new Date(p.createdAt), 'MMM d, yyyy') : '—'}</td>
                    <td><Link to={`/patients/${p.id}`} className="btn btn-sm">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 20 && (
            <div className="pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-ghost">Previous</button>
              <span className="pagination-info">Page {page} of {Math.ceil(total / 20)}</span>
              <button type="button" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="btn btn-ghost">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
