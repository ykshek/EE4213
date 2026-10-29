---
name: interaction-design
description: Use when shaping information architecture, task flows, interface behavior, or prototypes. Focuses on human capabilities, usability, accessibility, and testable end-to-end interactions.
---

# Interaction design

Use this workflow to turn a framed user need into an interaction people can understand, complete, and recover from.

## Workflow

1. **Start from the user task.** Define the user's goal, starting point, expected outcome, and relevant context. Map the primary flow and important alternate, error, and recovery paths before polishing screens.
2. **Make the structure understandable.** Use familiar concepts and labels, match the user's mental model, and group related information. Prefer recognition over recall; chunk complex information and avoid unnecessary choices or memory demands.
3. **Choose fidelity to answer a question.** Sketch or wireframe early to compare structure and flow cheaply. Increase visual and interaction fidelity when testing content, hierarchy, timing, feedback, or a realistic end-to-end workflow. Make clear what is simulated.
4. **Design visible interaction states.** Show system status after user actions; provide clear affordances, validation, useful error messages, undo or recovery where appropriate, and consistent navigation. Keep the user in control.
5. **Review usability systematically.** Check visibility of system status, match to the real world, user control, consistency, error prevention and recovery, recognition, flexibility, minimalist presentation, and useful help. Also look for dark patterns that obscure information or constrain meaningful choice.
6. **Account for human capabilities.** Consider attention, perception, working memory, motor precision, and varied experience. Use hierarchy and grouping to reduce cognitive load; do not rely on color alone to convey meaning.
7. **Design for access and different contexts.** Use semantic structure, keyboard operation, visible focus, readable contrast, clear labels, adequate touch targets, responsive layouts, and accessible names for dynamic updates. Use the project's localization conventions when applicable.
8. **Test a complete journey.** Ensure the prototype supports the intended task from entry to a meaningful result, including relevant feedback and recovery—not just a collection of attractive screens.

## Design review

For each key screen or state, record the user goal, important decision, visible system response, possible error/recovery, and accessibility considerations. Link design choices to the problem framing and define what a prototype test should reveal.

## Quality checks

- Labels and controls communicate what they do before users act.
- Important outcomes and changes of state are perceivable.
- The primary workflow can be completed without hidden steps or unexplained dead ends.
- Errors explain the problem and the next action in plain language.
- Users can review, correct, cancel, or recover from consequential actions.
- Accessibility and responsiveness are considered throughout, not only at final polish.
