# Study Journey

A personal, static study workspace for AI Internals, Fusion 360 Mechanisms, and Linux Reverse Engineering & Security. Three paths, six weeks per path, and 126 half-hour exercises, copied from `study_tracker_codex_spec.md` in their exact order.

## Run locally

Use Node.js 22 or newer and npm.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Open the URL printed by Vite. `npm run build` checks TypeScript and produces `dist/`. `npm test` checks exact syllabus integrity, backup validation and round-tripping, storage recovery, and progress updates.

## GitHub Pages

1. Create a GitHub repository and put **the contents of this folder at its root** (including `.github/workflows/deploy.yml`). Keep `package-lock.json` committed. Do not commit `node_modules` or `dist`.
2. In the repository, open **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**.
3. Push to `main`, or manually run the **Deploy Study Journey to GitHub Pages** workflow. Tests and the production build must succeed before deployment.
4. The deployment job displays the deployed URL. Project repositories use `https://<owner>.github.io/<repo-name>/`; a repository named `<owner>.github.io` uses `/`.

The workflow automatically configures the Vite base path for either repository type. For a custom domain or other prefix, set the repository Actions variable `VITE_BASE_PATH` to `/` or your desired path with both leading and trailing slashes. For a manual subpath build in PowerShell:

```powershell
$env:VITE_BASE_PATH = '/StudyJourney/'
npm run build
npm run preview
Remove-Item Env:VITE_BASE_PATH
```

The app uses hash routes such as `/#/course/ai` and `/#/exercise/ai-w1-d1`. Under a project subpath these become `/StudyJourney/#/course/ai`, so navigation and refresh do not require server redirects or a special 404 page. GitHub deployment requires your repository and Pages configuration; creating the local project alone does not publish it.

## Data and backups

- Progress is saved automatically under the versioned `localStorage` key `study-tracker:v1`. It is specific to the current browser, device, and origin. Different URL paths on the same origin share it. Preview, localhost, and GitHub Pages origins have separate data.
- Browser data can be cleared, private browsing can discard it, and storage writes can fail. This app has no account, backend, cloud sync, database, or API keys. If saving fails, a banner asks you to export before closing the tab.
- Use **Settings & backup → Export JSON backup** regularly. The export includes completion dates, notes, personal checklist items, hints, solutions, reference links, and theme.
- To transfer devices, open the app on the other device and import the exported JSON. Import validates schema version, exercise IDs, field types, timestamps, and HTTP(S) URLs, then requires confirmation before replacing your current data. It does not merge backups. Export your current data before replacement.
- Unsupported schema versions, unknown exercise IDs, malformed JSON, and invalid fields are rejected without changing existing progress. Invalid browser storage is preserved; autosave stays paused until you import a valid backup or explicitly start fresh. Download the original raw storage from Settings before recovery.
- Course resets clear completion and completion dates only, preserving notes and personal fields. The full workspace reset deletes all study data after confirmation, preserving your appearance preference.
- Completion timestamps are stored as ISO timestamps and displayed/edited in the device's local timezone. Dates are optional. Reopening clears the timestamp; marking complete again records the new time. Estimated remaining time is incomplete sessions × 30 minutes, **not actual time tracked**.
- Hints and solutions are blank, personal, editable fields, collapsed by default. The app provides no generated or verified solutions. Notes and checklist completion never automatically complete a session.

## Related YouTube videos

Every exercise has two direct YouTube video links below its objective, with creator credit, a description, and guidance on what to focus on for that specific lesson. The 126 lesson mappings reuse 70 teaching videos where topics overlap. Longer lectures are optional reference material, not an addition to the estimated 30-minute exercise time. Some resources teach supporting concepts instead of the exact project; language, framework, and license differences are labeled where relevant.

Videos open in a new tab. The app does not embed players, autoplay content, fetch YouTube APIs, or track viewing. Your personal reference links and progress remain separate from the built-in catalog, so existing backups work unchanged. No API key or backend is required.

The selection was researched using creator pages and video descriptions. YouTube title/channel metadata was checked on October 25, 2026; this does not guarantee playback in every region or future availability, and the videos have not all been watched end-to-end. See `docs/video-link-check.json` for the metadata check results.

To maintain the collection, edit `src/videoCatalog.ts` and `src/lessonVideos.ts`. Keep each course’s mapping in global day order (1–42), then run `npm test`. An optional network check refreshes the metadata report:

```sh
node --import tsx scripts/check-videos.ts
```

Primary discovery sources include [Karpathy’s course](https://karpathy.ai/zero-to-hero.html), [pwn.college’s assembly course](https://pwn.college/cse365-2024-summer/assembly-crash-course/), [Undo’s ThreadSanitizer tutorial](https://undo.io/resources/gdb-watchpoint/using-threadsanitizer-to-debug-data-races/), and the creators’ YouTube pages linked by each catalog entry.

## Project structure

- `src/syllabus.json`: authoritative seed data, separate from progress.
- `scripts/seed.mjs`: regenerates seed data directly from the supplied Markdown. Run `node scripts/seed.mjs` after deliberate syllabus edits; changing existing IDs affects backups.
- `src/data.ts`: types and syllabus helpers.
- `src/storage.ts`: schema validation, storage loading, completion logic.
- `src/main.tsx`: dashboard, course, exercise, settings, and confirmation views.
- `src/style.css`: responsive layouts, light/dark themes, and keyboard focus styles.
- `src/videoCatalog.ts` and `src/lessonVideos.ts`: teaching videos and explicit per-lesson assignments.
- `src/RelatedVideos.tsx` and `src/videos.css`: accessible video-list presentation.
- `tests/data.test.ts`: automated data and persistence coverage.

The interface uses Lucide icons and optional Google Fonts (DM Sans and Manrope); it falls back to system fonts when fonts are unavailable. No study data is sent to a server. The app works after its static assets load; offline installation/service workers are outside v1 scope.

## Browser tests

With Google Chrome installed, build and run `npm run test:e2e`. Playwright starts and stops its own preview server on port 4173. These tests exercise real browser persistence, checklist and note edits, collapsed optional fields, completion/reopening, exact backup restoration, invalid import rejection, corrupt storage recovery, keyboard navigation, dark mode, and 390px mobile layouts.

To verify project-repository hosting specifically, use the same environment variable for both commands:

```powershell
$env:VITE_BASE_PATH = '/StudyJourney/'
npm run build
npm run test:e2e
Remove-Item Env:VITE_BASE_PATH
```

The browser tests use an isolated browser profile; they never read or change your personal browser's saved progress. The GitHub Pages workflow runs the data tests and build; the optional browser suite uses locally installed Chrome.

## Manual verification

On desktop and phone widths: complete and reopen exercises, filter/search course sessions, add/edit checklist steps and notes, navigate away and reload, and verify persistence. Export a backup, reset, then import it and verify every field. Try malformed JSON and unsupported versions and confirm existing data remains. Check light/dark/system themes, keyboard-only navigation, confirmation cancellation with Escape, collapsed hints/solutions, and refresh under a repository subpath.
