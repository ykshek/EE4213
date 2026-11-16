# Development Guide

## Project overview

This repository contains a high-fidelity prototype of a CityU Electrical Engineering student guide. The current team implementation is `portal/`. It is a static, multipage, build-free portal with a shared shell, browser-local demo accounts, and substantial feature implementations:

- Home, Course Information, Major Information, and Course Comparator are publicly browsable.
- Student Profile and Degree Audit Helper are implemented behind the demo login.
- Course Workload Details and course feedback are implemented inside Course Information.
- The Registration Navigator has a full multi-step UI and logic, and its page assets are connected. It is functional.
- Program Browser & Career Information is still a placeholder.
- A dedicated Student Status page does not exist.

The portal is no longer a set of placeholders. Do not describe a feature as unimplemented when the files above exist, and do not describe the Registration Navigator or Program Browser as working until the gaps in this document are resolved.

`original/` contains read-only reference prototypes. The former root-level `base.html` has been removed; do not reference it as an active file. The repository also contains course-method skills in `.github/skills/`, a manual AIMS export helper, and an offline AIMS import/enrichment script in `tools/`.

## Document authority

This `AGENTS.md` is the authoritative development guide for the entire repository, including `portal/`. It covers product scope, current implementation status, portal structure and run instructions, page ownership, shared data, session behavior, HCI/HAI requirements, accessibility, bilingual UI, safe rendering, data limitations, and validation.

`README.md` is the user-facing project overview and retains the course project brief. When the two files disagree about implementation status, this file takes precedence. Update both when a change alters the documented feature set, structure, data model, or access rules.

**After completing any work, update AGENTS.md to reflect the new state.** If your change affects feature status, file paths, access rules, or data model, ensure the documentation matches what you delivered. Do not leave AGENTS.md describing a feature as unimplemented when it is now working, or vice versa.

Treat `original/` as read-only reference material unless a task explicitly asks to change it. Port reference behavior into the matching `portal/` page rather than editing the originals. Do not recreate `base.html` unless the team explicitly decides to restore it.

## Current implementation

| Path | Status | Current contents |
| --- | --- | --- |
| `portal/index.html` | Implemented, public | Home landing page with programme overview, major cards, study areas, four-year journey, practical-learning section, career examples, official-resource links, and guest/member calls to action. Not listed in the sidebar. |
| `portal/registration/index.html` | Implemented | Six-step Registration Navigator: welcome, profile, goals, interests, checklist, summary. It is login-protected and not in the sidebar. The page loads `common.js`, `mock-data.js`, `registration.css`, and `registration.js`, and `goToStep()` is defined. |
| `portal/student-profile/index.html` | Implemented, login-protected | View and edit the demo account name (read-only), major, entry route, year of study, career goal, and specialization. Reads and writes profile data in `sessionStorage`. |
| `portal/course-info/index.html` | Implemented, public | Searchable course directory for 56 baseline EE entries (more after the official AIMS import). Supports search by code or Chinese/English title, preserves the query in the URL, and links to Workload Details. |
| `portal/course-info/workload.html` | Implemented, public subpage | Course detail page: description, credits, optional official assessment block, workload metrics, 13-week busy-week timeline, student experiences, term filter, grade distribution, and a feedback form. |
| `portal/course-info/review-seed.js` | Implemented fixture | Deterministic fictional review generator loaded only by `workload.html`. Produces 24–36 illustrative reviews per course from the course ID; these are not collected student data and are never written to browser storage. |
| `portal/major-info/index.html` | Implemented, public | Bilingual static overview of CDE, ELEL, INFE, and MEE, including study focus, example careers, official programme links, and a 2025/26 major-allocation summary. |
| `portal/comparator/index.html` | Implemented, public | Course workload comparison and sample timetable conflict preview for nine baseline Comparator courses and six sample semester presets (more courses after the official AIMS import). Selection and sorting are in memory. |
| `portal/degree-audit/index.html` | Implemented, login-protected | Degree-audit checklist, semester planner, interactive drag-and-drop flowchart with a menu alternative, timetable conflict simulator, and prerequisite-override preview. State is in memory and resets on reload. |
| `portal/program-career/index.html` | Placeholder, login-protected | "Under Development" placeholder. Career content currently lives on the Home page; `comparisonProgrammes` fixtures exist but are unused. |
| `portal/assets/js/mock-data.js` | Implemented shared fixture | `window.EE4213Data` with courses, majors, Comparator presets, comparison programmes, feedback templates, and an empty student-profile array. The checked-in baseline has 84 courses; the AIMS importer can enrich those records and add an `officialOfferings` key. |
| `portal/assets/js/common.js` | Implemented shared shell | Mounts the header, sidebar, footer, login/register dialog, locked notice, storage notice, and access notice. Owns demo accounts, session state, language switching, and navigation. |
| `portal/assets/css/common.css` | Implemented shared styles | Theme tokens, layout, top bar, sidebar, footer, buttons, cards, forms, dialogs, notices, and responsive behavior. |
| `original/cityu-ee-guide.html` | Read-only reference | Original individual prototype: programme/course information, career information, internship information, and programme comparison. |
| `original/EE4213_code_v6.html` | Read-only reference | Original individual prototype: degree audit, interactive flowchart, and recovery simulator. |
| `original/comparator/` | Read-only reference | Original course workload comparison and sample timetable conflict preview. |
| `tools/aims-course-export-console.js` | Developer helper | Manually run console script for exporting AIMS course pages in an authorized browser session. Not part of the portal runtime. |
| `tools/import_course_exports.py` | Developer helper | Standalone Python 3.10+ importer/enricher. Parses `tools/htmls`, catalogue HTML, and syllabus PDFs; translates English titles/descriptions; generates deterministic sample workload/GPA; and merges results into `mock-data.js`. Not part of the portal runtime. |
| `tools/htmls/` | Local source export (gitignored) | 1,644 AIMS `*-course.html` / `*-classes.html` pairs across 39 subject prefixes, including 57 EE courses. Input to `import_course_exports.py`; not committed. |
| `.github/skills/` | Course guidance | Reusable user-research, problem-framing, interaction-design, HAI, usability-validation, agile-planning, and project-delivery skills. |
| `README.md` | Project overview + brief | Current feature summary, structure, run instructions, data limitations, and the course project brief. |

