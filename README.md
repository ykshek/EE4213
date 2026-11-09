# CityU EE Student Portal

A static, build-free high-fidelity prototype of a student guide for the Department of Electrical Engineering at City University of Hong Kong (CityUHK). It brings programme and major exploration, course discovery, workload comparison, degree planning, and a browser-local demo account flow together in one multipage portal.

> **Prototype data only.** Course, major, workload, review, grade, and student data are sample or demo content. Nothing is connected to CityU AIMS, Canvas, or official student records, and nothing is saved on a server.

## What works today

| Feature | Location | Status |
| --- | --- | --- |
| Home page | `portal/index.html` | Implemented. Public landing page with programme, study-area, learning-journey, career, and official-resource sections. Not listed in the sidebar. |
| Demo accounts, login, and language switch | `portal/assets/js/common.js`, `portal/assets/css/common.css` | Implemented. Browser-local accounts, session state, first-login routing, locked-page notices, storage warnings, and a Chinese/English switch. |
| Registration Navigator | `portal/registration/index.html` | UI and step logic are present, but the page is **not currently wired up**: it does not load its page CSS/JS or the shared data module, and its page-root class does not match the scoped CSS. The flow is login-protected and not in the sidebar. |
| Student Profile | `portal/student-profile/` | Implemented. View and edit major, entry route, year, career goal, and specialization. Login-protected. |
| Course Information directory | `portal/course-info/index.html` | Implemented. Searchable directory of 56 EE course entries with bilingual titles, credits, and practical/theoretical badges. Public. |
| Course Workload Details | `portal/course-info/workload.html` | Implemented. Course description, credits, workload metrics, 13-week busy-week timeline, student experiences, and grade distribution. Public subpage; not a sidebar item. |
| Course Feedback Collector | `portal/course-info/workload.html` | Implemented. Validated feedback form saved per course in `localStorage`, mixed with deterministic fictional seed reviews for demonstration. |
| Major Information | `portal/major-info/index.html` | Implemented. Bilingual overview of the four EE majors, the 2025/26 major-allocation summary, and official links. Public. |
| Course Comparator | `portal/comparator/index.html` | Implemented. Compares nine sample courses, loads six sample semesters, detects timetable overlaps, and sorts workload metrics. Public. |
| Degree Audit Helper | `portal/degree-audit/` | Implemented. Degree-audit checklist, semester planner, interactive flowchart, timetable conflict simulator, and prerequisite waiver preview. Login-protected; state is in memory only. |
| Program Browser and Career Information | `portal/program-career/index.html` | Placeholder. Login-protected; career information currently appears only on the Home page. |
| Student Status | — | No dedicated page yet. The Student Profile shows profile fields, and the Degree Audit Helper shows credit progress, but completed/planned courses are not combined into one status view. |

The former root-level `base.html` prototype has been removed. The files under `original/` remain as read-only source references.

## Repository structure

```text
EE4213/
├── AGENTS.md                         # Authoritative development guide
├── README.md                         # This file; course brief appended below
├── LICENSE
├── portal/                           # Current team implementation
│   ├── index.html                    # Home (public, not in sidebar)
│   ├── registration/
│   │   └── index.html                # Multi-step UI; asset wiring incomplete
│   ├── student-profile/
│   │   └── index.html
│   ├── course-info/
│   │   ├── index.html                # Course directory
│   │   ├── workload.html             # Workload details + feedback
│   │   ├── course-info.css
│   │   ├── course-info.js
│   │   └── review-seed.js            # Deterministic fictional reviews
│   ├── major-info/
│   │   ├── index.html
│   │   └── major-info.css
│   ├── comparator/
│   │   ├── index.html
│   │   ├── comparator.css
│   │   └── comparator.js
│   ├── degree-audit/
│   │   ├── index.html
│   │   ├── index.css
│   │   └── index.js
│   ├── program-career/
│   │   └── index.html                # Placeholder
│   └── assets/
│       ├── css/
│       │   ├── common.css            # Shared shell and base components
│       │   ├── home.css
│       │   ├── registration.css      # Currently not linked by a page
│       │   └── student-profile.css
│       └── js/
│           ├── common.js             # Shared shell, auth, language, storage
│           ├── mock-data.js          # Shared course/major/comparator fixtures
│           ├── registration.js       # Currently not linked by a page
│           └── student-profile.js
├── original/                         # Read-only reference prototypes
│   ├── cityu-ee-guide.html
│   ├── EE4213_code_v6.html
│   └── comparator/
│       ├── index.html
│       ├── app.js
│       └── styles.css
├── tools/
│   └── aims-course-export-console.js # Manual AIMS HTML export helper
└── .github/skills/                   # Reusable course-method skills
```

