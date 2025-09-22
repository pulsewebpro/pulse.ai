# PULSE · SPEC MEMORIA PREMIUM (v1)

## Objetivo
Persistencia entre sesiones SOLO para clientes de plan con memoria activada (opt-in explícito).

## Gating
- Requiere sesión + plan con memoria activa + consentimientos ON.
- En demo: SIN persistencia en servidor (solo ZIP local que baja el usuario).

## Modelo
- /data/memory/{userId}.json → { preferences, copies, campaigns, assetsRefs, timeline }
- Tamaño limitado y rotación básica (p.ej., 90 días por defecto).

## Endpoints
- GET /api/pulse/memory      (auth) → devuelve memoria del usuario.
- POST /api/pulse/memory     (auth) → guarda cambios parciales (merge validado).
- POST /api/pulse/memory/export (auth) → genera ZIP.
- DELETE /api/pulse/memory   (auth) → borra todo (derecho al olvido).

## UX
- En /account: switches “Recordar preferencias”, “Recordar campañas”.
- Aviso claro: qué se guarda, por qué y cómo borrar/exportar.
- Banner cookies real (categorías); si el usuario rechaza analítica/marketing, respetar.

## Legal
- Opt-in granular; registro de consentimientos con timestamp.
- Exportación y eliminación inmediata bajo petición.
- Nunca usar datos para entrenamiento externo.

## QA / Done
- Persistencia sólo con consentimientos ON.
- Export ZIP correcto.
- DELETE borra ficheros y referencias.