The portal uses separate shared CSS and JavaScript files; the files in `original/` use inline HTML, CSS, and JavaScript. There is no package manifest, build system, backend, framework, or automated test suite. The portal has a client-side shared shell, uses `localStorage` for browser-local prototype accounts and course feedback, and `sessionStorage` for login state, language preference, profile data, and selected courses. Login compares credentials with accounts registered in the same browser and origin; there is no server-side persistence, database, or real authentication.

## Portal structure and local run instructions

Paths below are relative to the repository root:

```text
portal/
├── index.html                    # Home (public)
├── registration/
│   └── index.html                # Registration Navigator (login-protected)
├── student-profile/
│   └── index.html                # Student Profile (login-protected)
├── course-info/
│   ├── index.html                # Course directory (public)
│   ├── workload.html             # Workload details + feedback (public)
│   ├── course-info.css
│   ├── course-info.js
│   └── review-seed.js
├── major-info/
│   ├── index.html                # Major Information (public)
│   └── major-info.css
├── comparator/
│   ├── index.html                # Course Comparator (public)
│   ├── comparator.css
│   └── comparator.js
├── degree-audit/
│   ├── index.html                # Degree Audit Helper (login-protected)
│   ├── index.css
│   └── index.js
├── program-career/
│   └── index.html                # Placeholder (login-protected)
└── assets/
    ├── css/
    │   ├── common.css
    │   ├── home.css
    │   ├── registration.css      # Unused; page loads portal/registration/registration.css
    │   └── student-profile.css
    └── js/
        ├── common.js
        ├── mock-data.js
        ├── registration.js       # Unused; page loads portal/registration/registration.js
        └── student-profile.js
```

### Tooling

```text
tools/
├── aims-course-export-console.js   # Manual authorized-session AIMS exporter
├── import_course_exports.py        # Offline HTML/PDF enrichment and merge tool
└── htmls/                          # Local AIMS export (gitignored, not committed)
    ├── <CODE>-course.html
    └── <CODE>-classes.html
```

The import tool is not loaded by any portal page. It is run manually from the repository root and writes `portal/assets/js/mock-data.js` only when invoked without `--dry-run`.

### Open a page

No extra software is needed beyond a web browser. Keep the whole `portal/` folder together, then open `portal/index.html` or the feature page you want to test (for example, `portal/course-info/index.html`) in the browser. The sidebar links can open the other pages.

When opened with a `file://` URL, browser storage may not work consistently across pages or browser sessions. The shell shows a notice when storage access fails. Registration cannot save an account if account storage is unavailable. If only session storage is unavailable, login unlocks the current page and the account remains in local storage. Use the local server below to test account persistence, profiles, feedback, and cross-page sessions reliably.

### Run a local static server

If Python is already installed, no packages are needed. From the repository root, run:

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory portal
```

Open `http://127.0.0.1:8765/` and stop the server with `Ctrl+C`. On Windows, use `py` instead of `python` if that is the available command.

## Page and file ownership

- Implement page content in the responsible page's HTML, inside `#pageContent`, and preserve its existing `data-page` and shared mounting structure. Do not remove `hidden` / `inert` from protected pages; `common.js` controls those states.
- The shared shell (header, sidebar, footer, dialogs, notices) is mounted by `common.js`, with shared presentation in `common.css`. Shared navigation, login, language switching, and site-wide styles belong there; coordinate shared-shell changes before editing.
- Add page-specific CSS after `common.css` and load page-specific JavaScript with `defer` after `common.js`. Scope page styles to the page.
- Load shared data with a path relative to the HTML file, before the page script:

  ```html
  <script src="../assets/js/common.js" defer></script>
  <script src="../assets/js/mock-data.js" defer></script>
  <script src="course-info.js" defer></script>
  ```

  Deferred scripts execute in document order, so `common.js` and `mock-data.js` are ready before page code runs.
