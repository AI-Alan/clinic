import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, recentPatients: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [patientsRes, patientsListRes] = await Promise.all([
          api.get('/patients?limit=1&page=1'),
          api.get('/patients?limit=5&page=1'),
        ]);
        setStats({
          patients: patientsRes.data.total ?? 0,
          recentPatients: patientsListRes.data.patients ?? [],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading">Loading dashboard…</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="stat-card">
          <span className="stat-value">{stats.patients}</span>
          <span className="stat-label">Total Patients</span>
          <Link to="/patients">View all</Link>
        </div>
      </div>
      <section className="dashboard-section">
        <h2>Recent Patients</h2>
        {stats.recentPatients.length === 0 ? (
          <p>No patients yet.</p>
        ) : (
          <ul className="list">
            {stats.recentPatients.map((p) => (
              <li key={p.id}>
                <Link to={`/patients/${p.id}`}>{p.firstName} {p.lastName}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
