#!/usr/bin/env bash
set -euo pipefail

ref="${1:-latest}"

if [ "$ref" = "latest" ]; then
  ref="$(git tag --list 'checkpoint/*' --sort=-creatordate | head -n1)"
  if [ -z "$ref" ]; then
    echo "No hay checkpoints aún."; exit 1
  fi
fi

echo "↩️  Restaurando '$ref' a una rama nueva…"
git fetch --tags >/dev/null 2>&1 || true
new_branch="restore/$(echo "$ref" | tr '/' '_')"
git checkout -b "$new_branch" "$ref"
echo "✅ Listo. Estás en la rama: $new_branch (basada en $ref)"
echo "   Para volver a tu trabajo previo: git checkout -"
