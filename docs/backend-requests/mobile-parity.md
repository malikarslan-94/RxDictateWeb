# Backend request: features both apps need next

Paste this into a Claude Code session opened in `clinic-api`.

The web app (`../clinic-web`) is catching up with the mobile app
(`../clinic-app`). Most of that work runs on endpoints you already have. This
file lists what's still missing on the server. Both apps use every item here,
not just the web.

It adds to the two earlier requests and replaces neither:
`clinic-web/docs/backend-requests/web-client.md` (items 1–10, still open) and
`clinic-app/docs/backend-requests/*.md`.

## Status (28 Oct 2026)

§1–§7 have shipped, and the web app uses all of them: report review, the
Reports and labs page, the patient timeline, Rx templates, the History log, and
"Arrived" on the Schedule. `appointment.booked` now goes to assistants only.
Push notifications, the patient portal and signing out everywhere still answer 501.

## How to do it

- **Contract first.** Every new or changed shape goes into `src/shared` as a zod
  schema with its inferred type. Both apps copy that folder
  (`yarn sync:contract`), so settle the shapes and tell the app side before you
  build the endpoints.
- **An endpoint that isn't built yet answers 501** behind the real auth and
  permission chain, so the apps can ship against the contract.
- Keep the existing rules:
  - the `{ data, meta }` envelope, and errors by `code`;
  - E.164 phones;
  - practice and location scoping;
  - permissions in `src/core/permissions`;
  - audit entries and notifications where similar actions already make them;
  - tests.
- Don't rename or remove anything the apps already use. Adding fields is fine.
- Never assume a gender in copy, comments or docs. Say "clinic", not
  "practice", in anything a user reads.
- Work in this order. §1 and §2 unblock features that are already built.

## 1. Report uploads that work from a browser and on a dev machine

**Now:**

- `signedPutUrl` throws `STORAGE_UNAVAILABLE` under the local driver
  (`src/core/storage/index.ts`). On a dev machine, neither app can upload a
  report.
- With S3 or R2, the browser PUTs the bytes straight to the bucket. That
  request is cross-origin, so the bucket refuses it unless its CORS rules allow
  the web app's address.

**Asked:**

- **A signed PUT for the local driver.** It mirrors the signed GET that
  `/api/v1/files/*` already serves:
  - `PUT /api/v1/files/*?expires=…&sig=…&ct=…&size=…`, with the HMAC covering
    the key, expiry, content type and size.
  - The handler refuses an expired or altered link, a different
    `Content-Type`, or a body larger than the signed size. It writes through
    `driver().put`.
  - Mount it only when `servesLocalFiles()` is true. Production stays on
    presigned S3/R2.
- **CORS for that route.** The web dev server runs on `http://localhost:5173`,
  and the browser PUTs straight to `publicApiUrl`, so the request is
  cross-origin.
  - Add `http://localhost:5173` to `defaultDevOrigins` (`src/config/config.ts`).
  - Check that the CORS middleware covers the files route and allows `PUT` with
    a `Content-Type` header.
  - In the README's `CORS_ORIGINS` row, say that the web app's address must be
    listed. Setting `CORS_ORIGINS` replaces the defaults, so a `.env` that sets
    it must include `5173` itself.
- **Bucket CORS for production.** Document the rule in the README: allowed
  origins are the web app's addresses; allowed methods `PUT` and `GET`; allowed
  header `Content-Type`; exposed header `ETag`. Without it, every browser upload
  fails before it reaches the server.
- Tests: an upload round trip under the local driver, and refusal of an expired
  link, the wrong content type, and an oversized body.

## 2. Marking a report reviewed

**Now:** `reportViewSchema.reviewedAt` is "null until the doctor has looked at
it", but nothing ever sets it. So every report stays "New" forever, and the
Patients filter `newReports=true` (with `counts.newReports`) never empties.

**Asked:**

- `POST /reports/:id/review`, for the doctor only (a new permission,
  `report.review`). It sets `reviewedAt` and `reviewedBy` and returns the
  `ReportView`.
- It is idempotent: reviewing again keeps the first time.
- Add `reviewedBy: objectId | null` to `reportViewSchema`.
- Write an audit entry. Send no notification.

## 3. Patient history

