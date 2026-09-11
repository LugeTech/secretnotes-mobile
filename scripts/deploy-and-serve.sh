#!/usr/bin/env bash
set -euo pipefail

cd /home/admin/apps/secretnotes-mobile

git switch subs
git pull --ff-only origin subs
pnpm install --frozen-lockfile
pnpm exec expo export --platform web --output-dir web-build

exec npx --yes serve web-build -p 3002
