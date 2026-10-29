# Development Guide

## Project overview

This repository contains a high-fidelity prototype for a CityU Electrical Engineering student guide. The architecture chart describes both the current prototypes and a broader intended product. Keep those states distinct: a feature listed in the intended architecture is not necessarily implemented.

The current team implementation is `portal/`. `base.html` and the two files in `original/` are reference prototypes kept so their work can be ported into the portal.

## Document authority

`portal/DEVELOPMENT.md` is authoritative for the portal: project structure, local run instructions, page ownership, shared assets, and session behavior. This file (`AGENTS.md`) is the repository-wide guide: product scope, HCI/HAI requirements, accessibility, bilingual UI, safe rendering, and the legacy `base.html` behavior. For portal-specific details, follow `portal/DEVELOPMENT.md`; if the two documents disagree, the portal-specific guidance wins for `portal/`. When a change affects both, update both documents.

## Current implementation

| Path | Status | Current contents |
| --- | --- | --- |
| `portal/` | **Current team implementation** | Static multipage prototype. `portal/index.html` is the public Home; seven feature folders each contain a placeholder `index.html`; the shared header, sidebar, footer, dialogs, demo login, and language switch live in `portal/assets/css/common.css` and `portal/assets/js/common.js`. Only Home and the shared shell are interactive today. |
| `portal/DEVELOPMENT.md` | Current portal guide | Portal structure, run methods, demo session behavior, and edit ownership. |
| `base.html` | Legacy reference | Pre-split single-file prototype with inline HTML, CSS, and JavaScript. It keeps every feature as an in-page section and uses in-memory demo state. Do not treat it as the active build target. |
| `original/cityu-ee-guide.html` | Legacy reference | Original individual prototype: programme/course information, career information, internship information, and programme comparison. |
| `original/EE4213_code_v6.html` | Legacy reference | Original individual prototype: degree audit, interactive flowchart, and recovery simulator. |
| `README.md` | Course brief | Course project brief and submission requirements. |

The portal uses separate shared CSS and JavaScript files; `base.html` and the files in `original/` use inline HTML, CSS, and JavaScript. There is no package manifest, build system, backend, framework, or automated test suite. The portal does have a client-side shared shell and uses `sessionStorage` for demo login and language state; there is no server-side persistence, database, or credential verification. `base.html` keeps the same demo state in memory only.

## Pages to complete

Use these checkboxes to track the chart's feature pages. Checked items have a working prototype counterpart somewhere in the repository (the current portal or `original/`); unchecked items are missing, placeholders, or only partly implemented. The portal completion status is stated in each item. Existing behavior is mock/demo behavior, not connected to live university systems. Treat the `original/` files as read-only references: port their behavior into the matching `portal/` page rather than editing the originals.

- [x] **Home Page** — Landing screen shown when the user is not logged in. Provides login and register entry points. Implemented as `portal/index.html`, which is not listed in the sidebar; after login or registration the portal navigates to the Registration Navigator or Student Profile page. The legacy `base.html` equivalent is the `feature-home` section.
- [ ] **Registration Navigator** — Build a student-facing registration flow that uses the selected major, degree route, completed courses, and planned courses to guide course selection. Surface prerequisite eligibility and timetable conflicts, and connect to the existing degree-audit planner and timetable simulator rather than duplicating them. The current simulator can show prerequisite warnings and timetable clashes, but it does not provide a registration navigator or complete registration workflow. In `portal/`, it is `portal/registration/index.html`: login required, not listed in the sidebar, reached from the first login/registration flow or opened directly after login. The page is currently a placeholder. The legacy `base.html` equivalent is `feature-registration`.
- [ ] **Student Status Page** — Create a dedicated student overview using mock Student Profile data. Summarize major, degree route, year, completed/planned courses, credit progress, and outstanding or failed requirements. The degree-audit simulator currently has global selectors, a completion checklist, and credit metrics, but no separate status page; its state is held in in-memory JavaScript variables and resets on reload. In `portal/`, plan this as a subpage or section of `portal/student-profile/` rather than a new sidebar item; the exact URL and layout are still to confirm. Not implemented.
- [ ] **Course Workload Details Page** — Build it as a subpage at `portal/course-info/workload.html`, reachable from Course Information and other relevant flows. Port the existing course detail view from `original/cityu-ee-guide.html`. It currently shows a sample workload score, GPA, generic assessment items, and generated sample comments. Add clear workload detail/context and label mock or generated content so it cannot be mistaken for verified course data or real student feedback. Do not add it as a sidebar item.
- [ ] **Course Feedback Collector** — Add an actual course feedback form and submission interaction, with input validation and mock feedback data associated with the selected course. The course detail view currently renders generated comments only; it has no feedback form or collection behavior. Keep generated examples distinct from user-submitted mock feedback. In `portal/`, plan it within the Course Information/course detail flow rather than a new sidebar item; its exact placement is still to confirm. Not implemented.
- [x] **Degree Audit Helper** — The reference prototype is in `original/EE4213_code_v6.html` as the Degree Audit & Interactive Flowchart tab, including a completion checklist, semester planner, credit metrics, and prerequisite warnings. `portal/degree-audit/index.html` is a placeholder. This is a prototype counterpart, not a connection to official student records.
- [x] **Course Comparator** — The reference prototype is in `original/cityu-ee-guide.html` as the Compare Programmes page, with two programme selectors and side-by-side comparison. `portal/comparator/index.html` is a placeholder.
- [x] **Program Browser and Career Information** — The reference prototype is in `original/cityu-ee-guide.html` as programme search on Home and the Career page. The guide also has a separate Internships page; the chart marks internship opportunities as optional. `portal/program-career/index.html` is a placeholder.

