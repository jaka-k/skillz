#!/usr/bin/env bash
set -euo pipefail

# Installs Addy Osmani's agent-skills into a target project's .claude/commands/
# Usage: ./addy-osmani.sh [target-dir]
#   target-dir defaults to the current working directory

TARGET_DIR="${1:-.}"
COMMANDS_DIR="$TARGET_DIR/.claude/commands"

if ! command -v gh &>/dev/null; then
  echo "error: gh CLI not found. Install from https://cli.github.com/" >&2
  exit 1
fi

echo "Installing Addy Osmani's agent-skills into $COMMANDS_DIR ..."

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

gh repo clone addyosmani/agent-skills "$TMPDIR/agent-skills" -- --depth=1 --quiet

mkdir -p "$COMMANDS_DIR"
cp "$TMPDIR/agent-skills/.claude/commands/"*.md "$COMMANDS_DIR/"

echo "Done. Skills installed:"
ls "$COMMANDS_DIR/"
