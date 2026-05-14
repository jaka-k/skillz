#!/usr/bin/env bash
set -euo pipefail

# Installs a curated set of frontend-focused skills from:
#   addyosmani/agent-skills  (via gh skill install)
#   mattpocock/skills        (via gh skill install)
#
# Usage: ./packages/frontend.sh

if ! command -v gh &>/dev/null; then
  echo "error: gh CLI not found. Install from https://cli.github.com/" >&2
  exit 1
fi

if ! gh skill --help &>/dev/null 2>&1; then
  echo "error: 'gh skill' subcommand not available. Update gh to v2.92+" >&2
  exit 1
fi

# ── Addy Osmani — addyosmani/agent-skills ────────────────────────────────────
ADDY_SKILLS=(
  frontend-ui-engineering    # production-quality UI components & layouts
  performance-optimization   # Core Web Vitals, load time, profiling
  code-review-and-quality    # multi-axis review before merge
)

echo "── Addy Osmani skills ──────────────────────────────────────────────────"
for skill in "${ADDY_SKILLS[@]}"; do
  echo "  installing $skill ..."
  gh skill install addyosmani/agent-skills "$skill"
done

# ── Matt Pocock — mattpocock/skills ──────────────────────────────────────────
MATT_SKILLS=(
  engineering/tdd            # red-green-refactor, test-first development
  misc/setup-pre-commit      # Husky + lint-staged + type-check on commit
)

echo ""
echo "── Matt Pocock skills ──────────────────────────────────────────────────"
for skill in "${MATT_SKILLS[@]}"; do
  echo "  installing $skill ..."
  gh skill install mattpocock/skills "$skill"
done

echo ""
echo "Done. $(( ${#ADDY_SKILLS[@]} + ${#MATT_SKILLS[@]} )) skills installed."
