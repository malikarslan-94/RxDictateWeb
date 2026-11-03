# Design: organisations, access, medicines and announcements

**Status:** agreed direction (1 Nov 2026). Phases 1 and 2 are built (2–3 Nov 2026). Each
remaining phase at the end becomes a clinic-api prompt, then the web side.

## Why

The product is growing past doctors and assistants:

- **New people:** a hospital's medicine manager, medicine companies, and
  RxDictate's own team. Later others may come: event organisers, nurses, lab
  staff, patients.
- **New things they make that doctors see:** medicines today; events, seminars
  and announcements later.
- **Choices at several levels:** a doctor picks how suggestions behave, a
  hospital may decide for its doctors, and RxDictate decides what a plan
  includes.

Three foundations serve all of it, plus one shared review flow:

1. **Access:** who belongs where, and what they may do.
2. **Audience:** who a thing is for.
3. **Settings:** what each person, clinic and plan has chosen.
4. **Review:** anything submitted from outside a clinic is checked before it
   goes live.

Features (medicines, announcements, whatever comes next) are built on these
and never invent their own versions.

## 1. Organisations and memberships

A user belongs to organisations through **memberships**, each with one role.
The role lives on the membership, as it does today. So one person can be a
doctor in one clinic and an editor at a medicine company, with different
rights in each.

| Organisation type | What it is                                       | Roles                                                                                     |
| ----------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `clinic`          | Today's practice. A hospital is a larger clinic. | `doctor`, `pa`, `medicineManager` (new). Later perhaps `nurse`, `labTech`, `clinicAdmin`. |
| `company`         | A medicine company                               | `companyAdmin`, `companyEditor`                                                           |
| `platform`        | RxDictate itself: exactly one                    | `platformAdmin`, `reviewer`, `contentManager`                                             |

- **Existing practices** become organisations of type `clinic` and keep their
  ids. `X-Practice-Id` and every field the apps use stay as they are; nothing
  is renamed.
- **The active organisation** decides the area the app opens:
  - a clinic opens the clinic app;
  - a company opens the company portal;
  - the platform opens the admin console.

  One sign-in (phone OTP) covers all of them.

- **Who adds whom** is in section 2.
- **Patients aren't members of a clinic.** They reach their own records
  another way (section 3).
- **A role never changes once given.** Remove the membership and add a new one
  instead, as today.

## 2. Accounts: who creates whom

Everyone signs in the same way, with phone and OTP, so an "account" is just a
user with that phone. What differs is how they get **access** to an
organisation or to records.

| Who              | Account made by                        | Access given by                                                                |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| Doctor           | themselves: sign-up                    | creating their clinic at sign-up (as today)                                    |
| Assistant        | the doctor adds them by phone          | that membership (as today)                                                     |
| Medicine manager | the doctor adds them by phone          | that membership                                                                |
| Patient          | themselves: sign-in in the patient app | proving the clinic's record is theirs (section 3); the clinic makes the record |
| Company admin    | **RxDictate** invites them by phone    | RxDictate creates the company after checking it; a self-apply form comes later |
| Company editor   | the company admin adds them            | that membership                                                                |
| RxDictate staff  | the first admin by a server script     | then platform admins add the rest                                              |

**Companies, in more detail:**

- **To start, RxDictate creates every company.** A company's data reaches
  every doctor, so who they are is checked first: company registration and
  DRAP licence. RxDictate creates the company and invites its first admin by
  phone, and that admin adds the company's own staff.
- **Later, an "Apply as a company" form** on the website sends the details to
  the review queue (section 7). Approving it creates the company and invites
  its admin. Nothing in the model changes; only the front door is added.

## 3. Patients

A patient is never a member of a clinic. The clinic's assistant or doctor
makes the patient **record**, as today. The patient makes their own
**account** by signing in with their phone in the patient app, then **links**
it to their records.

### Why the phone alone isn't enough

- **Families share one phone.** The app already sees "3 patients use this
  number". A phone match alone would show a grown-up child's records to
  whoever holds the family phone.
- **SIMs are reused.** A number that changes hands would show the old owner's
  history to the new one.

### Linking a record needs two things

1. **The signed-in phone matches the record's phone** (proved by the OTP).
2. **Plus one of these:**
   - **A clinic invite:** staff tap "Invite to RxDictate" on the patient, and
     an SMS link with a one-time code arrives. Sending it automatically at
     the first print can be a clinic setting, since SMS costs money.
   - **A printed prescription:** the patient scans the QR on their own
     printout, or types its code, and taps "This is mine". The code is the
     verification code from the QR work, so no second code is needed.

