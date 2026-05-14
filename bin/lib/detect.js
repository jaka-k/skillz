import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export function detectStructure(cwd) {
  const dirs  = ['.claude', '.agents'].filter(d => existsSync(join(cwd, d)));
  const files = ['AGENTS.md', 'CLAUDE.md'].filter(f => existsSync(join(cwd, f)));
  return { dirs, files };
}

export function scaffold(cwd) {
  const results = { createdDir: false, createdMd: false };

  const agentsDir = join(cwd, '.agents');
  if (!existsSync(agentsDir)) {
    mkdirSync(agentsDir, { recursive: true });
    results.createdDir = true;
  }

  const agentsMd = join(cwd, 'AGENTS.md');
  if (!existsSync(agentsMd)) {
    writeFileSync(agentsMd, '# Agent Guidelines\n');
    results.createdMd = true;
  }

  return results;
}
