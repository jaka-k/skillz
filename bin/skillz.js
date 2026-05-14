#!/usr/bin/env node
import * as p from '@clack/prompts';
import { homedir } from 'os';
import { REPOS, fetchSkills } from './lib/skills.js';
import { assertGh, installSkill } from './lib/install.js';
import { detectStructure, scaffold } from './lib/detect.js';
import { appendAgentsMd } from './lib/agents-md.js';
import { PACKAGES, checkAvailability, resolvePackageSkills } from './lib/packages.js';

async function main() {
  p.intro('@jaka-k/skillz');

  assertGh();

  // ── Step 1: scope ────────────────────────────────────────────────────────
  const scope = await p.select({
    message: 'Where do you want to install skills?',
    options: [
      { value: 'local',  label: 'Local',  hint: 'current project — .agents/ and AGENTS.md' },
      { value: 'global', label: 'Global', hint: 'available across all projects' },
    ],
  });
  if (p.isCancel(scope)) { p.cancel(); process.exit(0); }

  const ghScope = scope === 'local' ? 'project' : 'user';

  let targetDir;

  if (scope === 'local') {
    targetDir = process.cwd();

    const mode = await p.select({
      message: 'How are you setting up?',
      options: [
        { value: 'scratch',  label: 'Starting from scratch', hint: 'creates .agents/ and AGENTS.md' },
        { value: 'existing', label: 'Existing project',      hint: 'detects .claude/ and .agents/ structure' },
      ],
    });
    if (p.isCancel(mode)) { p.cancel(); process.exit(0); }

    if (mode === 'scratch') {
      const { createdDir, createdMd } = scaffold(targetDir);
      if (createdDir) p.log.success('Created .agents/');
      else            p.log.warn('.agents/ already exists, skipping');
      if (createdMd)  p.log.success('Created AGENTS.md');
      else            p.log.warn('AGENTS.md already exists, skipping');
    } else {
      const { dirs, files } = detectStructure(targetDir);
      if (dirs.length === 0 && files.length === 0) {
        p.log.warn('Nothing detected — no .claude/, .agents/, AGENTS.md or CLAUDE.md found');
      } else {
        if (dirs.length)  p.log.info(`Directories: ${dirs.map(d => `${d}/`).join('  ')}`);
        if (files.length) p.log.info(`Files:       ${files.join('  ')}`);
      }
    }
  } else {
    const target = await p.select({
      message: 'Installation target',
      options: [
        { value: 'generic', label: 'Generic', hint: '~/.agents/ and ~/AGENTS.md' },
        { value: 'vendor',  label: 'Vendor',  hint: '.claude/ and others — coming soon', disabled: true },
      ],
    });
    if (p.isCancel(target)) { p.cancel(); process.exit(0); }

    targetDir = homedir();
    const { createdDir, createdMd } = scaffold(targetDir);
    if (createdDir) p.log.success(`Created ${targetDir}/.agents/`);
    else            p.log.info(`${targetDir}/.agents/ already exists`);
    if (createdMd)  p.log.success(`Created ${targetDir}/AGENTS.md`);
    else            p.log.info(`${targetDir}/AGENTS.md already exists`);
  }

  // ── Step 2: fetch available skills ───────────────────────────────────────
  const fetchSpinner = p.spinner();
  fetchSpinner.start('Fetching available skills...');
  let addyOptions, mattOptions;
  try {
    [addyOptions, mattOptions] = await Promise.all([
      fetchSkills(REPOS.addy),
      fetchSkills(REPOS.matt),
    ]);
    fetchSpinner.stop(`Fetched ${addyOptions.length + mattOptions.length} skills`);
  } catch (err) {
    fetchSpinner.stop('Failed to fetch skills');
    p.cancel(err.message);
    process.exit(1);
  }

  // ── Step 3: packages or manual ───────────────────────────────────────────
  const selectionMode = await p.select({
    message: 'How do you want to pick skills?',
    options: [
      { value: 'packages', label: 'Install a package',  hint: 'curated combos for common setups' },
      { value: 'manual',   label: 'Manual selection',   hint: 'pick individual skills from both repos' },
    ],
  });
  if (p.isCancel(selectionMode)) { p.cancel(); process.exit(0); }

  let addyToInstall = [];
  let mattToInstall = [];

  if (selectionMode === 'packages') {
    const packageOptions = PACKAGES.map(pkg => {
      const { total, found, ok } = checkAvailability(pkg, addyOptions, mattOptions);
      const status = ok ? '✓' : `⚠ ${found}/${total}`;
      return {
        value: pkg.value,
        label: `${status}  ${pkg.label}`,
        hint: pkg.description,
      };
    });

    const selectedPackages = await p.multiselect({
      message: 'Select packages to install',
      options: packageOptions,
      required: true,
    });
    if (p.isCancel(selectedPackages)) { p.cancel(); process.exit(0); }

    const seen = new Set();
    for (const pkgValue of selectedPackages) {
      const pkg = PACKAGES.find(p => p.value === pkgValue);
      const { addy, matt } = resolvePackageSkills(pkg, addyOptions, mattOptions);
      for (const s of addy) {
        if (!seen.has(s.value)) { addyToInstall.push(s); seen.add(s.value); }
      }
      for (const s of matt) {
        if (!seen.has(s.value)) { mattToInstall.push(s); seen.add(s.value); }
      }
    }
  } else {
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

    addyToInstall = addySelected.map(v => addyOptions.find(s => s.value === v));
    mattToInstall = mattSelected.map(v => mattOptions.find(s => s.value === v));
  }

  const total = addyToInstall.length + mattToInstall.length;
  if (total === 0) {
    p.outro('No skills selected. Nothing to install.');
    process.exit(0);
  }

  // ── Step 4: inject AGENTS.md ─────────────────────────────────────────────
  const injectMd = await p.confirm({
    message: 'Append skills block to AGENTS.md?',
    initialValue: true,
  });
  if (p.isCancel(injectMd)) { p.cancel(); process.exit(0); }

  // ── Step 5: install ──────────────────────────────────────────────────────
  const installSpinner = p.spinner();

  for (const skill of addyToInstall) {
    installSpinner.start(`Installing ${skill.value}`);
    const r1 = installSkill(REPOS.addy, skill.value, { scope: ghScope });
    installSpinner.stop(r1 === 'already-installed' ? `Already installed ${skill.value}` : `Installed ${skill.value}`);
  }

  for (const skill of mattToInstall) {
    installSpinner.start(`Installing ${skill.value}`);
    const r2 = installSkill(REPOS.matt, skill.value, { scope: ghScope });
    installSpinner.stop(r2 === 'already-installed' ? `Already installed ${skill.value}` : `Installed ${skill.value}`);
  }

  if (injectMd) {
    appendAgentsMd(targetDir, addyToInstall, mattToInstall);
    p.log.success('Appended skills block to AGENTS.md');
  }

  p.outro(`${total} skill${total === 1 ? '' : 's'} installed.`);
}

main().catch(err => {
  p.cancel(err.message);
  process.exit(1);
});
