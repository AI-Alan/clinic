import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { format } from 'date-fns';

export default function VisitDetail() {
  const { id } = useParams();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/visits/${id}`)
      .then(({ data }) => setVisit(data))
      .catch((e) => { if (e.response?.status === 404) setVisit(null); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading…</div>;
  if (!visit) return <div className="error">Visit not found.</div>;

  let vitals = null;
  try {
    vitals = visit.vitals ? JSON.parse(visit.vitals) : null;
  } catch (_) {}

  return (
    <div className="page">
      <div className="page-header">
        <h1>Visit — {format(new Date(visit.date), 'MMM d, yyyy')}</h1>
        <Link to={`/visits/${id}/edit`} className="btn">Edit</Link>
      </div>
      <section className="card">
        <p><strong>Patient:</strong> <Link to={`/patients/${visit.patient?.id}`}>{visit.patient?.firstName} {visit.patient?.lastName}</Link></p>
        <p><strong>Doctor:</strong> {visit.user?.name}</p>
        <p><strong>Chief complaint:</strong> {visit.chiefComplaint || '—'}</p>
        {vitals && (
          <p><strong>Vitals:</strong> {typeof vitals === 'object' ? JSON.stringify(vitals) : visit.vitals}</p>
        )}
        <p><strong>Diagnosis:</strong> {visit.diagnosis || '—'}</p>
        <p><strong>Notes:</strong></p>
        <pre className="notes">{visit.notes || '—'}</pre>
        {visit.prescriptions && <p><strong>Prescriptions:</strong> {visit.prescriptions}</p>}
      </section>
    </div>
  );
}
