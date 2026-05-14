import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export function assertGh() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch {
    throw new Error('gh CLI not found — install from https://cli.github.com/');
  }
}

export function installSkill(repo, skill, { scope = 'project' } = {}) {
  const base = scope === 'user' ? homedir() : process.cwd();
  const slug = skill.split('/').pop();
  if (existsSync(join(base, '.claude', 'skills', slug, 'SKILL.md'))) {
    return 'already-installed';
  }

  try {
    execSync(
      `gh skill install ${repo} ${skill} --agent claude-code --scope ${scope} --allow-hidden-dirs`,
      { stdio: 'pipe' },
    );
    return 'installed';
  } catch (err) {
    if (err.stdout?.toString().includes('already installed')) return 'already-installed';
    throw err;
  }
}
