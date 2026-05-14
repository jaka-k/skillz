import { execSync } from 'child_process';

export function assertGh() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch {
    throw new Error('gh CLI not found — install from https://cli.github.com/');
  }
}

export function installSkill(repo, skill) {
  execSync(`gh skill install ${repo} ${skill}`, { stdio: 'inherit' });
}