- Page scripts currently live either in the feature folder (`course-info/`, `comparator/`, `degree-audit/`) or in `portal/assets/js/` (`student-profile.js`, `registration.js`). Follow the feature's existing placement unless there is a reason to consolidate; moving a script requires updating the HTML and testing storage behavior.
- Keep Course Workload Details at `portal/course-info/workload.html`. Do not add it as a sidebar item. Keep Student Status and Course Feedback integrated into Student Profile / Course Information rather than adding sidebar items unless the team explicitly changes the information architecture.
- A new `PAGES` entry or sidebar item in `common.js` affects shared navigation and routing; coordinate it before changing.
- Keep the portal build-free. Do not add dependencies, a backend, or build tooling without a concrete need.

## Feature status checklist

Checked items are implemented and reachable in the current portal. Unchecked items are missing, placeholders, or currently broken. Existing behavior is mock/demo behavior, not connected to live university systems.

- [x] **Home Page** — Public landing page at `portal/index.html`; not in the sidebar. Includes programme, major, study-area, journey, career, and official-link content plus guest/member calls to action.
- [x] **Registration Navigator** — Six-step UI and logic implemented in `portal/registration/`. The page loads `common.js`, `mock-data.js`, `registration.css`, and `registration.js`. `#pageContent` has the `registration-page` class. `goToStep()` is defined and exposed via `window.goToStep` for inline onclick handlers. Login-protected and not in the sidebar.
- [x] **Student Profile** — Implemented at `portal/student-profile/`. Shows and edits major, entry route, year, career goal, and specialization. Profile values are stored in `sessionStorage`. This is not the broader Student Status page.
- [ ] **Student Status Page** — No dedicated status view exists. Student Profile shows profile fields, and Degree Audit Helper shows credit metrics, checklists, and planned terms, but completed/planned courses and outstanding requirements are not combined into one page, and the two features do not share state.
- [x] **Course Workload Details Page** — Implemented as the `workload.html` subpage under `portal/course-info/`. It shows course information, workload metrics, a 13-week busy-week timeline, reviews, and grade distribution. It is public and not a sidebar item.
- [x] **Course Feedback Collector** — Implemented inside `workload.html`. A validated form collects weekly study hours, workload ratings, busiest weeks, optional term, optional grade, and an optional comment. Responses are stored per course in `localStorage` and merged with deterministic fictional seed reviews for demonstration.
- [x] **Major Information** — Implemented at `portal/major-info/` with bilingual content for CDE, ELEL, INFE, and MEE, plus the 2025/26 allocation summary and official links. Public.
- [x] **Course Comparator** — Implemented at `portal/comparator/` with nine baseline sample courses, six sample semesters, timetable conflict detection, and workload comparison/sorting. Public. The checked-in presets and baseline fixtures are illustrative; the AIMS importer can add courses with official section times and catalogue/PDF assessment weights, while study hours, difficulty, and sample GPA remain generated.
- [x] **Degree Audit Helper** — Implemented at `portal/degree-audit/` with a completion checklist, semester planner, credit metrics, interactive flowchart, timetable conflict simulator, and prerequisite-override preview. Login-protected; state is in memory only. It is a prototype counterpart to `original/EE4213_code_v6.html`, not a connection to official records.
- [ ] **Program Browser and Career Information** — Still a placeholder at `portal/program-career/`, login-protected. The Home page contains career and programme overview content, and `comparisonProgrammes` exists in shared data, but the dedicated browser/comparison page is not built.
- [ ] **Internship Opportunities** — Optional in the original product chart and not implemented as a page. The Home page mentions practical learning and careers; `original/cityu-ee-guide.html` includes internship reference content.

## Page map and access

| Page | Path | Access | Sidebar | Current state |
| --- | --- | --- | --- | --- |
| Home | `portal/index.html` | Public | No | Implemented |
| Registration Navigator | `portal/registration/` | Login required | No | Implemented |
| Student Profile | `portal/student-profile/` | Login required | Yes | Implemented |
| Course Information | `portal/course-info/` | Public | Yes | Implemented directory |
| Course Workload Details | `portal/course-info/workload.html` | Public | No (subpage) | Implemented |
| Major Information | `portal/major-info/` | Public | Yes | Implemented |
| Course Comparator | `portal/comparator/` | Public | Yes | Implemented |
| Degree Audit Helper | `portal/degree-audit/` | Login required | Yes | Implemented |
| Program Browser & Career Information | `portal/program-career/` | Login required | Yes | Placeholder |

Page-specific behavior worth preserving:

