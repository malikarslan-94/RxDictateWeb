# Clinic Web — Code Standards

The web app for doctors and assistants. It follows the mobile app's standards
(`clinic-app/docs/STANDARDS.md`) wherever they apply; this file is the web
version. If something isn't covered, follow the nearest existing pattern and add
the rule here.

## 1. Stack

| Concern     | Use                                                  | Not                                       |
| ----------- | ---------------------------------------------------- | ----------------------------------------- |
| Build       | Vite                                                 | CRA, Next.js                              |
| Language    | TypeScript, `strict: true`                           | JS files, `any`                           |
| Routing     | React Router 7, one table in `src/app/router.tsx`    | routes declared inside features           |
| Server data | RTK Query (Redux Toolkit)                            | `fetch` in components, hand-written flags |
| App state   | Redux Toolkit slices (session, active clinic)        | server data in slices                     |
| Forms       | react-hook-form + zod                                | one `useState` per field                  |
| Styling     | Tailwind v4 with the tokens in `src/theme/theme.css` | arbitrary values, hex, CSS modules        |
| Format      | Prettier + prettier-plugin-tailwindcss               | hand formatting                           |
| Lint        | oxlint                                               |                                           |

## 2. Folders

The same shape as the mobile app:

```
src/
  app/            router.tsx (every path → a screen) and guards.tsx. No other logic.
  features/
    <feature>/    auth, onboarding, clinic, team, today, patients, visits, vitals,
                  prescription, templates, voice, printing, reception,
                  reports, appointments, notifications, lock, settings, shell,
                  verification
      screens/      UI only
      components/   parts used only by this feature
      hooks/        the screens' state and behaviour
      api.ts        RTK Query endpoints (`baseApi.injectEndpoints`)
      slice.ts      Redux slice — only if the feature has app state
      schemas.ts    zod schemas for forms
      types.ts
      constants.ts
      copy.ts       every user-facing string
      utils.ts      pure helpers only this feature uses
      index.ts      the feature's public surface
  contract/       GENERATED copy of clinic-api/src/shared. Never edit.
  store/          the Redux store, typed hooks, listeners
  ui/             design-system primitives. No business words ("patient", "doctor").
  components/     shared parts built from ui/, used by 2+ features (PageHeader, form fields, printout)
  hooks/          generic hooks (useHotkey, useDebounce, useNow)
  lib/            infrastructure: api, session, realtime, toast, storage, recordings, files, pdf
  theme/          theme.css: tokens, utilities, print rules
  constants/      app-wide constants and enums (Routes, Hotkeys, ErrorCode, Role)
  utils/          pure functions (phone, time, date, text)
  types/          app-wide types the contract doesn't cover
```

**Where does a new thing go?**

- Used by one feature → inside that feature.
- Used by two or more → the shared folder (`components/`, `hooks/`, `utils/`, `constants/`, `types/`).
- No business meaning (a button, a chip) → `ui/`.

## 3. Imports

- Direction is `app → features → components → ui → theme`. Never backwards.
- Anything may import `contract/`, `utils/`, `constants/`, `types/`, `hooks/`.
- `lib/` never imports `features/`. `ui/` never imports `features/`, `components/` or `lib/`.
- `store/` is the one place that gathers feature slices and listeners; it imports them by file (`@/features/x/slice`).
- A feature imports another feature only through its `index.ts`, and two features never import each other.
- Across folders use the `@/` alias. Inside a feature, `./` and `../` are fine. Never `../../` (the one exception is `constants/app.ts` reading `package.json`).
- Order: packages, then `@/…` alphabetically, then relative imports, each group separated by a blank line.

## 4. Screens and components

**A screen draws; a hook thinks.** A screen gets everything from its hook and renders it — no fetching, validation, timers or error mapping in the screen.

```tsx
export function SignInScreen() {
  const form = useSendCodeForm(AuthMode.SignIn);
  return (/* layout + ui components only */);
}
```

