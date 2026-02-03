import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { format } from 'date-fns';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/patients/${id}`)
      .then(({ data }) => setPatient(data))
      .catch((e) => {
        if (e.response?.status === 404) setPatient(null);
        else console.error(e);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen">Loading…</div>;
  if (!patient) return <div className="error-msg">Patient not found.</div>;

  return (
    <div className="page patient-detail-page">
      <div className="page-header">
        <div className="page-header-main">
          <h1>{patient.firstName} {patient.lastName}</h1>
          {patient.cardNumber && <span className="badge badge-card">Card: {patient.cardNumber}</span>}
          {patient.age != null && <span className="badge badge-age">Age: {patient.age}</span>}
          {patient.createdAt && (
            <span className="meta-date">Registered {format(new Date(patient.createdAt), 'MMM d, yyyy')}</span>
          )}
        </div>
        <div className="page-header-actions">
          <Link to={`/patients/${id}/edit`} className="btn btn-ghost">Edit</Link>
        </div>
      </div>

      {patient.issue ? (
        <section className="card card-classy card-issue">
          <h2>Patient issue</h2>
          <p className="issue-text">{patient.issue}</p>
        </section>
      ) : (
        <section className="card card-classy">
          <h2>Patient issue</h2>
          <p className="empty-text">No issue recorded.</p>
        </section>
      )}
    </div>
  );
}
