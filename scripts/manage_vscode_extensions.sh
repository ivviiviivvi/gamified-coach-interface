#!/usr/bin/env bash
set -euo pipefail

# Manage VS Code / VS Code Insiders extensions directory when you keep extensions
# inside a dot-files repo. This script creates a safe symlink from the expected
# extensions location in the home directory to a directory inside your dot-files
# repo (or can copy/back up/restore). It's non-destructive by default and
# provides revert and status commands.
#
# Usage:
#   ./manage_vscode_extensions.sh status
#   ./manage_vscode_extensions.sh create --source ~/dot-files/.vscode-insiders/extensions --target ~/.vscode-insiders/extensions
#   ./manage_vscode_extensions.sh copy --source ~/dot-files/.vscode-insiders/extensions --target ~/.vscode-insiders/extensions
#   ./manage_vscode_extensions.sh revert --target ~/.vscode-insiders/extensions
#   ./manage_vscode_extensions.sh help

SOURCE_DEFAULT="${HOME}/dot-files/.vscode-insiders/extensions"
TARGET_DEFAULT="${HOME}/.vscode-insiders/extensions"
LOGFILE="$HOME/Library/Logs/manage_vscode_extensions.out.log"
DRY_RUN=false

# Exit codes
EXIT_OK=0
EXIT_UNKNOWN_ARG=2
EXIT_MISSING_SOURCE=3
EXIT_NOT_SYMLINK=4
EXIT_TEST_FAILURE=5

print_help() {
  cat <<EOF
Manage VS Code extensions directory by symlinking or copying from a dot-files location.

Commands:
  status                 Show the current state of the target (exists, symlink, destination)
  create [--source S] [--target T]
                         Create a symlink at T pointing to S. Backups target if it exists and is not a symlink.
  copy [--source S] [--target T]
                         Copy contents from S into T (creates T if missing). Non-destructive (S left intact).
  revert [--target T]   Remove symlink at T and restore any backed-up original T (if backup exists).
    --max-backups N        Configure how many backups to keep (env MAX_BACKUPS also supported). Default: 5
  help                  Show this help

Defaults:
  source: $SOURCE_DEFAULT
  target: $TARGET_DEFAULT

Examples:
  $0 create --source ~/dot-files/.vscode-insiders/extensions --target ~/.vscode-insiders/extensions
  $0 copy --source ~/dot-files/.vscode-insiders/extensions --target ~/.vscode-insiders/extensions
  $0 status

Notes:
  - create will move an existing non-symlink target to a timestamped backup before creating the symlink.
  - revert will attempt to restore the most recent backup if present.
  - You can add the create command to a login script or launchd plist to ensure the link remains.
EOF
}

die() {
  local code=1
  if [[ "$#" -gt 1 && "$1" =~ ^[0-9]+$ ]]; then
    code=$1; shift
  fi
  echo "$*" >&2
  log "ERROR: $*"
  exit ${code}
}

cmd=${1:-help}
shift || true

SOURCE="$SOURCE_DEFAULT"
TARGET="$TARGET_DEFAULT"
WAIT_SECONDS=0
WAIT_INTERVAL=5

resolve_path() {
  # portable resolver: prefer python3, fallback to readlink -f if available
  local p="$1"
  if command -v python3 >/dev/null 2>&1; then
    python3 -c "import os,sys; print(os.path.abspath(os.path.expanduser(sys.argv[1])))" "$p"
  elif command -v readlink >/dev/null 2>&1; then
    # macOS readlink doesn't support -f; try realpath if present
    if command -v realpath >/dev/null 2>&1; then
      realpath "$p"
    else
      # best-effort: expand ~ and print
      echo "$(cd "$(dirname "$p")" 2>/dev/null && pwd)/$(basename "$p")"
    fi
  else
    echo "$p"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) SOURCE=$(resolve_path "$2"); shift 2;;
    --target) TARGET=$(resolve_path "$2"); shift 2;;
    --max-backups)
      MAX_BACKUPS=$(printf "%s" "$2")
      shift 2;;
    --wait) WAIT_SECONDS=$(printf "%s" "$2"); shift 2;;
    --wait-interval) WAIT_INTERVAL=$(printf "%s" "$2"); shift 2;;
    --dry-run) DRY_RUN=true; shift 1;;
    --help|-h) print_help; exit 0;;
    *) die "Unknown arg: $1";;
  esac
done

timestamp() { date +%Y%m%d_%H%M%S; }
MAX_BACKUPS="${MAX_BACKUPS:-5}"

rotate_backups() {
  # Remove oldest backups beyond MAX_BACKUPS. Be defensive: only remove
  # entries that match the expected backup name prefix inside HOME.
  local backup_prefix="${HOME}/.vscode_extensions_backup_"
  # enable nullglob when supported so non-matching globs expand to empty
  shopt -s nullglob 2>/dev/null || true
  local -a items=( ${backup_prefix}* )
  local -a backups=()
  for p in "${items[@]}"; do
    [[ -e "$p" ]] || continue
    backups+=("$p")
  done
  local total=${#backups[@]}
  if [[ $total -le $MAX_BACKUPS ]]; then
    return 0
  fi
  # sort lexical (timestamp suffix ensures chronological order)
  IFS=$'\n' sorted=( $(printf "%s\n" "${backups[@]}" | sort) )
  local remove_count=$(( total - MAX_BACKUPS ))
  for ((i=0;i<remove_count;i++)); do
    local p="${sorted[i]}"
    # safety: only operate on paths that start with backup_prefix
    case "$p" in
      "${HOME}"/.vscode_extensions_backup_*)
        if [[ "$DRY_RUN" == "true" ]]; then
          echo "[dry-run] rm -rf $p"
          log "[dry-run] Would remove old backup: $p"
        else
          rm -rf "$p"
          echo "Removed old backup: $p"
          log "Removed old backup: $p"
        fi
        ;;
      *)
        echo "Skipping unsafe path during rotate: $p" >&2
        log "Skipping unsafe path during rotate: $p"
        ;;
    esac
  done
}

