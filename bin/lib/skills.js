import { execSync } from 'child_process';

export const REPOS = {
  addy: 'addyosmani/agent-skills',
  matt: 'mattpocock/skills',
};

export function fetchSkills(repo) {
  const author = repo.split('/')[0];
  const raw = execSync(`gh skill search ${author}`, { encoding: 'utf8' });

  return raw.trim().split('\n')
    .filter(line => line.startsWith(`${repo}\t`))
    .map(line => {
      const parts = line.split('\t');
      const value = parts[1] ?? '';
      const description = parts[2] ?? '';
      const hint = description.split('. ')[0].slice(0, 90);
      return { value, label: value.split('/').pop(), hint, repo };
    })
    .filter(s => s.value);
}
