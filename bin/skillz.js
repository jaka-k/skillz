#!/usr/bin/env node
import * as p from '@clack/prompts';
import { REPOS, fetchSkills } from './lib/skills.js';
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

  const spinner = p.spinner();
  spinner.start('Fetching available skills...');
  let addyOptions, mattOptions;
  try {
    addyOptions = fetchSkills(REPOS.addy);
    mattOptions = fetchSkills(REPOS.matt);
    spinner.stop(`Fetched ${addyOptions.length + mattOptions.length} skills`);
  } catch (err) {
    spinner.stop('Failed to fetch skills');
    p.cancel(err.message);
    process.exit(1);
  }

  const addySelected = await p.multiselect({
    message: 'Addy Osmani — addyosmani/agent-skills',
    options: addyOptions,
    required: false,
  });
  if (p.isCancel(addySelected)) { p.cancel(); process.exit(0); }

  const mattSelected = await p.multiselect({
    message: 'Matt Pocock — mattpocock/skills',
    options: mattOptions,
    required: false,
  });
  if (p.isCancel(mattSelected)) { p.cancel(); process.exit(0); }

  const total = addySelected.length + mattSelected.length;
  if (total === 0) {
    p.outro('No skills selected. Nothing to install.');
    process.exit(0);
  }

  const injectMd = await p.confirm({
    message: 'Append skills block to AGENTS.md?',
    initialValue: true,
  });
  if (p.isCancel(injectMd)) { p.cancel(); process.exit(0); }

  const installSpinner = p.spinner();

  for (const value of addySelected) {
    installSpinner.start(`Installing ${value}`);
    installSkill(REPOS.addy, value);
    installSpinner.stop(`Installed ${value}`);
  }

  for (const value of mattSelected) {
    installSpinner.start(`Installing ${value}`);
    installSkill(REPOS.matt, value);
    installSpinner.stop(`Installed ${value}`);
  }

  if (injectMd) {
    const addy = addySelected.map(v => addyOptions.find(s => s.value === v));
    const matt = mattSelected.map(v => mattOptions.find(s => s.value === v));
    appendAgentsMd(cwd, addy, matt);
    p.log.success('Appended skills block to AGENTS.md');
  }

  p.outro(`${total} skill${total === 1 ? '' : 's'} installed.`);
}

main().catch(err => {
  p.cancel(err.message);
  process.exit(1);
});