- **Home** uses `data-guest-only` and `data-member-only` to switch calls to action after login. The degree-audit card is a button that uses `data-nav`; the other feature cards are direct links. The Home page is not in the sidebar and the brand link returns to it.
- **Registration** is a six-step flow. Step navigation, course-list rendering, checklist rendering, and summary rendering depend on `registration.js` and `mock-data.js`. The page's step sections rely on `registration.css` for `.reg-step` visibility. Current HTML does not load either resource.
- **Student Profile** reads `ee4213.registration.profile.v1` from `sessionStorage`; defaults apply when the key is missing. The account name comes from the shared session. Editing is local to the page and saves on **Save** only.
- **Course Information** filters course data by an EE course-ID pattern, excludes Comparator-only sample records except `EE4213`, and builds the directory from shared data. It uses a `q` query parameter to preserve search and passes `course` plus `q` to `workload.html`.
- **Workload Details** resolves the course by the `course` query parameter, shows a not-found state when the ID is absent or unknown, and renders a read-only state for combined course IDs containing `/`. The official assessment block is currently hardcoded for `EE4213` only; imported assessment data lives in `EE4213Data.officialOfferings` and is not yet rendered by this page. Reviews combine seed data with browser submissions; the form validates before writing.
- **Major Information** is static bilingual HTML. It does not consume `EE4213Data.majors`, so its major descriptions can drift from the shared data. Keep official links and the 2025/26 allocation wording accurate.
- **Course Comparator** requires `EE4213Data.courses` and `comparatorSemesterPresets`; it throws a visible error if they are missing. It filters to courses with a `comparator` object, resolves presets by ID, and keeps the selection in memory. The checked-in presets and most baseline fixtures are demo data. After an import, some comparator records carry official AIMS section times and catalogue/PDF assessment weights, but their study-hour, difficulty, and sample-GPA values are still generated; the UI's sample-data wording must not be treated as verification of those generated figures.
- **Degree Audit Helper** builds its curriculum map from `EE4213Data.majors` at load time, then keeps completed courses and planned terms in memory. It supports four majors, three entry routes (120, 96, and 75 credits), and three planning terms. It does not persist state.
- **Program Browser & Career Information** is a placeholder inside the shared shell. Do not add feature copy that implies it is implemented.

## Shared mock data

The shared static data module is `portal/assets/js/mock-data.js`, exposed as `window.EE4213Data`. Keep the portal build-free:

- Use the shared data file for records needed by multiple pages. It works with both `file://` and a static server, without fetch configuration or a backend.
- JSON files loaded with `fetch()` remain an option only if pages are tested through the documented local server; browsers commonly block local-file fetches. A later build/runtime would need a reliable loader.
- Page-local constants are suitable only for data used by one page. Duplicating shared records across pages causes inconsistency. Do not use `sessionStorage` or `localStorage` as the canonical store for reference fixtures; those stores are mutable per-browser state, not shared data.
- Maintain stable IDs: course records have `courseId`; major records have `majorId`; curriculum entries refer to courses by `courseId`; Comparator presets reference course IDs. Handle missing IDs explicitly with a user-visible not-found state instead of silently substituting unrelated data.

Current contents:

| Key | Size / shape | Notes |
| --- | --- | --- |
| `metadata` | Object | Baseline marks the data as mock data and names the original source files. After an import, adds `containsOfficialData` and `officialImport` (term, as-of time, import time, source templates, translation/sample-score notes). |
| `courses` | 84 baseline records | Bilingual titles and descriptions where available, credit units, sample workload/GPA where present, `category`, `hasLab`, and an optional `comparator` object. Some records are curriculum-only. 37 baseline records have no description. Two IDs combine two codes: `EE4015 / EE5410` and `EE4016 / EE5438`. The importer updates records for exported courses and appends new EE codes, so the count grows. |
| `officialOfferings` | Optional object, added by the importer | Keyed by `courseId`; each record has `term`, `asOf`, `sections`, `demand`, `catalogue` (description, offering term, assessment percentages), `assessment` (raw task labels/weights plus derived components), and source URLs. This is the full audit record and is not currently rendered directly by any page. |
| `majors` | 4 records | `CDE`, `INFE`, `ELEL`, and `MEE`, each with a curriculum of 40–41 entries, semester placement, prerequisite/scheduling metadata, and curriculum titles. |
| `comparatorSemesterPresets` | 6 presets | `2A`, `2B`, `3A`, `3B`, `4A`, and `4B`, each an array of course IDs. |
| `comparisonProgrammes` | 5 records | CityU EE, HKU EE, PolyU EE, CUHK EE, and HKUST EE comparison records. Currently unused by pages. |
| `generatedFeedbackTemplates` | 3 comment sets | English-language templates from the original guide's generator. Currently unused by pages. |
| `studentProfiles` | Empty array | Intentionally empty: the source prototypes contain no student profile records. Do not fabricate a profile from simulator defaults. |

The baseline course directory loads 56 of the 84 records after filtering. In the checked-in baseline, nine course records have a `comparator` object with a sample study-hour estimate, assessment-load label, difficulty, grading breakdown, and `scheduledMeetingTimes` built from illustrative whole-hour demo slots. After an import, every imported course also gets a `comparator`: section times and assessment weights come from the official export/catalogue/PDF, while study hours, difficulty, and sample GPA remain generated. Do not duplicate comparator records in page scripts or treat generated workload indices as source facts.

Additional fixture and data rules:

