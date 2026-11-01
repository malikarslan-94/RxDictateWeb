# Clinic Web — rules for AI

@docs/STANDARDS.md

## How to work here

- Follow `docs/STANDARDS.md` for every file you create or touch. If a rule doesn't fit the case, ask before breaking it — never deviate silently.
- Before creating a component, hook, util, constant or type, search for an existing one and extend it.
- Theme is missing a value → add the token or utility to `src/theme/theme.css`, not a local override.
- Ask before adding a dependency.
- When you edit a file that breaks a standard, fix the part you touch. Don't refactor unrelated files without asking.
- When we agree on a new rule, add it to `docs/STANDARDS.md` in the same change.

## Product

- Prescription app for doctors in Pakistan; this is the web app for the doctor's desk and the reception computer. Roles here: doctor and assistant (`pa`). Doctors dictate in Urdu and English.
- The mobile app is `../clinic-app`. The two share the API contract and the product rules, not code. The web app need not copy every mobile screen.
- Backend: `../clinic-api`, base path `/api/v1`, responses `{ data, meta }` / `{ error: { code, message, details } }`.
- The API contract (zod schemas, error codes, roles) lives in `clinic-api/src/shared` and is copied into `src/contract` by `yarn sync:contract`. Never edit `src/contract`; if the app needs a contract change, say so and add it to `docs/backend-requests/web-client.md`.
