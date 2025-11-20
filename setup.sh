#!/usr/bin/env bash
# setup.sh
# Orchestrates Multipurpose Website Builder scaffolding
# - Safety Level 2 (double confirmation + backup option)
# - Creates project root
# - Calls modular scripts in ./scripts

########################################
# SAFETY LEVEL 2 — Full Protection
########################################

# Prevent running from dangerous directories
if [[ "$PWD" == "/" ]]; then
  echo "❌ ERROR: Refusing to run in root directory (/)."
  exit 1
fi

if [[ "$PWD" == "$HOME" ]]; then
  echo "❌ ERROR: Refusing to run in HOME directory ($HOME)."
  exit 1
fi

# Notify user of current directory
echo "📌 Current directory: $PWD"

# Check if directory contains any file except setup.sh and scripts/
HAS_FILES=$(find . -mindepth 1 ! -name "setup.sh" ! -path "./scripts" ! -path "./scripts/*" | wc -l)

if (( HAS_FILES > 0 )); then
  echo "⚠️  Existing files detected in this directory (outside ./scripts and setup.sh)."
  read -p "🗑️  Delete EVERYTHING except setup.sh and ./scripts? (y/n): " confirm1

  if [[ "$confirm1" == "y" || "$confirm1" == "Y" ]]; then

    # DOUBLE CONFIRMATION
    read -p "❗ Are you ABSOLUTELY sure? This action cannot be undone. (y/n): " confirm2

    if [[ "$confirm2" == "y" || "$confirm2" == "Y" ]]; then

      # Offer to create backup zip
      read -p "📦 Create backup ZIP before deleting? (y/n): " backup

      if [[ "$backup" == "y" || "$backup" == "Y" ]]; then
        TS=$(date +"%Y%m%d-%H%M%S")
        BACKUP_NAME="backup-$TS.zip"
        echo "📦 Creating backup: $BACKUP_NAME ..."
        zip -r "$BACKUP_NAME" . -x "setup.sh" "./scripts/*"
        echo "✔ Backup saved as $BACKUP_NAME"
      fi

      echo "🧹 Deleting all files except setup.sh and ./scripts..."
      find . -mindepth 1 ! -name "setup.sh" ! -path "./scripts" ! -path "./scripts/*" -exec rm -rf {} +
      echo "✔ Cleanup complete."

    else
      echo "❌ Deletion cancelled."
    fi

  else
    echo "❌ Skipped deleting files."
  fi
fi

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="multipurpose-website-builder"

echo "📂 Creating project root: $ROOT_DIR"
mkdir -p "$ROOT_DIR"

echo "📁 Ensuring scripts are executable..."
chmod +x "$SCRIPT_DIR"/scripts/*.sh 2>/dev/null || true

echo "🚀 Running scaffolding steps..."

bash "$SCRIPT_DIR/scripts/create_backend.sh"   "$ROOT_DIR"
bash "$SCRIPT_DIR/scripts/create_builder.sh"   "$ROOT_DIR"
bash "$SCRIPT_DIR/scripts/create_partials.sh"  "$ROOT_DIR"
bash "$SCRIPT_DIR/scripts/create_assets.sh"    "$ROOT_DIR"
bash "$SCRIPT_DIR/scripts/create_sheets.sh"    "$ROOT_DIR"
bash "$SCRIPT_DIR/scripts/create_docs.sh"      "$ROOT_DIR"

echo "✅ All done!"
echo "👉 Project generated in: $ROOT_DIR"
echo "   - Apps Script backend: $ROOT_DIR/src/apps-script/"
echo "   - Theme partials:      $ROOT_DIR/src/apps-script/partials/"
echo "   - Assets:              $ROOT_DIR/src/assets/"
echo "   - Sheets templates:    $ROOT_DIR/sheets-templates/"
echo "   - Docs:                $ROOT_DIR/docs/"
echo "   - README:              $ROOT_DIR/README.md"
