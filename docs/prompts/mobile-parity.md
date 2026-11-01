# Task: bring the web app level with the mobile app

Paste this into a Claude Code session opened in `clinic-web`.

The mobile app (`../clinic-app`) has features that the web app still shows as
"Coming soon". Build them on the web, one feature at a time, in the order below.
The backend is `../clinic-api`: read it, don't change it. Anything the server is
missing goes in `docs/backend-requests/mobile-parity.md`.

## Before you start

1. Read `CLAUDE.md`, `docs/STANDARDS.md` and
   `docs/backend-requests/web-client.md`.
2. Run `yarn sync:contract`. If `src/contract` changed, run `yarn typecheck`
   and fix what broke before anything else.
3. Under each feature below is a list of mobile files. They show how the feature
   should behave: what is fetched, what the hook returns, the copy and the edge
   cases. Port the behaviour, not the code. `Sheet` becomes `Dialog`,
   `router.push` becomes `navigate`, and the camera and gallery pickers become a
   file input.
4. Designs are PDFs in `~/Downloads`:
   - Web doctor: `Doctor Clinic App (7).pdf`. Web assistant:
     `Doctor Clinic App (8).pdf`. Sign-in and the lock screen:
     `Doctor Clinic App (9).pdf`.
   - The web designs draw these features only as "Coming soon" (`(7)` p14,
     `(8)` p6), so there is no web drawing for them. Take what each one shows
     from the mobile drawings:
     - `Doctor Clinic App (2).pdf` p3 and p6: the consultation's History,
       Reports and Past Rx tabs.
     - `Doctor Clinic App (2).pdf` p8: upload report.
     - `Doctor Clinic App (2).pdf` p9: Rx templates.
     - `Doctor Clinic App (5).pdf` p1: the queue with Add vitals and Upload
       report.
     - `Doctor Clinic App (5).pdf` p4: upload report.
     - `Doctor Clinic App (5).pdf` p5: Schedule.
   - Lay them out with the web's own parts (`AppShell`, `PageHeader`, `Table`,
     `Card`, `Dialog`), using the Today and Patients pages as models. The design
     is 1440 wide, and pages must still work at 1280.

## Rules for this task

All of `docs/STANDARDS.md` applies. These are the rules this work runs into
most:

- Search `ui/`, `components/` and the feature first. Add a prop or a variant
  before making a near-copy.
- Every string goes in the feature's `copy.ts`. Never assume a gender: write
  "the assistant", "they". Say "clinic".
- Limits and enums come from `@/contract`: `REPORT_UPLOAD`,
  `reportTypeSchema.enum`, `appointmentKindSchema.enum`, `VITAL_RANGES`,
  `vitalFlags`. Never retype them.
- A new page needs four things: an entry in `Routes` (plus a path helper if it
  takes an id), a line in `src/app/router.tsx` under the right `RoleGuard`, a
  nav entry in `features/shell/constants.ts`, and removal of its item from
  `DOCTOR_SOON` / `ASSISTANT_SOON`. When either list is empty, that sidebar's
  "Coming soon" group goes.
- New RTK Query tags go in `ApiTag` (`lib/api/baseApi.ts`). Today there are none
  for reports, appointments or follow-ups.
- A list that someone else changes polls, with a named `_POLL_MS` constant
  (15 s, like Today), until the server can push changes.
- An assistant never creates, approves or dictates a prescription. No page the
  assistant can open offers those actions.
- Don't add dependencies without asking. None should be needed: files come from
  `<input type="file">` and drag-and-drop, images show in `<img>`, and PDFs open
  in a new tab.
- Never edit `src/contract`. If a shape is missing, stop that item, add it to
  `docs/backend-requests/mobile-parity.md`, and say so.
- When the work needs a new rule (like the upload exception in item 3), add it
  to `docs/STANDARDS.md` in the same change.
- After each feature, run `yarn typecheck`, `yarn lint` (no errors) and
  `yarn format:check`. Don't start the dev server or open a browser unless the
  user asks. clinic-web isn't a git repo yet: don't run `git init` or commit
  unless the user asks.

## Already built: extend it, don't rebuild it

