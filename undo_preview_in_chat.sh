#!/usr/bin/env bash
set -euo pipefail
echo "♻️  Undo preview en /chat"
# Quita import dinámico (entre marcadores) si existe
perl -0777 -pe 's/\{\/* PULSE_PREVIEW_EMBED_START \*\/\}[\s\S]*?\{\/* PULSE_PREVIEW_EMBED_END \*\/\}//g' -i pages/chat.tsx || true
# No intentamos revertir onClick para no corromper JSX; manual si quieres dejar los botones sin acción.
rm -f components/PreviewEmbed.tsx
echo "Hecho. /chat vuelve a su estado anterior (menos onClick)."
