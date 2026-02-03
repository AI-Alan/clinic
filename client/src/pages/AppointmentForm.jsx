import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { format } from 'date-fns';

export default function AppointmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patientId: '',
    userId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    status: 'scheduled',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    Promise.all([api.get('/patients?limit=500'), api.get('/users')])
      .then(([pRes, uRes]) => {
        setPatients(pRes.data.patients ?? []);
        setUsers(uRes.data ?? []);
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const statePatientId = window.history.state?.usr?.patientId;
    if (statePatientId) setForm((f) => ({ ...f, patientId: statePatientId }));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/appointments/${id}`)
      .then(({ data }) => {
        setForm({
          patientId: data.patientId,
          userId: data.userId,
          date: data.date ? data.date.slice(0, 10) : form.date,
          time: data.time || '09:00',
          status: data.status || 'scheduled',
          reason: data.reason || '',
          notes: data.notes || '',
        });
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load'));
  }, [id, isEdit]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, date: new Date(form.date + 'T12:00:00').toISOString() };
    const req = isEdit ? api.put(`/appointments/${id}`, payload) : api.post('/appointments', payload);
    req
      .then(({ data }) => navigate('/appointments'))
      .catch((e) => setError(e.response?.data?.error || 'Save failed'));
  }

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Appointment' : 'New Appointment'}</h1>
        <Link to="/appointments" className="btn">Cancel</Link>
      </div>
      <form onSubmit={handleSubmit} className="form card">
        {error && <p className="error">{error}</p>}
        <div className="form-row">
          <label>Patient *</label>
          <select name="patientId" value={form.patientId} onChange={handleChange} required>
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Doctor *</label>
          <select name="userId" value={form.userId} onChange={handleChange} required>
            <option value="">Select doctor</option>
            {users.filter((u) => u.role === 'doctor' || u.role === 'admin').map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Date *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label>Time *</label>
          <input type="time" name="time" value={form.time} onChange={handleChange} required />
        </div>
        {isEdit && (
          <div className="form-row">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-show</option>
            </select>
          </div>
        )}
        <div className="form-row">
          <label>Reason</label>
          <input name="reason" value={form.reason} onChange={handleChange} />
        </div>
        <div className="form-row">
          <label>Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn primary">{isEdit ? 'Update' : 'Create'}</button>
          <Link to="/appointments" className="btn">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