- A plain `navigate(Routes.x)` may sit in a hook's returned function; anything conditional goes in the hook too.
- Forms bind fields with `FormInput`, `FormPhoneInput`, `FormDayPicker`, `FormTimeInput`, `FormDateInput`, `FormChoiceChips`… from `components/`, and a patient with `FormPatientField` from `features/patients`. A failure that belongs to the whole form shows in a `Banner` above the actions.
- A dialog that a page can't import, because its feature imports the page's feature (History, Reports and booking over the Patients page; the template editor over Templates), opens at its own child route: the page renders `<Outlet />`, the dialog's screen reads the route, and closing navigates back to the page.
- A dialog that leads to another (Reports to one report, History to "Save as template") swaps itself for it instead of stacking a second `Dialog`, so Esc closes one thing at a time. A field inside a dialog that handles Esc itself stops it there.
- A pick-one field is `Select`, and a time of day is `TimeInput` (`FormTimeInput` in a form): the app's own rounded list, never a native `<select>` or `<input type="time">`, whose pop-ups the browser draws square.
- Every page starts with `PageHeader`: a white card with the page's icon (the one its menu line shows), the title, a line under it, and the page's actions on the right. The consult is the exception; its patient card is its header.
- Layouts (`AppShell`, `SessionGate`, `SettingsLayout`, `AuthLayout`) wrap pages; route layouts render `<Outlet />`.
- A public page, for someone with no account here (`/v/:code`, what a printout's QR opens), is a route of its own outside `SessionGate`: no session, no live connection, no shell.
- One component per file; file name = component name. Screens end in `Screen`.
- Props type is `<Name>Props`. Callback props are `onX`; handlers inside are `handleX`.
- Extract a component when it's used twice, is a named thing in the design (e.g. the printout header), or its JSX passes ~40 lines.
- Before creating a component, check `ui/` and `components/`. Add a prop or variant instead of making a near-copy.
- Keep files under ~200 lines. Bigger means it's doing two jobs.

## 5. Logic

- **Hooks** (`useX.ts`) hold state and behaviour, call `api.ts` and `utils/`, and return what the screen needs.
- **Utils** are pure: input → output, no React, no I/O. Formatting, parsing and calculations go here, never inline in JSX.
- **API calls** live in the feature's `api.ts` and go through `lib/api`. Nothing else calls `fetch`. The exceptions are file bytes sent to a signed storage URL, which go through `putFile` in `lib/files`, and what `lib/pdf` reads into a saved PDF: the app's own font files, and the page's images such as the QR.
- **Server data stays in the RTK Query cache.** Slices hold only app state. Never copy API responses into a slice.
- Use the typed `useAppSelector` / `useAppDispatch`, never the plain react-redux hooks.
- **Lists update live; nothing polls.** `useLiveUpdates` (`features/auth`, mounted in `SessionGate`) keeps one WebSocket open through `lib/realtime`. Each `changed` message refetches the tags `lib/realtime/topics.ts` maps its topic to; a reconnect, or a new clinic or location, refetches everything. A new query a topic should refresh needs its tag in that map. Never add `pollingInterval`.
- **A prescription edit shows before it's saved.** The editor's changes go through `apply` in `usePrescriptionDraft`, which hands them to `useDraftSaves`: the change shows at once (the server's op rules run here, in `localOps.ts`), the PATCHes go one at a time and in order, and each answer replaces the cached draft with the edits still waiting laid over it. A refused edit drops out and says why. A line added but not saved yet has a `pending-` id and can't be changed until it lands. Approve and discard act on the whole draft, so they wait for `whenSaved` first.
- **Today's list has one order on every screen**, the assistant's and the doctor's: sort with `inQueueOrder` from `features/visits` (status, then the assistant's `queuePosition`), never a local order. Only the assistant moves a waiting patient (`useMoveVisitMutation` with `{ before }`); the list moves at once and the token never changes.
- **Keyboard shortcuts** are declared in `constants/keys.ts` (`Hotkeys`, and `HotkeyLabel` for showing them) and bound with `useHotkey`. A shortcut without Ctrl never fires while the user types in a field. Each shortcut has one owner (Ctrl K belongs to the shell).

## 6. Constants and enums

- No magic strings or numbers in screens, hooks or components. If it means something, name it.
- Design numbers are theme tokens. Plain numbers are fine only where they are geometry: SVG coordinates, `0` resets, a computed scale.
- Enums are `as const` objects plus a derived type — not TS `enum`:

```ts
export const AuthMode = { SignIn: 'signIn', SignUp: 'signUp' } as const;
export type AuthMode = (typeof AuthMode)[keyof typeof AuthMode];
```

- Values that come from the API are derived from the contract, never retyped: `ErrorCode.OTP_LOCKED`, `Role.pa`, `VisitStatus.waiting`.
- Navigate with `Routes.x`, `consultPath(…)`, `printPath(…)`, never a typed-out path.
- Browser-storage keys are `StorageKey` in `lib/storage`.

## 7. Types

- No `any` — use `unknown` and narrow. No `@ts-ignore` without a reason in a comment.
- Anything that crosses the wire comes from `@/contract`. Never redefine it. When the API changes, run `yarn sync:contract`.
- Other types never live in screen files: feature types → `types.ts`, shared → `types/`.
- Form types come from zod: `z.input<typeof schema>` for what's typed, `z.output<…>` for what's submitted.
- Use `type`, not `interface` (except `env.d.ts`, where Vite needs declaration merging).

## 8. Styling

- Colours, fonts, text sizes, radii and named sizes come from `theme/theme.css` (`bg-primary`, `text-section`, `rounded-card`, `w-sidebar`). No hex values, no arbitrary values (`w-[123px]`, `text-[15px]`) and no `style` for design values.
- Theme missing something? Add a token to `@theme` or a `@utility` in `theme.css` — don't work around it in a component.
- Tailwind's own spacing scale (`gap-4`, `px-8`, `size-10`) is fine for layout.
- `style` is only for values computed at run time: the print preview's scale, a level meter's height.
- Colours are CSS variables, so a dark theme is one block under `.dark`.
- `Dialog` is the only modal. `Popover` is for menus that hang from a button. `Toast` is a passing message, shown top right by the one `Toaster` (mounted in `SessionGate`, above dialogs). Each status colour has exactly one meaning.
- A list that opens over the page (a `Select`'s options) is placed on the window with `useMenuPlacement`, so a dialog or a table can't clip it. It sits above dialogs (`z-55`) and under the lock (`z-60`).
- Every scroll container (`overflow-y-auto`) is `relative`. Otherwise an absolutely placed child inside it, even an `sr-only` label, stretches the whole window.
- A button that removes or deletes something is red: `IconButton tone="danger"`, or `Button variant="destructive"` to confirm.
- A long form's Save floats at the bottom of the window (`FloatingActions`, with `useInView`'s `observe` as the Save row's `ref`) while there are unsaved changes and that row is out of sight. The moment any of the row shows, the floating one goes: never both at once.
- The design is drawn at 1440 wide. Pages must still work at 1280.

## 9. Copy

- Every user-facing string lives in the feature's `copy.ts` (shared ones in `constants/copy.ts`). JSX contains no literal text, not even a dash.
- Say **clinic**, never "practice" (the API's `practiceId` is the only exception).
- Never assume a gender. Doctors, assistants and patients can be anyone: write "they", "the assistant", "your doctor" — in copy, comments and docs alike.
- The product name is `APP_NAME` ("RxDictate"), written on screen with `Wordmark`: "Rx" in dark teal, "Dictate" in ink. The mark is `BrandMark`, the pulse cross from the logo pack in `RxDictate-logo/`. `index.html` and `public/site.webmanifest` repeat the name; change all three together.

## 10. API and errors

- `lib/api` holds the one `baseApi` and its `baseQuery`, the only HTTP client. It unwraps `{ data, meta }`, returns errors as `ApiError { code, message, details, status }`, adds `Authorization`, `X-Practice-Id` and `X-Location-Id`, and refreshes the token once on 401 — single-flight across every tab of the browser (`navigator.locks`).
- In development Vite proxies `/api` to clinic-api, so the page needs no CORS. A deployed build sets `VITE_API_URL`.
- Validate responses against the contract with `rawResponseSchema`. A mismatch becomes `INVALID_RESPONSE`, not a crash.
- After a change, refresh lists with tags (`providesTags` / `invalidatesTags`), not manual refetches.
- Every action says how it went, in a toast. A mutation that fails says so by itself, with the message from `errorMessages.ts` (the session's own errors excepted). A mutation that works names its message where it's defined: `extraOptions: { success: featureCopy.toast.x }`. A background mutation (marking a report seen, marking notifications read, signing out) passes `extraOptions: { quiet: true }`. Successes from one action arrive together and share one toast. A form still shows its own failure in its `Banner`, so the reason stays beside the fields.
- Don't dispatch a toast for something a mutation already announces. Dispatch `toastShown` yourself only for news that isn't a mutation, such as losing access to a clinic.
- Branch on `error.code` using the `ErrorCode` constants — never on message text.
- Error codes map to user messages in one place: `lib/api/errorMessages.ts`.
- Phones are E.164 on the wire (`utils/phone`); local format is for display only.
- The client only reports what the server said about the session (`signOutRequested`, `membershipLost`); `store/listeners.ts` acts on it.

## 10a. The browser

- **Tokens** live only in `lib/session/tokenStore`: `sessionStorage` (gone when the tab closes), or `localStorage` when "Keep me signed in on this computer" is ticked. This is interim until the server sets an httpOnly refresh cookie. Nothing else sensitive goes in browser storage.
- **Per-computer settings** (print, microphone, lock time, printed marks, last location) stay through sign-out: each computer has its own printer and microphone.
- **Tabs** follow each other through `lib/session/tabSync` (BroadcastChannel): logging out in one logs out all; a new location in one shows in the others.
- **The live connection** (`lib/realtime`) signs in with the access token in its first message, never in the address, and sends each fresh token over the open socket. The token is refreshed shortly before it runs out, so the server never closes the line for an old one. A quiet heartbeat means a dead line: drop it and reconnect. Down for more than a few seconds, the shell shows `LiveNotice` and the Live lines (`LiveStatus`) read "Reconnecting…".
- **Recordings** that haven't uploaded live in memory (`lib/recordings`) and never in storage.
- **Report pages** chosen for upload stay in memory as `File` objects and never go to storage. Thumbnails are object URLs, revoked when the page is removed or the form closes. Closing the form or signing out aborts an upload in progress.
- **Printing** renders the page into a print-only portal and calls `window.print()`. Print rules are in `theme.css`; the page is real A4 in millimetres, and the preview is the same page scaled.
- **The QR** on an approved printout is the server's image (`verifyQrPath` from the contract), 18 mm like the server's PDF. A draft has none. The letterhead sample in Settings shows an empty box where it goes.
- **Saving a PDF** draws that same print-only page into a one-page PDF in the browser (`pageToPdf` in `lib/pdf`) and saves it to the computer with `saveFile` from `lib/files`, never in a new tab. The file is the preview: its margins, its fonts and this computer's print settings. Only an approved prescription is saved. WhatsApp still sends the server's link, because a chat can only carry a link.
- **The lock** hides the app (`inert`) after inactivity without unmounting it, so a recording carries on. The PIN is stored only as a salted SHA-256 hash.

## 10b. Signing out

- There is one way out: `signOut` in `features/auth`. Nothing else clears the session.
- Anything a feature keeps in the browser for the user must go when they sign out:
  - Storage keys are listed in `features/auth/userKeys.ts`.
  - Something live, like a recording in progress, registers a `registerSignOutTask`.
- The device id and this computer's settings survive sign-out.

## 11. Product rules (never break)

- An assistant can't create, approve or dictate prescriptions. Their pages don't offer it, the router keeps them out of the doctor's pages (`RoleGuard`), and the server enforces it too.
- A doctor adds only assistants, and nobody's role changes once added.
- An approved prescription is never edited. Changes create a new version.
- Signed-in requests always carry the active clinic and location.

## 12. Naming and exports

- Components `PascalCase.tsx`, hooks `useThing.ts`, everything else `camelCase.ts`, folders lowercase.
- Boolean variables and state start with `is`, `has` or `can` (`isSending`, `canResend`).
- Boolean component props are plain adjectives instead: `disabled`, `loading`, `selected`, `fullWidth`, `compact`.
- Named exports everywhere. No default exports.

## 13. Done means

- `yarn typecheck` passes, `yarn lint` has no errors, and `yarn format:check` passes.
- No `console.log`, commented-out code, or TODO without a reason. A gap the server has to fill is a `TODO(backend)` that points at `docs/backend-requests/web-client.md`.

## Exempt files

These may break the size, copy and number rules, and only these:

- `src/contract/` — generated from the API; never edited by hand.
- `src/theme/theme.css` — it is where the numbers and colours live.
- `src/app/` — the router and guards read the session (area, role) to decide where someone may go.
