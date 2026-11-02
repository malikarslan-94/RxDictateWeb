# RxDictate — web

RxDictate on the web: the doctor's desk (Today, the prescription
workspace with dictation, Patients, the History log, Reports and labs, Rx
templates, Settings) and the reception computer (the assistant's list, adding
patients, vitals, the schedule, report uploads, the print queue). Built with Vite, React,
TypeScript, Tailwind, Redux Toolkit and React Router.

The mobile app is `../clinic-app`; the API is `../clinic-api`.

## Run it

Start clinic-api first (it listens on port 3000), then:

```sh
yarn install
yarn dev            # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:3000` and drops the browser's
`Origin` header on the way, so clinic-api's origin allow-list needs no entry
for the dev server. A deployed build sets `VITE_API_URL` (including `/api/v1`):

```sh
VITE_API_URL=https://api.example.com/api/v1 yarn build
```

The deployed web app's address must then be in clinic-api's `CORS_ORIGINS`,
or every request is refused with "Origin not allowed".

## Scripts

| Script               | Does                                                  |
| -------------------- | ----------------------------------------------------- |
| `yarn dev`           | Development server                                    |
| `yarn build`         | Typecheck and build to `dist/`                        |
| `yarn preview`       | Serve the built app                                   |
| `yarn typecheck`     | TypeScript only                                       |
| `yarn lint`          | oxlint                                                |
| `yarn format`        | Prettier (sorts Tailwind classes too)                 |
| `yarn sync:contract` | Copy the API contract from `../clinic-api/src/shared` |

## Pages

| Who        | Pages                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Everyone   | Sign in, enter the code, number not linked to a clinic                                                                                                                         |
| New doctor | Set up: about you, your clinic, your assistant                                                                                                                                 |
| Doctor     | Today, Consult (list · prescription · what you said, with vitals, History, Reports and templates), Patients, History log, Reports and labs, Templates, Print preview, Settings |
| Assistant  | Today's list with Add patient and vitals, Patients, Schedule, Print queue, Upload reports, My account                                                                          |
| Both       | Over Patients: a patient's reports and uploading one; the doctor also reads past prescriptions and the timeline, the assistant books appointments                              |

Settings covers profile, locations, team, voice, security and printing. The
template editor opens over Templates at its own address.

## Icons

Everything in `public/` comes from the logo pack in `RxDictate-logo/` (see its
`README.txt`):

| File                    | From                                                 |
| ----------------------- | ---------------------------------------------------- |
| `favicon.svg`           | `svg/favicon.svg`                                    |
| `favicon.ico`           | `favicon/favicon-16`, `-32`, `-48.png` (ImageMagick) |
| `apple-touch-icon.png`  | `app-icon/apple-touch-icon-180.png`                  |
| `icon-192.png`, `-512`  | `app-icon/rxdictate-icon-teal-rounded-192/512.png`   |
| `icon-maskable-512.png` | `svg/rxdictate-icon-teal-square.svg` at 512 px       |
| `og-image.png`          | `lockup/social-share-1200x630.png`                   |

```sh
P=RxDictate-logo
magick $P/favicon/favicon-16.png $P/favicon/favicon-32.png $P/favicon/favicon-48.png public/favicon.ico
rsvg-convert -w 512 -h 512 $P/svg/rxdictate-icon-teal-square.svg -o public/icon-maskable-512.png
```

## Read next

- `docs/STANDARDS.md` — how code is written here.
- `docs/backend-requests/web-client.md` — what the web app needs from the API,
  and what it does until then.

# RxDictateWeb
