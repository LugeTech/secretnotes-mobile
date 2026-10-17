#!/usr/bin/env bash
set -euo pipefail

cd /home/admin/apps/secretnotes-mobile

pnpm install --frozen-lockfile
pnpm exec expo export --platform web --output-dir web-build

exec npx --yes serve web-build -p 3002
