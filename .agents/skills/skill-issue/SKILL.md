---
name: skill-issue
description: >
  Find out why a coding-agent skill won't fire. Audits installed skills'
  activation metadata: grades each description A–F on whether the agent will
  reliably pick it, simulates which skill fires for a given prompt, and reports
  collisions where two skills compete and one silently never runs. Use when the
  user says "why isn't my skill firing", "skill-issue", "which skill fires for",
  "audit my skills", "my skill never triggers", "skill collisions", or after
  writing or installing a new SKILL.md.
allowed-tools: Bash(skill-issue:*)
license: MIT
compatibility: Needs the skill-issue CLI on PATH (npm i -g @misha_misha/skill-issue, or bunx @misha_misha/skill-issue).
---

# skill-issue — skill activation audit

A coding agent decides which skill to run from each skill's always-on `name` +
`description`. A skill can be perfectly implemented and still never fire because
its description is too vague to match how people phrase requests, or because it
collides with a more specific sibling. `skill-issue` audits exactly that surface.

## Run it

When installed as a plugin, `skill-issue` is already on PATH:

```bash
skill-issue ~/.claude/skills                       # grade every skill A–F (+ collisions summary)
skill-issue ~/.claude/skills --why "deploy to prod"  # which skill fires for this prompt, and why
skill-issue ~/.claude/skills --collisions          # clusters of skills that shadow each other
skill-issue ~/.claude/skills --fix                 # add a "Use when …" clause to weak descriptions
skill-issue .                                      # audit the current repo's skills/ + agents/
skill-issue ~/.claude/skills --json                # machine-readable
```

Add `--skill <name>` to `--why` to focus on one skill and see which of the
prompt's words its description is missing. Add `--llm` to judge with a local
`claude`/`codex` CLI instead of the offline heuristic.

## Interpreting output

- **lint grades**: `A` will fire on its triggers; `F` has an error (empty or
  duplicated description) and can never be told apart. `B`–`D` are graded warnings
  (no "use when" clause, too vague, too thin/heavy, restates the name).
- **--why**: skills ranked by how much of the prompt's salient, rarity-weighted
  vocabulary each covers. `← would fire` marks the winner; a small margin to #2
  means an ambiguous collision; "no skill reliably fires" means the best match is
  too weak (its description is missing the prompt's words).
- **--collisions**: each cluster lists the skills that share trigger vocabulary;
  one silently wins the shared intent and the rest never fire.

Exit code is 1 when any skill has an error-level defect, so it can gate a commit
hook.

## Scope (v1)

Heuristic, offline, conservative: only empty/duplicated descriptions are errors;
everything else is a graded warning. It does NOT yet run the real agent loop to
observe selection (the v2 replay roadmap) — it predicts from the metadata the
picker reads. If `skill-issue: command not found`, run `npx @misha_misha/skill-issue <dir>`
or install with `npm i -g @misha_misha/skill-issue`.
