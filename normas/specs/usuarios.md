# PULSE · SPEC USUARIOS (v1)

## Objetivo
Cuenta de usuario básica para activar Memoria Premium y área personal, sin dependencias externas.

## Alcance (MVP)
- Registro, login, logout.
- Cookie de sesión httpOnly + Secure + SameSite=Lax.
- Perfil mínimo (email, plan, consentimientos).
- Rutas UI: /auth/login, /auth/register, /account.
- Sin subir ficheros personales en MVP.

## Datos (file-based en /data para dev/prototipo)
- /data/users.json  → { id, email, pass_hash, createdAt, plan, consents: {privacy:true, marketing:false} }
- /data/sessions.json → { sessionId, userId, createdAt, expiresAt }

## Endpoints
- POST /api/auth/register {email, password, consentPrivacy:true}
  - Valida email, fuerza de contraseña, consentimiento.
  - Guarda hash+salt con coste ajustable.
  - Responde 201 {ok:true}
- POST /api/auth/login {email,password}
  - Verifica hash; crea cookie de sesión httpOnly.
  - Responde 200 {ok:true}
- POST /api/auth/logout
  - Invalida cookie. 200 {ok:true}
- GET /api/me
  - Devuelve {email, plan, consents}, nunca devuelve pass_hash.

## UI
- /pages/auth/register.tsx  → formulario con casilla “Acepto privacidad”.
- /pages/auth/login.tsx     → email + password.
- /pages/account/index.tsx  → ver plan, toggles de consentimientos, exportar/borrar datos.

## Legal
- Registro requiere consentimiento de privacidad (obligatorio).
- Derecho al olvido: botón en /account → borra user+sesiones+memoria.
- Exportar datos: genera ZIP con JSON de perfil + memoria.

## Seguridad
- Hash + salt con coste configurable (memoria-duro).
- Bloqueo de intentos (rate limit por IP + cooldown por cuenta).
- Cookies marcadas como Secure en producción.
- Sin PII innecesaria; no guardar nada no usado.

## QA / Done
- Tests: registro/login/logout felices + casos de error.
- Cookie no accesible por JS.
- /me no expone pass_hash.
- Botón borrar datos realmente elimina todo lo asociado.
