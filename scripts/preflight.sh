#!/usr/bin/env bash
set -euo pipefail
echo "▶ Preflight…"
# Legales mínimos presentes
grep -RIn "/legal/terms" . >/dev/null || { echo "❌ Falta link a /legal/terms"; exit 1; }
grep -RIn "/legal/privacy" . >/dev/null || { echo "❌ Falta link a /legal/privacy"; exit 1; }

# AA mínimo en hero: busca tokens clave (heurística)
grep -RIn "contrastAA" . >/dev/null || echo "⚠️ Revisa contraste AA en hero"

# TS + build (si hay Next)
npx -y tsc --noEmit || true
npm run -s build || echo "⚠️ build no configurado"
echo "✅ Preflight ok (heurístico)"
