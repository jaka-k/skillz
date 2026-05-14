# @jaka-k/skillz

Interactive CLI to install curated [Claude Code](https://claude.ai/code) agent skills from [Addy Osmani](https://github.com/addyosmani/agent-skills) and [Matt Pocock](https://github.com/mattpocock/skills) into your project.

## Requirements

- Node 18+
- [gh CLI](https://cli.github.com/) v2.92+, authenticated with `gh auth login`

## Usage

Run directly with npx — no install needed:

```bash
npx @jaka-k/skillz
```

The CLI will:

1. Present a multi-select list of Addy Osmani's skills
2. Present a multi-select list of Matt Pocock's skills
3. Run `gh skill install` for each selection
4. Optionally append a skills usage block to `AGENTS.md` in the current directory

## Available skills

**Addy Osmani** (`addyosmani/agent-skills`)

| Skill | When to use |
|---|---|
| `frontend-ui-engineering` | Building or modifying user-facing components |
| `performance-optimization` | Core Web Vitals degraded or profiler flags a bottleneck |
| `code-review-and-quality` | Before any merge |
| `code-simplification` | Code works but is harder to read than it should be |
| `spec-driven-development` | Starting a feature with no specification yet |
| `api-and-interface-design` | Designing REST/GraphQL endpoints or module boundaries |
| `ci-cd-and-automation` | Setting up or modifying build and deployment pipelines |
| `security-and-hardening` | Handling user input, auth, or external integrations |
| `documentation-and-adrs` | Making architectural decisions or changing public APIs |
| `shipping-and-launch` | Preparing a production deploy or rollout strategy |
| `context-engineering` | Starting a new session or agent output quality has degraded |
| `doubt-driven-development` | High-stakes logic that needs adversarial review |
| `idea-refine` | Idea is vague and needs stress-testing before planning |
| `interview-me` | Ask is underspecified — extract what you actually want |
| `using-agent-skills` | Discover which skill applies to the current task |

**Matt Pocock** (`mattpocock/skills`)

| Skill | When to use |
|---|---|
| `engineering/tdd` | Starting a feature or fix — write the failing test first |
| `engineering/diagnose` | Disciplined debug loop: reproduce → minimise → fix → regress |
| `engineering/prototype` | Throwaway prototype before committing to a design |
| `engineering/to-prd` | Turn conversation context into a PRD on the issue tracker |
| `engineering/to-issues` | Break a plan or PRD into independently-grabbable issues |
| `engineering/triage` | Incoming bugs or feature requests need workflow management |
| `engineering/zoom-out` | Unfamiliar code — need broader context or bigger picture |
| `misc/setup-pre-commit` | Husky / lint-staged / type-checking on commit is missing |
| `misc/scaffold-exercises` | Set up a new course section with problems and solutions |
| `misc/migrate-to-shoehorn` | Replace `as` type assertions in tests with shoehorn |

## Scripts

The `packages/` and `main/` directories contain standalone bash scripts if you prefer not to use the interactive CLI.

```bash
# Install a preset frontend skill bundle
./packages/frontend.sh

# Append skills usage block to AGENTS.md
./packages/inject-agents-md.sh [target-dir]

# Install all skills from a single author
./main/addy-osmani.sh [target-dir]
./main/matt-pocock.sh [target-dir]
```
