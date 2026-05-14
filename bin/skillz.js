#!/usr/bin/env node
import * as p from '@clack/prompts';
import { ADDY, MATT } from './lib/skills.js';
import { assertGh, installSkill } from './lib/install.js';
import { detectStructure, scaffold } from './lib/detect.js';
import { appendAgentsMd } from './lib/agents-md.js';

async function main() {
  p.intro('@jaka-k/skillz');

  assertGh();

  const cwd = process.cwd();

  const mode = await p.select({
    message: 'How are you setting up?',
    options: [
      { value: 'scratch',  label: 'Starting from scratch', hint: 'creates .agents/ and AGENTS.md' },
      { value: 'existing', label: 'Existing project',      hint: 'detects .claude/ and .agents/ structure' },
    ],
  });
  if (p.isCancel(mode)) { p.cancel(); process.exit(0); }

  if (mode === 'scratch') {
    const { createdDir, createdMd } = scaffold(cwd);
    if (createdDir) p.log.success('Created .agents/');
    else            p.log.warn('.agents/ already exists, skipping');
    if (createdMd)  p.log.success('Created AGENTS.md');
    else            p.log.warn('AGENTS.md already exists, skipping');
  } else {
    const { dirs, files } = detectStructure(cwd);
    if (dirs.length === 0 && files.length === 0) {
      p.log.warn('Nothing detected — no .claude/, .agents/, AGENTS.md or CLAUDE.md found');
    } else {
      if (dirs.length)  p.log.info(`Directories: ${dirs.map(d => `${d}/`).join('  ')}`);
      if (files.length) p.log.info(`Files:       ${files.join('  ')}`);
    }
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
    message: 'Append skills block to AGENTS.md?',
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
    appendAgentsMd(cwd, addy, matt);
    p.log.success('Appended skills block to AGENTS.md');
  }

  p.outro(`${total} skill${total === 1 ? '' : 's'} installed.`);
}

main().catch(err => {
  p.cancel(err.message);
  process.exit(1);
});
