import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { format } from 'date-fns';

export default function Visits() {
  const [visits, setVisits] = useState([]);
  const [patientFilter, setPatientFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/patients?limit=500').then(({ data }) => setPatients(data.patients ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = {};
        if (patientFilter) params.patientId = patientFilter;
        if (dateFilter) params.date = dateFilter;
        const { data } = await api.get('/visits', { params });
        setVisits(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientFilter, dateFilter]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Visits</h1>
        <Link to="/visits/new" className="btn primary">New Visit</Link>
      </div>
      <div className="toolbar">
        <label>
          Patient
          <select value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)}>
            <option value="">All</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </label>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Chief complaint</th>
              <th>Diagnosis</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id}>
                <td>{format(new Date(v.date), 'MMM d, yyyy')}</td>
                <td>
                  <Link to={`/patients/${v.patient?.id}`}>
                    {v.patient?.firstName} {v.patient?.lastName}
                  </Link>
                </td>
                <td>{v.user?.name}</td>
                <td>{v.chiefComplaint || '—'}</td>
                <td>{v.diagnosis || '—'}</td>
                <td><Link to={`/visits/${v.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && visits.length === 0 && <p>No visits match filters.</p>}
    </div>
  );
}