log() {
  # Append a timestamped message to logfile when actions are performed.
  # Don't fail the script if logging fails.
  local msg="$*"
  if [[ -n "${LOGFILE:-}" ]]; then
    mkdir -p "$(dirname "$LOGFILE")" 2>/dev/null || true
    printf "%s %s\n" "$(date --iso-8601=seconds 2>/dev/null || date)" "$msg" >>"$LOGFILE" 2>/dev/null || true
  fi
}

status() {
  echo "Source: $SOURCE"
  echo "Target: $TARGET"
  if [[ -L "$TARGET" ]]; then
    echo "Target is a symlink -> $(readlink "$TARGET")"
  elif [[ -d "$TARGET" ]]; then
    echo "Target is a directory (no symlink). Contents:"
    ls -la "$TARGET" | sed -n '1,200p'
  else
    echo "Target does not exist"
  fi
}

create_symlink() {
  # Optionally wait for source to appear (useful for external drives)
  if [[ ! -d "$SOURCE" && $WAIT_SECONDS -gt 0 ]]; then
    echo "Source $SOURCE not present — waiting up to $WAIT_SECONDS seconds (interval ${WAIT_INTERVAL}s)"
    waited=0
    while [[ $waited -lt $WAIT_SECONDS && ! -d "$SOURCE" ]]; do
      sleep "$WAIT_INTERVAL"
      waited=$((waited + WAIT_INTERVAL))
      echo "  waited ${waited}s..."
    done
  fi
  if [[ ! -d "$SOURCE" ]]; then
    die "Source directory does not exist: $SOURCE"
  fi
  if [[ -L "$TARGET" ]]; then
    echo "Target is already a symlink -> $(readlink "$TARGET")"
    return 0
  fi
  if [[ -e "$TARGET" && ! -L "$TARGET" ]]; then
    # backup
    backup="$HOME/.vscode_extensions_backup_$(timestamp)"
    echo "Backing up existing target to: $backup"
    log "Backing up existing target $TARGET to: $backup"
    mkdir -p "$(dirname "$backup")"
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[dry-run] mv $TARGET $backup"
    else
      mv "$TARGET" "$backup"
    fi
    rotate_backups
  fi
  mkdir -p "$(dirname "$TARGET")"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[dry-run] ln -s $SOURCE $TARGET"
    log "[dry-run] Would create symlink: $TARGET -> $SOURCE"
  else
    ln -s "$SOURCE" "$TARGET"
    echo "Created symlink: $TARGET -> $SOURCE"
    log "Created symlink: $TARGET -> $SOURCE"
  fi
}

copy_contents() {
  if [[ ! -d "$SOURCE" ]]; then
    die "Source directory does not exist: $SOURCE"
  fi
  mkdir -p "$(dirname "$TARGET")"
  if [[ -e "$TARGET" && ! -d "$TARGET" ]]; then
    die "Target exists and is not a directory: $TARGET"
  fi
  mkdir -p "$TARGET"
  echo "Copying (preserving attributes) from $SOURCE to $TARGET ..."
  # Prefer rsync if available, else ditto (macOS), else cp -pR
  if command -v rsync >/dev/null 2>&1; then
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[dry-run] rsync -a "$SOURCE/" "$TARGET/""
    else
      rsync -a "$SOURCE/" "$TARGET/"
    fi
  elif command -v ditto >/dev/null 2>&1; then
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[dry-run] ditto "$SOURCE" "$TARGET""
    else
      ditto "$SOURCE" "$TARGET"
    fi
  else
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[dry-run] cp -pR '$SOURCE/.' '$TARGET/'"
    else
      cp -pR "$SOURCE/." "$TARGET/"
    fi
  fi
  echo "Copy complete. Run 'status' to verify."
  log "Copied contents from $SOURCE to $TARGET"
}

revert() {
  if [[ -L "$TARGET" ]]; then
    echo "Removing symlink: $TARGET"
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[dry-run] rm $TARGET"
      log "[dry-run] Would remove symlink: $TARGET"
    else
      rm "$TARGET"
      log "Removed symlink: $TARGET"
    fi
    # attempt to find backup
    backups=("$HOME"/.vscode_extensions_backup_*)
    # pick most recent existing
    latest=""
    for b in "${backups[@]}"; do
      [[ -e "$b" ]] || continue
      if [[ -z "$latest" || "$b" -nt "$latest" ]]; then
        latest="$b"
      fi
    done
    if [[ -n "$latest" ]]; then
      echo "Restoring backup $latest -> $TARGET"
      if [[ "$DRY_RUN" == "true" ]]; then
        echo "[dry-run] mv $latest $TARGET"
        log "[dry-run] Would restore backup $latest -> $TARGET"
      else
        mv "$latest" "$TARGET"
        log "Restored backup $latest -> $TARGET"
      fi
    else
      echo "No backup found. Re-run create if you want the symlink recreated."
    fi
  else
    die "Target is not a symlink: $TARGET"
  fi
}

case "$cmd" in
  status)
    status
    ;;
  create)
    create_symlink
    ;;
  copy)
    copy_contents
    ;;
  revert)
    revert
    ;;
  help)
    print_help
    ;;
  *)
    echo "Unknown command: $cmd" >&2
    print_help
    exit ${EXIT_UNKNOWN_ARG}
    ;;
esac

exit ${EXIT_OK}
