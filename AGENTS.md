# Development Guide

## Project overview

This repository contains a high-fidelity prototype for a CityU Electrical Engineering student guide. The architecture chart describes both the current prototypes and a broader intended product. Keep those states distinct: a feature listed in the intended architecture is not necessarily implemented.

## Current implementation

| File | Current contents |
| --- | --- |
| `base.html` | A base html file that all features are built based on it |
| `README.md` | Course project brief and submission requirements. |

Both prototypes currently use inline HTML, CSS, and JavaScript. There is no package manifest, build system, or automated test suite. Do not assume a framework, server, persistence layer, or shared component system exists.

### Pages to complete

Use these checkboxes to track the chart's feature pages. Checked items have a working prototype counterpart; unchecked items are missing or need the work described below. Existing behavior is mock/demo behavior, not connected to live university systems.

- [ ] **Home Page** — Landing screen shown when the user is not logged in. Provides login and register entry points. In `base.html`, the Home page is a standalone section (`feature-home`) not listed in the sidebar; it is replaced by a protected page after successful login or registration.
- [ ] **Registration Navigator** — Build a student-facing registration flow that uses the selected major, degree route, completed courses, and planned courses to guide course selection. Surface prerequisite eligibility and timetable conflicts, and connect to the existing degree-audit planner and timetable simulator rather than duplicating them. In `base.html`, the Registration Navigator is a standalone section (`feature-registration`) not listed in the sidebar; it is shown automatically on the first login or after clicking Register.
- [ ] **Course Workload Details Page** — Turn the existing course detail view in `cityu-ee-guide.html` into a complete workload-focused destination reachable from course information and other relevant flows. It currently shows a sample workload score, GPA, generic assessment items, and generated sample comments. Add clear workload detail/context and label mock or generated content so it cannot be mistaken for verified course data or real student feedback.
- [ ] **Degree Audit Helper** — Present in `EE4213_code_v6.html` as the Degree Audit & Interactive Flowchart tab, including a completion checklist, semester planner, credit metrics, and prerequisite warnings. This is a prototype counterpart, not a connection to official student records.
- [ ] **Course Comparator** — Present in `cityu-ee-guide.html` as the Compare Programmes page, with two programme selectors and side-by-side comparison.
- [ ] **Program Browser and Career Information** — Present in `cityu-ee-guide.html` as programme search on Home and the Career page. The guide also has a separate Internships page; the chart marks internship opportunities as optional.

The chart also names **Major Information**, **Course Information**, and **Student Profile** as information areas rather than standalone pages. Keep their mock data consistent across the relevant features; do not treat the current page-specific arrays and simulator state as an already-shared data model.

## Intended architecture

**Major Information**, **Course Information**, and **Student Profile** are the relevant information areas the product needs to collect or generate. Treat their data as mock data for this prototype; do not imply that it is fetched from or persisted to live university systems. The chart connects student-facing features to these areas:

- **Registration navigator** and **Student Status Page**
- **Degree Audit Helper**
- **Course Comparator**
- **Course Workload Details Page** and **Course feedback collector**
- **Program Browser and Career Informations Page**
- **Interning opportunities** (marked optional in the chart)

In `base.html`, these information areas and connected features are organised as single-page sections:

- **Home** (`feature-home`) — public landing screen; not shown in the sidebar.
- **Registration Navigator** (`feature-registration`) — not shown in the sidebar; reached automatically on first login or via Register; content under development.
- **Student Profile** (`feature-profile`) — sidebar item; login required; content under development.
- **Course Information** (`feature-course-info`) — sidebar item; publicly browsable without login; content under development.
- **Major Information** (`feature-major-info`) — sidebar item; publicly browsable without login; content under development.
- **Course Comparator** (`feature-comparator`) — sidebar item; login required; content under development.
- **Degree Audit Helper** (`feature-degree-audit`) — sidebar item; login required; content under development (the working prototype lives in `EE4213_code_v6.html`).
- **Program Browser and Career Information** (`feature-program-career`) — sidebar item; login required; content under development (the working prototype lives in `cityu-ee-guide.html`).

The Student Status Page, Course Feedback Collector, and Internship Opportunities pages are removed in real building, the features of them will be combined with the existing pages. The two existing HTML files in "original" folder implement only part of our direction. In particular, do not describe the profile, registration navigator, student status, workload details, or feedback collector as implemented unless they have since been added. The chart is a high-level structure: it does not specify exact data ownership, API contracts, or connector semantics. Confirm those details before making changes that depend on them.

## Login and registration states

`base.html` implements a client-side (demo-only) login and registration state machine. No server, persistence layer, or credential verification exists; any input in the login or registration form is accepted.

- **Login** and **Register** buttons are shown when the user is not logged in.
- A **Logout** button and a user chip are shown when the user is logged in.

### Not logged in

- The main content area shows the **Home** landing section.
- Only the **Course Information** and **Major Information** sidebar items are browsable.
- All other sidebar items (Student Profile, Course Comparator, Degree Audit Helper, Program Browser & Career Information) are locked. Clicking a locked item opens a notice frame asking the user to login or register; the page is not switched.

### Logged in

- All sidebar items become clickable.
- **First login or registration** — the **Registration Navigator** section is shown automatically.
- **Subsequent logins** — the **Student Profile** section is shown automatically.
- "First" is tracked with an in-memory `hasVisitedNavigator` flag; it resets on page reload.
- Clicking **Register** triggers the login flow and always lands on the Registration Navigator, treating the session as first-time.

### Logout

- Returns the user to the Home landing section.
- The `hasVisitedNavigator` flag is preserved, so the next login lands on the Student Profile section.


## Development conventions

- Preserve the prototypes' ability to run directly as standalone HTML pages unless a task explicitly changes that constraint.
- Keep edits focused on the requested feature and follow the existing page's HTML, CSS, and JavaScript patterns. Avoid introducing dependencies or build tooling without a concrete need.
- Keep course and programme facts accurate and clearly distinguish prototype/sample data from verified official information. Prefer linking to authoritative CityU sources for facts that can change.
- Support keyboard interaction, meaningful labels, visible focus states, readable contrast, and responsive layouts when adding or changing UI.
- When rendering dynamic or user-provided values, avoid inserting untrusted strings as raw HTML; use safe DOM APIs or escape content appropriately.
- Keep navigation and interactions working when editing shared inline scripts or page markup. Do not silently remove existing prototype flows.

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
- Default language is Chinese; the top-bar language switch must keep working after any change.

### Safe rendering

- Do not insert untrusted or user-provided strings as raw HTML; use safe DOM APIs or escape content appropriately.
- Label mock, generated, or simulated data explicitly in the UI.

### AI-assisted workflow

- Before generating code, list the details that will be generated or modified and confirm understanding with the user.
- Ask for clarification when requirements are ambiguous.
- Keep changes focused on the requested feature and follow the existing inline HTML/CSS/JS patterns.

## Validation

There are no repository-provided automated checks. For changes to a prototype, open the affected HTML file directly in a browser and exercise the changed interaction and nearby navigation. Check the browser console for JavaScript errors and verify the layout at a narrow viewport when the change affects presentation. If automated tooling is added later, document and run its relevant checks.
