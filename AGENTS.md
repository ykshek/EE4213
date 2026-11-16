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
| `portal/registration/index.html` | Implemented | Six-step Registration Navigator: welcome, profile, goals, interests, checklist, summary. Profile fields are restored from and saved to `sessionStorage` for Student Profile. It is login-protected and not in the sidebar. |
| `portal/student-profile/index.html` | Implemented, login-protected | View and edit the demo account name (read-only), major, entry route, year of study, career goal, and specialization. Reads and writes profile data in `sessionStorage`. |
| `portal/course-info/index.html` | Implemented, public | Searchable course directory for 61 current EE entries (more after further AIMS imports). Supports search by code or Chinese/English title, preserves the query in the URL, links to Workload Details, and offers an Add to Course Comparator action per course. |
| `portal/course-info/workload.html` | Implemented, public subpage | Course detail page: description, credits, optional official assessment block, grading-components pie chart, workload metrics, 13-week busy-week timeline, student experiences, term filter, grade distribution, and a feedback form. |
| `portal/course-info/review-seed.js` | Implemented fixture | Deterministic fictional review generator loaded only by `workload.html`. Produces 24–36 illustrative reviews per course from the course ID; these are not collected student data and are never written to browser storage. |
| `portal/major-info/index.html` | Implemented, public | Bilingual static overview of CDE, ELEL, INFE, and MEE, including study focus, example careers, official programme links, and a 2025/26 major-allocation summary. |
| `portal/comparator/index.html` | Implemented, public | Combined course workload and timetable planner. The available-course list follows the Student Profile-based year/major pool and excludes completed/failed courses and unmet prerequisites; courses imported from a selected Degree Audit curriculum semester remain selectable even outside the current-year pool. Without a Student Profile, the available list falls back to the common first-year pool; no demo presets are offered. A Degree Audit handoff can also include a retake course and section, which the Comparator exposes as L01/L02 retake sections and highlights as retake clashes. Students can select among imported alternative sections before conflict checking. A searchable course picker uses a single continuous list sorted by course code, so checking or unchecking does not reorder it; code entry is available as a secondary disclosure; code entry accepts any known course as an explicit override. Unchecked courses return to the available-course list until reload, and a minus action removes them from the current list. The course list grows with the page instead of using an inner scrollbar. Course Information list rows and detail pages can hand a course to the Comparator through an `add` query parameter. A sticky summary reports selected, planned, and conflict counts. The results area splits **Timetable & conflict check** and **Workload comparison** into keyboard-accessible tabs, so the comparison table is not pushed below the tall timetable; the timetable tab shows the live conflict count. The Grading components row uses themed pie charts with accessible legends. The timetable uses a taller hourly scale and a compact short-event layout so 50-minute and one-hour classes remain readable; only events in the same overlap cluster share the column width, so non-conflicting courses on the same day stay full width. Selection, section choices, and sorting are saved in same-tab `sessionStorage`; clearing can be undone. A data-source row and legend distinguish AIMS snapshots from sample estimates. |
| `portal/degree-audit/index.html` | Implemented, login-protected | Degree-audit planning with profile-following major/entry route/year, a left control column, a right-side two-tab results area, full-curriculum flowchart that also serves as the term plan, and a prerequisite-override assistant with a computed downstream chain and gated sample waiver preview; timetable conflict checking is delegated to Course Comparator. Semesters are compact accordion panels. Users drag course rows onto another semester summary; each row shows icon-only Completed, Failed, and reset actions, while rows with a slot selector or prerequisite warning use a small ⋯ options popover. Each semester also has a Mark all action that marks its courses completed while skipping and reporting courses blocked by failed prerequisites. Row credit totals, per-card prerequisite warnings, rescheduled markers, and planned-credit metrics update with placement. Projected pre-registration is shown by a blue top edge and P marker on eligible major-flowchart courses; failed-prerequisite courses require manual registration and are not marked. GE/elective substitutions and course status controls remain available. Any semester's concrete courses can be transferred to the Comparator in the same tab with their Degree Audit status; all appear in the comparison, while only planned courses enter the timetable and conflict check. A separate action hands off moved courses plus the selected retake course for conflict checking. Audit status is shared in browser-local storage; placements remain in memory. |
| `portal/program-career/index.html` | Placeholder, login-protected | "Under Development" placeholder. Career content currently lives on the Home page; `comparisonProgrammes` fixtures exist but are unused. |
| `portal/assets/js/mock-data.js` | Implemented shared fixture | `window.EE4213Data` with courses, majors, comparison programmes, feedback templates, and an empty student-profile array. Each major's ordered `curriculum` contains course IDs; each course record stores its major-specific curriculum details in `curriculumByMajor`. Major-flowchart course records also carry projected pre-registration status and applicable major IDs. The AIMS importer refreshes these tags, enriches course records, and adds an `officialOfferings` key. |
| `portal/assets/js/course-pool.js` | Implemented shared logic | Resolves Student Profile major, entry route, and year into a year-specific course pool; excludes completed/failed courses and courses with unmet prerequisites for Comparator additions and the Degree Audit flowchart. |
| `portal/assets/js/timetable.js` | Implemented shared logic | Normalizes weekday labels and detects overlapping meeting intervals for the Course Comparator. |
| `portal/assets/js/grading-chart.js` | Implemented shared UI helper | Builds the themed, accessible grading-component pie chart used by Course Comparator and Course Workload Details. Uses safe DOM APIs and shared category colours. |
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
        ├── course-pool.js         # Shared profile-based available course pool
        ├── timetable.js           # Shared weekday normalization and overlap detection
        ├── grading-chart.js       # Shared grading-component pie chart
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
- [ ] **Student Status Page** — No dedicated status view exists. Student Profile shows profile fields, and Degree Audit Helper shows credit metrics and manual course placements, but completed/planned courses and outstanding requirements are not combined into one page. Degree Audit and Comparator share completion status and a one-way plan/retake handoff, not a persistent unified plan.
- [x] **Course Workload Details Page** — Implemented as the `workload.html` subpage under `portal/course-info/`. It shows course information, a grading-components pie chart, workload metrics, a 13-week busy-week timeline, reviews, and grade distribution. It is public and not a sidebar item.
- [x] **Course Feedback Collector** — Implemented inside `workload.html`. A validated form collects weekly study hours, workload ratings, busiest weeks, optional term, optional grade, and an optional comment. Responses are stored per course in `localStorage` and merged with deterministic fictional seed reviews for demonstration.
- [x] **Major Information** — Implemented at `portal/major-info/` with bilingual content for CDE, ELEL, INFE, and MEE, plus the 2025/26 allocation summary and official links. Public.
- [x] **Course Comparator** — Implemented at `portal/comparator/` with a Student Profile-based available-course pool, timetable conflict detection, alternative section choices, and workload comparison/sorting. Courses from a selected Degree Audit curriculum semester, or the moved plan plus selected retake course, can be imported in the same tab and compared even when outside the current-year pool. Retake courses use synthetic L01/L02 sections and retake clashes are labeled. A searchable picker uses one course-code-sorted list and supports code/title search; manual code entry remains a secondary disclosure and accepts any known course as an explicit override. Unchecked courses return to the available-course list until the page is reloaded or left, and each selected/unchecked entry has a minus remove action. Course Information list rows and detail pages can add a course to the Comparator. A sticky summary reports selected, planned, and conflict counts. The results area uses accessible **Timetable & conflict check** and **Workload comparison** tabs; selecting a conflict highlights the corresponding timetable events and section choices, and the timetable tab carries a conflict-count badge. Grading components are shown as themed pie charts in the comparison table and on course detail pages. Short timetable events use a compact time line and whole-event link so 50-minute/one-hour classes are not clipped. Lane widths are computed per overlap cluster, so a conflict does not compress unrelated courses later or earlier on the same day. Selection, section choices, and sorting persist in same-tab `sessionStorage`, and clearing can be undone. A data-source row and legend distinguish AIMS snapshots from generated sample values. The checked-in baseline fixtures are illustrative; the AIMS importer can add courses with official section times and catalogue/PDF assessment weights, while study hours, difficulty, and sample GPA remain generated.
- [x] **Degree Audit Helper** — Implemented at `portal/degree-audit/` with a profile-following major, entry route and year; a left control column with Degree Audit and Prerequisite Override tabs in the right results area; per-card Completed/Failed status controls, credit metrics, full-curriculum flowchart that doubles as the term plan, and a prerequisite-override assistant with a computed downstream chain and gated sample waiver preview; timetable conflict checks are delegated to Course Comparator. Eligible major-flowchart courses show a blue top edge and P marker for projected pre-registration; GE requirements and elective placeholders do not, and courses blocked by failed prerequisites are unmarked for manual registration. Semesters are collapsible and contain compact course rows. Rows can be dragged to another semester summary; each row shows icon-only Completed, Failed, and reset actions, with a ⋯ options popover for slot selection and prerequisite details. Each semester also offers a Mark all action that completes eligible courses and reports any skipped blocked courses. Course status, per-card prerequisite warnings, rescheduled markers, and term credit totals update with placement. A failed prerequisite highlights only the affected course cards, including downstream dependents, and names the prerequisite chain. The prerequisite-override assistant computes the downstream chain, requires a failed course with blocked dependents plus GPA and no-clash confirmations, disables the preview until eligible, and shows a sample waiver dialog with the chain and checks. Any semester's concrete courses, with planned/completed/failed/blocked status, or the current moved plan plus selected retake course, can be transferred to the Comparator; all imported courses appear in the comparison, while the shared timetable conflict detector schedules planned courses only. Completed/failed audit status is shared with Comparator; course placements remain in memory. Login-protected; it is a prototype counterpart to `original/EE4213_code_v6.html`, not a connection to official records.
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
- **Student Profile** reads `ee4213.registration.profile.v1` from `sessionStorage`; defaults apply when the key is missing. The account name comes from the shared session. Editing is local to the page and saves on **Save** only. The shared course pool reads the saved major, entry route, and year.
- **Course Information** filters course data by an EE course-ID pattern, excludes Comparator-only sample records except `EE4213`, and builds the directory from shared data. It uses a `q` query parameter to preserve search and passes `course` plus `q` to `workload.html`. Each directory row includes an Add to Course Comparator link.
- **Workload Details** resolves the course by the `course` query parameter across shared course records, shows a not-found state when the ID is absent or unknown, and renders a read-only state for combined course IDs containing `/`. The course directory remains limited to EE course IDs, but Comparator and Degree Audit links can open details for any matching shared curriculum course. A grading-components pie chart appears when course-level `gradingComponents` or `comparator.gradingComponents` data exists; courses without either hide the section. The official assessment block is currently hardcoded for `EE4213` only; imported assessment data lives in `EE4213Data.officialOfferings` and is not yet rendered by this page. Reviews combine seed data with browser submissions; the form validates before writing.
- **Major Information** is static bilingual HTML. It does not consume `EE4213Data.majors`, so its major descriptions can drift from the shared data. Keep official links and the 2025/26 allocation wording accurate.
- **Course Comparator** requires `EE4213Data.courses`, `course-pool.js`, `timetable.js`, and `grading-chart.js`; it throws a visible error if these dependencies are missing. Its Available Courses list follows the shared course pool for Student Profile's major, entry route, and year. Completed/failed courses and courses with unmet prerequisites are excluded from the available list; manual code entry accepts any known course as an explicit override, including out-of-pool courses. A failed retake course can still arrive through the Degree Audit handoff. A same-tab plan imported from Degree Audit is kept selectable outside that pool and is labeled. Imported plans may carry Degree Audit status metadata; all imported concrete courses appear in the comparison with status chips, while only planned courses are included in section choices, the timetable, and conflict detection. Completed, failed, and prerequisite-blocked courses may still be selected for workload comparison. When imported meeting data has multiple sections of a type, the first is selected initially and users can choose an alternative; duplicate room records for the same section meeting are shown as one event with their locations combined. An imported Degree Audit handoff may include a retake course and section; the Comparator substitutes synthetic L01/L02 retake meetings, shows a retake section choice, and labels retake clashes. A searchable picker uses a single course-code-sorted list and filters courses by code or bilingual title; checking or unchecking keeps each row in place; code entry is available under a secondary disclosure and accepts any known course as an explicit override, including courses outside the profile pool. Unchecked courses return to the available-course list until reload/navigation, with a minus action to remove an entry from the current list. The list grows with the page rather than using a nested scrollbar. The code-entry summary and Add courses button use a plus cue. Course Information list rows and detail pages hand a course to the Comparator through an `add` query parameter. A sticky summary reports selected, planned, and conflict counts. The results area is split into **Timetable & conflict check** and **Workload comparison** tabs; the timetable tab includes a conflict-count badge. Conflict entries are buttons that highlight the relevant timetable blocks and section selectors, with a next-conflict control. The timetable uses a taller hourly scale and compact short-event layout for 50-minute/one-hour classes; each event is a full link to its course detail. Only events in the same overlap cluster share a narrower lane; non-overlapping courses on the same day keep the full column width. The Grading components row renders themed pie charts with legends; the pie prefers course-level `gradingComponents`, falls back to `comparator.gradingComponents`, and normalizes shares when the recorded total is not 100%. Course selection, section choices, and sorting are saved in same-tab `sessionStorage`; clearing can be undone. A Data source row and legend distinguish AIMS/catalogue snapshots from generated sample values, with generated metrics labelled as estimates. The checked-in baseline fixtures are demo data. After an import, some comparator records carry official AIMS section times and catalogue/PDF assessment weights, but their study-hour, difficulty, and sample-GPA values are still generated; the UI's sample-data wording must not be treated as verification of those generated figures.
- **Degree Audit Helper** keeps its major, entry-route, year, retake, and Comparator actions in a left control column. The right results area uses accessible **Degree Audit & Interactive Flowchart** and **Prerequisite Override Assistant** tabs with `role="tab"`, `role="tabpanel"`, arrow-key/Home/End navigation, and a hidden inactive panel. The page now uses the shared portal page header, white card surfaces, border tokens, typography, and status-chip styling rather than a separate maroon banner. It builds its curriculum map from `EE4213Data.majors` and reads major, entry route, and year from Student Profile. The controls are read-only; edit the profile to change them. Associate Degree and Higher Diploma map to 96 CU, Direct Entry to 120 CU, and Department Transfer to 75 CU. The flowchart shows every course in the selected curriculum, grouped by its current semester placement (the curriculum's recommended semester by default); completed and prerequisite-blocked courses remain visible and are labeled. Core courses listed in the 2026/27 major flowcharts carry a blue top edge and P marker for projected pre-registration; GE requirements and elective placeholders do not. Markers are hidden for courses blocked by failed prerequisites, which require manual registration. The projection is not a confirmed registration. A failed prerequisite highlights only the affected course cards, including downstream courses in the failed prerequisite chain, with the chain shown on each card; the semester row itself is not marked. Semesters are compact accordion panels with credits, course count, and warning count in the summary; every semester opens initially and remains collapsible. Compact course rows are arranged horizontally in a responsive grid, then dragged onto another semester summary to move a course. Each row has icon-only Completed, Failed, and reset actions; the reset becomes active once the course is moved and restores the recommended semester. Courses with a slot selector or prerequisite warning also show a ⋯ options popover for slot selection and prerequisite details; ordinary courses have no details disclosure. Each semester summary also has a Mark all action that completes eligible courses and reports any skipped blocked courses. Semester CU totals, per-course warnings, rescheduled markers, and the planned-credit metric update after moves. GE and technical-elective placeholders can be assigned specific compatible course records; the selected course is shown in place of its placeholder while retaining the requirement identity. Course rows expose icon-only Completed/Failed controls. Placements and credit totals are in memory; placeholder course selections are saved per major in same-tab `sessionStorage`. Each semester can transfer all of its concrete course IDs and their completed/failed/blocked status to the Comparator in the same tab; all are compared, while only planned courses are scheduled. The top-level conflict action hands off moved courses plus the selected retake course. The waiver assistant's no-clash item is a manual confirmation after checking in the Comparator; it resets when placements or course statuses change. Its prerequisite-chain visualizer computes downstream dependents from the curriculum graph rather than static chain fields, requires a failed course before the no-clash confirmation is enabled, and gates the sample waiver preview on a failed course with blocked dependents plus GPA and no-clash confirmations. The preview dialog lists the failed course, blocked courses, chain, and checks, and is explicitly labelled as a sample. Course status is shared with Comparator through `cityuEE4213DegreeAuditStatusV2` in `localStorage`.
- **Program Browser & Career Information** is a placeholder inside the shared shell. Do not add feature copy that implies it is implemented.

## Shared mock data

The shared static data module is `portal/assets/js/mock-data.js`, exposed as `window.EE4213Data`. Keep the portal build-free:

- Use the shared data file for records needed by multiple pages. It works with both `file://` and a static server, without fetch configuration or a backend.
- JSON files loaded with `fetch()` remain an option only if pages are tested through the documented local server; browsers commonly block local-file fetches. A later build/runtime would need a reliable loader.
- Page-local constants are suitable only for data used by one page. Duplicating shared records across pages causes inconsistency. Do not use `sessionStorage` or `localStorage` as the canonical store for reference fixtures; those stores are mutable per-browser state, not shared data.
- Maintain stable IDs: course records have `courseId`; major records have `majorId`; each major's ordered `curriculum` is an array of course IDs; per-major placement and curriculum annotations live on the course under `curriculumByMajor[majorId]`; handle missing IDs explicitly with a user-visible not-found state instead of silently substituting unrelated data.

Current contents:

| Key | Size / shape | Notes |
| --- | --- | --- |
| `metadata` | Object | Baseline marks the data as mock data and names the original source files. `preRegistrationProjection` records the 2026/27 major-flowchart sources and notes that status is projected, not live registration. After an AIMS import, adds `containsOfficialData` and `officialImport` (term, as-of time, import time, source templates, translation/sample-score notes). |
| `courses` | 167 current records (68 EE) | Bilingual titles and descriptions where available, course-level credit units, per-major curriculum details under `curriculumByMajor` (title, semester, prerequisite and scheduling annotations, GE/elective flags), sample workload/GPA where present, `category`, `hasLab`, an optional course-level `gradingComponents` object (catalogue fallback when no comparator exists), an optional `comparator` object, and optional `preRegistration` metadata (`status: "projected"` plus applicable `majorIds`). This metadata is set for non-GE, non-elective courses in major flowcharts; omitted for GE requirements and elective placeholders. Some records are curriculum-only. 8 EE records still have no description; see `MOCK_DATA_AUDIT.md`. Two IDs combine two codes: `EE4015 / EE5410` and `EE4016 / EE5438`. The importer updates records for exported courses and appends new EE codes, so the count grows. |
| `officialOfferings` | Optional object, added by the importer | Contains `term`, `asOf`, `source`, and `courses`; `courses` is keyed by `courseId` (82 records in the current import). Each course record has `sections`, `demand`, `catalogue` (description, offering term, assessment percentages), `assessment` (raw task labels/weights plus derived components), and source URLs. This is the full audit record and is not currently rendered directly by any page. |
| `majors` | 4 records | `CDE`, `INFE`, `ELEL`, and `MEE`, each with an ordered curriculum of 40–41 course IDs. Semester placement, curriculum titles, prerequisites, and scheduling annotations are stored on the referenced course records under `curriculumByMajor[majorId]`. |
| `comparisonProgrammes` | 5 records | CityU EE, HKU EE, PolyU EE, CUHK EE, and HKUST EE comparison records. Currently unused by pages. |
| `generatedFeedbackTemplates` | 3 comment sets | English-language templates from the original guide's generator. Currently unused by pages. |
| `studentProfiles` | Empty array | Intentionally empty: the source prototypes contain no student profile records. Do not fabricate a profile from simulator defaults. |

The current course directory loads 61 EE entries. The checked-in data has 43 EE records with a `comparator` object, 23 of the 25 records without a comparator have a course-level catalogue grading fallback, and 2 split project records have no grading chart. Imported records receive section times and assessment weights from the official export/catalogue/PDF, while study hours, difficulty, and sample GPA remain generated. Do not duplicate comparator records in page scripts or treat generated workload indices as source facts. `MOCK_DATA_AUDIT.md` records the source-backed alignment and the remaining gaps.

Additional fixture and data rules:

- `MOCK_DATA_AUDIT.md` is the current source-backed completeness audit. It records corrected catalogue facts and lists records that still lack comparator data, grading components, descriptions, credits, Chinese titles, sample metrics, or meetings. Do not fill those gaps with invented official facts.

- `portal/course-info/review-seed.js` is a separate deterministic generator, not shared reference data. It creates 24–36 fictional reviews per course for the presentation and usability tests. Load it only on the workload page. These reviews must be described as fictional examples, not collected student feedback.
- The official assessment object for `EE4213` is hardcoded in `portal/course-info/course-info.js`, not in `mock-data.js`. It includes the term, prerequisites, assessment weights, passing requirements, and a CityU syllabus PDF link. Its comparator grading components are aligned to the syllabus weights (project 49, midterm 21, final 30). If more official course outlines are added, keep the source URL and term with each record.
- Course feedback submitted by a tester is stored in `localStorage` under keys beginning `ee4213.portal.experiences.v1:`. It is browser-local and must not be treated as shared reference data.
- The profile uses `sessionStorage` under `ee4213.registration.profile.v1`; `course-pool.js` reads it to determine the eligible major, route, year, and course pool. Selected registration courses use `ee4213.registration.selectedCourses.v1` and are not consumed by another page.
- `comparisonProgrammes` and `generatedFeedbackTemplates` are currently unused. Do not delete them without checking whether a planned page depends on them.
- Use bilingual fields for new user-facing labels, such as `{ "en": "Electrical Engineering", "zh": "電機工程學" }`. Keep page-specific presentation and derived values in page code rather than duplicating source facts.
- Label sample, generated, or simulated content in the UI. Never put real student or sensitive data in fixtures.
- Projected pre-registration markers come from the 2026/27 major flowcharts and each major's required non-GE, non-elective curriculum courses, using the course's `curriculumByMajor[majorId]` metadata. They are not confirmed registration data. Do not mark GE requirements or elective placeholders; hide the marker when a course is blocked by a failed prerequisite because it requires manual registration.

Example lookup:

```js
const course = window.EE4213Data.courses.find((item) => item.courseId === courseId);
if (!course) {
    // Show an explicit not-found state for this course.
}
```

### Official AIMS import

`tools/import_course_exports.py` is the supported way to refresh the course/offering dataset from the local AIMS export. It is a developer-only Python 3.10+ script; no portal page loads or runs it. The checked-in `mock-data.js` currently contains 167 records (including 82 imported offering records); the importer refreshes this static dataset when run.

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
- Adds `officialOfferings.courses` keyed by course code. Each record contains the term/as-of snapshot, complete `sections` (CRN, section, credit, campus, WEB, level, availability, capacity, waitlist, instructor, medium of instruction, meetings, programme/major restrictions), `demand` rows and total, catalogue description, raw assessment tasks/weights, and source URLs.
- Gives every imported course a `comparator` object so the Course Comparator includes it automatically. Section times and assessment weights are official/catalogue/PDF-derived where available; `expectedStudyHoursPerWeek`, `difficulty`, `sampleWorkload`, and `sampleMeanGpa` are deterministically generated sample values.
- Leaves `majors`, `comparisonProgrammes`, `generatedFeedbackTemplates`, and `studentProfiles` unchanged.
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
| `ee4213.degree-audit.slot-selections.v1` | `sessionStorage` | Per-major concrete GE/elective course choices for Degree Audit placeholders. |
| `ee4213.course-planner.transfer.v1` | `sessionStorage` | One-time handoff from Degree Audit to the Course Comparator in the same tab: `courseIds`, optional `semester`, `courses` status metadata (`planned`/`completed`/`failed`/`blocked`), `excluded` unassigned requirements, plus optional `retakeCourseId` and `retakeSection`. |
| `ee4213.comparator.selection.v1` | `sessionStorage` | Saved Course Comparator selection: selected course IDs, manual override codes, sort key, section choices, imported course statuses/reasons, and retake course/section. Used to restore the working comparison after reload; **Clear** stores the previous state for undo. Retained unchecked entries and minus-dismissed entries are transient and deliberately not persisted. |
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
3. **Selected registration courses are not consumed elsewhere.** They are saved under `ee4213.registration.selectedCourses.v1`, but Student Profile and Degree Audit Helper do not read them. The profile fields are saved separately under `ee4213.registration.profile.v1` and are shown in Student Profile.
4. **Program Browser & Career Information is a placeholder.** `comparisonProgrammes` and `generatedFeedbackTemplates` exist in shared data but are not rendered anywhere. The Home page's career section is not a substitute for the dedicated feature.
5. **No Student Status page.** Student Profile shows profile fields only. Degree Audit Helper uses the profile to select a curriculum and credit target, but completed/planned courses and outstanding requirements are not combined with profile details in one status view; Registration Navigator selections are not consumed.
6. **Profile and audit state have different persistence.** The shared course pool follows Student Profile values in `sessionStorage`. Completed/failed course status is shared between Degree Audit and Comparator in `localStorage`; manual semester-placement overrides remain in memory and reset on reload. Concrete GE/elective placeholder choices are stored per major in same-tab `sessionStorage`. Any selected curriculum semester, or the moved plan plus selected retake course, can be handed to the Comparator through a one-time same-tab `sessionStorage` transfer. Comparator course selection, section choices, and sorting are saved separately in same-tab `sessionStorage`; clearing can be undone. Conflict checking now interrupts the Degree Audit flow with a same-tab navigation to the Comparator.
7. **Seed reviews and grade distributions need careful labeling.** Workload metrics, review text, and grade distributions blend deterministic fictional reviews with browser-submitted responses. The UI's "Student experiences" and "Grade distribution" sections are demonstrations, not official statistics. Any change to those sections should keep the fictional/demo distinction clear.
8. **`base.html` is gone, but a stale comment remains.** `portal/assets/js/common.js` says its shell markup was "copied from base.html"; the file no longer exists. The comment is harmless but should not be used as evidence that the legacy file is present.
9. **Imported official data is a mixed static snapshot.** `officialOfferings` is not rendered by any page yet, and imported comparator records combine official section times/assessment weights with generated study hours, difficulty, sample GPA, and workload. Imported data is term-specific and can go stale; do not describe it as live AIMS data or verified student statistics.
10. **The official importer is manual and network-dependent.** It relies on CityU catalogue/PDF access (with an `r.jina.ai` fallback), Google Translate, and optional local PDF tooling. Translation/network failures fall back to English/generated data; there is no scheduled refresh. The importer writes `mock-data.js` directly unless `--dry-run` is used.
11. **No automated checks.** There is no CI workflow, test framework, linter, or package manifest. The importer has a `--dry-run` mode and deterministic sample generation, but no automated test suite. Validation is manual, as described below.
12. **Pre-registration is a projection.** The major-flowchart markers describe expected registration for core curriculum courses only; they do not reflect a student's actual enrollment, and GE requirements/elective placeholders are not marked. A failed prerequisite hides the marker to signal manual registration.
13. **Degree Audit course moving is pointer-only.** Courses are moved between semesters by drag and drop. The previous Move term disclosure was replaced by an inline icon-only reset action on each course row; the reset is keyboard-accessible, but there is no keyboard path for moving a course. Add a compact keyboard move control if keyboard-only planning becomes a requirement.

## Development conventions

- Work in `portal/` for the current team implementation. Treat `original/` as read-only reference material unless the task explicitly asks to change it.
- Preserve the prototypes' ability to run as static HTML. Portal pages need the `portal/` folder and its `assets/`; opening an individual page directly in a browser is the simplest way to test it. Use the optional static server to test cross-page sessions and storage.
- Keep the portal build-free. Put page content inside `#pageContent`, keep the shared shell in `common.js`/`common.css`, and load page-specific CSS after `common.css` and page-specific JavaScript with `defer` after `common.js`. Scope page styles to avoid affecting other pages.
- Use `window.EE4213Data` for shared records and handle missing IDs explicitly. Keep page-specific presentation and derived values in the page code.
- Keep course and programme facts accurate and clearly distinguish prototype/sample data from verified official information. Prefer linking to authoritative CityU sources for facts that can change.
- Refresh official offering data through `tools/import_course_exports.py`; do not hand-edit imported section/assessment fields. Run a dry run first, keep `term`/`asOf` with imported records, and preserve the generated-vs-official distinction in UI copy.
- Support keyboard interaction, meaningful labels, visible focus states, readable contrast, and responsive layouts when adding or changing UI.
- Reuse the shared theme variables and components (`--cityu-maroon`, `--border-color`, `--text-muted`, `.card`, `.btn-action`, `.btn-secondary`) rather than duplicating brand colours. Put decorative page-title icons in a separate `aria-hidden` span outside the bilingual title text, and use classes rather than inline styles for reusable spacing.
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
- The existing sidebar supports arrow-key navigation; new navigation controls should offer an equivalent keyboard path. The Degree Audit flowchart moves courses by pointer drag only; its inline icon actions and options popover are keyboard-accessible, but moving a course is not.

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
5. **Course Information:** Search by code, English title, and Chinese title; clear the search; reload a URL with `?q=`; open a course; verify the back link keeps the query; use Add to Course Comparator from a list row and from the detail page; check the not-found state with a bogus `course` parameter.
6. **Workload Details and feedback:** Confirm the grading-components pie chart and legend render for a course with components, switch language, and confirm a course without components hides the chart; submit an empty form and confirm field-level errors; submit a valid form; reload and confirm the response persists; submit enough grades to check the distribution; filter reviews by term; test the combined-ID read-only state. Label seeded reviews as fictional when describing test results.
7. **Major Information:** Check all four major cards, the allocation summary, language switching, and official links.
8. **Course Comparator:** Change major, entry route, and year on Student Profile, then verify the Available Courses list changes accordingly; confirm completed/failed and unmet-prerequisite courses are excluded from the available list, direct code entry accepts known out-of-pool courses as an explicit override, Course Information adds a course through the `add` parameter, no sample-semester control remains, the available list follows the profile or common first-year pool, search filters by code and bilingual title, courses stay in a consistent course-code order when checked or unchecked, with no separate Selected/Available headings, selections and section choices survive a reload, unchecked entries return to the available-course list until reload, the minus action removes an entry, Clear can be undone, the Timetable & conflict check and Workload comparison tabs switch with mouse and keyboard, the conflict-count badge updates, the Data source row distinguishes AIMS snapshots from sample estimates, the grading-components pie charts render with legends and a no-data state, and the demo-data note remains visible.
9. **Degree Audit Helper:** Set different major/entry route/year combinations on Student Profile and verify the audit controls and credit target follow them. Confirm the full curriculum flowchart shows recommended semester placement, course links, projected pre-registration markers for core courses only, and status controls. Fail a prerequisite and confirm downstream courses lose the projected marker, and that only the affected course cards (including downstream dependents) are highlighted with the prerequisite chain while the semester row stays neutral. Expand and collapse semesters with the summary controls; confirm every semester opens initially, rows flow horizontally, and collapsed summaries retain credits, course count, and warning count. Drag a course row onto another semester summary and confirm the destination expands and receives the course. Confirm the moved row's inline icon-only reset button is active and restores the recommended semester; the reset should be disabled for courses already in their recommended semester. Repeat the reset with the keyboard. Open the ⋯ options popover only on rows with a slot selector or prerequisite warning, confirm ordinary rows have no details button, and verify the popover closes with Escape or an outside click. Verify row CU totals, per-card prerequisite warnings, rescheduled markers, and planned-credit metrics update. Substitute compatible GE courses for each area and specific courses for technical-elective slots; confirm slot identity is retained. Set and clear Completed/Failed status and verify it synchronizes with the Comparator. Use each semester's Mark all action and confirm eligible courses become completed while courses blocked by failed prerequisites are skipped and reported. Confirm completed and prerequisite-blocked courses cannot be moved, that a failed course can be moved for retake, and that any semester's **Timetable** action transfers all concrete course IDs and their statuses, including completed, failed, and blocked courses. Use the top-level conflict-check action to hand off moved courses plus the selected retake course; verify the Comparator opens with the retake section, L01/L02 choice, and retake clash labels. Confirm the waiver no-clash item starts unchecked, requires manual confirmation, and resets after a placement or status change. Open the override tab and verify the chain is computed for the selected failed course (for example, failing EE1001 shows EE2000 → EE2004 → CS3103/EE3220), the preview is disabled until a failed course and all checks are present, and the preview dialog lists the chain and checks without a false-positive eligible state. Check language switching and the waiver preview. Verify the left control column stays beside the results at desktop width, the Degree Audit and Override tabs switch with mouse and keyboard, and the layout stacks without horizontal overflow at narrow widths.
10. **Combined course planner:** In Degree Audit, choose **Timetable** on a semester row, or use the top-level conflict-check action to hand off moved courses plus the selected retake course. Confirm the Comparator loads known courses, identifies missing course records, includes curriculum-only courses outside the current-year pool, and shows their available curriculum schedule data. Confirm all concrete courses from the term appear in the comparison with status chips, while only planned courses appear in section choices, the timetable, and conflict results. Verify an all-completed term still shows comparison data but no planned timetable, and a single-course term still renders its comparison column. Check overlapping and non-overlapping meetings in the Comparator, add a 50-minute tutorial and a one-hour meeting, confirm their timetable entries remain fully readable and link to course details, select a short-event conflict and confirm its timetable blocks and section selectors are highlighted, verify non-overlapping courses on the same day keep the full column width, use the next-conflict control, try the L01/L02 retake alternate sections, and verify bilingual status updates.
11. **Student Profile:** Edit and save every field, cancel an edit, reload, and confirm the values persist in the same tab. Confirm the account name is read-only.
12. **Registration Navigator:** Verify step navigation, course selection, goal/specialization selection, checklist, and summary. Finish the flow and confirm that all five profile fields appear in Student Profile; return to the Navigator and confirm saved choices are restored.
13. **Program Browser & Career Information:** Confirm it still shows the placeholder rather than broken or partial feature content.
14. **Official AIMS import (developer):** Run `python tools/import_course_exports.py --scope ee --limit 2 --dry-run` and inspect `tools/official-import-preview.json`. Then run `--scope ee`, confirm `officialOfferings` exists, new EE courses appear in the Course Information directory, imported courses appear in the Course Comparator, generated scores are still labelled as sample data, `mock-data.js.bak` was created once, and the page loads without console errors. Test one course whose catalogue/PDF fetch fails and confirm the fallback does not corrupt existing records.

For the legacy `original/` files, open them directly and exercise their in-page tabs and modals without modifying them. The importer has a dry-run mode but no automated test suite; run its manual checks in addition to the checks above.

## Skills and helper tools

- `.github/skills/` contains reusable skills for user research, problem framing, interaction design, HAI decisions, usability validation, agile planning, and EE4213 project delivery. Use them when the task matches their scope; they do not override this guide.
- `tools/aims-course-export-console.js` is a manual browser-console helper for exporting AIMS course pages in an authorized session. It is not loaded by the portal, makes network requests only when run manually, and must not be wired into a page or executed automatically.
- `tools/import_course_exports.py` is a manual Python 3.10+ importer/enricher. It reads the gitignored `tools/htmls` export, fetches catalogue/PDF data, translates missing Chinese text, generates deterministic sample scores, and merges the result into `mock-data.js`/`officialOfferings`. It is not loaded by the portal and must not be wired into a page. Run it only through its documented CLI; use `--dry-run` to inspect changes first.