| Where                      | What                                                                                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/vitals`          | `api.ts` (`getVisitVitals`, `recordVitals`), `schemas.ts` (`vitalsFormSchema`), `utils.ts`, `copy.ts`. There is no dialog yet.                                                     |
| `features/patients`        | `PatientPickerDialog`, `usePatientSearch`, and `PatientPanel`, the Patients page's side panel. Its "Full history, vitals and reports" row says Soon.                               |
| `features/prescription`    | `PatientHeader`, whose History and Reports buttons are disabled (`copy.soon`). `useConsultation` already reads the visit's vitals.                                                 |
| `components/printout`      | The A4 prescription page that print preview uses.                                                                                                                                  |
| `features/notifications`   | The bell (`NotificationsBell`) and Today's Activity card. Rows for reports and appointments open nothing yet.                                                                      |
| `features/visits`          | `useVisitLifecycle`, which starts a visit when there isn't one.                                                                                                                    |
| `components/form`          | `FormInput`, `FormTextarea`, `FormSegmented`, `FormTimeInput`, `FormDayPicker` (weekdays, for clinic hours), `FormCheckbox`, `FormCheckboxGroup`, `FormPhoneInput`. No date field. |
| `lib/api/errorMessages.ts` | Already has a message for `STORAGE_UNAVAILABLE`.                                                                                                                                   |

## Part A: the API is ready for these

### 1. Vitals

**Mobile:** `features/vitals/hooks/useVitalsSheet.ts`,
`components/VitalsSheet.tsx`, `schemas.ts`, `utils.ts`;
`features/queue/hooks/useQueue.ts` (`addVitals`);
`features/prescription/components/ConsultationSheets.tsx`.

**API:** `GET /visits/:id/vitals` and `PUT /visits/:id/vitals`. Both the doctor
and the assistant can use them.

**Build:**

- `VitalsDialog` and `useVitalsDialog({ vitals, getVisitId, onSaved })` in
  `features/vitals`, exported from its `index.ts`.
- The fields match mobile: BP systolic and diastolic, pulse, temperature (°F),
  weight (kg), SpO₂. Units come from `VITAL_RANGES`. The hint reads "Leave out
  anything you didn't measure." The form needs at least one reading, or it shows
  the form error. When editing, the form starts from the saved readings.
- A reading outside the normal range is marked as soon as it's typed
  (`vitalFlags`), in the status colour that already means "needs attention".
- Reception list (`ReceptionQueue`): each waiting patient's row shows their
  readings, or "Add vitals". Clicking it opens the dialog for that visit.
- Consult (`PatientHeader`): the vitals line gets "Add vitals" or "Edit". If
  there is no visit yet, `getVisitId` starts one through `useVisitLifecycle`,
  as mobile does.
- Take "Vitals" out of `ASSISTANT_SOON`. There is no design for a separate
  Vitals page, and the list row covers it, as on mobile. Mention this choice in
  your report so the user can disagree.

**Done when:** the assistant records vitals from the list; the doctor sees them
in the consult header and on the printout without reloading (through tags); and
an out-of-range BP is marked.

### 2. Past prescriptions (doctor)

**Mobile:** `features/prescription/hooks/usePastPrescriptions.ts`,
`components/PastRxList.tsx`, `copy.pastRx`.

**API:** `GET /prescriptions?patientId=…&status=approved`. This is already
`listPrescriptions` in `features/prescription/api.ts`.

**Build:**

- The consult header's "History" button opens `PastRxDialog`. It lists the
  patient's approved prescriptions from other visits, newest first, each with
  its number, date, medicine count and diagnosis. Selecting one shows it
  read-only on the right with `components/printout`, scaled the way print
  preview scales it, plus a link to its print preview (`printPath`).
- On the Patients page, the panel's prescription list opens the same dialog.
  The "Full history…" row stays Soon until item 9.
- When there are none, it says "No earlier prescriptions for this patient."

**Done when:** for a patient with two approved visits, the doctor opens History
in the consult, reads the older prescription, and gets to its print preview.

### 3. Reports: list, view, upload

**Mobile:** `features/reports`: `api.ts`, `constants.ts`, `schemas.ts`,
`utils.ts`, `copy.ts`, `hooks/usePatientReports.ts`, `useReport.ts`,
`useUploadReport.ts`, `usePickPages.ts`, `components/PatientReports.tsx`,
`ReportRow.tsx`, `PageTiles.tsx`; also `lib/files` (`putFile`).

**API:** these steps, for both the doctor and the assistant.

1. `GET /patients/:id/reports` lists a patient's reports.
2. `GET /reports/:id` returns one report, with a short-lived signed URL per
   page.
3. An upload asks `POST /reports/uploads` for one ticket per page.
4. It PUTs each page's bytes to the ticket's `uploadUrl`.
5. `POST /patients/:id/reports` creates the report from the page keys.

**Build:**

- A new feature, `features/reports`, with the same files as mobile.
- **List:** each report shows its test name, type, test date and page count,
  plus "New" while `reviewedAt` is null. Newest test first.
- **Viewer (`ReportDialog`):**
  - Image pages show inline, one under another, labelled "Page x of y".
  - A PDF page opens in a new tab (`target="_blank" rel="noopener noreferrer"`).
  - Signed links expire (`expiresAt`). Fetch the report each time the viewer
    opens, refetch when a link has expired, and never store the links.
- **Upload (`UploadReportDialog`):** also served as the page `/reports/upload`
  for the assistant's sidebar item "Upload reports".
  - Fields: patient (the picker, preset when opened for a patient), type, test
    name, test date (today or earlier), pages.
  - Pages come from a file input (`multiple`) or are dropped onto the dialog.
  - Check each file before sending it: its type must be in
    `REPORT_UPLOAD.allowedContentTypes`, its size at most `maxBytes`, and the
    page count at most `maxPages`. When a file is refused, say why.
  - Images show as thumbnails through `URL.createObjectURL`. Revoke each URL
    when its page is removed or the dialog closes.
  - Send the pages one at a time, showing "Uploading page x of y…". Then create
    the report with the page keys and that patient's visit today, if they have
    one.
- **The PUT to `uploadUrl` is not an API call.** It doesn't go through
  `baseQuery` and carries no `Authorization` header: the URL is the credential.
  Add `putFile(url, file, contentType, signal)` in a new `lib/files`. Then add
  to STANDARDS §5 the exception mobile already has: "Nothing else calls `fetch`.
  The one exception is file bytes sent to a signed storage URL, which go through
  `putFile` in `lib/files`."
- Files stay in memory as `File` objects and are never written to browser
  storage. Signing out aborts an upload in progress (`registerSignOutTask` with
  an `AbortController`).
- **Where it appears:** the consult header's "Reports" button (list and
  Upload), the Patients panel, an "Upload report" action on the reception row,
  and the assistant's sidebar "Upload reports" (take it out of
  `ASSISTANT_SOON`).
- **Errors:** on a dev machine using the local storage driver, every upload gets
  `STORAGE_UNAVAILABLE`, which already has a message. That's expected until the
  backend's §1 lands. Don't work around it.

**Done when:** with object storage set up, an assistant uploads a two-page
report (a photo and a PDF), and the doctor sees it marked New in the consult and
opens both pages.

### 4. Schedule and booking (assistant)

**Mobile:** `features/appointments`: `api.ts` (`listAppointments` reads
`countsByDay` from `meta.envelope`), `hooks/useSchedule.ts`,
`useBookAppointment.ts`, `utils.ts` (`weekTiles`), `schemas.ts`, `copy.ts`,
`components/WeekStrip.tsx`, `AppointmentRow.tsx`, `FollowUpRow.tsx`,
`CancelAppointmentSheet.tsx`.

**API:** `GET /appointments?from=…&to=…` (with `meta.countsByDay`),
`POST /appointments`, `POST /appointments/:id/cancel`, `GET /follow-ups`.

**Build:**

- The page `/schedule`, for the assistant. Add `Schedule` to `ASSISTANT_NAV`
  and take it out of `ASSISTANT_SOON`. Its `PageHeader` reads "Schedule" and
  has a "Book appointment" button.
- **Week strip:** seven days, each with its appointment count, and previous and
  next week. It can't go back before the current week. Selecting a day lists its
  appointments: time, patient, kind, note, and Cancel.
- **"Follow-ups to book · n" card:**
  - Each follow-up shows the patient, due date, Overdue when it's past due, and
    the note.
  - Its "Book" button opens the booking dialog, filled in with the patient, the
    `prescriptionId`, the due date and the follow-up kind.
  - Booking takes the follow-up off this list. Invalidating the appointment and
    follow-up tags does that, as on mobile.
- **`BookAppointmentDialog`:**
  - Fields: patient, kind (follow-up or new problem), date (today or later),
    time, note.
  - `at` is the chosen local date and time, sent as one instant.
- **Cancel:** a confirm dialog that says "If it was a follow-up, it goes back on
  the list to book."
- **A date field:**
  - Add a `DateInput` primitive to `ui/`: a native `<input type="date">` styled
    like `Input`.
  - Add `FormDateInput` to `components/form` (value `YYYY-MM-DD`, with `min`
    and `max`), and add it to the list of form fields in STANDARDS §4.
  - Use it for the report's test date too.
- Poll the week and the follow-ups every 15 s.
- The Patients panel and the reception row get a "Book appointment" action.

**Done when:** the doctor approves a prescription with a follow-up date, and
within one poll it shows in the assistant's follow-ups. The assistant books it:
the appointment appears on its day and the follow-up leaves the list. Cancelling
the appointment puts the follow-up back.

### 5. The Patients page for the assistant

**Mobile:** `features/patients/hooks/usePatientActions.ts`,
`components/PatientActionsSheet.tsx`, `app/(app)/(assistant)/patients.tsx`.

**Build:**

- Move `Routes.patients` out of the doctor-only `RoleGuard`, into the group
  both roles share. Add Patients to `ASSISTANT_NAV`.
- The page is the same; its actions depend on the role.
  - **Doctor:** New prescription, as today.
  - **Assistant:** "On today's list · token #n" or "Add to today's list", plus
    Upload report and Book appointment. No prescription actions.

**Done when:** the assistant finds a patient and adds them to today's list, and
sees "New prescription" nowhere.

### 6. Notifications open what they're about

**Mobile:** `features/notifications/hooks/useNotifications.ts` (`open`),
`utils.ts`.

**Build:** clicking a row in the bell or in the Activity card marks it read and
opens what it's about. Each role opens only pages it can see.

| Notification                                    | Doctor                | Assistant            |
| ----------------------------------------------- | --------------------- | -------------------- |
| `report.uploaded`                               | that report's viewer  | that report's viewer |
| `prescription.approved`, `prescription.revised` | print preview         | print preview        |
| `visit.statusChanged`, `vitals.recorded`        | the patient's consult | —                    |
| `appointment.booked`                            | —                     | Schedule             |

**Done when:** each row opens the page in this table for its role.

## Part B: these wait on the backend

Each of these needs an item from `docs/backend-requests/mobile-parity.md`.
Before starting one, check that the API has it: the route no longer answers 501,
or the schema is in `src/contract` after `yarn sync:contract`. If it doesn't,
skip the item and say so.

### 7. Reviewing reports, and the doctor's "Reports and labs" page (backend §2)

- Opening a report in the viewer as the doctor marks it reviewed. "New" goes
  away, and the Patients filter counts drop.
- The page `/reports`, for the doctor: patients with a report nobody has
  reviewed (`GET /patients?newReports=true`, with `counts.newReports` as the
  sidebar badge). Each row shows the newest such report and opens that patient's
  reports. Take "reports" out of `DOCTOR_SOON`.

### 8. Rx templates (backend §4)

**Mobile design:** `Doctor Clinic App (2).pdf` p9.

- The page `/templates`, for the doctor:
  - Search, and a list showing each template's name, a summary ("3 medicines ·
    3 labs · advice"), its medicine line and how many times it has been used.
  - Actions: Use, New, Edit, Delete.
- "Save as template" on an approved prescription, in print preview and the
  History dialog.
- "Start from template" in the consult, offered while the draft is empty, or to
  add a template's lines to the draft.
- Take "templates" out of `DOCTOR_SOON`.

### 9. Patient history timeline (backend §3)

- `GET /patients/:id/history` (`historyItemViewSchema`) is for the doctor only
  (`patient.history`).
- The History dialog from item 2 gets a "Timeline" tab beside Past
  prescriptions. Filter chips narrow it by kind: visit, prescription, lab,
  report.
- The Patients panel's "Full history, vitals and reports" row opens the same
  dialog.

### 10. The doctor's History log (backend §5)

- The page `/prescriptions`, for the doctor:
  - Every prescription at this location, newest first, with status chips and a
    search by patient.
  - A draft opens the consult; an approved prescription opens print preview.
- Take "history" out of `DOCTOR_SOON`. The doctor's "Coming soon" group is then
  gone.

### 11. `web-client.md` items as they land

Printed state, visit moves on the server, removing a patient from today's list,
live events, and the rest. When an item ships, replace its `TODO(backend)` and
the interim code.

## Report back

When you finish, give the user a short list:

- What you built, and where each piece appears.
- What you skipped, and why.
- Choices you made where the design says nothing, such as the Vitals nav item.
- What mobile now lacks next to the web, for the next task. Known so far:
  Settings › Voice, Security and Printing; the PIN lock; the assistant's print
  queue; Reports and labs; the History log; Rx templates.