There is no package manifest, framework, bundler, backend, database, or automated test suite. Pages are plain HTML, CSS, and JavaScript.

## Run the prototype

No installation is needed beyond a modern web browser.

### Open a page directly

Keep the `portal/` folder together, then open `portal/index.html` in a browser. The sidebar links open the other pages. Opening individual pages with a `file://` URL is the quickest way to test them, but browser storage may be unavailable or inconsistent across pages; the portal shows a notice when that happens.

### Run a local static server (recommended for login and storage)

From the repository root:

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory portal
```

Open <http://127.0.0.1:8765/> and stop the server with `Ctrl+C`. On Windows, use `py` instead of `python` if that is the available command. Use only made-up credentials when testing.

## Accounts and access

- **Public pages:** Home, Course Information (including Workload Details), Major Information, and Course Comparator.
- **Login-protected pages:** Registration Navigator, Student Profile, Degree Audit Helper, and Program Browser & Career Information.
- **Account storage:** demo accounts are saved in `localStorage` under `ee4213.portal.demo-accounts.v1`. Passwords are stored in plain text; this is a prototype, not real authentication.
- **Session storage:** login state, the navigator-visited flag, and language preference are saved in `sessionStorage` under `ee4213.portal.session.v1`, so they are per tab.
- **Routing:** registration or a first login opens the Registration Navigator; later logins open Student Profile; logout returns to Home. Clicking Register always lands on the Registration Navigator.
- **Profile and feedback data:** the profile uses `sessionStorage` under `ee4213.registration.profile.v1`; course feedback uses `localStorage` keys beginning `ee4213.portal.experiences.v1:`.

Clearing site data removes all demo accounts, profiles, and feedback.

## Prototype data and limitations

- Shared fixtures live in `portal/assets/js/mock-data.js` as `window.EE4213Data`: 84 course records, four major curricula, six sample-semester presets, nine Comparator courses, five comparison programmes, and three feedback templates.
- `studentProfiles` is intentionally empty. No real student data is included.
- The course directory shows 56 EE entries. Comparator-only sample records are excluded except `EE4213`.
- Comparator hours, difficulty, grading, and meeting times are illustrative fixtures, not current or official section data.
- Workload metrics and grade distributions combine deterministic fictional reviews from `portal/course-info/review-seed.js` with feedback submitted in the same browser. They are not official statistics or verified student feedback.
- Only `EE4213` has an official assessment block, sourced from a CityU syllabus PDF. Treat other course information as prototype content and check official CityU sources before relying on it.
- The Degree Audit Helper and Comparator keep their working state in memory; reloading the page resets it.
- There is no internship page. Career information appears on the Home page; internship-related sample fields exist only in the unused `comparisonProgrammes` fixtures.

## Known gaps

- The Registration Navigator needs its page assets reconnected before the step buttons work; see `AGENTS.md` for the exact mismatch.
- `portal/registration/` and `portal/assets/` contain two different copies of the registration CSS and JavaScript. One canonical pair should be linked and the duplicate removed.
- The Registration Navigator's selected courses are stored in `sessionStorage` but are not read by the Student Profile or Degree Audit Helper.
- Program Browser & Career Information is still a placeholder.
- There is no dedicated Student Status page combining profile, completed/planned courses, and credit progress.
- The Student Profile and Degree Audit Helper have separate data sources and do not synchronize.

## Documentation

- `AGENTS.md` — authoritative development guide: page ownership, data model, access rules, conventions, HCI/HAI requirements, and validation.
- `.github/skills/README.md` — reusable user-research, design, validation, and agile-planning skills.
- `tools/aims-course-export-console.js` — optional, manually run console helper for exporting AIMS course pages in an authorized browser session. It is not part of the portal runtime.

---

# Course project brief

_The following is copied and summarized from the course submission page and remains the source of the assignment requirements._

Team members will present their individual projects and demonstrate their prototypes to teammates. Your team will then decide what to include or exclude in your final group prototype, treating it as a subsequent iteration. This decision should be based on research evidence collected from target users and a thorough evaluation. From this iterated version, your team will collectively create user stories and conduct sprint planning and development. The purpose of this group project is to provide you with hands-on experience with User-Centric Application Design and the Scrum Development Process.

## Prerequisite:

You all will bring together your individual research findings, personas, problem statements, HMW questions, and prototypes to this group project. As a team, you all will compare your findings and determine whether any personas and their needs are connected through a common service or ecosystem. Your group project may support multiple personas but shall be closely related.
Your team should then establish priorities, define a focused problem, identify primary and secondary user groups, and set clear prototype boundaries. Explain how each individual problem statement contributes to the group project, e.g., which persona is selected as the main focus, synthesised a new persona with related/similar findings, retained a specific persona as a secondary opportunity, deferred it for future development, or even excluded from the prototype.
In projects with multiple personas and problem statements, e.g., the demand side and supply side of a marketplace, please ensure that the final problem statements are hierarchically structured and aligned with one cohesive theme rather than unrelated directions.

## Requirements:

### Project Background
Present your final primary and secondary personas along with their corresponding problem statements. Provide a brief rationale explaining your choices based on your group's discussion (refer prerequisite phase).

### Solution
Based on your final persona(s) and problem statement(s), gather the 4-5 prototypes from your individual project and decide which features, elements or workflow to include, adjust, rework, or exclude in the final group prototype. Note: If you have more than one problem statements, make sure they are hierarchically well-structured.
Develop the iteration carefully to address users’ problem and improve the overall HCI/HAI quality. Explain what changed, why it changed, and how the final solution responds to users’ needs, referring specifically to your teammate’s initial Individual Project prototype. If your final project includes AI, identify what AI-assisted interaction patterns you have chosen and define the human-oversight boundary, i.e. what the AI decides and what remains with the user.
You should provide explanation to support your decision on the AI-assisted interaction and human-oversight boundary design. (Note: A well-reasoned decision not to use AI in your project is equally acceptable.)
You should demostrate a strong HCI/HAI design at different stages (For AI product, Lifecycle Guidelines for Human-AI Interaction shall be followed.)

### Validation
Your group needs to conduct usability tests with at least 3 target users on the group prototype. Before running a usability test, clearly define the study goals, target participants, tasks/scenarios, methods, and the success criteria (or metrics if applicable) you’ll use to evaluate task performance and/or user experience.
Summarize your usability methodology and the main insights gathered from these evaluations. Gather feedback, analyze results, and make necessary adjustments to improve the prototype.
The presentation should highlight the "before and after," along with a clear rationale for the changes made. (Photographs accompanying the observation report or video recordings that document the evaluation activities are required.)
Recordings for validation are mandatory for your submission requirement. You must secure consent from your participants to record the session via audio or video.

### User Stories Creation

Your group will create at least 2 themes, each containing at least 3 epics. For each epic, develop at least 4 user stories. Each user story will be assigned a story point. This comprehensive set of epics, features, and user stories will form the foundation for your product backlog.
While you are welcome to utilize AI to develop your user stories, human oversight is required. Document what you accepted, edited, or overrode from its output, and why.
Product Backlog Template will be provided in excel format under Files on Canvas)

### Sprint Planning
Assume each sprint is only 1 weeklong. Your group needs to collectively define the sprint goal (i.e., What we want to achieve every 1 week). After that, you need to collaboratively review and prioritize the product backlog, then select items that can be fully developed within one week. Your method of prioritization, rationales, and results should be explained in your presentation.
Sprint Planning Template will be provided in excel format under Files on Canvas

### Functional Prototype
For each selected backlog item (user story), your group should discuss and decompose it into smaller tasks for development. A functional high-fidelity prototype or application should be developed and presented during the final presentation.

### Conclusion
#### Conduct Sprint Retrospective and include the following insights:
Successes: Highlight effective practices and team achievements during the project
Key Challenges: Identify underlying reasons for challenges faced by the group
Improvement Areas: Pinpoint potential process improvements and identify skills gaps, if any.
Next Steps: Specific action items or recommendations are decided to improve team effectiveness and productivity moving forward

#### Reflect on lessons learned when collaborating with AI
Describe how your team partnered with different AI tools to complete this project. What are the pros and cons of these tools and their generated outputs?
What did your team find helpful, surprising, or frustrating about the AI's suggestions and outputs?
If your team were to repeat this exercise, what would you do differently?

### Appendix
Photographs accompanying the observation report or video recordings that document the validation tests are mandatory for your submission.(Failure to provide this information will result in a substantial mark deduction)

## Deliverables & Remarks:

### 1. Group Presentation: Prepare a presentation of approximately 15–25 slides for a maximum of 12 minutes. The presentation should communicate the most important evidence, design decisions, and prototype outcomes rather than reproduce the full report. It should cover:
  The project context, research goal, primary persona (and secondary personas, if applicable), and problem statement (if more than one, they shall be closely related and hierarchically structured)
  Briefly explain how the team connected the individual findings to define the group’s ultimate problem statement and prototype scope.
  A prototype demonstration of primary end-to-end user workflow (connected secondary workflow if applicable).

  Please limit the scope of your presentation to 1-3 features only, making sure they are impactful to users.
  Unless your account registration, login, forget password workflow are providing a huge value to your solution, otherwise, you shall skip them in your prototype and focus on core feature(s).

  Explain the team’s AI-design decision (if applicable, which include the AI-assisted interaction patterns the human-oversight boundary design.)
  The usability-testing method, key findings, and clear before-and-after comparison.
  The backlog structure, selected user stories, and sprint priorities. No need to present every backlog item during presentation.
  The full details, supporting evidence, complete product backlog, AI review records, sprint documentation, usability-testing materials, and retrospective must be included in the report and appendix. You should also be prepared to answer questions about these materials during the Q&A session.

### 2. Functional High-Fidelity Prototype: A functional high-fidelity prototype (or working application) that incorporates user feedback and demonstrates the features outlined in the selected user stories.

  For software applications, you shall submit:

  A video hosted on YouTube demonstrating how your application works. (example: https://youtu.be/e67j3LBk1iA&t=39)
  Your code or a link to your final high-fidelity prototype.

  For hardware prototype, you shall submit a video hosted on YouTube demonstrating how it During the presentation, you should bring your hardware product and be able to demonstrate exactly the same user experience as shown in the video.
  In both cases, no extra marks will be given if the actual deliverable in the presentation is better than what's captured in the video.

### 3. Written Report:

#### a)   Introduction

  Introduce the project context and research goal.
  Present the final primary and secondary personas.
  Explain how the personas are connected through a common service, ecosystem, or workflow.
  Present the corresponding problem statements and explain their hierarchy.
  Explain how the group design challenge was selected or synthesised from the individual findings.
  Show how each teammate’s individual problem statement contributes to the group project.

#### b)   Solution

  Explain which features, elements, and workflows your team’s initial individual prototypes were included, adjusted, reworked, deferred, or excluded, and justify these decisions based on your group’s finalized personas, problem statements, research evidence, and project constraints.
  Identify the primary and secondary user workflows and define the prototype boundaries.
  Explain how the solution addresses the selected persona needs and problem statements.
  If AI is included, explain the selected AI-assisted interaction pattern and the human-oversight boundary. Provide rationale for your AI design. Note that a well-reasoned decision not to use AI is equally acceptable.
  For AI product, elaborate how well your design align with Lifecycle Guidelines for Human-AI Interaction.

#### c)    Validation

  Define the usability study goals, target participants, tasks/scenarios, methods, and the success criteria (or metrics if applicable) use to evaluate task performance and/or user experience.
  Analyze the feedbacks/signals and identify the main findings.
  Explain how the findings map to the primary and secondary personas.
  Detail the specific design modifications made in response to user feedback, highlighting how these changes directly improve the quality of HCI/HAI.
  Explain with before-and-after comparisons of the prototype, including screenshots.
  The Appendix must include either photographic documentation with audio or video recordings of all validation tests. Please note that missing evidence will severely impact the final assessment score.

#### d)   User Stories and Product Backlog

  Based on your final group prototype, document your agile development process by presenting at least 2 themes, each containing at least 3 epics, with at least 4 user stories per epic.
  Assign story points to each user story.
  Include testable acceptance criteria for each selected user story.
  Explain the rationale behind the backlog structure and prioritization.
  Ensure that each final user story is traceable to research evidence, a persona need, a problem statement, an HMW question, or a validated design decision.
  For every AI-assisted user story, document what the team accepted, edited, rejected, or deferred, and why.

#### e)   Sprint Planning

  Define the sprint goals for the planned sprints.
  Select user stories that can be fully developed within each one-week sprint.
  Describe the prioritization method, rationale, and results.
  Explain how the team balanced user value, technical feasibility, resources, and time.
  It’s accepted that some stories would be retained in the product backlog for future development due to time constraint.

#### f)     Conclusion

o   Sprint Retrospective

  Successes: Highlight effective practices and team achievements during the project
  Key Challenges: Identify underlying reasons for challenges faced by the group
  Improvement Areas: Pinpoint potential process improvements and identify skills gaps, if any.
  Next Steps: Specific action items or recommendations are decided to improve team effectiveness and productivity moving forward

o   AI Collaboration Assessment

  How the team partnered with AI tools.
  The strengths and limitations of the tools and their outputs.
  What the team accepted, edited, overrode, or rejected.
  Any evidence of bias, overconfidence, missing information, or unsuitable recommendations.
  How the team verified AI output before using it.
  What the team would do differently in a future project.

g)   Appendix

  The usability-test plan and questions.
  Photographic documentation with audio or video recordings of all validation sessions.
  Additional supporting materials.

### 4. Remarks

  Each group is required to submit a soft copy of your presentation, your report and any supporting materials via the CANVAS link by 17 Nov 2026 12:00 noon.
  Each group should present their project using at most 12 minutes during one of the last 2 lessons.
  Late submissions will not be accepted. You will not be able to present, and the system won't allow uploads after the deadline.
  All presentation decks will be pre-loaded on the lecture room's computer. Include all your presentation materials, URLs and visuals within your submitted presentation deck.
  To maximize your learning opportunities, student workload at each group on the project should be evenly distributed, besides, we encourage all teammates to participate equally during the presentation too.
  At the end of the course, you'll complete a confidential peer evaluation form via a provided link on the CANVAS. This assessment is crucial for fair recognition of each team member's contributions. Please provide honest, constructive feedback to accurately reflect individual performance within the team.

## Evaluation Criteria

### a)   Clarity of Persona and Problem Statement (5%)

  Assess how well you articulate your persona’s problem. Ensure the problem statement is clear, user-centric and concise. For the group project, also assess how clearly the problem statement was synthesized from, or selected among, the team's individual problem statements.

### b)   Final Prototype (40%)

  How effectively does the prototype address the target users’ real problems and goals? How much concrete value does it create in their workflows or experiences?

  How easy is it for target users to complete key tasks with effectiveness, efficiency, and satisfaction, and are HCI/HAI principles/best practice/rules considered at this stage?

  How well do core flows and interactions work end‑to‑end in the prototype?

  Does it meet the requirements outlined in the user stories?

### c)    Usability Test Process & Iterative Improvement (25%)

  Evaluate the quality and thoroughness of the evaluation methods used and the depth of analysis of the feedback

  Evaluate the final version of group prototype effectiveness in addressing the problem statement and incorporating user feedback. Assess improvements over the initial prototype, focusing on relevance and impact of changes.

### d)   User Stories, Product Backlog & Sprint Planning (20%)

  Review the completeness and clarity of the themes, epics and user stories created. Are they well-defined and aligned with the project goals?

  Assess the effectiveness in defining the sprint goal, selecting backlog items, and the rationale behind prioritization.

### e)   Presentation Quality (5%)

  Review the clarity, organization, and professionalism of the group

### f)     Team Collaboration (5%)

  Assess the evidence of teamwork and collaboration throughout the project (Your team contribution will be graded by your teammates.)

## FAQs

Q: What does “theme”, "epic" and “user story” mean?

A: This will be covered in week 9’s class - Agile Development & Implementation

Q: What is a functional high-fidelity prototype?

A: A high-fidelity prototype is a polished simulation of your final product that demonstrates complete functionality. It's a highly detailed, interactive representation that closely resembles the final design. This type of prototype includes visual design details and real content to showcase the look and feel of the end product. It also features robust interactivity and functionality to provide a more realistic user experience. (example:
https://youtu.be/e67j3LBk1iA&t=39 Starting from 0:39s)

Q: If we decided to work on a hardware solution, how should we submit the final product?

A: To submit your hardware final product, you shall record a video demonstrating how it works. During the presentation, you should be able to bring it back to the lecture room and demonstrate exactly the same user experience as shown in the video. No extra marks will be given if the actual deliverable is better than what's captured in the video.

Q: Can the prototype be hosted on our local drive?

A: Your prototype should be hosted on a cloud server. Since during the presentation, all presentation materials such as visuals, videos and/or demo links in your submitted dec be pre-loaded on the lecture room's computer.

Q: What if I don't have a working prototype? (i.e., just pure ideas and drawings but following almost all your steps) How many points will be deducted?

A: Iterative Improvement and Final Prototype contribute at least 40% of the final mark, i.e., at least 40 marks out of 100 will be deducted.

Q: How many points will be deducted for late submission?

A: 40% of the points will be deducted.

Q: Does our group project have to include an AI-driven feature?

A: No, refer to Solution section. A well-reasoned decision not to use AI is scored the same as a well-reasoned decision to use it.
