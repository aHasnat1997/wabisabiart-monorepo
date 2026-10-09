---
name: agent-customization-skill
summary: "Guides developers through creating or fixing VS Code GitHub Copilot agent customization files in this repo."
description: "Use when you want to create/update/validate workspace-level agent customizations: SKILL.md, .instructions.md, .prompt.md, .agent.md, hooks, and AGENTS.md. Includes checklist and sample snippets."
---

# agent-customization-skill

## Goal
Perform consistent agent customization in this repository by generating or debugging Copilot/VS Code config files.

## Usage
1. Open chat with Copilot Chat.
2. Type a command like:
   - `/create-skill NewFeature` (or ask: "Create a Skill for <purpose>")
   - `Help me create a SKILL.md to manage the seller-dashboard journaling workflow`
3. Apply the generated file and test by requesting the agent to follow it.

## What this skill does
- Defines scope (workspace vs user)
- Picks primitive file type (skill, prompt, instruction, agent, hook)
- Creates YAML frontmatter with `name`, `description`, `applyTo` (as needed)
- Adds clear: "Use when..." and explicit trigger phrases
- Verifies basic syntax and file path

## Minimal template
```markdown
---
name: <skill-name>
description: "Use when ... key phrase ..."
---

# <skill-title>

## Steps
1. ...
```

## Quick checklist
- [ ] path exists (`.github/skills/` preferred)
- [ ] `---` YAML frontmatter valid
- [ ] `description` includes search triggers
- [ ] should not use `applyTo: "**"` without need

## Common follow-up prompts
- "Adjust this skill for TypeScript folder rules only"
- "Add `prettier` hook to this skill"
- "Convert into `.instructions.md` file for all files under `app/seller-dashboard`"
