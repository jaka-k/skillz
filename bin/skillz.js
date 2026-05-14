#!/usr/bin/env node
import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import { appendFileSync } from 'fs';
import { join } from 'path';

const ADDY = [
  { value: 'frontend-ui-engineering',  label: 'frontend-ui-engineering',  hint: 'Building or modifying any user-facing component, layout, or interaction' },
  { value: 'performance-optimization', label: 'performance-optimization', hint: 'Core Web Vitals are degraded or a profiler flags a bottleneck' },
  { value: 'code-review-and-quality',  label: 'code-review-and-quality',  hint: 'Before any merge — run over your own output too, not just human code' },
  { value: 'code-simplification',      label: 'code-simplification',      hint: 'Code works but is harder to read than it should be' },
  { value: 'spec-driven-development',  label: 'spec-driven-development',  hint: 'Starting a feature with no specification yet' },
  { value: 'api-and-interface-design', label: 'api-and-interface-design', hint: 'Designing REST/GraphQL endpoints or module boundaries' },
  { value: 'ci-cd-and-automation',     label: 'ci-cd-and-automation',     hint: 'Setting up or modifying build and deployment pipelines' },
  { value: 'security-and-hardening',   label: 'security-and-hardening',   hint: 'Handling user input, auth, data storage, or external integrations' },
  { value: 'documentation-and-adrs',   label: 'documentation-and-adrs',   hint: 'Making architectural decisions or changing public APIs' },
  { value: 'shipping-and-launch',      label: 'shipping-and-launch',      hint: 'Preparing a production deploy or rollout strategy' },
  { value: 'context-engineering',      label: 'context-engineering',      hint: 'Starting a new session or agent output quality has degraded' },
  { value: 'doubt-driven-development', label: 'doubt-driven-development', hint: 'High-stakes or security-sensitive logic that needs adversarial review' },
  { value: 'idea-refine',              label: 'idea-refine',              hint: 'Idea is vague and needs stress-testing before planning' },
  { value: 'interview-me',             label: 'interview-me',             hint: 'Ask is underspecified — extract what you actually want' },
  { value: 'using-agent-skills',       label: 'using-agent-skills',       hint: 'Discover which skill applies to the current task' },
];

const MATT = [
  { value: 'engineering/tdd',             label: 'tdd',             hint: 'Starting a feature or fix — write the failing test first' },
  { value: 'engineering/diagnose',        label: 'diagnose',        hint: 'Disciplined debug loop: reproduce → minimise → fix → regress' },
  { value: 'engineering/prototype',       label: 'prototype',       hint: 'Throwaway prototype before committing to a design' },
  { value: 'engineering/to-prd',          label: 'to-prd',          hint: 'Turn conversation context into a PRD on the issue tracker' },
  { value: 'engineering/to-issues',       label: 'to-issues',       hint: 'Break a plan or PRD into independently-grabbable issues' },
  { value: 'engineering/triage',          label: 'triage',          hint: 'Incoming bugs or feature requests need workflow management' },
  { value: 'engineering/zoom-out',        label: 'zoom-out',        hint: 'Unfamiliar code section — need broader context or bigger picture' },
  { value: 'misc/setup-pre-commit',       label: 'setup-pre-commit', hint: 'Husky / lint-staged / type-checking on commit is missing' },
  { value: 'misc/scaffold-exercises',     label: 'scaffold-exercises', hint: 'Set up a new course section with problems and solutions' },
  { value: 'misc/migrate-to-shoehorn',    label: 'migrate-to-shoehorn', hint: 'Replace `as` type assertions in tests with shoehorn' },
];

function generateAgentsMd(addySkills, mattSkills) {
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

function installSkill(repo, skill) {
  execSync(`gh skill install ${repo} ${skill}`, { stdio: 'inherit' });
}

async function main() {
  p.intro('@jaka-k/skillz');

  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch {
    p.cancel('gh CLI not found — install from https://cli.github.com/');
    process.exit(1);
  }

  const addy = await p.multiselect({
    message: 'Addy Osmani — addyosmani/agent-skills',
    options: ADDY,
    required: false,
  });
  if (p.isCancel(addy)) { p.cancel(); process.exit(0); }

  const matt = await p.multiselect({
    message: 'Matt Pocock — mattpocock/skills',
    options: MATT,
    required: false,
  });
  if (p.isCancel(matt)) { p.cancel(); process.exit(0); }

  const total = addy.length + matt.length;
  if (total === 0) {
    p.outro('No skills selected. Nothing to install.');
    process.exit(0);
  }

  const injectMd = await p.confirm({
    message: 'Append skills block to AGENTS.md in this directory?',
    initialValue: true,
  });
  if (p.isCancel(injectMd)) { p.cancel(); process.exit(0); }

  const spinner = p.spinner();

  for (const skill of addy) {
    spinner.start(`Installing ${skill}`);
    installSkill('addyosmani/agent-skills', skill);
    spinner.stop(`Installed ${skill}`);
  }

  for (const skill of matt) {
    spinner.start(`Installing ${skill}`);
    installSkill('mattpocock/skills', skill);
    spinner.stop(`Installed ${skill}`);
  }

  if (injectMd) {
    appendFileSync(join(process.cwd(), 'AGENTS.md'), generateAgentsMd(addy, matt));
    p.log.success('Appended skills block to AGENTS.md');
  }

  p.outro(`${total} skill${total === 1 ? '' : 's'} installed.`);
}

main().catch(err => {
  p.cancel(err.message);
  process.exit(1);
});
