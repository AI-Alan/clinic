# Features

- **Authentication**: Login and logout; JWT stored in httpOnly cookie. Forgot-password page (UI only; no backend).
- **Roles**: Admin, doctor, nurse. Each role has different permissions (see below).
- **Patient management**: Create, read, update, delete patients. Search and filter by name, phone, location.
- **Visit management**: Add and edit visits per patient; view timeline of visits. Temperament (stored on patient) can be set from the visit form.
- **Temperament**: Optional field on patient with a fixed set of options; displayed and editable in visit flow.
- **Appointment queue**: Add patients to today’s queue; reorder queue; mark as visited; remove from queue (when still queued). Today’s queue and today’s visited are shown on the dashboard.
- **Dashboard**: Total patients count; today’s queue (with count, list, reorder, mark visited, remove); today’s visited list (read-only). “Add to queue” opens a patient picker.
- **Medicines**: Per visit, a free-text “Medicines (paragraph)” field (large, full-width) and an optional structured list (name, dosage, duration). Both can be used together.
- **Print prescription**: Modal to preview and print a prescription (patient info, date, symptoms, diagnosis, medicines paragraph and/or table, notes).
- **UI**: Accent colour (e.g. soft blue / emerald), responsive layout, senior-friendly (larger text, contrast, touch targets).

## Role capabilities

- **Admin**: Full access; staff CRUD; queue manage (add, reorder, mark visited, delete).
- **Doctor**: Patient and visit CRUD; queue manage (add, reorder, mark visited, delete); no staff access.
- **Nurse**: View patients and visits; add to queue and view queue; cannot reorder, mark visited, or delete from queue; no staff access.