- `portal/course-info/review-seed.js` is a separate deterministic generator, not shared reference data. It creates 24–36 fictional reviews per course for the presentation and usability tests. Load it only on the workload page. These reviews must be described as fictional examples, not collected student feedback.
- The official assessment object for `EE4213` is hardcoded in `portal/course-info/course-info.js`, not in `mock-data.js`. It includes the term, prerequisites, assessment weights, passing requirements, and a CityU syllabus PDF link. If more official course outlines are added, keep the source URL and term with each record.
- Course feedback submitted by a tester is stored in `localStorage` under keys beginning `ee4213.portal.experiences.v1:`. It is browser-local and must not be treated as shared reference data.
- The profile uses `sessionStorage` under `ee4213.registration.profile.v1`; selected registration courses use `ee4213.registration.selectedCourses.v1`. Neither is read by the Degree Audit Helper.
- `comparisonProgrammes` and `generatedFeedbackTemplates` are currently unused. Do not delete them without checking whether a planned page depends on them.
- Use bilingual fields for new user-facing labels, such as `{ "en": "Electrical Engineering", "zh": "電機工程學" }`. Keep page-specific presentation and derived values in page code rather than duplicating source facts.
- Label sample, generated, or simulated content in the UI. Never put real student or sensitive data in fixtures.

Example lookup:

```js
const course = window.EE4213Data.courses.find((item) => item.courseId === courseId);
if (!course) {
    // Show an explicit not-found state for this course.
}
```

### Official AIMS import

`tools/import_course_exports.py` is the supported way to refresh the course/offering dataset from the local AIMS export. It is a developer-only Python 3.10+ script; no portal page loads or runs it. The checked-in `mock-data.js` remains the 84-record baseline until someone runs the importer.

Inputs:

- `tools/htmls/<CODE>-course.html` and `<CODE>-classes.html` — the local, gitignored AIMS export. The current export contains 1,644 course/class pairs across 39 subject prefixes, including 57 EE courses, all labelled `Semester B 2026/27` with an early-November 2026 “as of” timestamp.
- `https://www.cityu.edu.hk/catalogue/ug/current/course/<CODE>.htm` — English title and Course Aims description.
- `https://www.cityu.edu.hk/catalogue/ug/202627/course/<CODE>.pdf` — assessment task labels/weights and the continuous-assessment/examination split.

Common commands, run from the repository root:

```sh
# Inspect a small subset without touching mock-data.js
python tools/import_course_exports.py --scope ee --limit 2 --dry-run

# Normal EE-only import (the default scope)
python tools/import_course_exports.py --scope ee

# Enrich only course codes already present in mock-data.js
python tools/import_course_exports.py --scope existing

# Import every subject in tools/htmls (slow; creates a very large Comparator list)
python tools/import_course_exports.py --scope all
```

Useful switches: `--subjects EE,CS` (overrides `--scope`), `--offline`, `--no-translate`, `--no-jina`, `--refresh-cache`, `--strict`, `--output`, and `--no-backup`. A dry run writes `tools/official-import-preview.json` and leaves `mock-data.js` unchanged.

Merge behaviour:

- Matches existing records by `courseId`. Existing records are enriched; new codes are appended. The script never removes baseline courses.
- Updates English title, Chinese title, description, credit units, `hasLab`, `sampleWorkload`, `sampleMeanGpa`, and `comparator`.
- Adds `officialOfferings` keyed by course code. Each record contains the term/as-of snapshot, complete `sections` (CRN, section, credit, campus, WEB, level, availability, capacity, waitlist, instructor, medium of instruction, meetings, programme/major restrictions), `demand` rows and total, catalogue description, raw assessment tasks/weights, and source URLs.
- Gives every imported course a `comparator` object so the Course Comparator includes it automatically. Section times and assessment weights are official/catalogue/PDF-derived where available; `expectedStudyHoursPerWeek`, `difficulty`, `sampleWorkload`, and `sampleMeanGpa` are deterministically generated sample values.
- Leaves `majors`, `comparatorSemesterPresets`, `comparisonProgrammes`, `generatedFeedbackTemplates`, and `studentProfiles` unchanged. Preset references are checked against the final course-ID set; missing IDs produce warnings rather than aborting the merge.
- Writes atomically and creates `mock-data.js.bak` once before the first non-dry-run write. A second run keeps the existing backup unless it is removed manually.

Data authority and limits:

- Sections, availability, capacity, restrictions, and demand are a term-specific snapshot. They become stale after add/drop or timetable changes; re-run the importer rather than treating them as live data.
- Catalogue descriptions and syllabus assessment data are official sources, but the catalogue’s offering term can differ from the AIMS export term. Keep `term`/`asOf` with imported records.
- Chinese titles and descriptions are machine translations from Google Translate (`zh-TW`). Existing Chinese text is preserved when the English source has not changed; translations are cached under `tools/htmls/.cache/official-import/`.
- Assessment tasks are mapped to comparator components: tests/quizzes → `midterm`, assignments/homework/reports → `assignments`, examination → `final`, project → `project`. Unrecognised tasks use `other`. Raw labels and weights remain in `officialOfferings`.
- The Workload Details page does **not** yet render imported assessment data. It still uses only its hardcoded `EE4213` assessment block. Imported assessment is currently consumed only through the Comparator’s `gradingComponents`/`assessmentLoad`.
- CityU’s catalogue host may block direct requests with an Incapsula challenge. The importer tries direct HTTP first and falls back to the public `r.jina.ai` text reader; disable that with `--no-jina`. PDF text uses `pdftotext` or `pypdf` locally when available, otherwise the Jina fallback (unless `--no-jina` is set).
- The importer is not a live integration, has no scheduler, and is not exercised by CI. Treat its output as a refreshed static fixture, not as verified student-record data.

