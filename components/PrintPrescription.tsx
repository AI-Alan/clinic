'use client'

import { useEffect, useRef } from 'react'

type Medicine = { name: string; dosage: string; duration: string }

type PrintPrescriptionProps = {
  patient: {
    name: string
    age: number
    gender: string
    phone?: string
    address?: string
  }
  visit: {
    date: string
    symptoms: string
    diagnosis: string
    medicines: Medicine[]
    notes: string
  }
  onClose: () => void
}

export default function PrintPrescription({ patient, visit, onClose }: PrintPrescriptionProps) {
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const visitDate = new Date(visit.date)
    const dateStr = visitDate.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patient.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Times New Roman', serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .clinic-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .clinic-info { font-size: 12px; color: #666; }
          .patient-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 10px;
            background: #f5f5f5;
          }
          .patient-info div { font-size: 14px; }
          .section { margin-bottom: 15px; }
          .section-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
            color: #333;
          }
          .section-content { font-size: 14px; color: #555; }
          .medicines-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .medicines-table th, .medicines-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 13px;
          }
          .medicines-table th { background: #f0f0f0; }
          .rx-symbol { font-size: 24px; margin-right: 10px; }
          .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          .signature { text-align: right; }
          .signature-line {
            border-top: 1px solid #333;
            width: 200px;
            margin-top: 40px;
            padding-top: 5px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="clinic-name">Dr. Clinic</div>
          <div class="clinic-info">Healthcare Services</div>
        </div>

        <div class="patient-info">
          <div>
            <strong>Patient:</strong> ${patient.name}<br>
            <strong>Age/Gender:</strong> ${patient.age} years / ${patient.gender}<br>
            ${patient.phone ? `<strong>Phone:</strong> ${patient.phone}` : ''}
          </div>
          <div>
            <strong>Date:</strong> ${dateStr}<br>
            ${patient.address ? `<strong>Address:</strong> ${patient.address}` : ''}
          </div>
        </div>

        ${visit.symptoms ? `
        <div class="section">
          <div class="section-title">Symptoms:</div>
          <div class="section-content">${visit.symptoms}</div>
        </div>
        ` : ''}

        ${visit.diagnosis ? `
        <div class="section">
          <div class="section-title">Diagnosis:</div>
          <div class="section-content">${visit.diagnosis}</div>
        </div>
        ` : ''}

        ${visit.medicines && visit.medicines.length > 0 ? `
        <div class="section">
          <div class="section-title"><span class="rx-symbol">Rx</span> Prescription:</div>
          <table class="medicines-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${visit.medicines.map((m, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${m.name}</td>
                  <td>${m.dosage || '-'}</td>
                  <td>${m.duration || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${visit.notes ? `
        <div class="section">
          <div class="section-title">Notes:</div>
          <div class="section-content">${visit.notes}</div>
        </div>
        ` : ''}

        <div class="footer">
          <div></div>
          <div class="signature">
            <div class="signature-line">Doctor's Signature</div>
          </div>
        </div>
      </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const visitDate = new Date(visit.date)
  const dateStr = visitDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-auto max-h-[90vh] overflow-auto min-w-0">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 z-10">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 shrink-0">Prescription Preview</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded bg-slate-800 text-white px-4 py-3 sm:py-2 text-sm font-medium hover:bg-slate-700 touch-manipulation flex-1 sm:flex-none"
            >
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 bg-white px-4 py-3 sm:py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation flex-1 sm:flex-none"
            >
              Close
            </button>
          </div>
        </div>

        <div ref={printRef} className="p-4 sm:p-6 overflow-x-auto">
          <div className="text-center border-b-2 border-slate-300 pb-4 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Dr. Clinic</h2>
            <p className="text-xs sm:text-sm text-slate-500">Healthcare Services</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4 p-3 bg-slate-50 rounded text-sm break-words">
            <div className="min-w-0">
              <p><span className="font-medium">Patient:</span> {patient.name}</p>
              <p><span className="font-medium">Age/Gender:</span> {patient.age} years / {patient.gender}</p>
              {patient.phone && <p><span className="font-medium">Phone:</span> {patient.phone}</p>}
            </div>
            <div className="sm:text-right min-w-0">
              <p><span className="font-medium">Date:</span> {dateStr}</p>
              {patient.address && <p><span className="font-medium">Address:</span> {patient.address}</p>}
            </div>
          </div>

          {visit.symptoms && (
            <div className="mb-3">
              <p className="text-sm font-medium text-slate-700">Symptoms:</p>
              <p className="text-sm text-slate-600">{visit.symptoms}</p>
            </div>
          )}

          {visit.diagnosis && (
            <div className="mb-3">
              <p className="text-sm font-medium text-slate-700">Diagnosis:</p>
              <p className="text-sm text-slate-600">{visit.diagnosis}</p>
            </div>
          )}

          {visit.medicines && visit.medicines.length > 0 && (
            <div className="mb-3 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <p className="text-sm font-medium text-slate-700 mb-2">
                <span className="text-lg mr-1">Rx</span> Prescription:
              </p>
              <table className="w-full text-xs sm:text-sm border-collapse min-w-[280px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-2 py-1 text-left">#</th>
                    <th className="border border-slate-300 px-2 py-1 text-left">Medicine</th>
                    <th className="border border-slate-300 px-2 py-1 text-left">Dosage</th>
                    <th className="border border-slate-300 px-2 py-1 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {visit.medicines.map((m, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 px-2 py-1">{i + 1}</td>
                      <td className="border border-slate-300 px-2 py-1 break-words">{m.name}</td>
                      <td className="border border-slate-300 px-2 py-1">{m.dosage || '-'}</td>
                      <td className="border border-slate-300 px-2 py-1 break-words">{m.duration || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {visit.notes && (
            <div className="mb-3">
              <p className="text-sm font-medium text-slate-700">Notes:</p>
              <p className="text-sm text-slate-600">{visit.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
