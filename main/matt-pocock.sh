#!/usr/bin/env bash
set -euo pipefail

# Installs Matt Pocock's skills into a target project's .claude/commands/
# Usage: ./matt-pocock.sh [target-dir]
#   target-dir defaults to the current working directory
#
# By default installs skills from: engineering/, productivity/, misc/
# Set SKILL_CATEGORIES env var to override (space-separated list)

TARGET_DIR="${1:-.}"
COMMANDS_DIR="$TARGET_DIR/.claude/commands"
SKILL_CATEGORIES="${SKILL_CATEGORIES:-engineering productivity misc}"

if ! command -v gh &>/dev/null; then
  echo "error: gh CLI not found. Install from https://cli.github.com/" >&2
  exit 1
fi

echo "Installing Matt Pocock's skills into $COMMANDS_DIR ..."

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

gh repo clone mattpocock/skills "$TMPDIR/skills" -- --depth=1 --quiet

mkdir -p "$COMMANDS_DIR"

count=0
for category in $SKILL_CATEGORIES; do
  src="$TMPDIR/skills/skills/$category"
  if [[ ! -d "$src" ]]; then
    echo "warning: category '$category' not found in repo, skipping" >&2
    continue
  fi
  for skill_dir in "$src"/*/; do
    skill_file="$skill_dir/SKILL.md"
    if [[ -f "$skill_file" ]]; then
      slug="$(basename "$skill_dir")"
      cp "$skill_file" "$COMMANDS_DIR/$slug.md"
      count=$((count + 1))
    fi
  done
done

echo "Done. $count skill(s) installed into $COMMANDS_DIR"
