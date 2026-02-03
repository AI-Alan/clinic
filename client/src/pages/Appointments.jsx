import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { format } from 'date-fns';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get('/appointments', {
          params: dateFilter ? { date: dateFilter } : {},
        });
        setAppointments(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dateFilter]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Appointments</h1>
        <Link to="/appointments/new" className="btn primary">New Appointment</Link>
      </div>
      <div className="toolbar">
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
              <th>Time</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Status</th>
              <th>Reason</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.time}</td>
                <td>
                  <Link to={`/patients/${a.patient?.id}`}>
                    {a.patient?.firstName} {a.patient?.lastName}
                  </Link>
                </td>
                <td>{a.user?.name}</td>
                <td><span className={`badge status-${a.status}`}>{a.status}</span></td>
                <td>{a.reason || '—'}</td>
                <td><Link to={`/appointments/${a.id}/edit`}>Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && appointments.length === 0 && <p>No appointments for this date.</p>}
    </div>
  );
}