## Storage, session, and account behavior

The portal implements a client-side, demo-only login and registration state machine.

| Key | Storage | Contents |
| --- | --- | --- |
| `ee4213.portal.demo-accounts.v1` | `localStorage` | Registered demo accounts: `userName`, plaintext prototype `password`, and `hasVisitedNavigator`. |
| `ee4213.portal.session.v1` | `sessionStorage` | `isLoggedIn`, `hasVisitedNavigator`, `userName`, and `language`. Per tab. |
| `ee4213.registration.profile.v1` | `sessionStorage` | Major, entry route, year, career goal, and specialization for Student Profile. |
| `ee4213.registration.selectedCourses.v1` | `sessionStorage` | Course IDs selected in the Registration Navigator. Currently not consumed by another page. |
| `ee4213.portal.experiences.v1:<courseId>:<unique>` | `localStorage` | One submitted course-feedback response per key. |

Common behavior:

- **Login** and **Register** buttons are shown when the user is not logged in. A **Logout** button and a user chip appear when logged in.
- **Not logged in:** Home is the landing page. **Course Information**, **Course Workload Details**, **Major Information**, and **Course Comparator** are browsable. Student Profile, Degree Audit Helper, Program Browser & Career Information, and Registration Navigator are protected. Clicking a locked sidebar item opens a notice; a protected page opened directly shows the same notice instead of its content.
- **Logged in:** all sidebar items become clickable. Registration Navigator remains outside the sidebar but is reachable from the first-login flow and the Home member actions.
- **First login or registration:** the portal navigates to the Registration Navigator. **Subsequent logins:** it navigates to Student Profile. Clicking **Register** always treats the session as first-time and lands on the Registration Navigator.
- **Logout:** returns the user to Home and preserves each account's navigator-visited flag, so the next login goes to Student Profile.

Account validation and persistence:

- Account names are trimmed and compared case-insensitively (1–100 characters). Passwords are matched exactly, case-sensitively (6–128 characters, not all whitespace).
- Duplicate account names, unknown accounts, and incorrect passwords show bilingual inline errors without logging in.
- Accounts persist across tab/browser closure in `localStorage` until site data is cleared. Login and language remain per-tab in `sessionStorage`.
- Accounts previously saved in session storage migrate to local storage without overwriting an existing account with the same normalized username; the legacy copy is removed only after migration succeeds.
- Login/registration refresh account data before checking credentials, and storage events refresh other open tabs.
- Hosts, ports, browser profiles, and devices have separate stores. A failed read/write shows an actionable error instead of reporting success.
- If only session storage fails, login unlocks the current page and a notice asks the user to log in again with the existing account after navigating.
- Logout preserves accounts and their navigator history. It does not clear browser-local feedback or profile data.

The Registration Navigator is now wired and functional. Its remaining gaps (duplicate assets, unconsumed selection data) are described in **Known gaps and risks**.

## Known gaps and risks

1. **Registration Navigator is wired and functional.** `portal/registration/index.html` loads `common.js`, `mock-data.js`, `registration.css`, and `registration.js`. `#pageContent` has the `registration-page` class. `goToStep()` is defined and exposed via `window.goToStep`. The step navigation works as intended.
2. **Duplicate registration assets differ.** `portal/registration/registration.css` and `.js` are not identical to `portal/assets/css/registration.css` and `portal/assets/js/registration.js`. The page loads the local copies (`portal/registration/`). The `portal/assets/` copies are unused by any page. Choose one canonical pair, retire the duplicate, and update the directory structure documentation.
3. **Registration data is not consumed.** Selected courses are saved under `ee4213.registration.selectedCourses.v1`, but Student Profile and Degree Audit Helper do not read them. The registration flow ends by navigating to Student Profile; it does not feed the audit checklist or planner.
4. **Program Browser & Career Information is a placeholder.** `comparisonProgrammes` and `generatedFeedbackTemplates` exist in shared data but are not rendered anywhere. The Home page's career section is not a substitute for the dedicated feature.
5. **No Student Status page.** Student Profile shows profile fields only. Degree Audit Helper shows credit metrics and planning state but does not read profile or completed-course data from registration.
6. **Profile and audit state are separate.** Student Profile uses `sessionStorage`; Degree Audit Helper uses in-memory sets and planned terms. Refreshing the audit page resets its state. Comparator selection is also in memory.
7. **Seed reviews and grade distributions need careful labeling.** Workload metrics, review text, and grade distributions blend deterministic fictional reviews with browser-submitted responses. The UI's "Student experiences" and "Grade distribution" sections are demonstrations, not official statistics. Any change to those sections should keep the fictional/demo distinction clear.
8. **`base.html` is gone, but a stale comment remains.** `portal/assets/js/common.js` says its shell markup was "copied from base.html"; the file no longer exists. The comment is harmless but should not be used as evidence that the legacy file is present.
9. **Imported official data is a mixed static snapshot.** `officialOfferings` is not rendered by any page yet, and imported comparator records combine official section times/assessment weights with generated study hours, difficulty, sample GPA, and workload. Imported data is term-specific and can go stale; do not describe it as live AIMS data or verified student statistics.
10. **The official importer is manual and network-dependent.** It relies on CityU catalogue/PDF access (with an `r.jina.ai` fallback), Google Translate, and optional local PDF tooling. Translation/network failures fall back to English/generated data; there is no scheduled refresh. The importer writes `mock-data.js` directly unless `--dry-run` is used.
11. **No automated checks.** There is no CI workflow, test framework, linter, or package manifest. The importer has a `--dry-run` mode and deterministic sample generation, but no automated test suite. Validation is manual, as described below.

