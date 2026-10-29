---
name: human-ai-interaction
description: Use when deciding whether to include AI or designing an AI-assisted interaction, including user expectations, uncertainty, human oversight, recovery, and lifecycle review.
---

# Human-AI interaction

Use this workflow to make AI behavior understandable and controllable. AI is optional: choose a simpler non-AI design when it serves users better.

## Workflow

1. **Establish the need for AI.** Identify the user problem and the capability AI would add. Compare with a deterministic or human-led alternative. Do not add AI solely to make a product appear innovative.
2. **Define the boundary.** State what the AI may recommend, generate, classify, or do; what it must not decide or do; what requires user confirmation; and who remains accountable for the final outcome.
3. **Choose the interaction pattern.** Decide whether the AI assists on request, offers suggestions, collaborates iteratively, or takes a bounded action. Match autonomy to consequence, reversibility, and confidence.
4. **Set expectations before use.** Explain the AI's relevant capabilities and limitations in context. Do not imply that outputs are verified, complete, or authoritative when they are not.
5. **Support informed use during interaction.** Make AI output identifiable, provide useful provenance or rationale where it helps the decision, communicate uncertainty appropriately, and offer alternatives or ways to refine the request. Avoid unsupported precision or confidence signals.
6. **Plan for errors and uncertainty.** Define low-confidence, missing-input, unavailable-service, and incorrect-output states. Provide safe fallback behavior, user correction, retry or escalation paths, and an easy way to stop or undo actions.
7. **Keep humans meaningfully in control.** For consequential decisions, require review and confirmation before action. Make it possible to inspect, edit, reject, or override output; do not create an approval flow that merely rubber-stamps an automated decision.
8. **Review across the lifecycle.** At onboarding, check whether users understand the AI's role. During use, check output clarity and controls. When errors occur, check notice and recovery. Over time, check whether behavior, user expectations, and reliance remain appropriate.
9. **Evaluate the interaction, not only model output.** Test whether users recognize AI output, calibrate trust, catch errors, recover, and retain agency. Record the reasoning for using AI or for deliberately not using it.

## Human-oversight record

Document the user need, AI capability, interaction pattern, input/output, allowed and prohibited actions, human review point, uncertainty communication, failure recovery, and evidence used to validate the boundary.

## Quality checks

- AI use creates a clear user benefit compared with a simpler alternative.
- Users can tell when AI is involved and understand what it can and cannot do.
- Users retain appropriate control; high-impact actions are not silently automated.
- Uncertainty and limitations are handled honestly, with actionable recovery.
- The design avoids manipulative defaults, false confidence, and unreviewable output.
