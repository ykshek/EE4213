# Development Guide

## Project overview

This repository contains a high-fidelity prototype for a CityU Electrical Engineering student guide. The architecture chart describes both the current prototypes and a broader intended product. Keep those states distinct: a feature listed in the intended architecture is not necessarily implemented.

## Current implementation

| File | Current contents |
| --- | --- |
| `cityu-ee-guide.html` | Standalone programme guide with programme search, curriculum and course information, career information, internship information, and programme comparison. |
| `EE4213_code_v6.html` | Standalone degree-audit and recovery simulator with a course checklist, study-plan/roadmap planning, timetable visualization, and override eligibility information. |
| `README.md` | Course project brief and submission requirements. |

Both prototypes currently use inline HTML, CSS, and JavaScript. There is no package manifest, build system, or automated test suite. Do not assume a framework, server, persistence layer, or shared component system exists.

### Pages to complete

Use these checkboxes to track the chart's feature pages. Checked items have a working prototype counterpart; unchecked items are missing or need the work described below. Existing behavior is mock/demo behavior, not connected to live university systems.

- [ ] **Registration Navigator** — Build a student-facing registration flow that uses the selected major, degree route, completed courses, and planned courses to guide course selection. Surface prerequisite eligibility and timetable conflicts, and connect to the existing degree-audit planner and timetable simulator rather than duplicating them. The current simulator can show prerequisite warnings and timetable clashes, but it does not provide a registration navigator or complete registration workflow.
- [ ] **Student Status Page** — Create a dedicated student overview using mock Student Profile data. Summarize major, degree route, year, completed/planned courses, credit progress, and outstanding or failed requirements. The degree-audit simulator currently has global selectors, a completion checklist, and credit metrics, but no separate status page; its state is held in in-memory JavaScript variables and resets on reload.
- [ ] **Course Workload Details Page** — Turn the existing course detail view in `cityu-ee-guide.html` into a complete workload-focused destination reachable from course information and other relevant flows. It currently shows a sample workload score, GPA, generic assessment items, and generated sample comments. Add clear workload detail/context and label mock or generated content so it cannot be mistaken for verified course data or real student feedback.
- [ ] **Course Feedback Collector** — Add an actual course feedback form and submission interaction, with input validation and mock feedback data associated with the selected course. The course detail view currently renders generated comments only; it has no feedback form or collection behavior. Keep generated examples distinct from user-submitted mock feedback.
- [x] **Degree Audit Helper** — Present in `EE4213_code_v6.html` as the Degree Audit & Interactive Flowchart tab, including a completion checklist, semester planner, credit metrics, and prerequisite warnings. This is a prototype counterpart, not a connection to official student records.
- [x] **Course Comparator** — Present in `cityu-ee-guide.html` as the Compare Programmes page, with two programme selectors and side-by-side comparison.
- [x] **Program Browser and Career Information** — Present in `cityu-ee-guide.html` as programme search on Home and the Career page. The guide also has a separate Internships page; the chart marks internship opportunities as optional.

The chart also names **Major Information**, **Course Information**, and **Student Profile** as information areas rather than standalone pages. Keep their mock data consistent across the relevant features; do not treat the current page-specific arrays and simulator state as an already-shared data model.

## Intended architecture

**Major Information**, **Course Information**, and **Student Profile** are the relevant information areas the product needs to collect or generate. Treat their data as mock data for this prototype; do not imply that it is fetched from or persisted to live university systems. The chart connects student-facing features to these areas:

- **Registration navigator** and **Student Status Page**
- **Degree Audit Helper**
- **Course Comparator**
- **Course Workload Details Page** and **Course feedback collector**
- **Program Browser and Career Informations Page**
- **Interning opportunities** (marked optional in the chart)

The two existing HTML files implement only part of this direction. In particular, do not describe the profile, registration navigator, student status, workload details, or feedback collector as implemented unless they have since been added. The chart is a high-level structure: it does not specify exact data ownership, API contracts, or connector semantics. Confirm those details before making changes that depend on them.

## Development conventions

- Preserve the prototypes' ability to run directly as standalone HTML pages unless a task explicitly changes that constraint.
- Keep edits focused on the requested feature and follow the existing page's HTML, CSS, and JavaScript patterns. Avoid introducing dependencies or build tooling without a concrete need.
- Keep course and programme facts accurate and clearly distinguish prototype/sample data from verified official information. Prefer linking to authoritative CityU sources for facts that can change.
- Support keyboard interaction, meaningful labels, visible focus states, readable contrast, and responsive layouts when adding or changing UI.
- When rendering dynamic or user-provided values, avoid inserting untrusted strings as raw HTML; use safe DOM APIs or escape content appropriately.
- Keep navigation and interactions working when editing shared inline scripts or page markup. Do not silently remove existing prototype flows.

## Validation

There are no repository-provided automated checks. For changes to a prototype, open the affected HTML file directly in a browser and exercise the changed interaction and nearby navigation. Check the browser console for JavaScript errors and verify the layout at a narrow viewport when the change affects presentation. If automated tooling is added later, document and run its relevant checks.