## Development conventions

- Work in `portal/` for the current team implementation. Treat `original/` as read-only reference material unless the task explicitly asks to change it.
- Preserve the prototypes' ability to run as static HTML. Portal pages need the `portal/` folder and its `assets/`; opening an individual page directly in a browser is the simplest way to test it. Use the optional static server to test cross-page sessions and storage.
- Keep the portal build-free. Put page content inside `#pageContent`, keep the shared shell in `common.js`/`common.css`, and load page-specific CSS after `common.css` and page-specific JavaScript with `defer` after `common.js`. Scope page styles to avoid affecting other pages.
- Use `window.EE4213Data` for shared records and handle missing IDs explicitly. Keep page-specific presentation and derived values in the page code.
- Keep course and programme facts accurate and clearly distinguish prototype/sample data from verified official information. Prefer linking to authoritative CityU sources for facts that can change.
- Refresh official offering data through `tools/import_course_exports.py`; do not hand-edit imported section/assessment fields. Run a dry run first, keep `term`/`asOf` with imported records, and preserve the generated-vs-official distinction in UI copy.
- Support keyboard interaction, meaningful labels, visible focus states, readable contrast, and responsive layouts when adding or changing UI.
- When rendering dynamic or user-provided values, avoid inserting untrusted strings as raw HTML; use safe DOM APIs or escape content appropriately.
- Keep navigation and interactions working when editing shared scripts or page markup. Do not silently remove existing prototype flows.
- Keep changes focused on the requested feature and follow the existing HTML, CSS, and JavaScript patterns. Avoid introducing dependencies, a backend, or build tooling without a concrete need.

## HCI/HAI coding requirements

All UI work must follow HCI (Human-Computer Interaction) and HAI (Human-AI Interaction) principles. These requirements guide AI assistants and developers when generating or modifying UI in this project.

### Target users and context

- Primary users are university students from different backgrounds (interns, freshmen, students transferring from associate degree or higher diploma) and HKDSE / JUPAS students who want to understand what a bachelor's degree actually involves.
- Every UI decision should prioritise the cognitive load and needs of these two user groups.
- Use plain, concrete language; avoid jargon that the target users would not recognise.

### Usability

- Provide clear visual hierarchy, consistent component styling, and predictable interactions.
- Avoid unnecessary cognitive load; forms and multi-step flows must have explicit labels, helper text, and visible progress.
- Error messages must be specific and actionable — explain what went wrong and what the user should do next.
- Feedback must be visible and timely for any action that changes state.
- Preserve user control: destructive or irreversible actions must be confirmable, and navigation must allow users to return to a known state.

### Accessibility

- Use semantic HTML, ARIA landmarks, and correct `lang` attributes.
- Support full keyboard operation: visible focus states, logical tab order, and a skip-to-content link.
- Meet WCAG AA contrast; keep touch targets at least 44px; ensure responsive layouts at narrow viewports.
- Dynamic content changes must be perceivable by assistive technologies (for example, live regions or `role="status"` where appropriate).
- The existing sidebar supports arrow-key navigation; new navigation controls should offer an equivalent keyboard path. The Degree Audit flowchart has a menu-based move control as a keyboard alternative to drag and drop; preserve or extend that pattern.

### Human-AI collaboration (HAI)

- Before generating or modifying UI, confirm the requirement, the scope, and any unclear details with the user; do not assume.
- Do not silently remove or rewrite existing prototype flows; preserve the behavior the user already relies on.
- Clearly separate demo / sample data from verified official information so users cannot mistake one for the other. In this repository that includes Comparator estimates, Degree Audit demo data, fictional seed reviews, browser-submitted feedback, imported AIMS snapshots, and machine-translated fields.
- If AI-assisted features are added later, define what the AI decides, what the user decides, and how the user can review, correct, or undo an AI suggestion.
- Label mock, generated, or simulated data explicitly in the UI.

### Bilingual UI (Chinese / English)

