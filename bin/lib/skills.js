import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const REPOS = {
  addy: 'addyosmani/agent-skills',
  matt: 'mattpocock/skills',
};

export async function fetchSkills(repo) {
  const author = repo.split('/')[0];
  const { stdout } = await execAsync(`gh skill search ${author}`);

  return stdout.trim().split('\n')
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