**Now:** `GET /patients/:id/history` is mounted, and the shapes are settled in
`history.schema.ts` (`historyItemViewSchema`, `listHistoryQuerySchema`). The
endpoint still answers 501.

**Asked:**

- Build it to that contract: one timeline per patient, newest first, mixing
  visits (with their vitals), prescriptions, labs and reports. It takes the
  `kind` filter and pages. It is practice-wide, like patient search, since a
  patient seen at two locations has one history.
- Change the schema only if building it shows a real problem with it. Tell the
  app side first if you do.
- Keep the permission doctor-only (`patient.history`).

## 4. Rx templates

**Now:** `GET /templates`, `POST /templates` and
`POST /prescriptions/from-template/:id` answer 501, and there is no template
schema. The mobile design (`Doctor Clinic App (2).pdf` p9) shows a template's
name, a summary ("3 medicines · 3 labs · advice"), its medicine line, how many
times it has been used, and a Use button.

**Asked, contract first (`src/shared/template.schema.ts`):**

- `templateViewSchema`:
  - `id` and `name`;
  - `sections`: the same `prescriptionSectionsSchema` a prescription uses, so
    applying a template is a copy rather than a translation. Drop the
    follow-up's date and keep its interval;
  - `useCount`, `lastUsedAt`, `createdAt`, `updatedAt`.
- `createTemplateBodySchema`: `name`, plus either `sections` or
  `fromPrescriptionId`, which copies the sections of an approved prescription
  for "Save as template".
- `updateTemplateBodySchema`: `name` and/or `sections`.
- `listTemplatesQuerySchema`: `q` (searches the name), `page`, `limit`.

**Then the endpoints, for the doctor only:**

- `GET /templates`, `POST /templates`, `GET /templates/:id`,
  `PATCH /templates/:id`, `DELETE /templates/:id` (soft delete). Add the
  permissions `template.update` and `template.delete`.
- Scope templates to the doctor within the clinic. Decide whether a clinic with
  two doctors shares them, and say which you chose.
- `POST /prescriptions/from-template/:id` takes the body
  `{ patientId, visitId? }`:
  - It creates a draft with `source: 'template'` and the template's sections,
    and adds one to `useCount`.
  - If the visit already has an open draft, it adds the template's lines to
    that draft instead (never removing what the doctor has) and returns it.
  - Its validator is currently `getPrescription`, which is a placeholder, and
    needs replacing.
- **Later, not now:** the dictation op "use hypertension template", which the
  mobile design mentions.

## 5. The patient on a prescription list

**Now:** `GET /prescriptions` returns `PrescriptionView` items, which carry
`patientId` but no name. A list of every prescription (the doctor's History
page) would need one patient request per row.

**Asked:**

- On the list response only, add
  `patient: { id, name, age, sex, mrNo } | null` to each item. Reuse the
  patient summary shape if one already exists. Don't add it to
  `prescriptionViewSchema` itself.
- Add `from` and `to` (date strings) to `listPrescriptionsQuerySchema`. Add `q`
  too (patient name, phone or MR number) if it's cheap with the existing index;
  skip it otherwise.

## 6. An appointment becomes "arrived"

**Now:** `appointmentStatusSchema` has `arrived`, but nothing sets it. The
assistant's Schedule can't show who came.

**Asked:** when a visit is created for a patient who has a `booked` appointment
that day at that location, mark the appointment `arrived` in the same
transaction. Create no visit from an appointment on its own.

## 7. Tell the assistants about a booking

**Now:** `appointment.booked` goes to `roles: ['doctor']` only
(`src/listeners/index.ts`). The assistants who keep the Schedule never hear of
a booking made at another computer, so both apps' "open the Schedule" handling
for that notification never runs. The doctor gets it but has no schedule page
to open.

**Asked:** send `appointment.booked` to `pa` as well, leaving out whoever
booked it, as other notifications already do. Whether the doctor still gets it
is your call; say which you chose.

## Done means

- Contract changes are in `src/shared`, and the app side has been told to run
  `yarn sync:contract`.
- Every endpoint has tests for its permission, its scoping, and its main error.
- The README's env table and the Swagger docs are updated.
- Your reply lists what shipped, what changed from this request and why, and
  what still answers 501.