The chart also names **Major Information**, **Course Information**, and **Student Profile** as information areas. In `portal/` they appear as sidebar destinations (`portal/major-info/`, `portal/course-info/`, `portal/student-profile/`); in legacy `base.html` they are sections. Keep their mock data consistent across the relevant features; do not treat the current page-specific arrays and simulator state as an already-shared data model.

## Intended architecture

**Major Information**, **Course Information**, and **Student Profile** are the relevant information areas the product needs to collect or generate. Treat their data as mock data for this prototype; do not imply that it is fetched from or persisted to live university systems. The chart connects student-facing features to these areas:

- **Registration navigator** and **Student Status Page**
- **Degree Audit Helper**
- **Course Comparator**
- **Course Workload Details Page** and **Course feedback collector**
- **Program Browser and Career Informations Page**
- **Interning opportunities** (marked optional in the chart)

The portal presents these information areas and connected features as separate pages with the shared shell:

- **Home** (`portal/index.html`) — public landing page; not listed in the sidebar.
- **Registration Navigator** (`portal/registration/`) — login required; not listed in the sidebar; reached from the first login/registration flow or opened directly after login; placeholder.
- **Student Profile** (`portal/student-profile/`) — sidebar item; login required; placeholder; planned home of the Student Status view (subpage or section to confirm).
- **Course Information** (`portal/course-info/`) — sidebar item; publicly browsable; placeholder; planned home of the Course Workload Details subpage (`workload.html`) and the Course Feedback flow.
- **Major Information** (`portal/major-info/`) — sidebar item; publicly browsable; placeholder.
- **Course Comparator** (`portal/comparator/`) — sidebar item; login required; placeholder.
- **Degree Audit Helper** (`portal/degree-audit/`) — sidebar item; login required; placeholder; reference prototype in `original/EE4213_code_v6.html`.
- **Program Browser and Career Information** (`portal/program-career/`) — sidebar item; login required; placeholder; reference prototype in `original/cityu-ee-guide.html`.

The legacy `base.html` keeps the same features as single-page sections (`feature-home`, `feature-registration`, `feature-profile`, `feature-course-info`, `feature-major-info`, `feature-comparator`, `feature-degree-audit`, `feature-program-career`) with an in-page tab switcher. Use it as a reference for copy and interaction patterns, but do not update it unless the task explicitly asks.

Student Status, Course Feedback, and Internship Opportunities are not separate sidebar destinations in the current portal. Student Status and Course Feedback should be integrated into Student Profile and Course Information (as subpages or sections); internships remain optional. The two original HTML files in `original/` implement only part of this direction. In particular, do not describe the profile, registration navigator, student status, workload details, or feedback collector as implemented unless they have since been added to `portal/`. The chart is a high-level structure: it does not specify exact data ownership, API contracts, or connector semantics. Confirm those details before making changes that depend on them.

## Login and registration states

`portal/` implements a client-side (demo-only) login and registration state machine. `base.html` implements a legacy in-memory version of the same flow. Neither has a server, database, or credential verification; any input in the login or registration form is accepted.

Common behavior:

- **Login** and **Register** buttons are shown when the user is not logged in.
- A **Logout** button and a user chip are shown when the user is logged in.
- **Not logged in:** the main content shows Home. Only **Course Information** and **Major Information** sidebar items are browsable. All other sidebar items (Student Profile, Course Comparator, Degree Audit Helper, Program Browser & Career Information) are locked. Clicking a locked item opens a notice asking the user to login or register; the portal does not navigate, and a protected page opened directly shows the same notice instead of its content.
- **Logged in:** all sidebar items become clickable.
- **First login or registration:** the portal navigates to the Registration Navigator. **Subsequent logins:** it navigates to Student Profile. Clicking **Register** always lands on the Registration Navigator, treating the session as first-time.
- **Logout:** returns the user to Home and preserves the "navigator visited" state, so the next login goes to Student Profile.

