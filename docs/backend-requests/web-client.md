# Backend request: the web client

Paste this into the clinic-api project. It lists what the web app (clinic-web)
needs from the server. The web app works today without any of it: each item
says what the app does in the meantime, so nothing here blocks a release.

## How to do it

- **Contract first.** Every new or changed shape goes into `src/shared` as a zod
  schema with its inferred type. Both apps copy that folder
  (`yarn sync:contract`), so settle the shapes before the endpoints.
- **An endpoint that isn't built yet answers 501** behind the real auth and
  permission chain, so the apps can ship against the contract.
- Keep the existing rules: `{ data, meta }` envelope, errors by `code`, E.164
  phones, practice and location scoping, permissions in `src/core/permissions`,
  audit entries, tests.
- Don't rename or remove anything the apps already use. Adding fields is fine.

## 1. Refresh token in an httpOnly cookie (security — most important)

**Now:** the web app keeps both tokens in `sessionStorage`, or `localStorage`
when "Keep me signed in on this computer" is ticked
(`src/lib/session/tokenStore.ts`). Any script on the page could read them.

**Asked:**

- `POST /auth/otp/verify` and `POST /auth/refresh`, when the request comes from
  the web client, set the refresh token as a cookie: `HttpOnly; Secure;
SameSite=Strict; Path=/api/v1/auth`. The body still returns the access token.
- `POST /auth/refresh` accepts the refresh token from that cookie when the body
  has none.
- A CSRF guard on the cookie routes: require a custom header (for example
  `X-Requested-With: clinic-web`) or a double-submit token.
- "Keep me signed in" decides the cookie's lifetime: a session cookie when off,
  `Max-Age` = the refresh token's lifetime when on. Add
  `keepSignedIn: boolean` (default `false`) to the verify body.
- `POST /auth/logout` clears the cookie.

## 2. `platform: 'web'`

**Now:** `devicePlatformSchema` allows `ios | android` only, so the web app
sends `'android'` (`src/lib/session/deviceInfo.ts`). Sessions from a browser
look like phones.

**Asked:** add `'web'` to the platform enum. Optionally accept a
`deviceName` such as "Chrome on Windows" for the session list (item 9).

## 3. A "printed" state for approved prescriptions

**Now:** the reception computer remembers what it printed in `localStorage`
(`src/features/printing/hooks/usePrintedMarks.ts`). Another computer, or the
doctor's list, can't tell printed from approved.

**Asked:** `POST /prescriptions/:id/printed` (assistant or doctor) records
`printedAt` and `printedBy`, and `prescriptionViewSchema` carries `printedAt:
Date | null`. Printing again keeps the first time and counts reprints if you
like. The list endpoint accepts `printed=false` so the print queue can ask for
what's left.

## 4. Visit transitions on the server

**Shipped (28 Oct 2026).** Opening a draft (typed or from a template) makes or
moves the visit to `with_doctor`, and approving moves it to `done`. The web app
no longer makes those calls itself. It still starts a visit with
`useVisitLifecycle` for vitals taken before any prescription, and for "Save and
start prescription".

**Was:** the web app moved the visit itself
(`src/features/visits/hooks/useVisitLifecycle.ts`): it creates a visit or sets
it to `with_doctor` when the doctor starts a prescription, and sets it to `done`
after approval. If the second call fails, the visit is left behind.

**Asked:** creating a draft for a patient with no open visit at this location
creates one in `with_doctor`; creating a draft on a `waiting` visit moves it to
`with_doctor`; approving moves the visit to `done`. All in the same
transaction as the prescription change.

## 5. Removing a patient from today's list

**Now:** an assistant can't take a patient off the list (added by mistake, or
left without being seen).

**Asked:** `DELETE /visits/:id` (or `POST /visits/:id/cancel`) for a visit that
is still `waiting` and has no prescription. The token isn't reused.

## 6. Live updates

**Shipped (1 Nov 2026).** `src/shared/realtime.schema.ts`, the socket at
`/api/v1/realtime`, and the events behind it. On the web, `useLiveUpdates`
keeps the connection, and every `pollingInterval` is gone. Not done on the
server, because the state doesn't exist yet: "prescription printed" (§3) and
"visit removed" (§5). What follows is the request as it was sent.

**Before:** the apps poll — today's list and the print queue every 15 s, a voice
session every 1.5 s while a part is being written up, notifications every 30 s.

**Asked (revised 1 Nov 2026: a WebSocket, not Server-Sent Events):**

- **The connection:** one WebSocket at `/api/v1/realtime` per open app.
  Browsers and React Native both have WebSocket built in. The browser's
  EventSource can't send the sign-in header, and React Native has none.
- **Signing in:** the access token goes in the first message, never in the
  address, because addresses end up in logs. The same message names the clinic
  and the location, and is sent again after each token refresh.
- **Who hears what:**
  - each location has a channel, so an assistant hears only their own
    locations;
  - each person has a channel, for notifications and the session.
- **What a message says:** only what changed, `{ type: 'changed', topic, id? }`.
  The app then refetches through the normal routes, so permissions stay where
  they are.
