import { appendFileSync } from 'fs';
import { join } from 'path';
import { ADDY, MATT } from './skills.js';

export function generateAgentsMd(addySkills, mattSkills) {
  const rows = [
    ...addySkills.map(v => {
      const d = ADDY.find(s => s.value === v);
      return `| \`${v}\` | addyosmani/agent-skills | ${d.hint} |`;
    }),
    ...mattSkills.map(v => {
      const d = MATT.find(s => s.value === v);
      return `| \`${v}\` | mattpocock/skills | ${d.hint} |`;
    }),
  ];

  const invocations = [
    ...addySkills.map(v => `/skill:${v}`),
    ...mattSkills.map(v => `/skill:${MATT.find(s => s.value === v).label}`),
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
