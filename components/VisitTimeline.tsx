'use client'

type Medicine = { name: string; dosage: string; duration: string }

type Visit = {
  _id: string
  date: string
  symptoms: string
  diagnosis: string
  medicinesParagraph?: string
  medicines: Medicine[]
  notes: string
}

type VisitTimelineProps = {
  visits: Visit[]
  onEdit?: (visit: Visit) => void
  onDelete?: (visitId: string) => void
  onPrint?: (visit: Visit) => void
}

export default function VisitTimeline({ visits, onEdit, onDelete, onPrint }: VisitTimelineProps) {
  const sortedVisits = [...visits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (sortedVisits.length === 0) {
    return (
      <p className="text-gray-600 text-base font-semibold">No visits yet.</p>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200" />
      <ul className="space-y-6">
        {sortedVisits.map((v) => {
          const d = new Date(v.date)
          const dateStr = d.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
          const timeStr = d.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })
          return (
            <li key={v._id} className="relative pl-8 sm:pl-10">
              <div className="absolute left-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full timeline-dot border-2 border-white" />
              <div className="bg-white rounded-lg border-2 border-slate-200 p-3 sm:p-4 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                  <p className="text-sm sm:text-base font-medium text-slate-600 shrink-0">
                    {dateStr} · {timeStr}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {onPrint && (
                      <button
                        type="button"
                        onClick={() => onPrint(v)}
                        className="text-base font-bold text-slate-600 hover:text-slate-800 py-2 px-3 rounded border-2 border-slate-200 hover:border-slate-300 touch-manipulation min-h-[44px]"
                      >
                        Print
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(v)}
                        className="text-base font-bold text-slate-600 hover:text-slate-800 py-2 px-3 rounded border-2 border-slate-200 hover:border-slate-300 touch-manipulation min-h-[44px]"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(v._id)}
                        className="text-base font-bold text-red-600 hover:text-red-800 py-2 px-3 rounded border-2 border-red-200 hover:border-red-300 touch-manipulation min-h-[44px]"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                {v.symptoms && (
                  <p className="text-sm sm:text-base text-slate-700 mb-1 break-words">
                    <span className="font-medium text-slate-600">Symptoms:</span> {v.symptoms}
                  </p>
                )}
                {v.diagnosis && (
                  <p className="text-sm sm:text-base text-slate-700 mb-1 break-words">
                    <span className="font-medium text-slate-600">Diagnosis:</span> {v.diagnosis}
                  </p>
                )}
                {v.medicinesParagraph && (
                  <div className="text-lg sm:text-xl text-slate-700 mb-1 break-words whitespace-pre-wrap">
                    <span className="font-medium text-slate-600">Medicines:</span>
                    <p className="mt-0.5">{v.medicinesParagraph}</p>
                  </div>
                )}
                {v.medicines && v.medicines.length > 0 && (
                  <div className="text-sm sm:text-base text-slate-700 mb-1 break-words">
                    {v.medicinesParagraph ? (
                      <span className="font-medium text-slate-600">Structured list:</span>
                    ) : (
                      <span className="font-medium text-slate-600">Medicines (Homeopathic):</span>
                    )}
                    <ul className="list-disc list-inside mt-0.5">
                      {v.medicines.map((m, i) => (
                        <li key={i}>
                          {m.name}
                          {m.dosage && ` ${m.dosage}`}
                          {m.duration && ` · ${m.duration}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {v.notes && (
                  <p className="text-sm sm:text-base text-slate-700 break-words">
                    <span className="font-medium text-slate-600">Notes:</span> {v.notes}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