- Use the existing `lang-zh` / `lang-en` visibility mechanism and the `body[data-lang]` state.
- Every new user-facing string must provide both Chinese and English versions.
- The initial default language is Chinese; the portal may restore a saved English preference from `sessionStorage`.
- The top-bar language switch calls `setLanguage()`, updates `document.documentElement.lang`, updates the `PAGES` title, and dispatches `portal:languagechange`. Dynamic content must re-render on that event where necessary. Test the switch after any UI change.
- For `option` elements, the existing pattern stores `data-zh` / `data-en` or rebuilds options on the event; follow the pattern used by the page.

### Safe rendering

- Do not insert untrusted or user-provided strings as raw HTML. Use safe DOM APIs such as `textContent`, `createElement`, and `replaceChildren` for user values.
- The Degree Audit page and the course-type note currently use `innerHTML` with internal, static template strings. If you extend those templates, do not interpolate user input or unverified external content.
- Feedback comments are rendered with `textContent`; preserve that behavior.
- Label mock, generated, or simulated data explicitly in the UI.

### AI-assisted workflow

- Before generating code, list the details that will be generated or modified and confirm understanding with the user.
- Ask for clarification when requirements are ambiguous.
- Keep changes focused on the requested feature and follow the existing portal or legacy inline patterns as appropriate.

## Validation

There are no repository-provided automated checks. Do not claim that tests pass unless you have run the relevant manual checks.

For portal changes, open the changed HTML page directly in a browser and exercise its interaction and page links. Use the optional local server when checking a demo login session, profile persistence, feedback storage, or cross-page navigation. Check the browser console for JavaScript errors and verify the layout at a narrow viewport.

Suggested manual checks:

1. **Shell and auth:** Load the Home page, switch language, open and close the login/register dialog with mouse and keyboard, register a made-up account, confirm the first-login redirect, log out, and log in again to confirm the Student Profile redirect. Try an incorrect password and a duplicate username.
2. **Access control:** While logged out, confirm the public feature pages open and the protected pages show the login notice instead of content. Repeat while logged in.
3. **Storage notices:** Open a page with `file://` and confirm the storage notice behaves as documented. Use the local server for reliable cross-page storage.
4. **Home:** Follow the public feature cards, the protected Degree Audit card, the programme anchor, member actions after login, and the official external links.
5. **Course Information:** Search by code, English title, and Chinese title; clear the search; reload a URL with `?q=`; open a course; verify the back link keeps the query. Check the not-found state with a bogus `course` parameter.
6. **Workload Details and feedback:** Submit an empty form and confirm field-level errors; submit a valid form; reload and confirm the response persists; submit enough grades to check the distribution; filter reviews by term; test the combined-ID read-only state. Label seeded reviews as fictional when describing test results.
7. **Major Information:** Check all four major cards, the allocation summary, language switching, and official links.
8. **Course Comparator:** Add valid and invalid codes, load each preset, clear the selection, create a deliberate overlap, sort every metric, and check the demo-data note.
9. **Degree Audit Helper:** Switch majors and entry routes, reset the checklist, plan courses in each term, drag a course and use the menu alternative, switch all three tabs, and check the waiver preview. Reload to confirm the state resets.
10. **Student Profile:** Edit and save every field, cancel an edit, reload, and confirm the values persist in the same tab. Confirm the account name is read-only.
11. **Registration Navigator:** Until the wiring gap is fixed, expect the steps to render together and the buttons to fail. After fixing it, verify step navigation, course selection, goal/specialization selection, checklist, summary, and the Finish route to Student Profile.
12. **Program Browser & Career Information:** Confirm it still shows the placeholder rather than broken or partial feature content.
13. **Official AIMS import (developer):** Run `python tools/import_course_exports.py --scope ee --limit 2 --dry-run` and inspect `tools/official-import-preview.json`. Then run `--scope ee`, confirm `officialOfferings` exists, new EE courses appear in the Course Information directory, imported courses appear in the Course Comparator, generated scores are still labelled as sample data, `mock-data.js.bak` was created once, and the page loads without console errors. Test one course whose catalogue/PDF fetch fails and confirm the fallback does not corrupt existing records.

For the legacy `original/` files, open them directly and exercise their in-page tabs and modals without modifying them. The importer has a dry-run mode but no automated test suite; run its manual checks in addition to the checks above.

## Skills and helper tools

- `.github/skills/` contains reusable skills for user research, problem framing, interaction design, HAI decisions, usability validation, agile planning, and EE4213 project delivery. Use them when the task matches their scope; they do not override this guide.
- `tools/aims-course-export-console.js` is a manual browser-console helper for exporting AIMS course pages in an authorized session. It is not loaded by the portal, makes network requests only when run manually, and must not be wired into a page or executed automatically.
- `tools/import_course_exports.py` is a manual Python 3.10+ importer/enricher. It reads the gitignored `tools/htmls` export, fetches catalogue/PDF data, translates missing Chinese text, generates deterministic sample scores, and merges the result into `mock-data.js`/`officialOfferings`. It is not loaded by the portal and must not be wired into a page. Run it only through its documented CLI; use `--dry-run` to inspect changes first.
