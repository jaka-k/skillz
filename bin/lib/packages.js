export const PACKAGES = [
  {
    value: 'frontend',
    label: 'Frontend',
    description: 'UI engineering, performance, code review, TDD, pre-commit',
    addy: ['frontend-ui-engineering', 'performance-optimization', 'code-review-and-quality'],
    matt: ['engineering/tdd', 'misc/setup-pre-commit'],
  },
  {
    value: 'backend',
    label: 'Backend',
    description: 'API design, security, CI/CD, code review, TDD, diagnostics',
    addy: ['api-and-interface-design', 'security-and-hardening', 'ci-cd-and-automation', 'code-review-and-quality'],
    matt: ['engineering/tdd', 'engineering/diagnose'],
  },
  {
    value: 'code_design',
    label: 'Code Design',
    description: 'Spec, ADRs, doubt-driven review, PRD, prototyping',
    addy: ['spec-driven-development', 'documentation-and-adrs', 'doubt-driven-development', 'idea-refine'],
    matt: ['engineering/to-prd', 'engineering/prototype'],
  },
];

export function checkAvailability(pkg, addyOptions, mattOptions) {
  const total = pkg.addy.length + pkg.matt.length;
  const found =
    pkg.addy.filter(v => addyOptions.some(o => o.value === v)).length +
    pkg.matt.filter(v => mattOptions.some(o => o.value === v)).length;
  return { total, found, ok: found === total };
}

export function resolvePackageSkills(pkg, addyOptions, mattOptions) {
  const addy = pkg.addy.map(v => addyOptions.find(o => o.value === v)).filter(Boolean);
  const matt = pkg.matt.map(v => mattOptions.find(o => o.value === v)).filter(Boolean);
  return { addy, matt };
}
