#!/bin/bash
# Auto-snapshot script — run after each prompt to create a rollback point
# Usage: bash scripts/snapshot.sh "description of change"

cd "$(dirname "$0")/.." || exit 1

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")
DESC="${1:-auto-snapshot}"
BRANCH="snapshots/${TIMESTAMP}_${DESC// /-}"

# Commit all changes on master
git add -A
git commit -m "snapshot: ${TIMESTAMP} — ${DESC}" 2>/dev/null || echo "Nothing new to commit on master"
git push origin master 2>/dev/null

# Create and push snapshot branch
git checkout -b "$BRANCH"
git push origin "$BRANCH"
git checkout master

echo ""
echo "✅ Snapshot saved: $BRANCH"
echo "   Roll back anytime with: git checkout $BRANCH"
