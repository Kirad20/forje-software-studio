# Third-party notices

The folders next to this file are skills copied from open-source projects, exactly as published
(SKILL.md, references, scripts, data and assets), under their original licenses. **No file from
upstream was modified.** Each folder keeps its LICENSE (for those whose license file lives at the
repository root, Forja added a copy named `LICENSE`, and for Impeccable also its `NOTICE.md`).

Forja only reads their text. SKILL.md and every other `.md` file become "parts" an agent can load
with `load_skill`, and Forja prepends a note when it serves them saying that its agents have no
shell, so the scripts, launchers and network tools they mention are not available. The scripts and
data stay on disk untouched and are never executed by Forja.

| Folder | Source | Commit | License |
|---|---|---|---|
| `frontend-design/` | Anthropic, [anthropics/skills](https://github.com/anthropics/skills), `skills/frontend-design` | `ca45fc4` | Apache-2.0 |
| `impeccable/` | Paul Bakaus, [pbakaus/impeccable](https://github.com/pbakaus/impeccable), `plugin/skills/impeccable` | `9fadc41` | Apache-2.0 |
| `hallmark/` | [Nutlope/hallmark](https://github.com/Nutlope/hallmark), `skills/hallmark` | `4f6a46c` | MIT |
| `taste-skill/` | Leonxlnx, [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), `skills/taste-skill` | `12af471` | MIT |
| `ui-ux-pro-max/` | Next Level Builder, [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), `.claude/skills/ui-ux-pro-max` | `713eef5` | MIT |
| `web-design-guidelines/` | Vercel Labs, [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) (repository root) | `434b7f9` | MIT |

Two things to know:

- `web-design-guidelines/SKILL.md` is written by Forja. Vercel's own `web-design-guidelines` skill
  (in `vercel-labs/agent-skills`) has no license file and only tells the agent to fetch the rules
  from a URL, so it was not copied; the rules come from the MIT-licensed guidelines repository.
- `impeccable/scripts/impeccable` is Impeccable's launcher. When someone runs it, it downloads a
  native binary from the project's GitHub releases and checks it against `engine-checksums.txt`.
  Forja never runs it; it is here only because the skill is copied whole.