Each record is linked on its own. A parent links each child's record, and
nobody gets a family member's history by accident.

### What a patient sees and does

- **Sees:** their approved prescriptions (as printed), reports, appointments
  and follow-ups, and vitals over time.
- **Does:**
  - upload a report, which lands in the clinic's report inbox for review;
  - get reminders for follow-ups, and later for medicines.
- **Later, with the patient's consent:** share their history with another
  doctor or clinic. The links make this possible without any change to the
  model.

### What the clinic controls

- **Whether its patients can link at all,** with a clinic setting
  `portal.enabled` in the registry.
- **"Don't share online"** on a single patient's record.
- **Removing a link.**
- **Clinic data stays in the clinic.** A clinic never sees a patient's records
  from another clinic unless the patient shares them.

### How it's stored

- A **patient link** connects a user to one patient record in one clinic: how
  it was made (invite or prescription code), when, and its status.
- It is not a membership and gives no clinic rights.
- The server already reserves the `patient` role and an empty `/portal` route
  for this.

### Where

- The **mobile app** comes first, because patients live on their phones.
- The web app can get a "My health" area later, using the same routes.

## 4. Permissions

- **One table:** role → actions (`entity.verb`) lives in
  `core/permissions`, as now, extended for each organisation type.
- **New actions**, for example:
  - `drug.submit`, `drug.review`;
  - `drugList.manage` (own list, or the clinic's list);
  - `settings.update` (for each layer);
  - `announcement.create`, `announcement.review`, `announcement.publish`.
- **The server enforces;** the apps only hide. `GET /me` returns the active
  membership's actions (`can: string[]`), and the apps show or hide on
  actions, never on role names. A new role then needs no app change beyond
  its own screens.
- **Platform rights come only from the platform organisation,** never from a
  clinic membership.

## 5. Settings: one registry, three layers

Every setting is one entry in a registry in `src/shared`:

```ts
'medicines.source': {
  values: ['myList', 'myListFirst', 'all'],
  default: 'myListFirst',
  setBy: ['clinic', 'user'],
  lockable: true,
},
```

- **Layers:**
  `platform (defaults, plan entitlements) → organisation → user in that organisation`.
  A higher layer may **lock** a lockable setting.
- **The server resolves it.** `GET /settings` returns each effective value,
  the layer it came from, and whether it is locked. The apps never work it out
  themselves.
- **Plan entitlements** (voice, number of locations, …) are platform-layer
  settings, so today's `practice.features` folds into the registry over time.
- **A new setting is one registry entry.** The settings screens can be drawn
  from the registry, so most new settings need no new screen.
- **Who may set it for a clinic:** an entry may name the action that sets it
  at the organisation layer, so `medicines.source` follows
  `drugList.clinic.manage` and a medicine manager can set it without getting
  every clinic setting. Otherwise it's `settings.organisation.update`.

## 6. Audience

**Who a thing is for**, written as rules over attributes:

- organisation type and role;
- specialty;
- city and province;
- specific organisations or users.

This needs structured fields that don't exist yet:

- a doctor's **specialty**, picked from a list. The letterhead's free-text
  speciality line stays as printed.
- a location's **city and province**.

Announcements use it first. Anything targeted later uses the same rules, for
example a recall notice to the doctors who prescribed a medicine.

## 7. Review

One queue serves everything submitted from outside a clinic:

- a company's product;
- a hospital's proposal to the national catalog;
- an event or announcement.

A submission has:

- a type and its payload;
- who sent it (organisation and user);
- a status: `pending`, `approved`, `rejected` or `changesRequested`;
- the reviewer, notes and history.

Approving publishes the item. Editing a published item goes through review
again.

## 8. Medicines

### Data

- **`drugs`, the national catalog:** one row per product.
  - brand, generic and salt composition, strength, form, pack, company, and
    DRAP registration number;
  - `source`: `drapImport`, `company`, `clinic` or `typed`;
  - `status`: `pending`, `active`, `rejected` or `discontinued`;
  - `scope`: `national`; `clinic`, one clinic's own local item, visible only
    inside that clinic; or `doctor`, a medicine a doctor typed that the
    catalog didn't have, visible only to that doctor in that clinic and
    marked unverified.
- **`drugLists`:** one per owner, either a doctor in a clinic or the clinic
  itself.
  - Each item is a drug id plus optional usual dose, days and instructions,
    for "my usual" later.
- **`drugUsage`:** how often and how recently each doctor prescribed each drug.
  This replaces today's single global count.

Prescriptions keep their own copy of each medicine line, so editing or
discontinuing a catalog row never changes a prescription.

### Suggestions

The server applies the doctor's `medicines.source` setting; the apps only send
what was typed.

| Mode                    | Searches                                                    | Order                                                                      |
| ----------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| `myList`                | the doctor's list and the clinic's list                     | the doctor's own use first                                                 |
| `myListFirst` (default) | everything                                                  | the doctor's list, then the clinic's, then the rest                        |
| `all`                   | every active national medicine and the clinic's local items | the doctor's list, then the doctor's use, then the clinic's, then the rest |

- **When `myList` finds nothing:** offer "Search all medicines", "Add as
  typed" and "Add to my list".
- **Never block prescribing.** A clinic locking its doctors to its list is a
  later, explicit setting.

### Flows

- **Doctor:**
  - Settings › Medicines: choose the mode and keep their own list;
  - "Add to my list" from a suggestion;
  - a typed medicine that isn't in the catalog goes to **their list only**,
    marked unverified.
- **Medicine manager (clinic or hospital):**
  - builds the clinic list from the catalog;
  - adds local items;
  - may propose an item to the national catalog, which goes to review;
  - may set the mode for the clinic's doctors.
- **Company:**
  - adds products one at a time or by CSV, and edits or discontinues them;
  - everything goes to review before it is live.
- **RxDictate:**
  - reviews submissions and merges duplicates;
  - re-imports the DRAP list on a schedule.

### Rules

1. The national catalog **no longer grows from typing.** That is today's
   source of typos, and of one doctor's entries showing for everyone.
2. **No paid or promoted ranking,** ever. Companies never see who prescribes
   what.
3. **Company data is reviewed** before it reaches any doctor.

## 9. Announcements, events and seminars

These are separate from the clinic's operational notifications ("patient
added", "prescription approved"), which stay as they are.

- **An announcement has:**
  - a kind: `seminar`, `event`, `update` or `sponsored`;
  - a title, body, image and link;
  - a call to action: Register, Learn more or Add to calendar;
  - for an event: the date, the place or an online link;
  - the window when it shows;
  - who it's from: the platform, or a company as sponsor;
  - an audience (section 6), placements, and a frequency cap.
- **Placements** are named slots in the contract, for example `today.banner`,
  `sidebar.card` and `inbox.updates`.
  - A screen that offers a slot renders one component for it.
  - The server picks what this user sees there, if anything.
  - A new slot is one contract entry and one component.
- **Never shown:**
  - in the prescription workspace or the consult;
  - on the printout;
  - on anything a patient sees;
  - on the lock screen.
- **Sponsored items** are labelled "Sponsored", and nothing paid ever touches
  medicine suggestions.
- **What the doctor can do:**
  - **Dismiss** it.
  - **Remind me:** the server schedules reminders, a day before and an hour
    before, through the bell and later push.
  - **Register:** their contact goes to the organiser only with their consent.
- **Settings:** `announcements.sponsored` lets a doctor turn off sponsored
  items; the platform's own events stay. A clinic may turn them off for its
  doctors.
- **Measurement:** shows, clicks and dismissals per announcement, as totals
  only. A sponsor never sees individual doctors, except those who registered.
- **Delivery:**
  - a realtime topic `announcements` refreshes the slots;
  - reminders need scheduled jobs; a jobs collection swept by the server's
    existing timers is enough at this scale.

## 10. Phases

1. **Foundation:**
   - organisation types (clinic, company, platform);
   - roles and actions for each type, and `can` on `GET /me`;
   - the settings registry with layers and locks;
   - structured specialty and city.
2. **Medicines for doctors and clinics:**
   - DRAP import, lists, the three modes, per-doctor ranking;
   - stop the catalog growing from typing;
   - the `medicineManager` role.
3. **Review queue and company portal.**
4. **Announcements:** content, audience, placements, reminders, measurement.
5. **Patients:** linking (invite and prescription code), the patient's own
   view, report upload, reminders. It needs only phase 1 and the QR
   verification code, so it can move earlier if patients matter sooner.

## Decisions

**Taken:**

- "My list" is the doctor's list and the clinic's list together.
- New doctors default to `myListFirst`.
- Company products are reviewed before they go live.
- A clinic's list suggests for now. Locking doctors to it is a later,
  lockable setting.
- RxDictate creates companies to start; a self-apply form with review comes
  later.
- Patients make their own accounts. Linking a record needs a matching phone
  plus a clinic invite or a printed prescription's code.

**Still open:**

- Whether sponsored _product_ promotion is allowed at all, as opposed to
  events and seminars.
- Plans and pricing, and so which entitlements exist.