Storage differs by prototype:

- **Portal (`portal/`)** — `portal/assets/js/common.js` stores `isLoggedIn`, `hasVisitedNavigator`, `userName`, and `language` in `sessionStorage` under `ee4213.portal.session.v1`. State survives page reloads and page changes in the same tab and origin. It is not shared across tabs, hosts, or ports, and may be unavailable under `file://`; in that case the page shows a notice and login only unlocks the current page.
- **Legacy `base.html`** — state is in memory only. `hasVisitedNavigator` resets on page reload, and the feature sections are switched in-page rather than by navigation.

## Development conventions

- Work in `portal/`; follow `portal/DEVELOPMENT.md` for structure, shared assets, and page ownership. Treat `base.html` and `original/` as read-only references unless the task explicitly asks to change them.
- Preserve the prototypes' ability to run as static HTML. Portal pages need the `portal/` folder and its `assets/`; a static file server (Live Server or `python -m http.server --directory portal`) is recommended for testing the cross-page demo session, but direct `file://` opening remains a documented fallback. `base.html` and the `original/` files remain directly openable single files.
- Keep portal pages build-free. Put page content inside `#pageContent`, keep the shared shell in `common.js`/`common.css`, and load any page-specific CSS after `common.css` and page-specific JS with `defer` after `common.js`. Scope page styles to avoid affecting other pages.
- Keep Course Workload Details under `portal/course-info/` as a subpage; do not add it as a sidebar item unless the team explicitly changes that placement.
- Keep edits focused on the requested feature and follow the existing page's HTML, CSS, and JavaScript patterns. Avoid introducing dependencies, a backend, or build tooling without a concrete need.
- Keep course and programme facts accurate and clearly distinguish prototype/sample data from verified official information. Prefer linking to authoritative CityU sources for facts that can change.
- Support keyboard interaction, meaningful labels, visible focus states, readable contrast, and responsive layouts when adding or changing UI.
- When rendering dynamic or user-provided values, avoid inserting untrusted strings as raw HTML; use safe DOM APIs or escape content appropriately.
- Keep navigation and interactions working when editing shared scripts or page markup. Do not silently remove existing prototype flows.

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

### Accessibility

- Use semantic HTML, ARIA landmarks, and correct `lang` attributes.
- Support full keyboard operation: visible focus states, logical tab order, and a skip-to-content link.
- Meet WCAG AA contrast; keep touch targets at least 44px; ensure responsive layouts at narrow viewports.
- Dynamic content changes must be perceivable by assistive technologies (e.g. live regions where appropriate).

### Human-AI collaboration (HAI)

- Before generating or modifying UI, confirm the requirement, the scope, and any unclear details with the user; do not assume.
- Do not silently remove or rewrite existing prototype flows; preserve the behaviour the user already relies on.
- Clearly separate demo / sample data from verified official information so users cannot mistake one for the other.
- Preserve user control: destructive or irreversible actions must be confirmable, and navigation must allow users to return to a known state.

### Bilingual UI (Chinese / English)

- Use the existing `lang-zh` / `lang-en` visibility mechanism.
- Any new user-facing string must provide both Chinese and English versions.
- The initial default language is Chinese; the portal may restore a saved English preference from `sessionStorage`. The top-bar language switch must keep working after any change.

### Safe rendering

- Do not insert untrusted or user-provided strings as raw HTML; use safe DOM APIs or escape content appropriately.
- Label mock, generated, or simulated data explicitly in the UI.

### AI-assisted workflow

- Before generating code, list the details that will be generated or modified and confirm understanding with the user.
- Ask for clarification when requirements are ambiguous.
- Keep changes focused on the requested feature and follow the existing portal or legacy inline patterns as appropriate.

## Validation

There are no repository-provided automated checks. For portal changes, serve `portal/` (Live Server or `python -m http.server 8765 --bind 127.0.0.1 --directory portal`), then exercise the changed interaction and nearby navigation: login, registration, logout, locked pages, language switch, page reload, Back/Forward, and any page-specific flow. Check the browser console for JavaScript errors and verify the layout at a narrow viewport. If `sessionStorage` is unavailable (for example when opening `file://` directly), verify the visible notice and per-page login fallback. For legacy `base.html`, open it directly and exercise the tab switcher and modals. If automated tooling is added later, document and run its relevant checks.
