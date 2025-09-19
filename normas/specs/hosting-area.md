# PULSE · SPEC HOSTING + ÁREA CLIENTE (v1)

## Objetivo
Cuando el cliente paga mensualidad, su web se sube a nuestro host y obtiene un área con ventana de conversación permanente con Pulse.

## Flujos
- Alta premium → crea subdominio/carpeta del cliente (simulado en MVP como /data/sites/{userId}/).
- Deploy: copiar artefactos (build/zip) al espacio del cliente.
- Área cliente: /account → acceso a “Mi sitio”, “Hablar con Pulse”, “Historial”.

## UX componentes
- /pages/account/site.tsx → listado de builds + botón “publicar”.
- /pages/account/chat.tsx → ventana con Pulse enfocada en su negocio (usa su memoria).
- Logs ligeros de versiones (sin PII).

## Legal
- Términos y privacidad enlazados.
- Botón “Eliminar mi sitio” + confirmación.
- Exportar sitio (zip) en cualquier momento.

## QA / Done
- Publicar copia los artefactos al espacio del cliente.
- Chat en /account/chat usa la memoria del usuario si está activada.
