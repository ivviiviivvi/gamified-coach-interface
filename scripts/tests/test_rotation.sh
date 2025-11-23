#!/usr/bin/env bash
set -euo pipefail

# Test rotation logic for manage_vscode_extensions.sh
# This script creates dummy backup dirs in a temp HOME and runs the rotation

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SCRIPT="$SCRIPT_DIR/manage_vscode_extensions.sh"

TMP_HOME=$(mktemp -d)
export HOME="$TMP_HOME"

cleanup() {
  rm -rf "$TMP_HOME"
}
trap cleanup EXIT

# create 8 dummy backups with timestamps in names to simulate history
for i in {1..8}; do
  # create timestamps increasing lexically by adding leading zeros
  ts=$(printf "202501%02d_000000" "$i")
  d="$HOME/.vscode_extensions_backup_${ts}"
  mkdir -p "$d"
  echo "dummy-$i" > "$d/README"
  # set mtime so sort by name is sufficient; leave as created
done

# ensure default source exists so create dry-run doesn't fail
mkdir -p "$HOME/dot-files/.vscode-insiders/extensions"

# run rotation keep 3 (dry-run)
bash "$SCRIPT" create --max-backups 3 --dry-run
# dry-run should not remove anything; verify 8 exist
count_before=$(ls -d "$HOME"/.vscode_extensions_backup_* | wc -l)
if [[ "$count_before" -ne 8 ]]; then
  echo "Expected 8 backups present after dry-run, found $count_before"
  exit 1
fi

echo "Dry-run preserved backups as expected."

# now run real rotation by invoking rotate via create path: simulate a backup existing and call rotate
# create a marker file that triggers create path to perform rotation: move target if exists
# But easier: call the script with --max-backups 3 and invoke a small helper to only run rotation
# The script does rotation when a create moves an existing target; simulate by creating a dummy target
TARGET_DIR="$HOME/.vscode-insiders/extensions"
mkdir -p "$(dirname "$TARGET_DIR")"
# create a dummy target to be backed up
mkdir -p "$TARGET_DIR"
# call create (not dry-run) with source pointing to an existing dir so create will backup target and then rotate
# prepare a source dir
SOURCE_DIR="$HOME/dot-files/.vscode-insiders/extensions"
mkdir -p "$SOURCE_DIR"

bash "$SCRIPT" create --source "$SOURCE_DIR" --target "$TARGET_DIR" --max-backups 3

# After rotation, count backups — should be 3 (the script moved the previous target to a new backup, then trimmed)
count_after=$(ls -d "$HOME"/.vscode_extensions_backup_* 2>/dev/null | wc -l || true)
if [[ "$count_after" -ne 3 ]]; then
  echo "Rotation failed: expected 3 backups after rotation, found $count_after"
  ls -ld "$HOME"/.vscode_extensions_backup_* || true
  exit 2
fi

echo "Rotation succeeded: kept 3 backups."

# check that removed backups were logged to logfile
LOGFILE="$HOME/Library/Logs/manage_vscode_extensions.out.log"
if [[ -f "$LOGFILE" ]]; then
  if ! grep -q "Removed old backup" "$LOGFILE"; then
    echo "Logfile exists but no removal messages found"
    exit 3
  else
    echo "Rotation logged removals to $LOGFILE"
  fi
else
  echo "Logfile not created: $LOGFILE"
  exit 4
fi

exit 0
