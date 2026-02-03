import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { format } from 'date-fns';

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    cardNumber: '',
    issue: '',
    age: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/patients/${id}`)
      .then(({ data }) => {
        setForm({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          cardNumber: data.cardNumber ?? '',
          issue: data.issue ?? '',
          age: data.age != null ? String(data.age) : '',
        });
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSavedAt(null);
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      cardNumber: form.cardNumber.trim() || undefined,
      issue: form.issue.trim() || undefined,
      age: form.age.trim() ? parseInt(form.age.trim(), 10) : undefined,
    };
    const req = isEdit ? api.put(`/patients/${id}`, payload) : api.post('/patients', payload);
    req
      .then(({ data }) => {
        setSavedAt(data.createdAt ? new Date(data.createdAt) : new Date());
        if (isEdit) {
          setForm({
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            cardNumber: data.cardNumber ?? '',
            issue: data.issue ?? '',
            age: data.age != null ? String(data.age) : '',
          });
        } else {
          setTimeout(() => navigate(`/patients/${data.id}`), 1500);
        }
      })
      .catch((e) => setError(e.response?.data?.error || 'Save failed'));
  }

  if (loading) return <div className="loading-screen">Loading…</div>;

  return (
    <div className="page patient-form-page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Patient' : 'Add Patient'}</h1>
        <Link to={isEdit ? `/patients/${id}` : '/patients'} className="btn btn-ghost">Cancel</Link>
      </div>

      <form onSubmit={handleSubmit} className="form-card form-card-classy">
        {error && <div className="form-error">{error}</div>}
        {savedAt && (
          <div className="form-success">
            Saved on {format(savedAt, 'MMMM d, yyyy \'at\' h:mm a')}
            {!isEdit && <span className="form-success-hint">Redirecting to patient…</span>}
          </div>
        )}

        <section className="form-section">
          <div className="form-grid form-grid-2">
            <div className="form-field">
              <label>Patient name (first) *</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>
            <div className="form-field">
              <label>Patient name (last) *</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>
            <div className="form-field">
              <label>Patient card number</label>
              <input
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="e.g. CARD-001"
              />
            </div>
            <div className="form-field">
              <label>Age</label>
              <input
                name="age"
                type="number"
                min={0}
                max={150}
                value={form.age}
                onChange={handleChange}
                placeholder="e.g. 35"
              />
            </div>
            <div className="form-field form-field-full">
              <label>Patient issue</label>
              <textarea
                name="issue"
                value={form.issue}
                onChange={handleChange}
                placeholder="Chief complaint or reason for visit"
                rows={4}
              />
            </div>
          </div>
        </section>

        <div className="form-actions form-actions-end">
          <Link to={isEdit ? `/patients/${id}` : '/patients'} className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary">
            {isEdit ? 'Update patient' : 'Save patient'}
          </button>
        </div>
      </form>
    </div>
  );
}