- **The heartbeat:** the server sends one every 25 s. An app that hears nothing
  for about a minute reconnects, and every reconnect refetches what's on
  screen. That replaces polling entirely; no slow backup poll.
- **The contract:** the message shapes, topics and timings live in
  `src/shared/realtime.schema.ts`.

The prompt the user pastes into clinic-api has the details.

**The web app then:**

- turns each message into an RTK Query tag invalidation;
- refetches everything on reconnect;
- shows "Reconnecting…" while the connection is down;
- removes the `_POLL_MS` polling.

## 7. Lock time for the clinic's computers

**Now:** "Lock after inactivity" and its minutes are kept per computer
(`src/features/lock/hooks/useLockSettings.ts`). The design has the doctor set
it once for every computer, and the assistant only sees it.

**Asked:** `practiceSettingsSchema.lockAfterMinutes: 0 | 5 | 10 | 15 | 30`
(0 = never), default 10, editable by the doctor through `PATCH /practice`.

## 8. Audio retention: "Don't keep"

**Now:** `audioRetentionDays` is 1–365, so the doctor can't choose to keep no
audio after approval. The web app offers 7, 30 and 90 days.

**Asked:** allow `0`, meaning delete the audio as soon as the prescription is
approved.

## 9. Log out of all phones and computers

**Now:** `POST /auth/logout-all` is routed but not built
(`session.service.ts`). The Security page shows it as "Soon".

**Asked:** build it, and add `GET /auth/sessions` (platform, device name,
signed in at, last used at, is this one) so the page can list where the
doctor is signed in.

## 10. Small fields the pages would use

- `memberViewSchema.lastActiveAt` — Settings › Team shows when each assistant
  last used the app.
- On a patient (`patientViewSchema` or the search result): `lastDiagnosis` and
  `lastLocationId` from the latest approved prescription — the patient picker
  and the Patients page show "last seen for …, at …".
- On a patient as well: `visitCount`, how many visits they've had across the
  clinic. The Patients page tags each row "New", "2 visits" or "Regular · 6
  visits".

  **Until then** the web app asks `GET /prescriptions?patientId=…&status=approved&limit=1`
  for each row on the page. The newest gives the diagnosis, and the total
  stands in for the visit count. Both count only this location, and only
  visits that ended in a prescription.

## 11. The assistant sets the order of today's list

**Shipped (29 Oct 2026).** Visits carry `queuePosition`, and
`POST /visits/:id/move` takes `{ before }`. On the web, the assistant drags a
waiting row by its handle, and `inQueueOrder` sorts by position
everywhere, so the doctor sees the same list. What follows is the
request as it was sent.

**Why:** the assistant calls patients in, so the assistant decides who goes
next: a frail patient first, someone who stepped out last. The doctor's screens
must show that same order. Tokens never change. A token out of sequence is
itself the sign that the list was rearranged, because the patient's slip
already shows that number.

**Now:** visits carry no order. `GET /visits` returns them by arrival, and
every screen sorts by token. The web app uses one shared order everywhere
(`inQueueOrder` in `features/visits`): with the doctor, then waiting, then
seen, each by token. So the assistant and the doctor already see the same
list, but nobody can rearrange it.

**Asked:**

- `visitViewSchema.queuePosition: number`: the visit's place in its day's list
  at its location. A new visit goes to the end. `GET /visits` returns visits in
  this order.
- `POST /visits/:id/move` with `{ before: objectId | null }` puts the visit
  just before another visit in the same day and location, or at the end with
  `null`.
  - Only a `waiting` visit moves, and only before another `waiting` one.
    Anything else answers `VALIDATION_ERROR`.
  - Use "before" rather than an index, so two people moving at once both land
    where they meant.
  - The token never changes.
  - The answer is the moved `VisitView`. Permission `visit.update`, written to
    the audit log, and no notification.
- Both apps poll today's list, so the doctor sees a move within the poll
  interval. A live event can replace that once §6 lands.

**The web app then:** gives each waiting row on the assistant's list a drag
handle, plus Move up and Move down for the keyboard, and `inQueueOrder` sorts by
`queuePosition` in place of the token. The mobile app needs the same.

## 12. An assistant sees only the patients of their own locations

**Shipped.** Patients carry location links, and the patient routes and the
live `patients` and `reports` messages use one rule (`canSeePatient`). What
follows is the request as it was sent.

**Before:** patient routes check the clinic, not the location. An assistant
working at one location can search, list and open every patient of the
clinic, including people only ever seen at a location they aren't part of.

**Asked:** a patient is linked to the locations where they were registered,
had a visit, or have an appointment. For a member whose `allowedLocationIds`
isn't `'all'` (the assistant), every route that lists, searches, counts or
opens patients, or takes a patient id, covers only patients linked to one of
their locations. Anyone else answers `NOT_FOUND`. The doctor still sees the
whole clinic. Patients carry no location yet, so store the links, backfill
them, and keep them current. The prompt the user pastes into clinic-api has
the details.

**The web app then:** needs no change. The assistant's Patients page, search
and pickers simply return fewer people.

## Already known from testing (not web-specific)

- The voice extractor overwrote earlier lines on an "update" op, and an op with
  no drug name failed the whole part instead of only that line.
