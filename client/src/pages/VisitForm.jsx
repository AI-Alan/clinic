import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { format } from 'date-fns';

export default function VisitForm() {
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
    appointmentId: '',
    chiefComplaint: '',
    vitals: '',
    diagnosis: '',
    notes: '',
    prescriptions: '',
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
    api.get(`/visits/${id}`)
      .then(({ data }) => {
        setForm({
          patientId: data.patientId,
          userId: data.userId,
          date: data.date ? data.date.slice(0, 10) : form.date,
          appointmentId: data.appointmentId || '',
          chiefComplaint: data.chiefComplaint || '',
          vitals: typeof data.vitals === 'string' ? data.vitals : (data.vitals ? JSON.stringify(data.vitals) : ''),
          diagnosis: data.diagnosis || '',
          notes: data.notes || '',
          prescriptions: data.prescriptions || '',
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
    const payload = {
      ...form,
      date: new Date(form.date + 'T12:00:00').toISOString(),
      appointmentId: form.appointmentId || undefined,
      vitals: form.vitals.trim() ? form.vitals : undefined,
      prescriptions: form.prescriptions.trim() ? form.prescriptions : undefined,
    };
    const req = isEdit ? api.put(`/visits/${id}`, payload) : api.post('/visits', payload);
    req
      .then(({ data }) => navigate(`/visits/${data.id}`))
      .catch((e) => setError(e.response?.data?.error || 'Save failed'));
  }

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Visit' : 'New Visit'}</h1>
        <Link to={isEdit ? `/visits/${id}` : '/visits'} className="btn">Cancel</Link>
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
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Date *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label>Chief complaint</label>
          <input name="chiefComplaint" value={form.chiefComplaint} onChange={handleChange} />
        </div>
        <div className="form-row">
          <label>Vitals (JSON)</label>
          <input name="vitals" value={form.vitals} onChange={handleChange} placeholder='e.g. {"bp":"120/80","temp":"98.6"}' />
        </div>
        <div className="form-row">
          <label>Diagnosis</label>
          <input name="diagnosis" value={form.diagnosis} onChange={handleChange} />
        </div>
        <div className="form-row">
          <label>Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} />
        </div>
        <div className="form-row">
          <label>Prescriptions</label>
          <textarea name="prescriptions" value={form.prescriptions} onChange={handleChange} rows={2} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn primary">{isEdit ? 'Update' : 'Create'}</button>
          <Link to={isEdit ? `/visits/${id}` : '/visits'} className="btn">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
