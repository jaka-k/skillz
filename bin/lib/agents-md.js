import { appendFileSync } from 'fs';
import { join } from 'path';

export function generateAgentsMd(addySkills, mattSkills) {
  const rows = [
    ...addySkills.map(s => `| \`${s.value}\` | addyosmani/agent-skills | ${s.hint} |`),
    ...mattSkills.map(s => `| \`${s.value}\` | mattpocock/skills | ${s.hint} |`),
  ];

  const invocations = [
    ...addySkills.map(s => `/skill:${s.label}`),
    ...mattSkills.map(s => `/skill:${s.label}`),
  ];

  return `
## Skills

This project uses a curated set of agent skills installed via \`gh skill install\`.
Invoke them at the right moment — don't apply them speculatively.

| Skill | Source | Invoke when |
|---|---|---|
${rows.join('\n')}

### Usage

\`\`\`
${invocations.join('\n')}
\`\`\`

### Rules

- **\`code-review-and-quality\` is not optional.** Run it before marking any task complete.
- **\`engineering/tdd\` is the default for new features.** Only skip it for pure config or one-liner fixes.
- Do not chain multiple skills in a single turn — complete one before starting the next.
`;
}

export function appendAgentsMd(cwd, addySkills, mattSkills) {
  appendFileSync(join(cwd, 'AGENTS.md'), generateAgentsMd(addySkills, mattSkills));
}
