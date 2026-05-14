# Agent Guidelines

## Skills

This project uses a curated set of agent skills installed via `gh skill install`.
Invoke them at the right moment — don't apply them speculatively.

| Skill | Source | Invoke when |
|---|---|---|
| `frontend-ui-engineering` | addyosmani/agent-skills | Building or modifying any user-facing component, layout, or interaction |
| `performance-optimization` | addyosmani/agent-skills | Core Web Vitals are degraded, a build flag changes bundle size, or a profiler flags a bottleneck |
| `code-review-and-quality` | addyosmani/agent-skills | Before any merge — run this over your own output, not just human-written code |
| `engineering/tdd` | mattpocock/skills | Starting a new feature or fixing a bug — write the failing test first, then the implementation |
| `misc/setup-pre-commit` | mattpocock/skills | Initialising a repo or when Husky / lint-staged / type-checking on commit is missing |

### Usage

```
/skill:frontend-ui-engineering
/skill:performance-optimization
/skill:code-review-and-quality
/skill:tdd
/skill:setup-pre-commit
```

### Rules

- **`code-review-and-quality` is not optional.** Run it before marking any task complete.
- **`engineering/tdd` is the default for new features.** Only skip it for pure config or one-liner fixes.
- Do not chain multiple skills in a single turn — complete one before starting the next.
